/**
 * ============================================================================
 * ✅ INPUT VALIDATION SCHEMAS - Metal3DCore Platform
 * ============================================================================
 * [SECURITY FIX 4/12] - Input Validation with Zod
 *
 * This module contains Zod validation schemas for all API endpoints.
 *
 * SECURITY PRINCIPLES:
 * - Validate ALL user input on the server-side
 * - Never trust client-side validation alone
 * - Sanitize input before database operations
 * - Return generic error messages to prevent information leakage
 * ============================================================================
 */

import { z } from "zod";

/**
 * ============================================================================
 * USER & AUTHENTICATION SCHEMAS
 * ============================================================================
 */

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email format")
  .max(255, "Email too long");

export const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .max(128, "Password too long")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    "Password must contain uppercase, lowercase, number, and special character"
  );

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  role: z.enum(["FAN", "BAND", "BENEFIZ", "ADMIN"]).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: emailSchema.optional(),
  image: z.string().url().optional(),
});

/**
 * ============================================================================
 * TICKET SCHEMAS
 * ============================================================================
 */

export const ticketTypeSchema = z.enum(["STANDARD", "VIP", "BACKSTAGE"]);

export const ticketPurchaseSchema = z.object({
  eventId: z.string().uuid("Invalid event ID"),
  ticketType: ticketTypeSchema,
  quantity: z
    .number()
    .int()
    .min(1, "Minimum 1 ticket")
    .max(10, "Maximum 10 tickets per order"),
  paymentMethodId: z.string().optional(),
});

export const ticketValidationSchema = z.object({
  ticketId: z.string().uuid(),
  qrCode: z.string().min(1),
});

/**
 * ============================================================================
 * EVENT SCHEMAS
 * ============================================================================
 */

export const createEventSchema = z.object({
  title: z.string().min(3, "Title too short").max(200, "Title too long"),
  description: z.string().min(10).max(5000),
  date: z.string().datetime("Invalid date format"),
  venue: z.string().min(2).max(200),
  city: z.string().min(2).max(100),
  country: z.string().min(2).max(100),
  priceStandard: z.number().min(0).max(10000),
  priceVIP: z.number().min(0).max(10000),
  priceBackstage: z.number().min(0).max(10000),
  capacity: z.number().int().min(1).max(100000),
  imageUrl: z.string().url().optional(),
});

export const updateEventSchema = createEventSchema.partial();

/**
 * ============================================================================
 * CONTACT FORM SCHEMAS
 * ============================================================================
 */

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name too short").max(100, "Name too long"),
  email: emailSchema,
  subject: z.string().min(3, "Subject too short").max(200, "Subject too long"),
  message: z
    .string()
    .min(10, "Message too short")
    .max(5000, "Message too long"),
});

/**
 * ============================================================================
 * ADMIN SCHEMAS
 * ============================================================================
 */

export const adminRoleUpdateSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["FAN", "BAND", "BENEFIZ", "ADMIN"]),
});

export const adminUserDeleteSchema = z.object({
  userId: z.string().uuid(),
  confirmEmail: emailSchema,
});

/**
 * ============================================================================
 * COMING SOON PAGE SCHEMAS
 * ============================================================================
 */

export const comingSoonUpdateSchema = z.object({
  vision: z.string().min(10).max(1000).optional(),
  milestones: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().min(3).max(100),
        status: z.enum(["complete", "in-progress", "planned"]),
        progress: z.number().int().min(0).max(100),
      })
    )
    .optional(),
});

/**
 * ============================================================================
 * PAGINATION & FILTERING SCHEMAS
 * ============================================================================
 */

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * ============================================================================
 * PAYMENT SCHEMAS
 * ============================================================================
 */

export const stripePaymentSchema = z.object({
  amount: z
    .number()
    .int()
    .min(100, "Minimum amount is 1 CHF")
    .max(100000, "Maximum amount exceeded"),
  currency: z.enum(["CHF", "EUR", "USD"]).default("CHF"),
  paymentMethodId: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * ============================================================================
 * FILE UPLOAD SCHEMAS
 * ============================================================================
 */

export const fileUploadSchema = z.object({
  filename: z.string().min(1).max(255),
  mimetype: z
    .string()
    .regex(
      /^(image|video|application)\/(jpeg|jpg|png|gif|webp|mp4|pdf)$/i,
      "Invalid file type"
    ),
  size: z
    .number()
    .int()
    .min(1)
    .max(10 * 1024 * 1024, "File size must be less than 10MB"),
});

/**
 * ============================================================================
 * API HELPERS
 * ============================================================================
 */

/**
 * Validate request body against a schema
 * Returns parsed data or throws validation error
 */
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Validation failed: ${error.issues
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ")}`
      );
    }
    throw error;
  }
}

/**
 * Validate request body safely
 * Returns success/error object instead of throwing
 */
export function safeValidateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    error: result.error.issues
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join(", "),
  };
}

/**
 * Type exports for TypeScript
 */
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type TicketPurchaseInput = z.infer<typeof ticketPurchaseSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type StripePaymentInput = z.infer<typeof stripePaymentSchema>;
