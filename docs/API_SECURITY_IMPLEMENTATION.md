# API Security Implementation Guide
**Date:** January 27, 2025

---

## Quick Start

### 1. Install Zod
```bash
pnpm add zod
```

### 2. Create Validation Schemas
See: `src/lib/validation-schemas.ts` (created below)

### 3. Update Endpoints
Follow the fixes in this document

---

## Step-by-Step Implementation

### Step 1: Create Validation Schemas

**File:** `src/lib/validation-schemas.ts` (NEW)

```typescript
import { z } from 'zod';

/**
 * Common validation schemas for API routes
 * Use these schemas to validate all input
 */

// Transaction ID: txn_uuid_timestamp
export const TransactionIdSchema = z.string()
  .min(1, 'Transaction ID is required')
  .max(100, 'Transaction ID too long')
  .regex(/^txn_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_\d+$/, 
    'Invalid transaction ID format');

// Offer ID: alphanumeric with hyphens/underscores
export const OfferIdSchema = z.string()
  .min(1, 'Offer ID is required')
  .max(100, 'Offer ID too long')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid offer ID format');

// Email: RFC 5322 compliant
export const EmailSchema = z.string()
  .email('Invalid email format')
  .max(254, 'Email too long')
  .toLowerCase()
  .trim();

// Full name: letters, spaces, hyphens, apostrophes
export const FullNameSchema = z.string()
  .min(1, 'Name is required')
  .max(200, 'Name too long')
  .regex(/^[\p{L}\s'-]+$/u, 'Invalid name format')
  .trim();

// Payment Intent ID: Stripe format
export const PaymentIntentIdSchema = z.string()
  .min(1, 'Payment intent ID is required')
  .max(200, 'Payment intent ID too long')
  .regex(/^pi_[a-zA-Z0-9_]+$/, 'Invalid payment intent ID format');

// Session ID: Stripe format
export const SessionIdSchema = z.string()
  .min(1, 'Session ID is required')
  .max(200, 'Session ID too long')
  .regex(/^cs_[a-zA-Z0-9_]+$/, 'Invalid session ID format');

// Discount code
export const DiscountCodeSchema = z.string()
  .max(50, 'Discount code too long')
  .regex(/^[A-Z0-9_-]+$/, 'Invalid discount code format')
  .optional();

// Cart item
export const CartItemSchema = z.object({
  offerId: OfferIdSchema,
  quantity: z.number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .max(10, 'Quantity cannot exceed 10'),
  name: z.string().max(200).optional(),
  priceLabel: z.string().max(40).optional(),
});

// Create Payment Intent
export const CreatePaymentIntentSchema = z.object({
  offerId: OfferIdSchema,
  recipientEmail: EmailSchema.optional(),
  fullName: FullNameSchema.optional(),
  discountCode: DiscountCodeSchema,
});

// Update Payment Intent
export const UpdatePaymentIntentSchema = z.object({
  paymentIntentId: PaymentIntentIdSchema,
  email: EmailSchema,
  fullName: FullNameSchema.optional(),
});

// Create Cart Payment Intent
export const CreateCartPaymentIntentSchema = z.object({
  items: z.array(CartItemSchema)
    .min(1, 'Cart cannot be empty')
    .max(10, 'Cart cannot have more than 10 items'),
  recipientEmail: EmailSchema.optional(),
  fullName: FullNameSchema.optional(),
  discountCode: DiscountCodeSchema,
  cartToken: z.string().max(128).optional(),
});

// Create Review
export const CreateReviewSchema = z.object({
  transactionId: TransactionIdSchema,
  rating: z.number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  title: z.string().max(120).optional(),
  body: z.string().max(1000).optional(),
});

// Query: By Session
export const BySessionQuerySchema = z.object({
  session_id: SessionIdSchema.optional(),
  payment_intent: PaymentIntentIdSchema.optional(),
}).refine(
  (data) => data.session_id || data.payment_intent,
  { message: "Either session_id or payment_intent is required" }
);

// Query: Checkout Session
export const CheckoutSessionQuerySchema = z.object({
  session_id: SessionIdSchema,
});

// Create Order
export const CreateOrderSchema = z.object({
  offerId: OfferIdSchema,
  recipientEmail: EmailSchema,
  fullName: FullNameSchema,
});

// Create Checkout Session
export const CreateCheckoutSessionSchema = z.object({
  offerId: OfferIdSchema,
  recipientEmail: EmailSchema,
  fullName: FullNameSchema,
});

// Cart Reminders
export const CartRemindersSchema = z.object({
  email: EmailSchema,
  items: z.array(CartItemSchema)
    .min(1, 'Cart cannot be empty')
    .max(10, 'Cart cannot have more than 10 items'),
  token: z.string().max(128).optional(),
});
```

---

### Step 2: Create Authorization Utilities

**File:** `src/lib/authorization.ts` (NEW)

```typescript
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin as supabase, isSupabaseAdminReady } from '@/lib/supabase';
import { getClientIP } from './security';

/**
 * Verify user is authenticated
 */
export async function requireAuth(): Promise<{ userId: string }> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('UNAUTHORIZED');
  }
  return { userId };
}

/**
 * Get customer record for authenticated user
 */
export async function getCustomerForUser(userId: string) {
  if (!isSupabaseAdminReady()) {
    return null;
  }

  const { data: customer } = await supabase
    .from('customers')
    .select('id, email, clerk_user_id')
    .eq('clerk_user_id', userId)
    .single();

  return customer;
}

/**
 * Verify user owns a purchase
 */
export async function verifyPurchaseOwnership(
  transactionId: string,
  userId: string
): Promise<{ authorized: boolean; purchase?: any; customer?: any }> {
  const customer = await getCustomerForUser(userId);
  if (!customer) {
    return { authorized: false };
  }

  const { data: purchase } = await supabase
    .from('esim_purchases')
    .select('transaction_id, customer_email, user_id')
    .eq('transaction_id', transactionId)
    .single();

  if (!purchase) {
    return { authorized: false };
  }

  const isOwner = 
    purchase.user_id === customer.id ||
    purchase.customer_email?.toLowerCase() === customer.email.toLowerCase();

  return { authorized: isOwner, purchase, customer };
}

/**
 * Verify user is admin
 */
export async function requireAdmin(): Promise<{ userId: string; email: string }> {
  const { userId } = await requireAuth();
  
  const user = await currentUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }

  const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase();
  if (!userEmail) {
    throw new Error('UNAUTHORIZED');
  }

  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  if (!ADMIN_EMAILS.includes(userEmail)) {
    throw new Error('FORBIDDEN');
  }

  return { userId, email: userEmail };
}

/**
 * Log unauthorized access attempt
 */
export async function logUnauthorizedAccess(
  eventType: string,
  userId: string | null,
  ip: string,
  details: Record<string, any>
): Promise<void> {
  if (!isSupabaseAdminReady()) return;

  try {
    const { logSecurityEvent } = await import('@/lib/auth-security');
    await logSecurityEvent({
      eventType,
      userId: userId || undefined,
      ip,
      details,
    });
  } catch (error) {
    console.error('[Authorization] Failed to log security event:', error);
  }
}
```

---

### Step 3: Create Request Validation Helper

**File:** `src/lib/request-validation.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Validate request body with Zod schema
 */
export async function validateRequestBody<T>(
  req: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await req.json();
    const validated = schema.parse(body);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        response: NextResponse.json(
          {
            error: 'Validation failed',
            details: error.errors.map(e => ({
              path: e.path.join('.'),
              message: e.message,
            })),
          },
          { status: 400 }
        ),
      };
    }
    throw error;
  }
}

/**
 * Validate query parameters with Zod schema
 */
export function validateQueryParams<T>(
  req: NextRequest,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
  try {
    const params: Record<string, string | null> = {};
    req.nextUrl.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    const validated = schema.parse(params);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        response: NextResponse.json(
          {
            error: 'Invalid query parameters',
            details: error.errors.map(e => ({
              path: e.path.join('.'),
              message: e.message,
            })),
          },
          { status: 400 }
        ),
      };
    }
    throw error;
  }
}

/**
 * Validate route parameters with Zod schema
 */
export function validateRouteParams<T>(
  params: Record<string, string>,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
  try {
    const validated = schema.parse(params);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        response: NextResponse.json(
          {
            error: 'Invalid route parameters',
            details: error.errors.map(e => ({
              path: e.path.join('.'),
              message: e.message,
            })),
          },
          { status: 400 }
        ),
      };
    }
    throw error;
  }
}
```

---

## Example: Fixed Endpoint

### Before (Vulnerable)
```typescript
// src/app/api/purchases/[transactionId]/qrcode/route.ts
export async function GET(req, { params }) {
  const { transactionId } = await params;
  // ❌ No auth
  // ❌ No validation
  // ❌ No ownership check
  
  const activation = await supabase
    .from('activation_details')
    .select('activation_code')
    .eq('transaction_id', transactionId)
    .single();
  
  return NextResponse.json({ activationCode: activation.activation_code });
}
```

### After (Secure)
```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/authorization";
import { verifyPurchaseOwnership } from "@/lib/authorization";
import { validateRouteParams } from "@/lib/request-validation";
import { TransactionIdSchema } from "@/lib/validation-schemas";
import { checkRateLimit, getClientIP } from "@/lib/security";
import { supabaseAdmin as supabase, isSupabaseAdminReady } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    // 1. Rate limiting
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(`qrcode:${clientIP}`, 10, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    // 2. Authenticate
    const { userId } = await requireAuth();

    // 3. Validate route params
    const { transactionId } = await params;
    const validation = validateRouteParams(
      { transactionId },
      z.object({ transactionId: TransactionIdSchema })
    );
    
    if (!validation.success) {
      return validation.response;
    }

    // 4. Verify ownership
    const ownership = await verifyPurchaseOwnership(validation.data.transactionId, userId);
    if (!ownership.authorized) {
      await logUnauthorizedAccess('unauthorized_qr_access', userId, clientIP, {
        transactionId: validation.data.transactionId,
      });
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // 5. Get activation details
    if (!isSupabaseAdminReady()) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const { data: activation } = await supabase
      .from('activation_details')
      .select('activation_code, universal_link, qr_code')
      .eq('transaction_id', validation.data.transactionId)
      .single();

    if (!activation?.activation_code) {
      return NextResponse.json(
        { error: "Activation code not available yet" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      activationCode: activation.activation_code,
      transactionId: validation.data.transactionId,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    console.error("[QR Code] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## Migration Guide

### For Each Endpoint:

1. **Add Rate Limiting** (if missing)
2. **Add Authentication** (if needed)
3. **Add Schema Validation** (Zod)
4. **Add Ownership Verification** (if resource-specific)
5. **Add Error Handling**
6. **Add Security Logging**

### Example Migration Checklist:

```typescript
// ✅ Rate limiting
const rateLimit = checkRateLimit(`endpoint:${clientIP}`, 10, 60000);
if (!rateLimit.allowed) return 429;

// ✅ Authentication
const { userId } = await requireAuth();

// ✅ Input validation
const validation = await validateRequestBody(req, MySchema);
if (!validation.success) return validation.response;

// ✅ Authorization
const ownership = await verifyPurchaseOwnership(id, userId);
if (!ownership.authorized) return 403;

// ✅ Business logic
// ... safe to proceed
```

---

## Testing

### Unit Tests
```typescript
import { describe, it, expect } from '@jest/globals';
import { CreatePaymentIntentSchema } from '@/lib/validation-schemas';

describe('CreatePaymentIntentSchema', () => {
  it('should validate valid input', () => {
    const input = {
      offerId: 'CKH036',
      recipientEmail: 'test@example.com',
      fullName: 'John Doe',
    };
    expect(() => CreatePaymentIntentSchema.parse(input)).not.toThrow();
  });

  it('should reject invalid email', () => {
    const input = {
      offerId: 'CKH036',
      recipientEmail: 'invalid-email',
    };
    expect(() => CreatePaymentIntentSchema.parse(input)).toThrow();
  });
});
```

### Integration Tests
```typescript
describe('GET /api/purchases/[transactionId]/qrcode', () => {
  it('should require authentication', async () => {
    const res = await fetch('/api/purchases/txn_123/qrcode');
    expect(res.status).toBe(401);
  });

  it('should require ownership', async () => {
    // Login as user A
    const tokenA = await login('userA@example.com');
    
    // Try to access user B's purchase
    const res = await fetch('/api/purchases/userB_txn/qrcode', {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    expect(res.status).toBe(403);
  });
});
```

---

**See Full Audit:** `docs/API_SECURITY_AUDIT.md`
