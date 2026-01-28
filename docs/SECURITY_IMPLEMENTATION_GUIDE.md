# Security Implementation Guide
**Date:** January 27, 2025  
**Purpose:** Step-by-step implementation guide for critical security fixes

---

## 1. Implement Redis-Based Rate Limiting

### Step 1: Install Dependencies
```bash
pnpm add @upstash/ratelimit @upstash/redis
```

### Step 2: Create Rate Limiting Utility
**File:** `src/lib/rate-limit.ts`

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Create rate limiters for different endpoints
export const paymentIntentLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
  analytics: true,
});

export const productsLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"), // 30 requests per minute
  analytics: true,
});

export const ordersLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
  analytics: true,
});

// Helper function to check rate limit
export async function checkRateLimit(
  identifier: string,
  limiter: Ratelimit
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const { success, limit, remaining, reset } = await limiter.limit(identifier);
  
  return {
    allowed: success,
    remaining: remaining,
    resetAt: reset,
  };
}
```

### Step 3: Update API Routes
**Example:** `src/app/api/create-payment-intent/route.ts`

```typescript
import { paymentIntentLimiter, checkRateLimit } from "@/lib/rate-limit";
import { getClientIP } from "@/lib/security";

export async function POST(req: NextRequest) {
  const clientIP = getClientIP(req);
  const identifier = `payment-intent:${clientIP}`;
  
  const rateLimit = await checkRateLimit(identifier, paymentIntentLimiter);
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimit.resetAt.toString()
        }
      }
    );
  }
  
  // ... rest of handler
}
```

---

## 2. Server-Side Price Verification

### Update Payment Intent Creation
**File:** `src/app/api/create-payment-intent/route.ts`

```typescript
import { getEsimPackage } from "@/lib/esimaccess";
import { calculatePrice } from "@/lib/pricing"; // Server-side price calculation

export async function POST(req: NextRequest) {
  const { offerId, recipientEmail, fullName, discountCode } = await req.json();
  
  // CRITICAL: Get package data from provider API (server-side)
  const packageData = await getEsimPackage(offerId);
  
  if (!packageData) {
    return NextResponse.json(
      { error: "Package not found" },
      { status: 404 }
    );
  }
  
  // CRITICAL: Calculate price server-side (never trust client)
  const serverCalculatedPrice = calculatePrice(packageData, discountCode);
  
  // If client provided a price, verify it matches
  // Otherwise, use server-calculated price
  const finalPrice = serverCalculatedPrice;
  
  // Create payment intent with server-verified price
  const paymentIntent = await stripe.paymentIntents.create({
    amount: finalPrice, // Always use server-calculated price
    currency: packageData.price.currency || 'USD',
    // ... rest of config
  });
  
  // ... rest of handler
}
```

---

## 3. Secure Transaction ID Generation

### Update Transaction ID Generation
**File:** `src/app/api/webhooks/stripe/route.ts`

```typescript
import { randomUUID } from 'crypto';

// Replace sequential/guessable transaction IDs
function generateSecureTransactionId(): string {
  // Use cryptographically secure UUID
  return `txn_${randomUUID()}`;
}

// In processPaymentAndFulfill function:
const transactionId = providedTransactionId || generateSecureTransactionId();
```

---

## 4. Webhook Event Deduplication

### Add Event Tracking
**File:** `src/app/api/webhooks/stripe/route.ts`

```typescript
import { supabaseAdmin as supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  
  // Verify signature
  const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  
  // CRITICAL: Check if event was already processed
  if (isSupabaseAdminReady()) {
    const { data: existingEvent } = await supabase
      .from('webhook_events')
      .select('id, processed_at')
      .eq('event_id', event.id)
      .eq('source', 'stripe')
      .maybeSingle();
    
    if (existingEvent?.processed_at) {
      console.log('[Stripe Webhook] Event already processed:', event.id);
      return NextResponse.json({ received: true, duplicate: true });
    }
    
    // Mark event as received (before processing)
    await supabase.from('webhook_events').insert({
      event_id: event.id,
      source: 'stripe',
      event_type: event.type,
      payload: event.data.object,
      received_at: new Date().toISOString(),
    });
  }
  
  // Process event...
  
  // Mark as processed after successful handling
  if (isSupabaseAdminReady()) {
    await supabase
      .from('webhook_events')
      .update({ processed_at: new Date().toISOString() })
      .eq('event_id', event.id);
  }
}
```

---

## 5. QR Code Access Control

### Secure QR Code Endpoint
**File:** `src/app/api/purchases/[transactionId]/qrcode/route.ts`

```typescript
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: { transactionId: string } }
) {
  const { transactionId } = params;
  
  // Validate transaction ID format
  if (!isValidTransactionId(transactionId)) {
    return NextResponse.json({ error: "Invalid transaction ID" }, { status: 400 });
  }
  
  // Get purchase record
  const { data: purchase } = await supabase
    .from('esim_purchases')
    .select('customer_email, user_id, created_at')
    .eq('transaction_id', transactionId)
    .maybeSingle();
  
  if (!purchase) {
    return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
  }
  
  // CRITICAL: Verify access
  // Option 1: Require authentication
  const { userId } = await auth();
  if (userId && purchase.user_id === userId) {
    // Authenticated user owns this purchase - allow access
  } else {
    // Option 2: Require email verification token
    const emailToken = req.nextUrl.searchParams.get('token');
    if (!emailToken || !verifyEmailToken(emailToken, purchase.customer_email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  
  // Check if QR code access has expired (24 hours)
  const purchaseAge = Date.now() - new Date(purchase.created_at).getTime();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  if (purchaseAge > maxAge) {
    return NextResponse.json({ error: "QR code access expired" }, { status: 410 });
  }
  
  // Return QR code...
}
```

---

## 6. Discount Code Security

### Add CAPTCHA
**File:** `src/components/discount-input.tsx`

```typescript
import { Turnstile } from '@marsidev/react-turnstile';

export function DiscountInput() {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  
  return (
    <div>
      <input type="text" placeholder="Enter discount code" />
      <Turnstile
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        onSuccess={setCaptchaToken}
      />
      <button disabled={!captchaToken}>Apply</button>
    </div>
  );
}
```

### Generate Complex Discount Codes
**File:** `src/lib/discounts.ts`

```typescript
import { randomBytes } from 'crypto';

export function generateDiscountCode(prefix: string): string {
  // Generate cryptographically secure random code
  const randomPart = randomBytes(8).toString('hex').toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  return `${prefix}-${timestamp}-${randomPart}`.slice(0, 32);
}
```

---

## 7. eSIM Access Webhook IP Validation

### Enforce IP Validation
**File:** `src/app/api/webhooks/esimaccess/route.ts`

```typescript
function validateIP(request: NextRequest): boolean {
  // CRITICAL: Never disable in production
  if (process.env.NODE_ENV === 'production' && 
      process.env.ESIMACCESS_SKIP_IP_VALIDATION === 'true') {
    console.error('[SECURITY] IP validation disabled in production - THIS IS UNSAFE');
    // Still validate, but log the warning
  }
  
  // Always validate IP in production
  if (process.env.NODE_ENV === 'production') {
    const allIPs = getAllClientIPs(request);
    const hasAllowedIP = allIPs.some(ip => ALLOWED_IPS.includes(ip));
    
    if (!hasAllowedIP) {
      console.error('[SECURITY] Webhook from unauthorized IP:', allIPs);
      return false; // Reject in production
    }
  }
  
  return true;
}
```

---

## 8. Content Security Policy (CSP)

### Update next.config.ts
**File:** `next.config.ts`

```typescript
const nextConfig: NextConfig = {
  // ... existing config
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.com https://*.stripe.com https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://*.clerk.com https://*.stripe.com https://*.supabase.co https://api.esimaccess.com",
              "frame-src 'self' https://*.clerk.com https://*.stripe.com https://challenges.cloudflare.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests"
            ].join('; ')
          },
        ],
      },
    ];
  },
};
```

---

## 9. Database Query Audit

### Create Audit Function
**File:** `src/lib/supabase-audit.ts`

```typescript
import { supabaseAdmin as supabase } from "@/lib/supabase";

// Log all database queries for security audit
export async function auditQuery(
  operation: string,
  table: string,
  userId: string | null,
  details: Record<string, any>
) {
  if (!isSupabaseAdminReady()) return;
  
  await supabase.from('audit_logs').insert({
    operation,
    table_name: table,
    user_id: userId,
    ip_address: details.ip,
    user_agent: details.userAgent,
    details: details,
    timestamp: new Date().toISOString(),
  });
}
```

---

## 10. Environment Variable Security

### Create .env.validation.ts
**File:** `src/lib/env-validation.ts`

```typescript
// Validate critical environment variables at startup
export function validateEnvironment() {
  const required = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'ESIMACCESS_ACCESS_CODE',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Warn if IP validation is disabled in production
  if (process.env.NODE_ENV === 'production' && 
      process.env.ESIMACCESS_SKIP_IP_VALIDATION === 'true') {
    console.error('[SECURITY WARNING] IP validation disabled in production!');
  }
}

// Call at application startup
validateEnvironment();
```

---

## Implementation Checklist

### Week 1 (Critical)
- [ ] Install Upstash Redis
- [ ] Replace in-memory rate limiting
- [ ] Add server-side price verification
- [ ] Secure transaction ID generation
- [ ] Add webhook event deduplication
- [ ] Enforce eSIM Access IP validation
- [ ] Add CAPTCHA to discount codes

### Week 2 (High Priority)
- [ ] Implement QR code access control
- [ ] Add strict CSP headers
- [ ] Replace HTML sanitization with DOMPurify
- [ ] Enable MFA enforcement
- [ ] Audit database queries
- [ ] Implement RLS policies

### Month 1 (Medium Priority)
- [ ] Add email security measures
- [ ] Implement monitoring & detection
- [ ] Create incident response plan
- [ ] Security testing & audit

---

**See full threat model:** `docs/THREAT_MODEL.md`  
**See priority actions:** `docs/SECURITY_PRIORITY_ACTIONS.md`
