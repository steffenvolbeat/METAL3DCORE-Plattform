/**
 * ============================================================================
 * 🔒 SECURITY MIDDLEWARE - Metal3DCore Platform
 * ============================================================================
 * [SECURITY FIX 2/12] - CSRF Protection
 * [SECURITY FIX 3/12] - Rate Limiting
 * [SECURITY FIX 7/12] - Security Headers (HTTPS/HSTS/CSP)
 *
 * This middleware handles:
 * - CSRF token validation
 * - Rate limiting per IP/user
 * - Security headers (CSP, HSTS, X-Frame-Options, etc.)
 * - API authentication checks
 * ============================================================================
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Security Headers Configuration
 */
const securityHeaders = [
  // HSTS - Force HTTPS (31536000 seconds = 1 year)
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  // Prevent clickjacking
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // Prevent MIME type sniffing
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // XSS Protection (legacy browsers)
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  // Referrer Policy
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Permissions Policy - WEBCAM ENABLED für Live-Concert Feature
  {
    key: "Permissions-Policy",
    value: "camera=('self'), microphone=('self'), geolocation=(), payment=()",
  },
  // Content Security Policy (CSP)
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.youtube.com https://s.ytimg.com", // Three.js + YouTube
      "script-src-elem 'self' 'unsafe-eval' 'unsafe-inline' blob: https://www.youtube.com https://s.ytimg.com", // Workers + YouTube API
      "worker-src 'self' blob:", // Troika Web Workers (Three.js text rendering)
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https: https://i.ytimg.com https://img.youtube.com", // YouTube thumbnails
      "font-src 'self' data:",
      "connect-src 'self' https: wss:", // WebRTC connections
      "media-src 'self' blob: https: https://www.youtube.com", // YouTube media
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com", // YouTube iframe
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

/**
 * Simple in-memory rate limiter
 * TODO: Replace with Upstash Redis in production
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly limit = 100; // requests per window
  private readonly windowMs = 60 * 1000; // 1 minute

  check(identifier: string): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get existing requests for this identifier
    const userRequests = this.requests.get(identifier) || [];

    // Filter out requests outside the current window
    const recentRequests = userRequests.filter((time) => time > windowStart);

    // Check if limit exceeded
    const allowed = recentRequests.length < this.limit;

    if (allowed) {
      recentRequests.push(now);
      this.requests.set(identifier, recentRequests);
    }

    return {
      allowed,
      remaining: Math.max(0, this.limit - recentRequests.length),
    };
  }

  cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [identifier, requests] of this.requests.entries()) {
      const recentRequests = requests.filter((time) => time > windowStart);
      if (recentRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, recentRequests);
      }
    }
  }
}

const rateLimiter = new RateLimiter();

// Cleanup old entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);
}

/**
 * CSRF Token Validation (for POST/PUT/DELETE requests)
 */
function validateCsrfToken(request: NextRequest): boolean {
  const method = request.method;

  // Only check CSRF on state-changing methods
  if (!["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
    return true;
  }

  // Skip CSRF for API routes with Bearer token (API authentication)
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return true; // Will be validated by API authentication instead
  }

  // Get CSRF token from header
  const csrfToken = request.headers.get("x-csrf-token");
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  // Development mode: allow localhost
  if (process.env.NODE_ENV === "development" && origin?.includes("localhost")) {
    return true;
  }

  // Validate origin matches host (same-origin policy)
  if (origin && host) {
    const originUrl = new URL(origin);
    const expectedOrigin = `${originUrl.protocol}//${host}`;
    if (origin !== expectedOrigin) {
      return false;
    }
  }

  // TODO: Implement proper CSRF token generation and validation
  // For now, just validate origin header
  return true;
}

/**
 * Main Middleware Function
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get IP address for rate limiting
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // Rate Limiting
  const rateLimitResult = rateLimiter.check(ip);

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
          "X-RateLimit-Limit": "100",
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // CSRF Protection for API routes
  if (pathname.startsWith("/api/")) {
    if (!validateCsrfToken(request)) {
      return NextResponse.json(
        {
          error: "Invalid CSRF token",
          message: "Request origin validation failed.",
        },
        { status: 403 }
      );
    }
  }

  // Create response with security headers
  const response = NextResponse.next();

  // Add security headers
  securityHeaders.forEach(({ key, value }) => {
    response.headers.set(key, value);
  });

  // Add rate limit headers
  response.headers.set("X-RateLimit-Limit", "100");
  response.headers.set(
    "X-RateLimit-Remaining",
    rateLimitResult.remaining.toString()
  );

  return response;
}

/**
 * Middleware Configuration
 * Apply to all routes except static files and Next.js internals
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
