# Logging & Monitoring - Implementation Guide
**Date:** January 27, 2025

---

## Quick Start

### ✅ Completed
- ✅ `src/lib/monitoring.ts` - Structured logging and alerting
- ✅ `supabase/migrations/014_security_alerts_table.sql` - Alerts table
- ✅ Secure logging utilities (PII sanitization)

---

## Step-by-Step Implementation

### Step 1: Run Database Migration

**File:** `supabase/migrations/014_security_alerts_table.sql`

```bash
# Execute migration to create security_alerts table
```

---

### Step 2: Integrate Authentication Logging

**File:** `src/app/api/webhooks/clerk/route.ts`

```typescript
import { logAuthEvent } from '@/lib/monitoring';

// On sign in success
await logAuthEvent({
  event: 'sign_in',
  userId: userId,
  email: email,
  ip: getClientIP(request),
  userAgent: request.headers.get('user-agent') || undefined,
  success: true,
});

// On sign in failure
await logAuthEvent({
  event: 'failed_login',
  email: email,
  ip: getClientIP(request),
  userAgent: request.headers.get('user-agent') || undefined,
  success: false,
  reason: 'Invalid credentials',
});

// On suspicious login
await logAuthEvent({
  event: 'suspicious_login',
  userId: userId,
  email: email,
  ip: getClientIP(request),
  userAgent: request.headers.get('user-agent') || undefined,
  success: false,
  reason: 'Impossible travel detected',
  details: {
    previousLocation: 'US',
    currentLocation: 'UK',
    timeDiff: '30 minutes',
  },
});
```

---

### Step 3: Integrate Payment Logging

**File:** `src/app/api/webhooks/stripe/route.ts`

```typescript
import { logPaymentEvent } from '@/lib/monitoring';

// On payment success
await logPaymentEvent({
  event: 'payment_succeeded',
  transactionId: transactionId,
  paymentIntentId: paymentIntent.id,
  userId: userId,
  email: recipientEmail,
  ip: 'webhook',
  amount: paymentIntent.amount,
  currency: paymentIntent.currency,
  success: true,
});

// On price mismatch (CRITICAL)
await logPaymentEvent({
  event: 'price_mismatch',
  transactionId: transactionId,
  paymentIntentId: paymentIntent.id,
  userId: userId,
  email: recipientEmail,
  ip: 'webhook',
  amount: paymentIntent.amount,
  currency: paymentIntent.currency,
  success: false,
  reason: 'Price verification failed',
  details: {
    paidAmount: paymentIntent.amount,
    expectedAmount: expectedPrice,
    difference: Math.abs(paymentIntent.amount - expectedPrice),
  },
});
```

---

### Step 4: Integrate Abuse Logging

**File:** `src/middleware/bot-protection.ts`

```typescript
import { logAbuseEvent } from '@/lib/monitoring';

// On rate limit exceeded
await logAbuseEvent({
  event: 'rate_limit_exceeded',
  ip: clientIP,
  endpoint: request.nextUrl.pathname,
  userAgent: request.headers.get('user-agent') || undefined,
  reason: `Rate limit exceeded: ${identifier}`,
  details: {
    limit: rateLimitResult.limit,
    remaining: rateLimitResult.remaining,
  },
});

// On bot detected
await logAbuseEvent({
  event: 'bot_detected',
  ip: clientIP,
  endpoint: request.nextUrl.pathname,
  userAgent: request.headers.get('user-agent') || undefined,
  reason: 'Bot signals detected',
  details: {
    signals: botSignals,
    challengeRequired: true,
  },
});

// On IP blocked
await logAbuseEvent({
  event: 'ip_blocked',
  ip: clientIP,
  endpoint: request.nextUrl.pathname,
  reason: 'IP address blocked due to abuse',
  details: {
    blockDuration: '1 hour',
    reason: 'Multiple violations',
  },
});
```

---

### Step 5: Integrate API Logging

**File:** `src/middleware.ts` (or create API middleware)

```typescript
import { logApiEvent } from '@/lib/monitoring';

// In API route handler
const startTime = Date.now();

try {
  // ... handle request
  const duration = Date.now() - startTime;
  
  await logApiEvent({
    event: 'api_request',
    endpoint: request.nextUrl.pathname,
    method: request.method,
    statusCode: 200,
    duration,
    userId: session?.userId,
    ip: getClientIP(request),
    userAgent: request.headers.get('user-agent') || undefined,
    requestId: request.headers.get('x-request-id') || undefined,
  });
} catch (error) {
  const duration = Date.now() - startTime;
  
  await logApiEvent({
    event: 'api_error',
    endpoint: request.nextUrl.pathname,
    method: request.method,
    statusCode: 500,
    duration,
    userId: session?.userId,
    ip: getClientIP(request),
    details: {
      error: error instanceof Error ? error.message : String(error),
    },
  });
}
```

---

### Step 6: Configure Admin Emails

**File:** `.env.local`

```bash
# Comma-separated list of admin emails for alerts
ADMIN_EMAILS=admin@myumrahesim.com,security@myumrahesim.com
```

---

### Step 7: Create Alert Dashboard (Optional)

**File:** `src/app/admin/alerts/page.tsx` (NEW)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { requireAdmin } from '@/lib/authorization';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Fetch unacknowledged alerts
    fetch('/api/admin/alerts')
      .then(res => res.json())
      .then(data => setAlerts(data));
  }, []);

  return (
    <div>
      <h1>Security Alerts</h1>
      {/* Display alerts */}
    </div>
  );
}
```

---

## Testing

### Test Authentication Logging

```typescript
// Test sign in logging
await logAuthEvent({
  event: 'sign_in',
  userId: 'test_user',
  email: 'test@example.com',
  ip: '127.0.0.1',
  success: true,
});

// Verify in database
// SELECT * FROM security_events WHERE event_type = 'sign_in';
```

### Test Payment Logging

```typescript
// Test price mismatch (should trigger alert)
await logPaymentEvent({
  event: 'price_mismatch',
  transactionId: 'test_txn',
  paymentIntentId: 'test_pi',
  amount: 1000,
  currency: 'USD',
  success: false,
  reason: 'Price verification failed',
});

// Verify alert created
// SELECT * FROM security_alerts WHERE event_type = 'price_mismatch';
```

### Test Abuse Logging

```typescript
// Test bot detection
await logAbuseEvent({
  event: 'bot_detected',
  ip: '192.168.1.1',
  endpoint: '/api/products',
  reason: 'Bot signals detected',
});

// Verify in database
// SELECT * FROM security_events WHERE event_type = 'bot_detected';
```

---

## Verification Checklist

- [ ] Database migration executed
- [ ] Admin emails configured
- [ ] Authentication logging integrated
- [ ] Payment logging integrated
- [ ] Abuse logging integrated
- [ ] API logging integrated
- [ ] Alerts triggering correctly
- [ ] PII sanitization working
- [ ] No secrets in logs

---

**See Full Strategy:** `docs/LOGGING_MONITORING_AUDIT.md`
