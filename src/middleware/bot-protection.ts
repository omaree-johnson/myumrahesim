/**
 * Bot Protection Middleware
 * Integrates with Next.js middleware for request-level protection
 */

import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimitMulti,
  getRateLimitIdentifiers,
  detectBotSignals,
  requiresChallenge,
  isIPBlocked,
  blockIP,
  logAbuseEvent,
  getChallengeAttempts,
} from "@/lib/bot-protection";
import { getClientIP } from "@/lib/security";

/**
 * Bot protection configuration per route
 */
export interface BotProtectionConfig {
  rateLimiter: any; // Ratelimit instance
  requireTurnstile?: boolean;
  challengeOnSuspicion?: boolean;
  blockOnAbuse?: boolean;
}

/**
 * Apply bot protection to a request
 */
export async function applyBotProtection(
  request: NextRequest,
  config: BotProtectionConfig,
  userId?: string | null,
  email?: string | null
): Promise<
  | { allowed: true }
  | {
      allowed: false;
      response: NextResponse;
      requiresChallenge: boolean;
      challengeLevel: "managed" | "interactive" | "block";
    }
> {
  const clientIP = getClientIP(request);

  // 1. Check if IP is blocked
  const blocked = await isIPBlocked(clientIP);
  if (blocked) {
    await logAbuseEvent({
      type: "blocked_ip_access",
      identifier: `ip:${clientIP}`,
      ip: clientIP,
      endpoint: request.nextUrl.pathname,
      reason: "IP is blocked",
    });

    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: "Access denied",
          message: "Your IP address has been temporarily blocked due to suspicious activity.",
        },
        { status: 403 }
      ),
      requiresChallenge: false,
      challengeLevel: "block",
    };
  }

  // 2. Get rate limit identifiers
  const identifiers = getRateLimitIdentifiers(request, userId, email);

  // 3. Check rate limit
  const rateLimitResult = await checkRateLimitMulti(
    request,
    config.rateLimiter,
    identifiers
  );

  // 4. Detect bot signals
  const botSignals = await detectBotSignals(request);

  // 5. Get previous challenge attempts
  const previousChallenges = await getChallengeAttempts(identifiers[0]);

  // 6. Determine if challenge is required
  const challenge = requiresChallenge(
    rateLimitResult,
    botSignals,
    previousChallenges
  );

  // 7. Check if Turnstile token is provided (if required)
  const turnstileToken = request.headers.get("x-turnstile-token");

  if (challenge.required && challenge.level !== "block") {
    // Challenge required but no token provided
    if (!turnstileToken) {
      return {
        allowed: false,
        response: NextResponse.json(
          {
            error: "Challenge required",
            challenge: {
              required: true,
              level: challenge.level,
              reason: challenge.reason,
            },
            turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
          },
          { status: 429 }
        ),
        requiresChallenge: true,
        challengeLevel: challenge.level === "none" ? "managed" : challenge.level as "managed" | "interactive" | "block",
      };
    }

    // Verify Turnstile token
    const { verifyTurnstileToken } = await import("@/lib/turnstile");
    const verification = await verifyTurnstileToken(turnstileToken, clientIP);

    if (!verification.success) {
      // Track failed challenge
      await logAbuseEvent({
        type: "failed_challenge",
        identifier: identifiers[0],
        ip: clientIP,
        endpoint: request.nextUrl.pathname,
        reason: `Challenge failed: ${verification.error}`,
        details: { challengeLevel: challenge.level },
      });

      // Block if too many failures
      if (previousChallenges >= 4) {
        await blockIP(clientIP, 900); // 15 minutes
        return {
          allowed: false,
          response: NextResponse.json(
            {
              error: "Access denied",
              message: "Too many failed security challenges. Your IP has been temporarily blocked.",
            },
            { status: 403 }
          ),
          requiresChallenge: false,
          challengeLevel: "block",
        };
      }

      return {
        allowed: false,
        response: NextResponse.json(
          {
            error: "Challenge verification failed",
            message: "Please complete the security challenge again.",
            challenge: {
              required: true,
              level: challenge.level,
              reason: "Previous challenge failed",
            },
            turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
          },
          { status: 429 }
        ),
        requiresChallenge: true,
        challengeLevel: challenge.level === "none" ? "managed" : challenge.level as "managed" | "interactive" | "block",
      };
    }

    // Challenge passed - track success
    const { trackChallengeAttempt } = await import("@/lib/bot-protection");
    await trackChallengeAttempt(identifiers[0], true);
  }

  // 8. Check rate limit (after challenge)
  if (!rateLimitResult.allowed) {
    await logAbuseEvent({
      type: "rate_limit_exceeded",
      identifier: rateLimitResult.identifier,
      ip: clientIP,
      endpoint: request.nextUrl.pathname,
      reason: "Rate limit exceeded",
      details: {
        remaining: rateLimitResult.remaining,
        resetAt: rateLimitResult.resetAt,
      },
    });

    // Block if persistent abuse
    if (previousChallenges >= 3 && !rateLimitResult.allowed) {
      await blockIP(clientIP, 3600); // 1 hour
    }

    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: "Too many requests",
          message: "Please slow down and try again later.",
          retryAfter: Math.ceil(
            (rateLimitResult.resetAt - Date.now()) / 1000
          ),
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              (rateLimitResult.resetAt - Date.now()) / 1000
            ).toString(),
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.resetAt.toString(),
          },
        }
      ),
      requiresChallenge: false,
      challengeLevel: "block",
    };
  }

  // 9. Always require Turnstile if configured
  if (config.requireTurnstile && !turnstileToken) {
    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: "Security challenge required",
          challenge: {
            required: true,
            level: "managed",
            reason: "Endpoint requires security verification",
          },
          turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
        },
        { status: 429 }
      ),
      requiresChallenge: true,
      challengeLevel: "managed",
    };
  }

  // 10. All checks passed
  return { allowed: true };
}
