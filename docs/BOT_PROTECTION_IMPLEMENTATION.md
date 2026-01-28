# Bot & Abuse Protection - Implementation Guide
**Date:** January 27, 2025

---

## Quick Start

### 1. Install Dependencies ✅
```bash
pnpm add @upstash/ratelimit @upstash/redis @marsidev/react-turnstile
```

### 2. Set Up Upstash Redis
1. Go to https://upstash.com
2. Create a Redis database
3. Copy REST URL and token
4. Add to `.env.local`:
```env
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### 3. Set Up Cloudflare Turnstile
1. Go to https://dash.cloudflare.com
2. Navigate to Turnstile
3. Create a site
4. Copy Site Key and Secret Key
5. Add to `.env.local`:
```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAA...
TURNSTILE_SECRET_KEY=0x4AAA...
```

---

## Code Examples

### Example 1: Protected Signup Endpoint

**File:** `src/app/api/sign-up/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { applyBotProtection } from "@/middleware/bot-protection";
import { signupLimiter } from "@/lib/bot-protection";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  // Apply bot protection
  const protection = await applyBotProtection(req, {
    rateLimiter: signupLimiter,
    requireTurnstile: true, // Always require Turnstile for signup
    challengeOnSuspicion: true,
    blockOnAbuse: true,
  });

  if (!protection.allowed) {
    return protection.response;
  }

  // Get Turnstile token from header
  const turnstileToken = req.headers.get("x-turnstile-token");
  if (!turnstileToken) {
    return NextResponse.json(
      { error: "Security challenge required" },
      { status: 429 }
    );
  }

  // Verify Turnstile token
  const { verifyTurnstileToken } = await import("@/lib/turnstile");
  const { getClientIP } = await import("@/lib/security");
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

  // Proceed with signup logic
  const body = await req.json();
  // ... signup implementation

  return NextResponse.json({ success: true });
}
```

---

### Example 2: Protected Checkout Endpoint

**File:** `src/app/api/create-payment-intent/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { applyBotProtection } from "@/middleware/bot-protection";
import { paymentIntentLimiter } from "@/lib/bot-protection";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
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

  // If challenge is required, check for token
  if (protection.requiresChallenge) {
    const turnstileToken = req.headers.get("x-turnstile-token");
    if (!turnstileToken) {
      return protection.response; // Returns challenge required response
    }

    // Verify token
    const { verifyTurnstileToken } = await import("@/lib/turnstile");
    const { getClientIP } = await import("@/lib/security");
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
}
```

---

### Example 3: Client-Side Turnstile Integration

**File:** `src/components/checkout-form.tsx`

```typescript
"use client";

import { useState } from "react";
import { TurnstileChallenge } from "@/components/turnstile-challenge";

export function CheckoutForm() {
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!turnstileToken) {
      alert("Please complete the security challenge");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-turnstile-token": turnstileToken, // Send token in header
        },
        body: JSON.stringify({
          offerId: "...",
          // ... other data
        }),
      });

      if (response.status === 429) {
        // Challenge required
        const data = await response.json();
        if (data.challenge?.required) {
          // Show challenge UI
          alert("Security challenge required");
          return;
        }
      }

      if (!response.ok) {
        throw new Error("Failed to create payment intent");
      }

      const data = await response.json();
      // ... handle success
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      
      {/* Turnstile Challenge */}
      <TurnstileChallenge
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        onSuccess={setTurnstileToken}
        mode="managed" // or "interactive" for visible challenge
      />

      <button type="submit" disabled={!turnstileToken || loading}>
        {loading ? "Processing..." : "Checkout"}
      </button>
    </form>
  );
}
```

---

### Example 4: Protected Products Endpoint (Anti-Scraping)

**File:** `src/app/api/products/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { applyBotProtection } from "@/middleware/bot-protection";
import { productsLimiter } from "@/lib/bot-protection";

export async function GET(req: NextRequest) {
  // Apply bot protection
  const protection = await applyBotProtection(req, {
    rateLimiter: productsLimiter,
    requireTurnstile: false,
    challengeOnSuspicion: true, // Challenge on scraping patterns
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

    // Verify token
    const { verifyTurnstileToken } = await import("@/lib/turnstile");
    const { getClientIP } = await import("@/lib/security");
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
  const products = await getProducts();
  return NextResponse.json({ products });
}
```

---

### Example 5: Signup Page with Turnstile

**File:** `src/app/sign-up/page.tsx`

```typescript
"use client";

import { SignUp } from "@clerk/nextjs";
import { TurnstileChallenge } from "@/components/turnstile-challenge";
import { useState } from "react";

export default function SignUpPage() {
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Turnstile Challenge - Always visible for signup */}
        <div className="mb-4">
          <TurnstileChallenge
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            onSuccess={setTurnstileToken}
            mode="managed"
          />
        </div>

        {/* Clerk SignUp component */}
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl",
            },
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
        />

        {/* Store token in localStorage for API calls */}
        {turnstileToken && (
          <script
            dangerouslySetInnerHTML={{
              __html: `localStorage.setItem('turnstile_token', '${turnstileToken}');`,
            }}
          />
        )}
      </div>
    </div>
  );
}
```

---

### Example 6: Middleware Integration

**File:** `src/proxy.ts` (Update existing)

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { applyBotProtection } from '@/middleware/bot-protection';
import { productsLimiter } from '@/lib/bot-protection';

const isProtectedRoute = createRouteMatcher([
  '/orders(.*)',
  '/account(.*)',
  '/dashboard(.*)',
]);

// Routes that need bot protection
const botProtectedRoutes = createRouteMatcher([
  '/api/sign-up',
  '/api/sign-in',
  '/api/create-payment-intent',
  '/api/create-checkout-session',
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
    if (req.nextUrl.pathname.startsWith('/api/products')) {
      limiter = productsLimiter;
    }
    // Add more limiters as needed

    if (limiter) {
      const protection = await applyBotProtection(
        req,
        {
          rateLimiter: limiter,
          requireTurnstile: req.nextUrl.pathname.includes('sign-up') || 
                          req.nextUrl.pathname.includes('sign-in'),
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

## Recommended Thresholds

### Rate Limits

| Endpoint | Per IP | Per User | Window | Notes |
|----------|--------|----------|--------|-------|
| Signup | 3 | - | 1 hour | Strict - prevent abuse |
| Login | 5 | - | 15 min | Moderate - allow retries |
| Password Reset | 3 | - | 1 hour | Strict - prevent enumeration |
| Payment Intent | 10 | 20 | 1 min | Moderate - allow checkout flow |
| Checkout Session | 10 | - | 1 min | Moderate - allow checkout flow |
| Cart Payment | 5 | - | 1 min | Strict - prevent cart abuse |
| Products | 30 | - | 1 min | Lenient - allow browsing |
| Orders (GET) | - | 10 | 1 min | User-based - authenticated |
| Orders (POST) | 5 | 10 | 1 min | Strict - prevent abuse |
| Purchase Status | - | 20 | 1 min | User-based - authenticated |

### Bot Detection Thresholds

| Signal | Threshold | Action |
|--------|-----------|--------|
| Bot Score | >= 70 | Interactive Challenge |
| Bot Score | >= 40 | Managed Challenge |
| Rate Limit Exceeded | 1x | Warning |
| Rate Limit Exceeded | 2x | Managed Challenge |
| Rate Limit Exceeded | 3x | Interactive Challenge |
| Rate Limit Exceeded | 5x | Temporary Block (15 min) |
| Rate Limit Exceeded | 10x | Extended Block (1 hour) |
| Failed Challenges | >= 5 | Permanent Block |

---

## Environment Variables

Add to `.env.local`:

```env
# Upstash Redis
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAA...
TURNSTILE_SECRET_KEY=0x4AAA...

# Optional: Admin emails for manual review
ADMIN_EMAILS=admin@example.com,security@example.com
```

---

## Testing

### Test Rate Limiting
```bash
# Should be blocked after 3 attempts
for i in {1..5}; do
  curl -X POST https://myumrahesim.com/api/sign-up \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com"}'
done
```

### Test Bot Detection
```bash
# Request without user agent (should trigger challenge)
curl https://myumrahesim.com/api/products \
  -H "User-Agent: "
```

### Test Turnstile
1. Visit signup page
2. Complete Turnstile challenge
3. Submit form
4. Verify token is sent to API

---

## Monitoring

### Key Metrics to Track
- Rate limit violations per endpoint
- Bot detection score distribution
- Challenge success/failure rates
- IP blocks and unblocks
- False positive rate

### Alerts
- **Critical:** >1000 rate limit violations/hour
- **High:** >100 bot detections/hour
- **Medium:** >50 IP blocks/hour
- **Low:** >10 challenge escalations/hour

---

**See Design Document:** `docs/BOT_PROTECTION_DESIGN.md`
