/**
 * ============================================================================
 * ⚠️ ERROR HANDLING - Metal3DCore Platform
 * ============================================================================
 * [SECURITY FIX 9/12] - Generic Error Messages
 *
 * This module provides secure error handling:
 * - Generic error messages for clients (prevent info leakage)
 * - Detailed logging for developers (via audit logging)
 * - Structured error responses
 * - Type-safe error handling
 *
 * SECURITY PRINCIPLE:
 * Never expose internal system details, stack traces, or database errors
 * to end users. These can be exploited to understand system architecture.
 * ============================================================================
 */

import { NextResponse } from "next/server";
import { logError, logWarning } from "./audit-logging";
import { Prisma } from "@prisma/client";

/**
 * Error Categories
 */
export enum ErrorCategory {
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  VALIDATION = "validation",
  NOT_FOUND = "not_found",
  CONFLICT = "conflict",
  RATE_LIMIT = "rate_limit",
  SERVER_ERROR = "server_error",
  DATABASE = "database",
  EXTERNAL_SERVICE = "external_service",
}

/**
 * Application Error Class
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public category: ErrorCategory,
    public statusCode: number = 500,
    public isOperational: boolean = true,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * ============================================================================
 * PREDEFINED ERROR TYPES
 * ============================================================================
 */

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, ErrorCategory.AUTHENTICATION, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Insufficient permissions") {
    super(message, ErrorCategory.AUTHORIZATION, 403);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, ErrorCategory.VALIDATION, 400, true, details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, ErrorCategory.NOT_FOUND, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource conflict") {
    super(message, ErrorCategory.CONFLICT, 409);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Too many requests") {
    super(message, ErrorCategory.RATE_LIMIT, 429);
  }
}

/**
 * ============================================================================
 * ERROR RESPONSE GENERATOR
 * ============================================================================
 */

/**
 * Client-safe error response (no sensitive details)
 */
interface ErrorResponse {
  error: string;
  message: string;
  code?: string;
  statusCode: number;
  timestamp: string;
}

/**
 * Generate generic error message based on category
 */
function getGenericMessage(category: ErrorCategory): string {
  const messages: Record<ErrorCategory, string> = {
    [ErrorCategory.AUTHENTICATION]:
      "Authentication failed. Please log in again.",
    [ErrorCategory.AUTHORIZATION]:
      "You do not have permission to access this resource.",
    [ErrorCategory.VALIDATION]: "The provided data is invalid.",
    [ErrorCategory.NOT_FOUND]: "The requested resource was not found.",
    [ErrorCategory.CONFLICT]:
      "The operation could not be completed due to a conflict.",
    [ErrorCategory.RATE_LIMIT]: "Too many requests. Please try again later.",
    [ErrorCategory.SERVER_ERROR]:
      "An unexpected error occurred. Please try again later.",
    [ErrorCategory.DATABASE]:
      "A database error occurred. Please try again later.",
    [ErrorCategory.EXTERNAL_SERVICE]:
      "An external service is temporarily unavailable.",
  };

  return messages[category];
}

/**
 * Create error response for client
 */
export function createErrorResponse(error: unknown): ErrorResponse {
  const timestamp = new Date().toISOString();

  // Known AppError
  if (error instanceof AppError) {
    // Log detailed error internally
    logError(error, {
      category: error.category,
      statusCode: error.statusCode,
      details: error.details,
    });

    // For validation errors, include some details
    if (error.category === ErrorCategory.VALIDATION && error.details) {
      return {
        error: error.category,
        message: error.message,
        statusCode: error.statusCode,
        timestamp,
      };
    }

    // For other errors, use generic message
    return {
      error: error.category,
      message: getGenericMessage(error.category),
      statusCode: error.statusCode,
      timestamp,
    };
  }

  // Prisma Database Errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    logError(new Error("Database error"), {
      code: error.code,
      meta: error.meta,
    });

    // Map Prisma errors to user-friendly messages
    switch (error.code) {
      case "P2002":
        return {
          error: ErrorCategory.CONFLICT,
          message: "This record already exists.",
          code: error.code,
          statusCode: 409,
          timestamp,
        };
      case "P2025":
        return {
          error: ErrorCategory.NOT_FOUND,
          message: "The requested resource was not found.",
          code: error.code,
          statusCode: 404,
          timestamp,
        };
      default:
        return {
          error: ErrorCategory.DATABASE,
          message: getGenericMessage(ErrorCategory.DATABASE),
          code: error.code,
          statusCode: 500,
          timestamp,
        };
    }
  }

  // Unknown errors
  if (error instanceof Error) {
    logError(error);

    // NEVER expose error message or stack trace to client
    return {
      error: ErrorCategory.SERVER_ERROR,
      message: getGenericMessage(ErrorCategory.SERVER_ERROR),
      statusCode: 500,
      timestamp,
    };
  }

  // Completely unknown error type
  logError(new Error("Unknown error type"), { error });
  return {
    error: ErrorCategory.SERVER_ERROR,
    message: getGenericMessage(ErrorCategory.SERVER_ERROR),
    statusCode: 500,
    timestamp,
  };
}

/**
 * ============================================================================
 * ERROR RESPONSE HELPERS
 * ============================================================================
 */

/**
 * Send JSON error response
 */
export function sendErrorResponse(error: unknown): NextResponse {
  const errorResponse = createErrorResponse(error);
  return NextResponse.json(errorResponse, { status: errorResponse.statusCode });
}

/**
 * Async error handler wrapper for API routes
 */
export function catchAsync(
  fn: (request: Request, context?: unknown) => Promise<NextResponse>
) {
  return async (request: Request, context?: unknown): Promise<NextResponse> => {
    try {
      return await fn(request, context);
    } catch (error) {
      return sendErrorResponse(error);
    }
  };
}

/**
 * ============================================================================
 * DEVELOPMENT-ONLY ERROR DETAILS
 * ============================================================================
 */

/**
 * Enhanced error response for development
 * Includes stack traces and detailed info
 */
export function createDevErrorResponse(error: unknown): ErrorResponse & {
  stack?: string;
  details?: unknown;
} {
  const baseResponse = createErrorResponse(error);

  if (process.env.NODE_ENV !== "development") {
    return baseResponse;
  }

  // Add detailed info in development
  if (error instanceof Error) {
    return {
      ...baseResponse,
      stack: error.stack,
      details: error instanceof AppError ? error.details : undefined,
    };
  }

  return {
    ...baseResponse,
    details: error,
  };
}

/**
 * ============================================================================
 * ERROR ASSERTION HELPERS
 * ============================================================================
 */

/**
 * Assert condition or throw error
 */
export function assert(
  condition: unknown,
  message: string,
  ErrorType: new (
    message: string,
    category: ErrorCategory,
    statusCode?: number
  ) => AppError = AppError as any
): asserts condition {
  if (!condition) {
    throw new ErrorType(message, ErrorCategory.SERVER_ERROR, 500);
  }
}

/**
 * Assert resource exists or throw NotFoundError
 */
export function assertExists<T>(
  value: T | null | undefined,
  resource: string = "Resource"
): asserts value is T {
  if (value === null || value === undefined) {
    throw new NotFoundError(resource);
  }
}

/**
 * Assert user has permission or throw AuthorizationError
 */
export function assertAuthorized(
  condition: boolean,
  message: string = "Insufficient permissions"
): asserts condition {
  if (!condition) {
    throw new AuthorizationError(message);
  }
}

/**
 * ============================================================================
 * GLOBAL ERROR HANDLER
 * ============================================================================
 */

/**
 * Global unhandled error handler
 */
export function setupGlobalErrorHandlers(): void {
  if (typeof process !== "undefined") {
    process.on("unhandledRejection", (reason: unknown) => {
      logError(new Error("Unhandled Promise Rejection"), { reason });
    });

    process.on("uncaughtException", (error: Error) => {
      logError(error, { fatal: true });
      // In production, you might want to restart the process here
      process.exit(1);
    });
  }
}
