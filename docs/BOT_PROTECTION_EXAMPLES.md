# Bot Protection - Complete Code Examples
**Date:** January 27, 2025

---

## Example 1: Protected Signup Endpoint

**File:** `src/app/api/sign-up/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { applyBotProtection } from "@/middleware/bot-protection";
import { signupLimiter } from "@/lib/bot-protection";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { getClientIP } from "@/lib/security";
import { CreateOrderSchema } from "@/lib/validation-schemas";
import { validateRequestBody } from "@/lib/request-validation";

export async function POST(req: NextRequest) {
  try {
    // 1. Apply bot protection
    const protection = await applyBotProtection(req, {
      rateLimiter: signupLimiter,
      requireTurnstile: true, // Always require for signup
      challengeOnSuspicion: true,
      blockOnAbuse: true,
    });

    if (!protection.allowed) {
      return protection.response;
    }

    // 2. Get and verify Turnstile token
    const turnstileToken = req.headers.get("x-turnstile-token");
    if (!turnstileToken) {
      return NextResponse.json(
        {
          error: "Security challenge required",
          challenge: {
            required: true,
            level: "managed",
            reason: "Signup requires security verification",
          },
          turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
        },
        { status: 429 }
      );
    }

    const verification = await verifyTurnstileToken(
      turnstileToken,
      getClientIP(req)
    );

    if (!verification.success) {
      return NextResponse.json(
        { error: "Security challenge failed", details: verification.error },
        { status: 400 }
      );
    }

    // 3. Validate request body
    const validation = await validateRequestBody(req, CreateOrderSchema);
    if (!validation.success) {
      return validation.response;
    }

    // 4. Proceed with signup
    const { email, password } = validation.data;
    // ... signup logic

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Signup] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## Example 2: Protected Checkout with Progressive Challenge

**File:** `src/app/api/create-payment-intent/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { applyBotProtection } from "@/middleware/bot-protection";
import { paymentIntentLimiter } from "@/lib/bot-protection";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { getClientIP } from "@/lib/security";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    // Get user ID if authenticated
    let userId: string | null = null;
    try {
      const { userId: clerkUserId } = await auth();
      userId = clerkUserId || null;
    } catch {}

    // Apply bot protection
    const protection = await applyBotProtection(
      req,
      {
        rateLimiter: paymentIntentLimiter,
        requireTurnstile: false, // Not always required
        challengeOnSuspicion: true, // Challenge on suspicion
        blockOnAbuse: true,
      },
      userId
    );

    if (!protection.allowed) {
      return protection.response;
    }

    // If challenge is required, verify token
    if (protection.requiresChallenge) {
      const turnstileToken = req.headers.get("x-turnstile-token");
      if (!turnstileToken) {
        return protection.response; // Returns challenge required
      }

      const verification = await verifyTurnstileToken(
        turnstileToken,
        getClientIP(req)
      );

      if (!verification.success) {
        return NextResponse.json(
          { error: "Security challenge failed" },
          { status: 400 }
        );
      }
    }

    // Proceed with payment intent creation
    const body = await req.json();
    // ... payment intent logic

    return NextResponse.json({ clientSecret: "..." });
  } catch (error) {
    console.error("[Payment Intent] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## Example 3: Anti-Scraping Products Endpoint

**File:** `src/app/api/products/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { applyBotProtection } from "@/middleware/bot-protection";
import { productsLimiter } from "@/lib/bot-protection";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { getClientIP } from "@/lib/security";
import { getCachedEsimProducts } from "@/lib/products-cache";

export async function GET(req: NextRequest) {
  try {
    // Apply bot protection (challenge on scraping patterns)
    const protection = await applyBotProtection(req, {
      rateLimiter: productsLimiter,
      requireTurnstile: false,
      challengeOnSuspicion: true, // Challenge on scraping detection
      blockOnAbuse: true,
    });

    if (!protection.allowed) {
      return protection.response;
    }

    // If challenge required (scraping detected)
    if (protection.requiresChallenge) {
      const turnstileToken = req.headers.get("x-turnstile-token");
      if (!turnstileToken) {
        return protection.response;
      }

      const verification = await verifyTurnstileToken(
        turnstileToken,
        getClientIP(req)
      );

      if (!verification.success) {
        return NextResponse.json(
          { error: "Security challenge failed" },
          { status: 400 }
        );
      }
    }

    // Return products
    const products = await getCachedEsimProducts("SA");
    return NextResponse.json({ products });
  } catch (error) {
    console.error("[Products] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## Example 4: Client-Side Checkout Form with Turnstile

**File:** `src/components/checkout-form.tsx`

```typescript
"use client";

import { useState } from "react";
import { TurnstileChallenge } from "@/components/turnstile-challenge";

export function CheckoutForm() {
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [challengeRequired, setChallengeRequired] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(turnstileToken && { "x-turnstile-token": turnstileToken }),
        },
        body: JSON.stringify({
          offerId: "...",
          // ... other data
        }),
      });

      // Handle challenge required
      if (response.status === 429) {
        const data = await response.json();
        if (data.challenge?.required) {
          setChallengeRequired(true);
          setTurnstileToken(null); // Reset token
          setError("Please complete the security challenge");
          return;
        }
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Request failed");
      }

      const data = await response.json();
      // ... handle success
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form fields */}
      
      {/* Turnstile Challenge - Show if required or always for checkout */}
      {(challengeRequired || !turnstileToken) && (
        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Security verification required
          </p>
          <TurnstileChallenge
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            onSuccess={(token) => {
              setTurnstileToken(token);
              setChallengeRequired(false);
              setError(null);
            }}
            onError={(err) => {
              setError("Challenge verification failed");
            }}
            mode={challengeRequired ? "interactive" : "managed"}
          />
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={!turnstileToken || loading}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg disabled:opacity-50"
      >
        {loading ? "Processing..." : "Complete Checkout"}
      </button>
    </form>
  );
}
```

---

## Example 5: Signup Page with Turnstile

**File:** `src/app/sign-up/page.tsx`

```typescript
"use client";

import { SignUp } from "@clerk/nextjs";
import { TurnstileChallenge } from "@/components/turnstile-challenge";
import { useState, useEffect } from "react";

export default function SignUpPage() {
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // Store token in localStorage for API calls
  useEffect(() => {
    if (turnstileToken) {
      localStorage.setItem("turnstile_token", turnstileToken);
    }
  }, [turnstileToken]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 sm:py-20">
      <div className="w-full max-w-md space-y-4">
        {/* Turnstile Challenge - Always visible for signup */}
        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Security Verification
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            Please complete the security challenge to create your account.
          </p>
          <TurnstileChallenge
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            onSuccess={setTurnstileToken}
            onError={(err) => console.error("Turnstile error:", err)}
            mode="managed"
          />
          {turnstileToken && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
              ✓ Verification complete
            </p>
          )}
        </div>

        {/* Clerk SignUp component */}
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl dark:shadow-slate-900/60",
            },
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
        />
      </div>
    </div>
  );
}
```

---

## Example 6: Middleware Integration

**File:** `src/proxy.ts` (Update existing)

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { applyBotProtection } from '@/middleware/bot-protection';
import {
  signupLimiter,
  loginLimiter,
  paymentIntentLimiter,
  productsLimiter,
} from '@/lib/bot-protection';

const isProtectedRoute = createRouteMatcher([
  '/orders(.*)',
  '/account(.*)',
  '/dashboard(.*)',
]);

// Routes that need bot protection
const botProtectedRoutes = createRouteMatcher([
  '/api/sign-up',
  '/api/sign-in',
  '/api/password-reset',
  '/api/create-payment-intent',
  '/api/create-checkout-session',
  '/api/create-cart-payment-intent',
  '/api/products',
  '/api/orders',
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Apply bot protection to specific routes
  if (botProtectedRoutes(req)) {
    const session = await auth();
    const userId = session.userId || null;

    // Get appropriate limiter based on route
    let limiter = null;
    let requireTurnstile = false;

    if (req.nextUrl.pathname.includes('/sign-up')) {
      limiter = signupLimiter;
      requireTurnstile = true;
    } else if (req.nextUrl.pathname.includes('/sign-in')) {
      limiter = loginLimiter;
      requireTurnstile = false; // Challenge on suspicion
    } else if (req.nextUrl.pathname.includes('/payment-intent')) {
      limiter = paymentIntentLimiter;
      requireTurnstile = false;
    } else if (req.nextUrl.pathname.includes('/products')) {
      limiter = productsLimiter;
      requireTurnstile = false;
    }

    if (limiter) {
      const protection = await applyBotProtection(
        req,
        {
          rateLimiter: limiter,
          requireTurnstile,
          challengeOnSuspicion: true,
          blockOnAbuse: true,
        },
        userId
      );

      if (!protection.allowed) {
        return protection.response;
      }
    }
  }

  // Security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

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

## Example 7: Handling Challenge Responses

**File:** `src/lib/api-client.ts`

```typescript
/**
 * API client with automatic challenge handling
 */

export async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get Turnstile token from localStorage (if available)
  const turnstileToken = typeof window !== 'undefined' 
    ? localStorage.getItem('turnstile_token')
    : null;

  // Add Turnstile token to headers
  const headers = new Headers(options.headers);
  if (turnstileToken) {
    headers.set('x-turnstile-token', turnstileToken);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle challenge required
  if (response.status === 429) {
    const data = await response.json();
    if (data.challenge?.required) {
      // Emit event for UI to show challenge
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('challenge-required', {
            detail: data.challenge,
          })
        );
      }
    }
  }

  return response;
}
```

---

## Example 8: Global Challenge Handler

**File:** `src/components/global-challenge-handler.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import { TurnstileChallenge } from "@/components/turnstile-challenge";

export function GlobalChallengeHandler() {
  const [challenge, setChallenge] = useState<{
    required: boolean;
    level: string;
    reason: string;
  } | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const handleChallengeRequired = (event: CustomEvent) => {
      setChallenge(event.detail);
      setToken(null);
    };

    window.addEventListener(
      "challenge-required",
      handleChallengeRequired as EventListener
    );

    return () => {
      window.removeEventListener(
        "challenge-required",
        handleChallengeRequired as EventListener
      );
    };
  }, []);

  if (!challenge?.required) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-2">Security Verification</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {challenge.reason}
        </p>
        <TurnstileChallenge
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
          onSuccess={(newToken) => {
            setToken(newToken);
            if (typeof window !== 'undefined') {
              localStorage.setItem('turnstile_token', newToken);
            }
            setChallenge(null);
            // Retry the request
            window.dispatchEvent(new CustomEvent('challenge-complete'));
          }}
          mode={challenge.level === "interactive" ? "interactive" : "managed"}
        />
      </div>
    </div>
  );
}
```

---

**See Full Implementation Guide:** `docs/BOT_PROTECTION_IMPLEMENTATION.md`
