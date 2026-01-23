/**
 * Utility validation functions for Metal3DCore Platform
 */

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 * Requirements:
 * - Minimum 12 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export function validatePassword(password: string): boolean {
  if (!password || typeof password !== "string") return false;
  if (password.length < 12) return false;

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[@$!%*?&]/.test(password);

  return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
}

/**
 * Sanitizes user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input.replace(/<[^>]*>/g, "");
}

/**
 * Validates UUID format
 */
export function validateUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== "string") return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
