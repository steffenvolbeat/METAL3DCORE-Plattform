/**
 * ============================================================================
 * 🔑 PASSWORD SECURITY - Metal3DCore Platform
 * ============================================================================
 * [SECURITY FIX 5/12] - Strong Password Policy + HIBP Integration
 *
 * This module handles:
 * - Password strength validation (12+ chars, complexity)
 * - Have I Been Pwned (HIBP) API integration
 * - Secure password hashing with bcrypt
 * - Password reset token generation
 * ============================================================================
 */

import bcrypt from "bcryptjs";
import crypto from "crypto";

/**
 * Password Policy Configuration
 */
export const PASSWORD_POLICY = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: "@$!%*?&",
} as const;

/**
 * Password Strength Validation
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < PASSWORD_POLICY.minLength) {
    errors.push(
      `Password must be at least ${PASSWORD_POLICY.minLength} characters`
    );
  }

  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (PASSWORD_POLICY.requireNumbers && !/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (
    PASSWORD_POLICY.requireSpecialChars &&
    !new RegExp(
      `[${PASSWORD_POLICY.specialChars.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}]`
    ).test(password)
  ) {
    errors.push(
      `Password must contain at least one special character (${PASSWORD_POLICY.specialChars})`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if password has been compromised using Have I Been Pwned API
 * Uses k-Anonymity model - only sends first 5 chars of SHA-1 hash
 *
 * @see https://haveibeenpwned.com/API/v3#PwnedPasswords
 */
export async function checkPasswordCompromised(password: string): Promise<{
  compromised: boolean;
  occurrences: number;
}> {
  try {
    // Generate SHA-1 hash of password
    const sha1Hash = crypto
      .createHash("sha1")
      .update(password)
      .digest("hex")
      .toUpperCase();

    // Send only first 5 characters to API (k-Anonymity)
    const prefix = sha1Hash.substring(0, 5);
    const suffix = sha1Hash.substring(5);

    // Query HIBP API
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      {
        headers: {
          "User-Agent": "Metal3DCore-Platform",
        },
      }
    );

    if (!response.ok) {
      console.error("HIBP API error:", response.statusText);
      // Fail open - don't block user if API is down
      return { compromised: false, occurrences: 0 };
    }

    const text = await response.text();

    // Parse response: each line is "SUFFIX:COUNT"
    const hashes = text.split("\n");
    for (const line of hashes) {
      const [hashSuffix, count] = line.split(":");
      if (hashSuffix === suffix) {
        return {
          compromised: true,
          occurrences: parseInt(count, 10),
        };
      }
    }

    return { compromised: false, occurrences: 0 };
  } catch (error) {
    console.error("Error checking password with HIBP:", error);
    // Fail open - don't block user if API is unreachable
    return { compromised: false, occurrences: 0 };
  }
}

/**
 * Hash password securely using bcrypt
 *
 * @param password - Plain text password
 * @param saltRounds - Number of salt rounds (default: 12)
 */
export async function hashPassword(
  password: string,
  saltRounds: number = 12
): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare password with hashed password
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate secure random token for password reset
 *
 * @param bytes - Number of random bytes (default: 32)
 */
export function generateResetToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

/**
 * Comprehensive password validation
 * Checks both strength and if password has been compromised
 */
export async function validatePassword(password: string): Promise<{
  valid: boolean;
  errors: string[];
  warnings: string[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check password strength
  const strengthCheck = validatePasswordStrength(password);
  if (!strengthCheck.valid) {
    errors.push(...strengthCheck.errors);
  }

  // Check if password has been compromised
  try {
    const compromisedCheck = await checkPasswordCompromised(password);
    if (compromisedCheck.compromised) {
      errors.push(
        `This password has been found in ${compromisedCheck.occurrences.toLocaleString()} data breaches. ` +
          `Please choose a different password.`
      );
    }
  } catch (error) {
    console.error("Password compromise check failed:", error);
    warnings.push(
      "Unable to verify if password has been compromised. Please choose a strong, unique password."
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Generate a strong random password
 * Useful for temporary passwords or password reset emails
 */
export function generateStrongPassword(length: number = 16): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = PASSWORD_POLICY.specialChars;
  const all = uppercase + lowercase + numbers + special;

  // Ensure at least one character from each required set
  let password = "";
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill remaining length with random characters
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}
