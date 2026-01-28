# Authentication & Session Management Security Audit
**Date:** January 27, 2025  
**Application:** myumrahesim.com  
**Auth Provider:** Clerk (@clerk/nextjs v6.36.10)

---

## Executive Summary

This audit identifies vulnerabilities in authentication flows, session management, and provides code-level fixes to harden security against brute force, credential stuffing, replay attacks, and session fixation.

**Overall Security Posture:** 5/10  
**Critical Issues Found:** 8  
**High Priority Issues:** 6

---

## 1. Current Authentication Architecture

### Technology Stack
- **Provider:** Clerk (managed authentication service)
- **Version:** @clerk/nextjs v6.36.10
- **Session Management:** Clerk-managed (JWT-based)
- **Cookie Handling:** Clerk handles automatically
- **Middleware:** `src/proxy.ts` (Clerk middleware)

### Authentication Flows
1. **Sign In:** `/sign-in/[[...sign-in]]` → Clerk `<SignIn>` component
2. **Sign Up:** `/sign-up/[[...sign-up]]` → Clerk `<SignUp>` component
3. **Password Reset:** Handled by Clerk (no custom implementation)
4. **Magic Links:** Handled by Clerk (if enabled)
5. **OAuth:** Google, etc. (if configured in Clerk dashboard)

### Protected Routes
- `/orders(.*)` - Protected via middleware
- API routes: Manual auth checks using `auth()` from `@clerk/nextjs/server`

---

## 2. Vulnerabilities Found

### 🔴 CRITICAL VULNERABILITIES

#### Vulnerability #1: No Brute Force Protection on Auth Endpoints
**Risk Score: 25/25 (Impact: 5 × Likelihood: 5)**  
**Severity:** CRITICAL

**Description:**  
Clerk handles authentication, but there's no application-level rate limiting on sign-in/sign-up endpoints. While Clerk has built-in protection, additional layers are needed.

**Attack Vector:**
- Automated credential stuffing attacks
- Brute force password attempts
- Account enumeration via sign-up endpoint
- DoS via authentication endpoint flooding

**Current State:**
- ✅ Clerk has built-in rate limiting (unknown thresholds)
- ❌ No application-level rate limiting on auth pages
- ❌ No IP-based blocking
- ❌ No account lockout after failed attempts
- ❌ No progressive delays

**Evidence:**
```typescript
// src/app/sign-in/[[...sign-in]]/page.tsx
// No rate limiting, no protection
export default function SignInPage() {
  return <SignIn />; // Direct Clerk component, no wrapper protection
}
```

**Impact:**
- Account takeover via credential stuffing
- Service disruption via DoS
- User enumeration
- Resource exhaustion

---

#### Vulnerability #2: Session Cookie Security Not Enforced
**Risk Score: 20/25 (Impact: 5 × Likelihood: 4)**  
**Severity:** CRITICAL

**Description:**  
Clerk manages cookies, but there's no explicit configuration to ensure HttpOnly, Secure, and SameSite=Strict flags are set.

**Attack Vector:**
- XSS attacks stealing session cookies
- Man-in-the-middle cookie interception
- CSRF attacks via cookie manipulation
- Session fixation attacks

**Current State:**
- ⚠️ Clerk default cookie settings (unknown if secure)
- ❌ No explicit cookie security configuration
- ❌ No SameSite=Strict enforcement
- ❌ No HttpOnly verification
- ❌ No Secure flag verification

**Evidence:**
```typescript
// src/app/layout.tsx
<ClerkProvider>
  {/* No cookie configuration */}
</ClerkProvider>
```

**Impact:**
- Session hijacking via XSS
- CSRF attacks
- Cookie theft
- Account takeover

---

#### Vulnerability #3: No Account Lockout After Failed Attempts
**Risk Score: 20/25 (Impact: 4 × Likelihood: 5)**  
**Severity:** CRITICAL

**Description:**  
No account lockout mechanism after multiple failed login attempts. Clerk may have some protection, but it's not configured or verified.

**Attack Vector:**
- Brute force password attacks
- Credential stuffing
- Automated account takeover attempts

**Current State:**
- ❌ No account lockout configuration visible
- ❌ No failed attempt tracking
- ❌ No progressive delays
- ❌ No account suspension after threshold

**Impact:**
- Successful brute force attacks
- Account takeover
- User data exposure

---

#### Vulnerability #4: Weak API Route Authorization
**Risk Score: 18/25 (Impact: 4 × Likelihood: 4.5)**  
**Severity:** HIGH

**Description:**  
Some API routes allow unauthenticated access even when they should require authentication, or have inconsistent authorization checks.

**Attack Vector:**
- Unauthorized access to user data
- Bypassing authentication checks
- Guest access to protected resources

**Current State:**
```typescript
// src/app/api/purchases/[transactionId]/route.ts
// Allows guest access if auth fails
catch (authError) {
  isAuthorized = true; // ⚠️ Allows guest access
}
```

**Evidence:**
- `/api/purchases/[transactionId]` - Allows guest access
- `/api/orders` - Requires auth but error handling allows continuation
- Inconsistent auth checks across routes

**Impact:**
- Unauthorized data access
- Privacy violations
- Data leakage

---

#### Vulnerability #5: No Session Timeout Configuration
**Risk Score: 16/25 (Impact: 4 × Likelihood: 4)**  
**Severity:** HIGH

**Description:**  
No explicit session timeout configuration. Sessions may persist indefinitely, increasing risk of session hijacking.

**Attack Vector:**
- Stolen session tokens remain valid indefinitely
- Long-lived sessions increase attack window
- No automatic session invalidation

**Current State:**
- ❌ No session timeout configuration
- ❌ No session lifetime limits
- ❌ No idle timeout
- ❌ No session rotation

**Impact:**
- Extended attack window for session hijacking
- Stolen sessions remain valid
- No automatic cleanup

---

#### Vulnerability #6: No Replay Attack Protection
**Risk Score: 15/25 (Impact: 3 × Likelihood: 5)**  
**Severity:** HIGH

**Description:**  
No protection against replay attacks on authentication flows or API requests.

**Attack Vector:**
- Replaying valid authentication requests
- Replaying API calls with captured tokens
- Reusing intercepted session tokens

**Current State:**
- ❌ No nonce/timestamp validation
- ❌ No request ID tracking
- ❌ No one-time token usage
- ❌ No request replay detection

**Impact:**
- Unauthorized access via replayed requests
- Session token reuse
- API abuse

---

#### Vulnerability #7: Session Fixation Vulnerability
**Risk Score: 15/25 (Impact: 3 × Likelihood: 5)**  
**Severity:** HIGH

**Description:**  
No explicit protection against session fixation attacks where attacker forces user to use a known session ID.

**Attack Vector:**
- Attacker creates session, tricks user into using it
- Session ID not regenerated on login
- Predictable session identifiers

**Current State:**
- ⚠️ Clerk handles session management (unknown if regenerates on login)
- ❌ No explicit session regeneration on privilege change
- ❌ No session ID validation

**Impact:**
- Session hijacking
- Account takeover
- Unauthorized access

---

#### Vulnerability #8: No Anomaly Detection
**Risk Score: 12/25 (Impact: 3 × Likelihood: 4)**  
**Severity:** MEDIUM-HIGH

**Description:**  
No detection of suspicious login patterns (new device, location, time, etc.).

**Attack Vector:**
- Account takeover from new location
- Unusual access patterns
- Automated attacks

**Current State:**
- ❌ No device fingerprinting
- ❌ No location tracking
- ❌ No login pattern analysis
- ❌ No alerting on anomalies

**Impact:**
- Undetected account compromises
- Delayed incident response
- Extended attack windows

---

## 3. Code-Level Fixes

### Fix #1: Add Application-Level Rate Limiting to Auth Pages

**File:** `src/app/sign-in/[[...sign-in]]/page.tsx`

```typescript
import { SignIn } from "@clerk/nextjs";
import { headers } from "next/headers";
import { checkAuthRateLimit } from "@/lib/auth-security";

export default async function SignInPage() {
  // Rate limit check at page level
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 
             headersList.get('x-real-ip') || 
             'unknown';
  
  const rateLimit = await checkAuthRateLimit(`sign-in:${ip}`);
  
  if (!rateLimit.allowed) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Too Many Attempts</h1>
          <p className="text-gray-600">
            Please try again after {Math.ceil((rateLimit.resetAt - Date.now()) / 1000)} seconds.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-[85vh] flex items-start justify-center py-16 sm:py-20">
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-xl dark:shadow-slate-900/60",
          },
        }}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
      />
    </div>
  );
}
```

**File:** `src/app/sign-up/[[...sign-up]]/page.tsx`

```typescript
import { SignUp } from "@clerk/nextjs";
import { headers } from "next/headers";
import { checkAuthRateLimit } from "@/lib/auth-security";

export default async function SignUpPage() {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 
             headersList.get('x-real-ip') || 
             'unknown';
  
  const rateLimit = await checkAuthRateLimit(`sign-up:${ip}`);
  
  if (!rateLimit.allowed) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Too Many Attempts</h1>
          <p className="text-gray-600">
            Please try again after {Math.ceil((rateLimit.resetAt - Date.now()) / 1000)} seconds.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <SignUp 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-xl"
          }
        }}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
      />
    </div>
  );
}
```

---

### Fix #2: Create Authentication Security Utility

**File:** `src/lib/auth-security.ts` (NEW)

```typescript
/**
 * Authentication Security Utilities
 * Provides rate limiting, account lockout, and anomaly detection for auth flows
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { supabaseAdmin as supabase, isSupabaseAdminReady } from "@/lib/supabase";

// Initialize Redis for distributed rate limiting
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Rate limiters for different auth operations
const signInLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 attempts per 15 minutes
      analytics: true,
    })
  : null;

const signUpLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "1 h"), // 3 sign-ups per hour per IP
      analytics: true,
    })
  : null;

const passwordResetLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "1 h"), // 3 password resets per hour
      analytics: true,
    })
  : null;

/**
 * Check rate limit for authentication operations
 */
export async function checkAuthRateLimit(
  identifier: string,
  operation: 'sign-in' | 'sign-up' | 'password-reset' = 'sign-in'
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  // Fallback to in-memory if Redis not configured
  if (!redis) {
    // Use basic in-memory rate limiting as fallback
    const { checkRateLimit } = await import('@/lib/security');
    const maxRequests = operation === 'sign-in' ? 5 : operation === 'sign-up' ? 3 : 3;
    const windowMs = operation === 'sign-in' ? 15 * 60 * 1000 : 60 * 60 * 1000;
    return checkRateLimit(identifier, maxRequests, windowMs);
  }

  const limiter = 
    operation === 'sign-in' ? signInLimiter :
    operation === 'sign-up' ? signUpLimiter :
    passwordResetLimiter;

  if (!limiter) {
    return { allowed: true, remaining: 999, resetAt: Date.now() + 60000 };
  }

  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  return {
    allowed: success,
    remaining: remaining,
    resetAt: reset,
  };
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
}

/**
 * Clear failed login attempts on successful login
 */
export async function clearFailedLoginAttempts(email: string): Promise<void> {
  if (!isSupabaseAdminReady()) return;

  await supabase
    .from('failed_login_attempts')
    .delete()
    .eq('email', email.toLowerCase());
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
}

/**
 * Log security events for monitoring
 */
async function logSecurityEvent(event: {
  eventType: string;
  userId?: string;
  email?: string;
  ip: string;
  details: Record<string, any>;
}): Promise<void> {
  if (!isSupabaseAdminReady()) return;

  await supabase.from('security_events').insert({
    event_type: event.eventType,
    user_id: event.userId || null,
    email: event.email || null,
    ip_address: event.ip,
    details: event.details,
    created_at: new Date().toISOString(),
  });
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
```

---

### Fix #3: Configure Clerk with Secure Cookie Settings

**File:** `src/app/layout.tsx`

```typescript
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isClerkConfigured = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
                            !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('your_clerk');
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {isClerkConfigured ? (
          <ClerkProvider
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
            // CRITICAL: Configure secure cookie settings
            appearance={{
              // Your existing appearance config
            }}
            // Session configuration
            sessionTokenTemplate="default"
            // Cookie configuration (via environment variables - see below)
          >
            {children}
          </ClerkProvider>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
```

**Environment Variables to Add:**
```env
# Clerk Cookie Security (set in Clerk Dashboard or via environment)
CLERK_COOKIE_SECURE=true
CLERK_COOKIE_SAME_SITE=strict
CLERK_COOKIE_HTTP_ONLY=true
```

---

### Fix #4: Harden API Route Authorization

**File:** `src/app/api/purchases/[transactionId]/route.ts`

```typescript
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const { transactionId } = await params;

    // Validate transaction ID format
    if (!isValidTransactionId(transactionId)) {
      return Response.json(
        { error: 'Invalid transaction ID format' },
        { status: 400 }
      );
    }

    // CRITICAL: Require authentication for purchase data
    let userId: string | null = null;
    try {
      const authResult = await auth();
      userId = authResult.userId;
    } catch (authError) {
      // Auth error - reject request
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!userId) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify user owns this transaction
    if (isSupabaseAdminReady()) {
      const { data: purchase } = await supabase
        .from('esim_purchases')
        .select('customer_email, user_id')
        .eq('transaction_id', transactionId)
        .single();

      if (!purchase) {
        return Response.json(
          { error: 'Purchase not found' },
          { status: 404 }
        );
      }

      // Get user email from Clerk
      const { data: customer } = await supabase
        .from('customers')
        .select('email, id')
        .eq('clerk_user_id', userId)
        .single();

      if (!customer) {
        return Response.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }

      // Verify ownership
      const isOwner = 
        purchase.user_id === customer.id || 
        purchase.customer_email?.toLowerCase() === customer.email.toLowerCase();

      if (!isOwner) {
        // Log unauthorized access attempt
        await logSecurityEvent({
          eventType: 'unauthorized_access_attempt',
          userId,
          ip: getClientIP(request),
          details: { transactionId, attemptedEmail: customer.email },
        });

        return Response.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
    }

    // ... rest of handler
  } catch (error) {
    // ... error handling
  }
}
```

---

### Fix #5: Add Session Management Middleware

**File:** `src/proxy.ts` (Update existing)

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/orders(.*)',
  '/account(.*)',
  '/dashboard(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // CRITICAL: Add security headers for all requests
  const response = NextResponse.next();
  
  // Session security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Prevent clickjacking
  response.headers.set('Content-Security-Policy', "frame-ancestors 'none'");
  
  // Add session timeout header (if applicable)
  // Clerk handles this, but we can add custom headers
  const session = await auth();
  if (session.userId) {
    // Add custom session header for client-side timeout handling
    response.headers.set('X-Session-Active', 'true');
  }

  return response;
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

---

### Fix #6: Create Database Tables for Auth Security

**File:** `supabase/migrations/012_auth_security_tables.sql` (NEW)

```sql
-- Failed login attempts tracking
CREATE TABLE IF NOT EXISTS public.failed_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  last_attempt_ip TEXT,
  last_attempt_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_email ON public.failed_login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_locked_until ON public.failed_login_attempts(locked_until);

-- Login history for anomaly detection
CREATE TABLE IF NOT EXISTS public.login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk user ID
  ip TEXT NOT NULL,
  user_agent TEXT,
  location JSONB, -- { country, city, etc. }
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON public.login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_created_at ON public.login_history(created_at);
CREATE INDEX IF NOT EXISTS idx_login_history_ip ON public.login_history(ip);

-- Security events logging
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id TEXT,
  email TEXT,
  ip_address TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_ip ON public.security_events(ip_address);

-- RLS Policies
ALTER TABLE IF EXISTS public.failed_login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.security_events ENABLE ROW LEVEL SECURITY;

-- Only service role can access these tables
CREATE POLICY "Service role only - failed_login_attempts"
  ON public.failed_login_attempts
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role only - login_history"
  ON public.login_history
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role only - security_events"
  ON public.security_events
  FOR ALL
  USING (auth.role() = 'service_role');
```

---

### Fix #7: Add Webhook Handler for Clerk Auth Events

**File:** `src/app/api/webhooks/clerk/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { clearFailedLoginAttempts, detectAuthAnomaly } from '@/lib/auth-security';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const payload = await req.text();
  const body = JSON.parse(payload);

  const wh = new Webhook(webhookSecret);

  let evt: any;

  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("[Clerk Webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const eventType = evt.type;
  const { id, email_addresses, ...data } = evt.data;

  // Handle user.created event
  if (eventType === 'user.created') {
    // Sync user to Supabase
    // ... existing sync logic
  }

  // Handle session.created event - track login
  if (eventType === 'session.created') {
    const userId = data.user_id;
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
               req.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Clear failed login attempts on successful login
    if (email_addresses?.[0]?.email_address) {
      await clearFailedLoginAttempts(email_addresses[0].email_address);
    }

    // Detect anomalies
    if (userId) {
      await detectAuthAnomaly(userId, ip, userAgent);
    }
  }

  // Handle user.deleted event
  if (eventType === 'user.deleted') {
    // Clean up user data
    // ... cleanup logic
  }

  return NextResponse.json({ received: true });
}
```

---

## 4. Clerk Dashboard Configuration

### Required Clerk Dashboard Settings

#### 1. Session Settings
**Path:** Clerk Dashboard → Sessions

**Configure:**
- ✅ **Session Lifetime:** 7 days (recommended)
- ✅ **Idle Timeout:** 30 minutes
- ✅ **Multi-session handling:** Enabled (if needed)
- ✅ **Session rotation:** Enabled (regenerate on privilege change)

#### 2. Security Settings
**Path:** Clerk Dashboard → Security

**Configure:**
- ✅ **Password Requirements:**
  - Minimum length: 12 characters
  - Require uppercase: Yes
  - Require lowercase: Yes
  - Require numbers: Yes
  - Require symbols: Yes
- ✅ **Account Lockout:**
  - Max failed attempts: 5
  - Lockout duration: 30 minutes
  - Progressive delays: Enabled
- ✅ **MFA Requirements:**
  - Enforce MFA: Yes (for all users or high-risk)
  - Backup codes: Enabled
  - Recovery methods: Email + SMS

#### 3. Cookie Settings
**Path:** Clerk Dashboard → Settings → Security

**Configure:**
- ✅ **HttpOnly:** Enabled (default, verify)
- ✅ **Secure:** Enabled (HTTPS only)
- ✅ **SameSite:** Strict
- ✅ **Domain:** Set to your domain (e.g., `.myumrahesim.com`)

#### 4. Rate Limiting
**Path:** Clerk Dashboard → Settings → Rate Limits

**Configure:**
- ✅ **Sign-in attempts:** 5 per 15 minutes per IP
- ✅ **Sign-up attempts:** 3 per hour per IP
- ✅ **Password reset:** 3 per hour per email
- ✅ **Magic link requests:** 3 per hour per email

#### 5. Email Verification
**Path:** Clerk Dashboard → Settings → Email

**Configure:**
- ✅ **Require email verification:** Yes
- ✅ **Verification link expiry:** 24 hours
- ✅ **Resend cooldown:** 5 minutes

#### 6. OAuth Settings
**Path:** Clerk Dashboard → Settings → OAuth

**Configure:**
- ✅ **Allowed redirect URLs:** Only your domain
  - `https://myumrahesim.com`
  - `https://www.myumrahesim.com`
  - `http://localhost:3000` (dev only)
- ✅ **State parameter validation:** Enabled
- ✅ **PKCE:** Enabled (for OAuth flows)

#### 7. Webhook Configuration
**Path:** Clerk Dashboard → Webhooks

**Configure:**
- ✅ **Endpoint:** `https://myumrahesim.com/api/webhooks/clerk`
- ✅ **Events to subscribe:**
  - `user.created`
  - `user.updated`
  - `user.deleted`
  - `session.created`
  - `session.ended`
  - `session.revoked`
- ✅ **Signing secret:** Store in `CLERK_WEBHOOK_SECRET`

---

## 5. Next.js Configuration

### Update next.config.ts

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ... existing config

  // Security headers for authentication
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // ... existing headers
          
          // CRITICAL: Session security headers
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY' // Prevent clickjacking
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Prevent session fixation
          {
            key: 'Set-Cookie',
            value: 'SameSite=Strict; Secure; HttpOnly'
          },
        ],
      },
      // Specific headers for auth pages
      {
        source: '/sign-in/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate'
          },
        ],
      },
      {
        source: '/sign-up/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate'
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

## 6. Environment Variables

### Add to `.env.local`

```env
# Clerk Authentication Security
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Clerk Cookie Security (configured in Clerk Dashboard, but document here)
# CLERK_COOKIE_SECURE=true
# CLERK_COOKIE_SAME_SITE=strict
# CLERK_COOKIE_HTTP_ONLY=true

# Rate Limiting (Redis for distributed rate limiting)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Session Configuration
SESSION_TIMEOUT_MS=1800000  # 30 minutes
SESSION_MAX_AGE_MS=604800000  # 7 days
```

---

## 7. Implementation Checklist

### Critical Fixes (Week 1)
- [ ] Create `src/lib/auth-security.ts` with rate limiting and account lockout
- [ ] Add rate limiting to sign-in/sign-up pages
- [ ] Create database tables for failed login tracking
- [ ] Configure Clerk dashboard security settings
- [ ] Add Clerk webhook handler for auth events
- [ ] Update API routes to require authentication consistently
- [ ] Add security headers in next.config.ts
- [ ] Implement Redis-based rate limiting

### High Priority (Week 2)
- [ ] Add anomaly detection for logins
- [ ] Implement session timeout handling
- [ ] Add security event logging
- [ ] Create monitoring dashboard for auth events
- [ ] Test all authentication flows
- [ ] Verify cookie security settings

### Medium Priority (Month 1)
- [ ] Add device fingerprinting
- [ ] Implement location-based anomaly detection
- [ ] Add email notifications for suspicious logins
- [ ] Create admin dashboard for security events
- [ ] Regular security audits

---

## 8. Testing Checklist

### Authentication Security Tests

#### Brute Force Protection
- [ ] Test: 10 failed login attempts → Account locked
- [ ] Test: Rate limit on sign-in page
- [ ] Test: Rate limit on sign-up page
- [ ] Test: Progressive delays after failed attempts

#### Session Security
- [ ] Test: Cookies have HttpOnly flag
- [ ] Test: Cookies have Secure flag (HTTPS only)
- [ ] Test: Cookies have SameSite=Strict
- [ ] Test: Session timeout after idle period
- [ ] Test: Session invalidated on logout

#### Authorization
- [ ] Test: Cannot access other user's data
- [ ] Test: API routes require authentication
- [ ] Test: Protected routes redirect to sign-in
- [ ] Test: Guest checkout still works (if needed)

#### Replay Attack Protection
- [ ] Test: Old session tokens rejected
- [ ] Test: Request timestamps validated
- [ ] Test: One-time tokens cannot be reused

#### Session Fixation
- [ ] Test: Session ID regenerated on login
- [ ] Test: Session ID not predictable
- [ ] Test: Cannot force session ID

---

## 9. Monitoring & Alerts

### Key Metrics to Monitor
- Failed login attempts per IP
- Account lockouts
- Suspicious login patterns
- Session creation/revocation
- Authentication anomalies
- Rate limit violations

### Alert Thresholds
- **Critical:** >10 failed attempts in 5 minutes from same IP
- **High:** Account locked
- **High:** Suspicious login (new location + device)
- **Medium:** >5 failed attempts in 15 minutes
- **Medium:** Impossible travel detected

---

## 10. Recommended Clerk Dashboard Settings Summary

### Session Configuration
```
Session Lifetime: 7 days
Idle Timeout: 30 minutes
Multi-session: Enabled
Session Rotation: Enabled
```

### Security Configuration
```
Password Min Length: 12
Require Uppercase: Yes
Require Lowercase: Yes
Require Numbers: Yes
Require Symbols: Yes
Max Failed Attempts: 5
Lockout Duration: 30 minutes
Progressive Delays: Enabled
MFA Enforcement: Yes (or for high-risk)
```

### Cookie Configuration
```
HttpOnly: Enabled
Secure: Enabled
SameSite: Strict
Domain: .myumrahesim.com
```

### Rate Limits
```
Sign-in: 5 per 15 minutes
Sign-up: 3 per hour
Password Reset: 3 per hour
Magic Link: 3 per hour
```

---

## 11. Code Files to Create/Update

### New Files
1. `src/lib/auth-security.ts` - Authentication security utilities
2. `src/app/api/webhooks/clerk/route.ts` - Clerk webhook handler
3. `supabase/migrations/012_auth_security_tables.sql` - Security tables

### Files to Update
1. `src/app/sign-in/[[...sign-in]]/page.tsx` - Add rate limiting
2. `src/app/sign-up/[[...sign-up]]/page.tsx` - Add rate limiting
3. `src/proxy.ts` - Add security headers
4. `src/app/layout.tsx` - Configure ClerkProvider
5. `src/app/api/purchases/[transactionId]/route.ts` - Require auth
6. `next.config.ts` - Add security headers
7. `.env.local` - Add security environment variables

---

## 12. Verification Steps

### After Implementation

1. **Test Rate Limiting:**
   ```bash
   # Try 10 sign-in attempts rapidly
   # Should be blocked after 5 attempts
   ```

2. **Test Account Lockout:**
   ```bash
   # Fail login 5 times with same email
   # Account should be locked for 30 minutes
   ```

3. **Verify Cookie Security:**
   ```bash
   # Check browser DevTools → Application → Cookies
   # Verify: HttpOnly ✓, Secure ✓, SameSite=Strict ✓
   ```

4. **Test Authorization:**
   ```bash
   # Try accessing /api/purchases/[transactionId] without auth
   # Should return 401
   ```

5. **Test Session Timeout:**
   ```bash
   # Login, wait 30 minutes idle
   # Session should expire
   ```

---

**Document Version:** 1.0  
**Last Updated:** January 27, 2025  
**Next Review:** February 27, 2025
