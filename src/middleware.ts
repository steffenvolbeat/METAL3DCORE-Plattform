/**
 *src/middleware.ts
 * Middleware file
 * ============================================================================
 *  🔒 SECURITY MIDDLEWARE - METAL3DCORE Plattform
 * ============================================================================
 * [SECURITY FIX 2/12] - CSRF Protection and Access Control Middleware
 * [SECURITY FIX 5/12] - RATE LIMITING MIDDLEWARE
 * [SECURITY FIX 8/12] - SECURITY HEADERS MIDDLEWARE (HTTPS, HSTS, CSP, XSS)
 *
 * Handles:
 * - CSRF token Protection
 * - Rate limiting
 * - Security Headers (CSP, HSTS, X-FRAME-Options, etc.)
 * -API authentication checks
 *
 * Note: This middleware is part of a comprehensive security strategy.
 *       It should be used in conjunction with other security measures.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
//import { markAccessControl, ACCESS_COMING_SOON_PATHS } from "./app/lib/access-control";
import { ACCESS_COMING_SOON_PATHS, markAccessControl } from "./app/lib/access-control";

/**
 * Security Headers Configuration
 */
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.youtube.com https://s.ytimg.com",
      "script-src-elem 'self' 'unsafe-eval' 'unsafe-inline' blob: https://www.youtube.com https://s.ytimg.com",
      "worker-src 'self' blob:",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https: https://i.ytimg.com https://img.youtube.com",
      "font-src 'self' data:",
      "connect-src 'self' https: wss:",
      "media-src 'self' blob: https: https://www.youtube.com",
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
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
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly limit = 100;
  private readonly windowMs = 60 * 1000;

  check(identifier: string): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const userRequests = this.requests.get(identifier) || [];
    const recentRequests = userRequests.filter(time => time > windowStart);
    const allowed = recentRequests.length < this.limit;
    if (allowed) {
      recentRequests.push(now);
      this.requests.set(identifier, recentRequests);
    }
    return { allowed, remaining: Math.max(0, this.limit - recentRequests.length) };
  }

  cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    for (const [identifier, requests] of this.requests.entries()) {
      const recentRequests = requests.filter(time => time > windowStart);
      if (recentRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, recentRequests);
      }
    }
  }
}

const rateLimiter = new RateLimiter();
if (typeof setInterval !== "undefined") {
  setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);
}

/**
 * CSRF Token Validation (simplified)
 */
function validateCsrfToken(request: NextRequest): boolean {
  const method = request.method;
  if (!["POST", "PUT", "DELETE", "PATCH"].includes(method)) return true;
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return true;
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (process.env.NODE_ENV === "development" && origin?.includes("localhost")) return true;
  if (origin && host) {
    const originUrl = new URL(origin);
    const expectedOrigin = `${originUrl.protocol}//${host}`;
    if (origin !== expectedOrigin) return false;
  }
  return true;
}

/**
 * Main Middleware Function
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAccessComingSoon = ACCESS_COMING_SOON_PATHS.some(p => pathname.startsWith(p));
  if (isAccessComingSoon) {
    console.warn("⚠️ Access-Control Coming Soon: keine Sperren aktiv.");
  }

  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

  const rateLimitResult = rateLimiter.check(ip);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Too many requests", message: "Rate limit exceeded. Please try again later." },
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

  if (pathname.startsWith("/api/")) {
    if (!validateCsrfToken(request)) {
      return NextResponse.json(
        { error: "Invalid CSRF token", message: "Request origin validation failed." },
        { status: 403 }
      );
    }
  }

  const response = NextResponse.next();

  securityHeaders.forEach(({ key, value }) => {
    response.headers.set(key, value);
  });
  response.headers.set("X-RateLimit-Limit", "100");
  response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString());

  markAccessControl(response, pathname);
  return response;
}

/**
 * Middleware Configuration
 */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"], ///
};
