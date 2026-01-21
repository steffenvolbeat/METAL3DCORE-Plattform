/**
 * ============================================================================
 * 📊 AUDIT LOGGING - Metal3DCore Platform
 * ============================================================================
 * [SECURITY FIX 10/12] - Comprehensive Audit Logging with Pino
 *
 * This module provides structured logging for:
 * - Authentication events (login, logout, failed attempts)
 * - Authorization failures
 * - Data modifications (CRUD operations)
 * - Administrative actions
 * - Security events (password changes, role updates)
 * - API access patterns
 *
 * COMPLIANCE:
 * - GDPR: User consent and data access logging
 * - SOC 2: Security event monitoring
 * - PCI DSS: Payment transaction logging
 * ============================================================================
 */

import pino from "pino";

/**
 * Pino Logger Configuration
 */
const isDevelopment = process.env.NODE_ENV === "development";

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),
  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    env: process.env.NODE_ENV,
    app: "metal3dcore-platform",
  },
});

/**
 * ============================================================================
 * AUDIT EVENT TYPES
 * ============================================================================
 */

export enum AuditEventType {
  // Authentication
  LOGIN_SUCCESS = "auth.login.success",
  LOGIN_FAILED = "auth.login.failed",
  LOGOUT = "auth.logout",
  PASSWORD_RESET_REQUESTED = "auth.password_reset.requested",
  PASSWORD_RESET_COMPLETED = "auth.password_reset.completed",
  PASSWORD_CHANGED = "auth.password.changed",

  // Authorization
  ACCESS_DENIED = "authz.access_denied",
  ROLE_CHANGED = "authz.role.changed",
  PERMISSION_GRANTED = "authz.permission.granted",
  PERMISSION_REVOKED = "authz.permission.revoked",

  // Data Operations
  USER_CREATED = "data.user.created",
  USER_UPDATED = "data.user.updated",
  USER_DELETED = "data.user.deleted",
  TICKET_PURCHASED = "data.ticket.purchased",
  TICKET_VALIDATED = "data.ticket.validated",
  EVENT_CREATED = "data.event.created",
  EVENT_UPDATED = "data.event.updated",
  EVENT_DELETED = "data.event.deleted",

  // Payment
  PAYMENT_INITIATED = "payment.initiated",
  PAYMENT_SUCCESS = "payment.success",
  PAYMENT_FAILED = "payment.failed",
  REFUND_INITIATED = "payment.refund.initiated",
  REFUND_COMPLETED = "payment.refund.completed",

  // Admin Actions
  ADMIN_ACTION = "admin.action",
  SYSTEM_CONFIG_CHANGED = "admin.config.changed",
  DATABASE_MIGRATION = "admin.database.migration",

  // Security Events
  SECURITY_ALERT = "security.alert",
  RATE_LIMIT_EXCEEDED = "security.rate_limit.exceeded",
  SUSPICIOUS_ACTIVITY = "security.suspicious_activity",
  SESSION_EXPIRED = "security.session.expired",
  CSRF_VIOLATION = "security.csrf.violation",

  // API Access
  API_REQUEST = "api.request",
  API_ERROR = "api.error",
}

/**
 * Audit Log Entry Interface
 */
interface AuditLogEntry {
  eventType: AuditEventType;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  action?: string;
  details?: Record<string, unknown>;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

/**
 * ============================================================================
 * AUDIT LOGGING FUNCTIONS
 * ============================================================================
 */

/**
 * Core audit log function
 */
export function auditLog(entry: AuditLogEntry): void {
  const logData = {
    eventType: entry.eventType,
    userId: entry.userId,
    userEmail: maskEmail(entry.userEmail),
    userRole: entry.userRole,
    ipAddress: maskIpAddress(entry.ipAddress),
    userAgent: entry.userAgent,
    resource: entry.resource,
    action: entry.action,
    success: entry.success,
    errorMessage: entry.errorMessage,
    details: entry.details,
    metadata: entry.metadata,
    timestamp: new Date().toISOString(),
  };

  if (entry.success) {
    logger.info(logData, `Audit: ${entry.eventType}`);
  } else {
    logger.warn(logData, `Audit (Failed): ${entry.eventType}`);
  }
}

/**
 * ============================================================================
 * AUTHENTICATION AUDIT LOGS
 * ============================================================================
 */

export function logLoginSuccess(
  userId: string,
  email: string,
  ipAddress?: string
): void {
  auditLog({
    eventType: AuditEventType.LOGIN_SUCCESS,
    userId,
    userEmail: email,
    ipAddress,
    success: true,
  });
}

export function logLoginFailed(
  email: string,
  reason: string,
  ipAddress?: string
): void {
  auditLog({
    eventType: AuditEventType.LOGIN_FAILED,
    userEmail: email,
    ipAddress,
    success: false,
    errorMessage: reason,
  });
}

export function logLogout(userId: string, email: string): void {
  auditLog({
    eventType: AuditEventType.LOGOUT,
    userId,
    userEmail: email,
    success: true,
  });
}

export function logPasswordChanged(userId: string, email: string): void {
  auditLog({
    eventType: AuditEventType.PASSWORD_CHANGED,
    userId,
    userEmail: email,
    success: true,
  });
}

/**
 * ============================================================================
 * AUTHORIZATION AUDIT LOGS
 * ============================================================================
 */

export function logAccessDenied(
  userId: string,
  resource: string,
  action: string,
  reason: string
): void {
  auditLog({
    eventType: AuditEventType.ACCESS_DENIED,
    userId,
    resource,
    action,
    success: false,
    errorMessage: reason,
  });
}

export function logRoleChanged(
  adminId: string,
  targetUserId: string,
  oldRole: string,
  newRole: string
): void {
  auditLog({
    eventType: AuditEventType.ROLE_CHANGED,
    userId: adminId,
    resource: `user:${targetUserId}`,
    action: "role_change",
    success: true,
    details: { oldRole, newRole },
  });
}

/**
 * ============================================================================
 * DATA OPERATION AUDIT LOGS
 * ============================================================================
 */

export function logTicketPurchase(
  userId: string,
  ticketId: string,
  eventId: string,
  amount: number,
  currency: string
): void {
  auditLog({
    eventType: AuditEventType.TICKET_PURCHASED,
    userId,
    resource: `ticket:${ticketId}`,
    action: "purchase",
    success: true,
    details: { eventId, amount, currency },
  });
}

export function logEventCreated(
  adminId: string,
  eventId: string,
  eventTitle: string
): void {
  auditLog({
    eventType: AuditEventType.EVENT_CREATED,
    userId: adminId,
    resource: `event:${eventId}`,
    action: "create",
    success: true,
    details: { eventTitle },
  });
}

/**
 * ============================================================================
 * SECURITY EVENT AUDIT LOGS
 * ============================================================================
 */

export function logRateLimitExceeded(
  ipAddress: string,
  endpoint: string
): void {
  auditLog({
    eventType: AuditEventType.RATE_LIMIT_EXCEEDED,
    ipAddress,
    resource: endpoint,
    success: false,
  });
}

export function logCsrfViolation(ipAddress?: string, origin?: string): void {
  auditLog({
    eventType: AuditEventType.CSRF_VIOLATION,
    ipAddress,
    success: false,
    details: { origin },
  });
}

export function logSecurityAlert(
  message: string,
  userId?: string,
  details?: Record<string, unknown>
): void {
  auditLog({
    eventType: AuditEventType.SECURITY_ALERT,
    userId,
    success: false,
    errorMessage: message,
    details,
  });
}

/**
 * ============================================================================
 * API ACCESS AUDIT LOGS
 * ============================================================================
 */

export function logApiRequest(
  method: string,
  path: string,
  userId?: string,
  statusCode?: number,
  duration?: number
): void {
  auditLog({
    eventType: AuditEventType.API_REQUEST,
    userId,
    resource: path,
    action: method,
    success: statusCode ? statusCode < 400 : true,
    metadata: { statusCode, duration },
  });
}

export function logApiError(
  method: string,
  path: string,
  error: string,
  userId?: string
): void {
  auditLog({
    eventType: AuditEventType.API_ERROR,
    userId,
    resource: path,
    action: method,
    success: false,
    errorMessage: error,
  });
}

/**
 * ============================================================================
 * PRIVACY HELPERS
 * ============================================================================
 */

/**
 * Mask email address for GDPR compliance
 * Example: john.doe@example.com -> j***@example.com
 */
function maskEmail(email?: string): string | undefined {
  if (!email) return undefined;

  const [local, domain] = email.split("@");
  if (!local || !domain) return "***@***";

  const maskedLocal = local[0] + "***";
  return `${maskedLocal}@${domain}`;
}

/**
 * Mask IP address
 * Example: 192.168.1.100 -> 192.168.***.***
 */
function maskIpAddress(ip?: string): string | undefined {
  if (!ip) return undefined;

  const parts = ip.split(".");
  if (parts.length !== 4) return "***";

  return `${parts[0]}.${parts[1]}.***.***`;
}

/**
 * ============================================================================
 * ERROR LOGGING
 * ============================================================================
 */

export function logError(
  error: Error,
  context?: Record<string, unknown>
): void {
  logger.error(
    {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      context,
    },
    "Application Error"
  );
}

export function logWarning(
  message: string,
  context?: Record<string, unknown>
): void {
  logger.warn({ context }, message);
}

export function logInfo(
  message: string,
  context?: Record<string, unknown>
): void {
  logger.info({ context }, message);
}

export function logDebug(
  message: string,
  context?: Record<string, unknown>
): void {
  logger.debug({ context }, message);
}
