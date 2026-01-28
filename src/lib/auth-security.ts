/**
 * Authentication Security Utilities
 * Provides rate limiting, account lockout, and anomaly detection for auth flows
 */

import { supabaseAdmin as supabase, isSupabaseAdminReady } from "@/lib/supabase";

// Fallback in-memory rate limiting (if Redis not available)
const inMemoryRateLimit = new Map<string, { count: number; resetTime: number }>();

/**
 * Check rate limit for authentication operations
 * Uses Redis if available, falls back to in-memory
 */
export async function checkAuthRateLimit(
  identifier: string,
  operation: 'sign-in' | 'sign-up' | 'password-reset' = 'sign-in'
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  // Try Redis-based rate limiting first
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const { Ratelimit } = await import("@upstash/ratelimit");
      const { Redis } = await import("@upstash/redis");

      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });

      const limiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          operation === 'sign-in' ? 5 : operation === 'sign-up' ? 3 : 3,
          operation === 'sign-in' ? "15 m" : "1 h"
        ),
        analytics: true,
      });

      const { success, limit, remaining, reset } = await limiter.limit(identifier);

      return {
        allowed: success,
        remaining: remaining,
        resetAt: reset,
      };
    } catch (error) {
      console.error("[Auth Security] Redis rate limiting failed, using fallback:", error);
      // Fall through to in-memory
    }
  }

  // Fallback to in-memory rate limiting
  const { checkRateLimit } = await import('@/lib/security');
  const maxRequests = operation === 'sign-in' ? 5 : operation === 'sign-up' ? 3 : 3;
  const windowMs = operation === 'sign-in' ? 15 * 60 * 1000 : 60 * 60 * 1000;
  return checkRateLimit(identifier, maxRequests, windowMs);
}

/**
 * Track failed login attempts and implement account lockout
 */
export async function trackFailedLoginAttempt(
  email: string,
  ip: string
): Promise<{ locked: boolean; attemptsRemaining: number; lockoutUntil?: number }> {
  if (!isSupabaseAdminReady()) {
    return { locked: false, attemptsRemaining: 5 };
  }

  const maxAttempts = 5;
  const lockoutDurationMs = 30 * 60 * 1000; // 30 minutes

  try {
    // Get or create failed attempt record
    const { data: existing } = await supabase
      .from('failed_login_attempts')
      .select('attempts, locked_until')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    const now = Date.now();
    const lockedUntil = existing?.locked_until ? new Date(existing.locked_until).getTime() : null;

    // Check if account is currently locked
    if (lockedUntil && lockedUntil > now) {
      return {
        locked: true,
        attemptsRemaining: 0,
        lockoutUntil: lockedUntil,
      };
    }

    // Increment failed attempts
    const newAttempts = (existing?.attempts || 0) + 1;
    const shouldLock = newAttempts >= maxAttempts;

    await supabase
      .from('failed_login_attempts')
      .upsert({
        email: email.toLowerCase(),
        attempts: newAttempts,
        locked_until: shouldLock ? new Date(now + lockoutDurationMs).toISOString() : null,
        last_attempt_ip: ip,
        last_attempt_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'email',
      });

    if (shouldLock) {
      // Log security event
      await logSecurityEvent({
        eventType: 'account_locked',
        email: email.toLowerCase(),
        ip,
        details: { attempts: newAttempts, lockoutDuration: lockoutDurationMs },
      });

      return {
        locked: true,
        attemptsRemaining: 0,
        lockoutUntil: now + lockoutDurationMs,
      };
    }

    return {
      locked: false,
      attemptsRemaining: maxAttempts - newAttempts,
    };
  } catch (error) {
    console.error("[Auth Security] Failed to track login attempt:", error);
    // Don't block on error - allow attempt but log
    return { locked: false, attemptsRemaining: 5 };
  }
}

/**
 * Clear failed login attempts on successful login
 */
export async function clearFailedLoginAttempts(email: string): Promise<void> {
  if (!isSupabaseAdminReady()) return;

  try {
    await supabase
      .from('failed_login_attempts')
      .delete()
      .eq('email', email.toLowerCase());
  } catch (error) {
    console.error("[Auth Security] Failed to clear login attempts:", error);
  }
}

/**
 * Detect authentication anomalies
 */
export async function detectAuthAnomaly(
  userId: string,
  ip: string,
  userAgent: string,
  location?: { country?: string; city?: string }
): Promise<{ suspicious: boolean; reasons: string[] }> {
  if (!isSupabaseAdminReady()) {
    return { suspicious: false, reasons: [] };
  }

  const reasons: string[] = [];

  try {
    // Get user's previous login history
    const { data: previousLogins } = await supabase
      .from('login_history')
      .select('ip, user_agent, location, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (previousLogins && previousLogins.length > 0) {
      const lastLogin = previousLogins[0];
      
      // Check for IP change
      if (lastLogin.ip !== ip) {
        reasons.push('IP address changed');
      }

      // Check for user agent change
      if (lastLogin.user_agent !== userAgent) {
        reasons.push('Device/browser changed');
      }

      // Check for location change (if available)
      if (location?.country && lastLogin.location?.country !== location.country) {
        reasons.push(`Location changed: ${lastLogin.location?.country} → ${location.country}`);
      }

      // Check for rapid location change (impossible travel)
      if (previousLogins.length >= 2) {
        const secondLast = previousLogins[1];
        const timeDiff = new Date(lastLogin.created_at).getTime() - new Date(secondLast.created_at).getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        if (location?.country && secondLast.location?.country && 
            location.country !== secondLast.location.country && hoursDiff < 2) {
          reasons.push('Impossible travel detected');
        }
      }
    } else {
      // First login - not suspicious by itself
      reasons.push('First login');
    }

    // Log login attempt
    await supabase.from('login_history').insert({
      user_id: userId,
      ip,
      user_agent: userAgent,
      location: location || {},
      created_at: new Date().toISOString(),
    });

    const suspicious = reasons.length > 2 || reasons.some(r => r.includes('Impossible travel'));

    if (suspicious) {
      await logSecurityEvent({
        eventType: 'suspicious_login',
        userId,
        ip,
        details: { reasons, userAgent, location },
      });
    }

    return { suspicious, reasons };
  } catch (error) {
    console.error("[Auth Security] Failed to detect anomaly:", error);
    return { suspicious: false, reasons: [] };
  }
}

/**
 * Log security events for monitoring
 */
export async function logSecurityEvent(event: {
  eventType: string;
  userId?: string;
  email?: string;
  ip: string;
  details: Record<string, any>;
}): Promise<void> {
  if (!isSupabaseAdminReady()) return;

  try {
    await supabase.from('security_events').insert({
      event_type: event.eventType,
      user_id: event.userId || null,
      email: event.email || null,
      ip_address: event.ip,
      details: event.details,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Auth Security] Failed to log security event:", error);
  }
}

/**
 * Generate secure, non-reusable authentication token
 */
export function generateAuthToken(): string {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate request timestamp to prevent replay attacks
 */
export function validateRequestTimestamp(timestamp: number, maxAgeMs: number = 5 * 60 * 1000): boolean {
  const now = Date.now();
  const age = now - timestamp;
  return age >= 0 && age <= maxAgeMs;
}

/**
 * Get client IP from request
 */
export function getClientIP(request: Request): string {
  // This should match the implementation in security.ts
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP.trim();
  }
  
  return 'unknown';
}
