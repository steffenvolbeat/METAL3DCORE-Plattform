/**
 * ============================================================================
 * 🛡️ XSS PROTECTION - Metal3DCore Platform
 * ============================================================================
 * [SECURITY FIX 6/12] - XSS Sanitization with DOMPurify
 *
 * This module handles sanitization of user-generated content to prevent
 * Cross-Site Scripting (XSS) attacks.
 *
 * SECURITY PRINCIPLES:
 * - Sanitize ALL user input before rendering
 * - Use DOMPurify for HTML sanitization
 * - Configure strict CSP headers (see middleware.ts)
 * - Never use dangerouslySetInnerHTML without sanitization
 * ============================================================================
 */

import DOMPurify from "isomorphic-dompurify";

/**
 * DOMPurify Configuration Presets
 */
const SANITIZE_CONFIG = {
  /**
   * Strict: Remove all HTML tags and attributes
   * Use for: Plain text content, search queries, form inputs
   */
  strict: {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  },

  /**
   * Basic: Allow safe basic formatting
   * Use for: Comments, descriptions, user bios
   */
  basic: {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li"],
    ALLOWED_ATTR: ["href", "title", "target"],
    ALLOWED_URI_REGEXP: /^(?:(?:https?):\/\/|mailto:|tel:)/i,
  },

  /**
   * Rich: Allow more formatting for rich content
   * Use for: Event descriptions, blog posts, announcements
   */
  rich: {
    ALLOWED_TAGS: [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "br",
      "hr",
      "b",
      "i",
      "em",
      "strong",
      "u",
      "s",
      "a",
      "img",
      "ul",
      "ol",
      "li",
      "blockquote",
      "pre",
      "code",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
    ],
    ALLOWED_ATTR: [
      "href",
      "title",
      "target",
      "rel",
      "src",
      "alt",
      "width",
      "height",
      "class",
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:https?):\/\/|mailto:|tel:)/i,
    ALLOW_DATA_ATTR: false,
  },
} as const;

/**
 * Sanitize HTML content
 *
 * @param dirty - Potentially unsafe HTML string
 * @param level - Sanitization level: 'strict' | 'basic' | 'rich'
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(
  dirty: string,
  level: "strict" | "basic" | "rich" = "basic"
): string {
  if (!dirty || typeof dirty !== "string") {
    return "";
  }

  const config = SANITIZE_CONFIG[level];
  return DOMPurify.sanitize(dirty, config as any) as unknown as string;
}

/**
 * Sanitize plain text (removes all HTML)
 * Use for user input that should never contain HTML
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  // Remove all HTML tags and decode entities
  return DOMPurify.sanitize(
    text,
    SANITIZE_CONFIG.strict as any
  ) as unknown as string;
}

/**
 * Sanitize URL to prevent javascript: and data: URIs
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== "string") {
    return "";
  }

  // Allow only http, https, mailto, tel protocols
  const safeProtocols = /^(https?|mailto|tel):/i;

  try {
    const urlObj = new URL(url);
    if (safeProtocols.test(urlObj.protocol)) {
      return url;
    }
  } catch {
    // Invalid URL
    return "";
  }

  return "";
}

/**
 * Sanitize user input for database storage
 * This prevents stored XSS attacks
 */
export function sanitizeForStorage(
  input: string,
  level: "strict" | "basic" | "rich" = "basic"
): string {
  // First sanitize HTML
  let sanitized = sanitizeHtml(input, level);

  // Trim whitespace
  sanitized = sanitized.trim();

  // Limit length to prevent DoS
  const maxLength = 50000; // 50KB
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Sanitize object properties recursively
 * Useful for sanitizing entire request bodies
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  level: "strict" | "basic" | "rich" = "strict"
): T {
  const sanitized = {} as T;

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key as keyof T] = sanitizeHtml(value, level) as T[keyof T];
    } else if (Array.isArray(value)) {
      sanitized[key as keyof T] = value.map((item) =>
        typeof item === "string" ? sanitizeHtml(item, level) : item
      ) as T[keyof T];
    } else if (value && typeof value === "object") {
      sanitized[key as keyof T] = sanitizeObject(
        value as Record<string, unknown>,
        level
      ) as T[keyof T];
    } else {
      sanitized[key as keyof T] = value as T[keyof T];
    }
  }

  return sanitized;
}

/**
 * React component helper for safe HTML rendering
 * Use with dangerouslySetInnerHTML
 *
 * @example
 * <div dangerouslySetInnerHTML={createSafeMarkup(userContent, 'basic')} />
 */
export function createSafeMarkup(
  content: string,
  level: "strict" | "basic" | "rich" = "basic"
): { __html: string } {
  return {
    __html: sanitizeHtml(content, level),
  };
}

/**
 * Validate and sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== "string") {
    return "";
  }

  // Remove all HTML and trim
  const cleaned = sanitizeText(email).trim().toLowerCase();

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleaned)) {
    return "";
  }

  return cleaned;
}

/**
 * Sanitize filename for safe file uploads
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== "string") {
    return "";
  }

  // Remove path traversal attempts
  let safe = filename.replace(/\.\./g, "");

  // Remove special characters except dots, dashes, underscores
  safe = safe.replace(/[^a-zA-Z0-9._-]/g, "_");

  // Limit length
  if (safe.length > 255) {
    const ext = safe.split(".").pop() || "";
    const name = safe.substring(0, 250 - ext.length);
    safe = `${name}.${ext}`;
  }

  return safe;
}

/**
 * Escape special characters for use in RegExp
 */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Encode HTML entities
 * Alternative to full sanitization when you want to preserve the exact input
 */
export function encodeHtmlEntities(str: string): string {
  if (!str || typeof str !== "string") {
    return "";
  }

  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return str.replace(/[&<>"'/]/g, (char) => entities[char] || char);
}

/**
 * Decode HTML entities
 */
export function decodeHtmlEntities(str: string): string {
  if (!str || typeof str !== "string") {
    return "";
  }

  const entities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#x27;": "'",
    "&#x2F;": "/",
  };

  return str.replace(
    /&(?:amp|lt|gt|quot|#x27|#x2F);/g,
    (entity) => entities[entity] || entity
  );
}
