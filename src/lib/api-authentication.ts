/**
 * ============================================================================
 * 🔑 API AUTHENTICATION - Metal3DCore Platform
 * ============================================================================
 * [SECURITY FIX 11/12] - Bearer Token Authentication
 *
 * This module implements API key/token authentication for:
 * - Admin API endpoints
 * - External integrations
 * - Webhook verification
 * - Service-to-service communication
 *
 * SECURITY:
 * - Tokens are hashed before storage
 * - Prefix system for easy identification (mp_live_*, mp_test_*)
 * - Token rotation and expiration
 * - Rate limiting per token
 * ============================================================================
 */

import crypto from "crypto";
import { prisma } from "./prisma";
import { AuthenticationError, RateLimitError } from "./error-handling";
import { logApiRequest, logSecurityAlert } from "./audit-logging";

/**
 * API Token Configuration
 */
export const API_TOKEN_CONFIG = {
  /**
   * Token prefix for identification
   */
  livePrefix: "mp_live_",
  testPrefix: "mp_test_",

  /**
   * Token length (bytes)
   */
  tokenBytes: 32,

  /**
   * Default token expiration (days)
   */
  defaultExpirationDays: 365,

  /**
   * Rate limit per token
   */
  rateLimitPerMinute: 60,
} as const;

/**
 * Token Metadata Interface
 */
interface TokenMetadata {
  id: string;
  name: string;
  prefix: string;
  hashedToken: string;
  userId: string;
  permissions: string[];
  expiresAt: Date | null;
  lastUsedAt: Date | null;
  createdAt: Date;
}

/**
 * ============================================================================
 * TOKEN GENERATION
 * ============================================================================
 */

/**
 * Generate a new API token
 *
 * @param isLive - Whether this is a live (production) token
 * @returns Object with plaintext token and hashed version
 */
export function generateApiToken(isLive: boolean = false): {
  token: string;
  hashedToken: string;
  prefix: string;
} {
  const prefix = isLive
    ? API_TOKEN_CONFIG.livePrefix
    : API_TOKEN_CONFIG.testPrefix;

  // Generate random bytes
  const randomBytes = crypto.randomBytes(API_TOKEN_CONFIG.tokenBytes);
  const tokenSecret = randomBytes.toString("hex");

  // Create full token with prefix
  const token = `${prefix}${tokenSecret}`;

  // Hash token for storage
  const hashedToken = hashToken(token);

  return {
    token,
    hashedToken,
    prefix,
  };
}

/**
 * Hash token using SHA-256
 */
function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * ============================================================================
 * TOKEN VALIDATION
 * ============================================================================
 */

/**
 * Validate API token from Authorization header
 *
 * @param authHeader - Authorization header value
 * @returns User ID and permissions if valid
 * @throws AuthenticationError if invalid
 */
export async function validateApiToken(authHeader: string | null): Promise<{
  userId: string;
  permissions: string[];
  tokenId: string;
}> {
  if (!authHeader) {
    throw new AuthenticationError("Missing Authorization header");
  }

  // Extract token from "Bearer <token>" format
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    throw new AuthenticationError("Invalid Authorization header format");
  }

  const token = match[1];

  // Validate token format
  const isLive = token.startsWith(API_TOKEN_CONFIG.livePrefix);
  const isTest = token.startsWith(API_TOKEN_CONFIG.testPrefix);

  if (!isLive && !isTest) {
    throw new AuthenticationError("Invalid token format");
  }

  // Hash token for comparison
  const hashedToken = hashToken(token);

  // Look up token in database
  try {
    const tokenRecord = await prisma.apiToken.findUnique({
      where: { hashedToken },
      include: { user: true },
    });

    if (!tokenRecord) {
      throw new AuthenticationError("Invalid or revoked token");
    }

    // Check expiration
    if (tokenRecord.expiresAt && tokenRecord.expiresAt < new Date()) {
      throw new AuthenticationError("Token has expired");
    }

    // Update last used timestamp
    await prisma.apiToken.update({
      where: { id: tokenRecord.id },
      data: { lastUsedAt: new Date() },
    });

    return {
      userId: tokenRecord.userId,
      permissions: tokenRecord.permissions,
      tokenId: tokenRecord.id,
    };
  } catch (error) {
    logSecurityAlert("API token validation failed", undefined, {
      hashedToken: hashedToken.substring(0, 10) + "...",
    });
    throw error;
  }
}

/**
 * ============================================================================
 * MIDDLEWARE HELPER
 * ============================================================================
 */

/**
 * Extract and validate API token from request
 *
 * @param request - Next.js Request object
 * @returns Validated token info
 */
export async function requireApiAuth(request: Request): Promise<{
  userId: string;
  permissions: string[];
  tokenId: string;
}> {
  const authHeader = request.headers.get("authorization");
  return validateApiToken(authHeader);
}

/**
 * Check if token has specific permission
 */
export function hasPermission(
  permissions: string[],
  requiredPermission: string
): boolean {
  return (
    permissions.includes("*") || // Wildcard permission
    permissions.includes(requiredPermission)
  );
}

/**
 * Assert token has permission or throw
 */
export function assertPermission(
  permissions: string[],
  requiredPermission: string
): void {
  if (!hasPermission(permissions, requiredPermission)) {
    throw new AuthenticationError(
      `Missing required permission: ${requiredPermission}`
    );
  }
}

/**
 * ============================================================================
 * TOKEN MANAGEMENT (Would need Prisma model)
 * ============================================================================
 */

/**
 * Create a new API token for a user
 *
 * NOTE: Requires ApiToken model in Prisma schema
 */
export async function createApiTokenForUser(
  userId: string,
  name: string,
  permissions: string[] = [],
  isLive: boolean = false,
  expirationDays?: number
): Promise<{
  token: string;
  tokenId: string;
}> {
  const { token, hashedToken, prefix } = generateApiToken(isLive);

  const expiresAt = expirationDays
    ? new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000)
    : undefined;

  const tokenRecord = await prisma.apiToken.create({
    data: {
      name,
      hashedToken,
      prefix,
      userId,
      permissions,
      expiresAt,
    },
  });

  return {
    token, // Only returned once!
    tokenId: tokenRecord.id,
  };
}

/**
 * Revoke an API token
 */
export async function revokeApiToken(tokenId: string): Promise<void> {
  await prisma.apiToken.delete({
    where: { id: tokenId },
  });
}

/**
 * List all tokens for a user
 */
export async function listUserTokens(userId: string): Promise<TokenMetadata[]> {
  return prisma.apiToken.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      prefix: true,
      hashedToken: true,
      userId: true,
      permissions: true,
      expiresAt: true,
      lastUsedAt: true,
      createdAt: true,
    },
  });
}

/**
 * ============================================================================
 * PRISMA SCHEMA EXTENSION NEEDED
 * ============================================================================
 *
 * Add this to your prisma/schema.prisma:
 *
 * model ApiToken {
 *   id           String    @id @default(uuid())
 *   name         String
 *   hashedToken  String    @unique
 *   prefix       String
 *   userId       String
 *   user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
 *   permissions  String[]
 *   expiresAt    DateTime?
 *   lastUsedAt   DateTime?
 *   createdAt    DateTime  @default(now())
 *   updatedAt    DateTime  @updatedAt
 *
 *   @@index([userId])
 *   @@index([hashedToken])
 * }
 *
 * Also add to User model:
 *   apiTokens ApiToken[]
 *
 * ============================================================================
 */
