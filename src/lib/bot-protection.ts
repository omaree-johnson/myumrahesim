/**
 * Enterprise-Grade Bot & Abuse Protection
 * Provides rate limiting, bot detection, and challenge escalation
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { getClientIP } from "./security";

// Initialize Redis client (with fallback)
let redis: Redis | null = null;
let redisInitialized = false;

function initRedis() {
  if (redisInitialized) return;
  
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      redisInitialized = true;
    } catch (error) {
      console.error("[Bot Protection] Failed to initialize Redis:", error);
    }
  }
  
  redisInitialized = true;
}

// Initialize on module load
initRedis();

/**
 * Rate limiters for different endpoint tiers
 */

// Tier 1: Strict (Authentication & Checkout)
export const signupLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "1 h"), // 3 per hour
      analytics: true,
      prefix: "ratelimit:signup",
    })
  : null;

export const loginLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 per 15 minutes
      analytics: true,
      prefix: "ratelimit:login",
    })
  : null;

export const passwordResetLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "1 h"), // 3 per hour
      analytics: true,
      prefix: "ratelimit:password-reset",
    })
  : null;

export const paymentIntentLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 per minute
      analytics: true,
      prefix: "ratelimit:payment-intent",
    })
  : null;

export const checkoutSessionLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 per minute
      analytics: true,
      prefix: "ratelimit:checkout-session",
    })
  : null;

export const cartPaymentLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 per minute
      analytics: true,
      prefix: "ratelimit:cart-payment",
    })
  : null;

// Tier 2: Moderate (Product & Order APIs)
export const productsLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"), // 30 per minute
      analytics: true,
      prefix: "ratelimit:products",
    })
  : null;

export const ordersGetLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 per minute
      analytics: true,
      prefix: "ratelimit:orders-get",
    })
  : null;

export const ordersPostLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 per minute
      analytics: true,
      prefix: "ratelimit:orders-post",
    })
  : null;

export const purchaseStatusLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "1 m"), // 20 per minute
      analytics: true,
      prefix: "ratelimit:purchase-status",
    })
  : null;

// Tier 3: Lenient (Public Content)
export const healthCheckLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 m"), // 60 per minute
      analytics: true,
      prefix: "ratelimit:health",
    })
  : null;

/**
 * Check rate limit with multiple identifiers
 */
export async function checkRateLimitMulti(
  request: Request,
  limiter: Ratelimit | null,
  identifiers: string[]
): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: number;
  identifier: string;
  requiresChallenge: boolean;
}> {
  // Fallback to in-memory if Redis not available
  if (!limiter || !redis) {
    const { checkRateLimit } = await import("./security");
    const clientIP = getClientIP(request);
    const identifier = identifiers[0] || `ip:${clientIP}`;
    const result = checkRateLimit(identifier, 10, 60000);
    return {
      ...result,
      identifier,
      requiresChallenge: !result.allowed,
    };
  }

  // Check all identifiers - if any exceeds limit, block
  let worstResult: {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
  } | null = null;

  let worstIdentifier = identifiers[0];

  for (const identifier of identifiers) {
    const result = await limiter.limit(identifier);
    
    if (!result.success && (!worstResult || result.remaining < worstResult.remaining)) {
      worstResult = result;
      worstIdentifier = identifier;
    } else if (result.success && !worstResult) {
      worstResult = result;
      worstIdentifier = identifier;
    }
  }

  if (!worstResult) {
    return {
      allowed: true,
      remaining: 999,
      resetAt: Date.now() + 60000,
      identifier: worstIdentifier,
      requiresChallenge: false,
    };
  }

  return {
    allowed: worstResult.success,
    remaining: worstResult.remaining,
    resetAt: worstResult.reset,
    identifier: worstIdentifier,
    requiresChallenge: !worstResult.success || worstResult.remaining < 3,
  };
}

/**
 * Get rate limit identifiers for a request
 */
export function getRateLimitIdentifiers(
  request: Request,
  userId?: string | null,
  email?: string | null
): string[] {
  const clientIP = getClientIP(request);
  const identifiers: string[] = [`ip:${clientIP}`];

  if (userId) {
    identifiers.push(`user:${userId}`);
  }

  if (email) {
    identifiers.push(`email:${email.toLowerCase()}`);
  }

  // Add endpoint identifier
  const url = new URL(request.url);
  identifiers.push(`endpoint:${url.pathname}:${clientIP}`);

  return identifiers;
}

/**
 * Bot detection signals from request
 */
export interface BotDetectionSignals {
  suspiciousUserAgent: boolean;
  missingReferrer: boolean;
  missingCookies: boolean;
  suspiciousHeaders: boolean;
  rapidRequests: boolean;
  score: number; // 0-100, higher = more suspicious
}

export function detectBotSignals(request: Request): BotDetectionSignals {
  const userAgent = request.headers.get("user-agent") || "";
  const referrer = request.headers.get("referer") || request.headers.get("referrer") || "";
  const cookie = request.headers.get("cookie") || "";
  
  let score = 0;

  // Check user agent
  const suspiciousUA = 
    !userAgent ||
    userAgent.length < 10 ||
    /bot|crawler|spider|scraper/i.test(userAgent) ||
    /^[A-Za-z0-9\s]+$/.test(userAgent) && userAgent.length < 20; // Too simple

  if (suspiciousUA) score += 30;

  // Check referrer
  const missingReferrer = !referrer && request.method === "GET";
  if (missingReferrer) score += 20;

  // Check cookies
  const missingCookies = !cookie;
  if (missingCookies) score += 25;

  // Check headers
  const cfRay = request.headers.get("cf-ray"); // Cloudflare
  const xForwardedFor = request.headers.get("x-forwarded-for");
  const suspiciousHeaders = !cfRay && !xForwardedFor && process.env.NODE_ENV === "production";
  if (suspiciousHeaders) score += 15;

  // Check for rapid requests (would need to track in Redis)
  // This is a placeholder - implement with Redis tracking
  const rapidRequests = false; // TODO: Implement with Redis
  if (rapidRequests) score += 10;

  return {
    suspiciousUserAgent: suspiciousUA,
    missingReferrer: missingReferrer,
    missingCookies: missingCookies,
    suspiciousHeaders: suspiciousHeaders,
    rapidRequests: rapidRequests,
    score: Math.min(100, score),
  };
}

/**
 * Determine if challenge is required
 */
export function requiresChallenge(
  rateLimitResult: { allowed: boolean; requiresChallenge: boolean },
  botSignals: BotDetectionSignals,
  previousChallenges: number = 0
): {
  required: boolean;
  level: "none" | "managed" | "interactive" | "block";
  reason: string;
} {
  // Block if too many previous challenges failed
  if (previousChallenges >= 5) {
    return {
      required: true,
      level: "block",
      reason: "Too many failed challenges",
    };
  }

  // Block if rate limit exceeded multiple times
  if (!rateLimitResult.allowed && previousChallenges >= 3) {
    return {
      required: true,
      level: "block",
      reason: "Persistent rate limit violations",
    };
  }

  // Interactive challenge if high bot score
  if (botSignals.score >= 70) {
    return {
      required: true,
      level: "interactive",
      reason: "High bot detection score",
    };
  }

  // Managed challenge if rate limit exceeded or moderate bot score
  if (!rateLimitResult.allowed || botSignals.score >= 40) {
    return {
      required: true,
      level: "managed",
      reason: rateLimitResult.allowed ? "Bot signals detected" : "Rate limit exceeded",
    };
  }

  return {
    required: false,
    level: "none",
    reason: "No challenge required",
  };
}

/**
 * Track challenge attempts
 */
export async function trackChallengeAttempt(
  identifier: string,
  success: boolean
): Promise<number> {
  if (!redis) return 0;

  try {
    const key = `challenge:${identifier}`;
    const attempts = await redis.incr(key);
    await redis.expire(key, 3600); // 1 hour TTL

    if (success) {
      // Reset on success
      await redis.del(key);
      return 0;
    }

    return attempts;
  } catch (error) {
    console.error("[Bot Protection] Failed to track challenge:", error);
    return 0;
  }
}

/**
 * Get challenge attempt count
 */
export async function getChallengeAttempts(identifier: string): Promise<number> {
  if (!redis) return 0;

  try {
    const key = `challenge:${identifier}`;
    const attempts = await redis.get<number>(key);
    return attempts || 0;
  } catch (error) {
    console.error("[Bot Protection] Failed to get challenge attempts:", error);
    return 0;
  }
}

/**
 * Block IP temporarily
 */
export async function blockIP(
  ip: string,
  durationSeconds: number = 900 // 15 minutes default
): Promise<void> {
  if (!redis) return;

  try {
    const key = `blocked:ip:${ip}`;
    await redis.set(key, "1", { ex: durationSeconds });
  } catch (error) {
    console.error("[Bot Protection] Failed to block IP:", error);
  }
}

/**
 * Check if IP is blocked
 */
export async function isIPBlocked(ip: string): Promise<boolean> {
  if (!redis) return false;

  try {
    const key = `blocked:ip:${ip}`;
    const blocked = await redis.get(key);
    return blocked === "1";
  } catch (error) {
    console.error("[Bot Protection] Failed to check IP block:", error);
    return false;
  }
}

/**
 * Log abuse event
 */
export async function logAbuseEvent(
  event: {
    type: string;
    identifier: string;
    ip: string;
    endpoint: string;
    reason: string;
    details?: Record<string, any>;
  }
): Promise<void> {
  // Log to database or monitoring service
  console.warn("[Bot Protection] Abuse event:", event);
  
  // TODO: Send to monitoring service (Sentry, DataDog, etc.)
  // TODO: Store in database for analysis
}
