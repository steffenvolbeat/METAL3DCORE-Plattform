/**
 * ============================================================================
 * 🔐 SECRETS MANAGEMENT - Metal3DCore Platform
 * ============================================================================
 * [SECURITY FIX 1/12] - Secrets Manager Implementation
 *
 * This module handles secure access to sensitive configuration values.
 *
 * PRODUCTION DEPLOYMENT:
 * - Use Render Environment Groups / Vercel Environment Variables
 * - Never commit actual secrets to Git
 * - Rotate secrets regularly
 *
 * For advanced secret management, consider:
 * - HashiCorp Vault
 * - AWS Secrets Manager
 * - Azure Key Vault
 * ============================================================================
 */

/**
 * Validates that required environment variables are present
 * Throws an error if critical secrets are missing
 */
function validateRequiredSecrets(): void {
  const required = ["DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL"];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `❌ CRITICAL: Missing required environment variables:\n` +
        missing.map((key) => `  - ${key}`).join("\n") +
        `\n\nPlease check your .env file or environment configuration.`
    );
  }

  // Validate NEXTAUTH_SECRET strength
  const secret = process.env.NEXTAUTH_SECRET!;
  if (secret.length < 32) {
    throw new Error(
      `❌ SECURITY: NEXTAUTH_SECRET must be at least 32 characters long.\n` +
        `Current length: ${secret.length}\n` +
        `Generate a strong secret with: openssl rand -base64 32`
    );
  }

  // Warning for development placeholder
  if (secret === "please-change-me") {
    console.warn(
      `⚠️  WARNING: Using default NEXTAUTH_SECRET!\n` +
        `   This is INSECURE for production. Generate a strong secret.`
    );
  }
}

/**
 * Secrets configuration object with validation
 */
export const secrets = {
  /**
   * Database connection string
   * @security Never log or expose this value
   */
  get databaseUrl(): string {
    validateRequiredSecrets();
    return process.env.DATABASE_URL!;
  },

  /**
   * NextAuth.js secret for session encryption
   * @security Must be at least 32 characters
   */
  get nextAuthSecret(): string {
    validateRequiredSecrets();
    return process.env.NEXTAUTH_SECRET!;
  },

  /**
   * NextAuth.js URL configuration
   */
  get nextAuthUrl(): string {
    validateRequiredSecrets();
    return process.env.NEXTAUTH_URL!;
  },

  /**
   * Stripe API Keys (optional)
   */
  stripe: {
    get publishableKey(): string | undefined {
      return process.env.STRIPE_PUBLISHABLE_KEY;
    },
    get secretKey(): string | undefined {
      return process.env.STRIPE_SECRET_KEY;
    },
    get webhookSecret(): string | undefined {
      return process.env.STRIPE_WEBHOOK_SECRET;
    },
  },

  /**
   * Email configuration (optional)
   */
  email: {
    get serverHost(): string | undefined {
      return process.env.EMAIL_SERVER_HOST;
    },
    get serverPort(): number | undefined {
      return process.env.EMAIL_SERVER_PORT
        ? parseInt(process.env.EMAIL_SERVER_PORT, 10)
        : undefined;
    },
    get serverUser(): string | undefined {
      return process.env.EMAIL_SERVER_USER;
    },
    get serverPassword(): string | undefined {
      return process.env.EMAIL_SERVER_PASSWORD;
    },
    get from(): string | undefined {
      return process.env.EMAIL_FROM;
    },
  },

  /**
   * Node environment
   */
  get nodeEnv(): string {
    return process.env.NODE_ENV || "development";
  },

  /**
   * Check if running in production
   */
  get isProduction(): boolean {
    return this.nodeEnv === "production";
  },

  /**
   * Check if running in development
   */
  get isDevelopment(): boolean {
    return this.nodeEnv === "development";
  },
} as const;

/**
 * Initialize secrets validation on module load
 * This ensures the application fails fast if secrets are misconfigured
 */
if (typeof window === "undefined") {
  // Only validate on server-side
  try {
    validateRequiredSecrets();
    console.log("✅ Secrets validation passed");
  } catch (error) {
    console.error(error);
    if (secrets.isProduction) {
      // In production, fail hard
      process.exit(1);
    }
  }
}

/**
 * Utility to safely log environment info (without exposing secrets)
 */
export function getEnvironmentInfo(): Record<string, unknown> {
  return {
    nodeEnv: secrets.nodeEnv,
    isProduction: secrets.isProduction,
    isDevelopment: secrets.isDevelopment,
    nextAuthUrl: secrets.nextAuthUrl,
    hasStripeConfig: !!(
      secrets.stripe.publishableKey && secrets.stripe.secretKey
    ),
    hasEmailConfig: !!(secrets.email.serverHost && secrets.email.serverUser),
    databaseConfigured: !!process.env.DATABASE_URL,
    // Never log actual secret values!
  };
}
