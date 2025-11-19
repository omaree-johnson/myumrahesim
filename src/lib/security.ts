/**
 * Security utilities for input validation, sanitization, and security checks
 */

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Additional checks
  if (email.length > 254) { // RFC 5321 limit
    return false;
  }
  
  if (email.length < 3) { // Minimum: a@b
    return false;
  }
  
  return emailRegex.test(email);
}

/**
 * Sanitizes string input to prevent XSS attacks
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');
  
  // Truncate to max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  // Remove potentially dangerous characters but keep basic formatting
  // This is a basic sanitization - for HTML content, use a proper HTML sanitizer
  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
  
  return sanitized.trim();
}

/**
 * Validates and sanitizes transaction ID format
 */
export function isValidTransactionId(transactionId: string): boolean {
  if (!transactionId || typeof transactionId !== 'string') {
    return false;
  }
  
  // Transaction IDs should match pattern: txn_timestamp_randomstring
  // Allow alphanumeric, underscore, and hyphen
  const transactionIdRegex = /^txn_\d+_[a-zA-Z0-9_-]+$/;
  
  if (transactionId.length > 100) {
    return false;
  }
  
  return transactionIdRegex.test(transactionId);
}

/**
 * Validates offer ID format
 */
export function isValidOfferId(offerId: string): boolean {
  if (!offerId || typeof offerId !== 'string') {
    return false;
  }
  
  // Offer IDs should be alphanumeric with possible hyphens/underscores
  const offerIdRegex = /^[a-zA-Z0-9_-]+$/;
  
  if (offerId.length > 100 || offerId.length < 1) {
    return false;
  }
  
  return offerIdRegex.test(offerId);
}

/**
 * Validates full name (allows letters, spaces, hyphens, apostrophes)
 */
export function isValidFullName(name: string): boolean {
  if (!name || typeof name !== 'string') {
    return false;
  }
  
  // Allow letters, spaces, hyphens, apostrophes, and common international characters
  const nameRegex = /^[\p{L}\s'-]+$/u;
  
  if (name.length > 200 || name.length < 1) {
    return false;
  }
  
  return nameRegex.test(name.trim());
}

/**
 * Sanitizes HTML content to prevent XSS (basic implementation)
 * For production, consider using a library like DOMPurify
 */
export function sanitizeHTML(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '');
}

/**
 * Rate limiting helper (in-memory, simple implementation)
 * For production, use Redis or a proper rate limiting service
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute default
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const key = identifier;
  const record = rateLimitStore.get(key);
  
  // Clean up old entries periodically
  if (rateLimitStore.size > 10000) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < now) {
        rateLimitStore.delete(k);
      }
    }
  }
  
  if (!record || record.resetTime < now) {
    // Create new record
    const resetTime = now + windowMs;
    rateLimitStore.set(key, { count: 1, resetTime });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: resetTime
    };
  }
  
  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetTime
    };
  }
  
  // Increment count
  record.count++;
  rateLimitStore.set(key, record);
  
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetAt: record.resetTime
  };
}

/**
 * Gets client IP address from request
 */
export function getClientIP(request: Request): string {
  // Check various headers (in order of preference)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP if there are multiple
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP.trim();
  }
  
  return 'unknown';
}

/**
 * Validates that a string is a valid UUID format
 */
export function isValidUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') {
    return false;
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validates request body size to prevent DoS attacks
 * @param contentLength - Content-Length header value
 * @param maxSizeBytes - Maximum allowed size in bytes (default: 1MB)
 */
export function validateBodySize(contentLength: string | null, maxSizeBytes: number = 1024 * 1024): { valid: boolean; error?: string } {
  if (!contentLength) {
    return { valid: true }; // No size limit if Content-Length not provided
  }
  
  const size = parseInt(contentLength, 10);
  if (isNaN(size)) {
    return { valid: false, error: 'Invalid Content-Length header' };
  }
  
  if (size > maxSizeBytes) {
    return { valid: false, error: `Request body too large. Maximum size: ${maxSizeBytes / 1024}KB` };
  }
  
  return { valid: true };
}

/**
 * Validates CSRF token (basic implementation)
 * For production, use a proper CSRF library
 * @param request - NextRequest object
 * @param expectedOrigin - Expected origin (from environment)
 */
export function validateCSRF(request: Request, expectedOrigin?: string): { valid: boolean; error?: string } {
  // In Next.js, CSRF is handled by framework for same-origin requests
  // This is a basic check for cross-origin requests
  
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  // Allow same-origin requests
  if (!origin && !referer) {
    return { valid: true }; // Same-origin request
  }
  
  // If expected origin is set, validate against it
  if (expectedOrigin && origin) {
    try {
      const originUrl = new URL(origin);
      const expectedUrl = new URL(expectedOrigin);
      
      if (originUrl.origin !== expectedUrl.origin) {
        return { valid: false, error: 'Invalid origin' };
      }
    } catch {
      return { valid: false, error: 'Invalid origin format' };
    }
  }
  
  return { valid: true };
}

