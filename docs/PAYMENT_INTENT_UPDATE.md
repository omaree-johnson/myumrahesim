# PaymentIntent Creation Flow - Update Summary

## Overview

The Stripe PaymentIntent creation flow has been updated to use server-calculated pricing, prevent client-side price manipulation, and follow Stripe best practices for EU customers (SCA compliance).

## Key Changes

### ✅ Server-Side Price Calculation
- All pricing is calculated server-side using the pricing API
- Client-provided prices are validated against server calculations
- Price mismatches are rejected to prevent tampering

### ✅ Enhanced Metadata
- `original_price` - Base price before discount
- `discount_applied` - Discount amount in cents
- `promotion_id` - Promotion UUID (if applied)
- `promotion_name` - Promotion name (if applied)
- `promo_code` - Promo code used (if any)
- `final_price` - Final price after discount
- `currency` - Currency code

### ✅ Idempotency
- Enhanced idempotency keys include price hash
- Prevents duplicate payment intents
- Handles retries gracefully

### ✅ EU Customer Support (SCA)
- `automatic_payment_methods.allow_redirects: 'always'` - Required for SCA
- `payment_method_options.card.request_three_d_secure: 'automatic'` - 3DS when needed
- `capture_method: 'automatic'` - Immediate capture

## API Changes

### Single Product Payment Intent

**Endpoint:** `POST /api/create-payment-intent`

**Request Body:**
```typescript
{
  offerId: string;
  recipientEmail?: string;
  fullName?: string;
  discountCode?: string;
  finalPriceCents?: number; // Optional: for validation
}
```

**Response:**
```typescript
{
  clientSecret: string;
  paymentIntentId: string;
  productDetails: {
    name: string;
    description: string;
    originalPrice: string;      // e.g., "10.00"
    discountPercent: number;    // e.g., 10
    discountAmount: string;     // e.g., "1.00"
    finalPrice: string;         // e.g., "9.00"
    currency: string;
    promotionId?: string;
    promotionName?: string;
    promoCode?: string;
  };
}
```

### Cart Payment Intent

**Endpoint:** `POST /api/create-cart-payment-intent`

**Request Body:**
```typescript
{
  items: Array<{ offerId: string; quantity: number }>;
  recipientEmail?: string;
  fullName?: string;
  discountCode?: string;
  cartToken?: string;
  finalPriceCents?: number; // Optional: for validation
}
```

**Response:**
```typescript
{
  clientSecret: string;
  paymentIntentId: string;
  summary: {
    currency: string;
    originalPrice: string;
    discountPercent: number;
    discountAmount: string;
    finalPrice: string;
    totalQuantity: number;
    promotionId?: string;
    promotionName?: string;
    promoCode?: string;
    items: Array<{ offerId: string; quantity: number }>;
  };
}
```

## Usage Flow

### Recommended: Two-Step Process

1. **Get Pricing** (from pricing API)
2. **Create Payment Intent** (with validated price)

```typescript
// Step 1: Get server-calculated pricing
const pricingRes = await fetch('/api/pricing', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    offerId: 'SA-10GB-7D',
    promoCode: 'RAMADAN10'
  })
});

const pricing = await pricingRes.json();

if (!pricing.success) {
  // Handle error
  return;
}

// Step 2: Create payment intent with validated price
const paymentRes = await fetch('/api/create-payment-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    offerId: 'SA-10GB-7D',
    recipientEmail: 'customer@example.com',
    discountCode: 'RAMADAN10',
    finalPriceCents: pricing.finalPriceCents // Optional: for validation
  })
});

const { clientSecret, paymentIntentId } = await paymentRes.json();
```

### Backward Compatible: Single-Step Process

The API still works without the pricing step, but it will:
- Calculate pricing server-side automatically
- Validate any provided price
- Reject mismatches

```typescript
// Single-step (still works, but less optimal)
const paymentRes = await fetch('/api/create-payment-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    offerId: 'SA-10GB-7D',
    recipientEmail: 'customer@example.com',
    discountCode: 'RAMADAN10'
    // finalPriceCents not provided - will be calculated server-side
  })
});
```

## Security Features

### ✅ Price Tampering Prevention

**How it works:**
1. Server calculates final price using pricing API
2. If client provides `finalPriceCents`, it's validated
3. Mismatches are rejected with error

**Example:**
```typescript
// Client tries to tamper with price
const paymentRes = await fetch('/api/create-payment-intent', {
  method: 'POST',
  body: JSON.stringify({
    offerId: 'SA-10GB-7D',
    finalPriceCents: 100 // Tampered: should be 900
  })
});

// Response:
{
  error: "Price mismatch. Please refresh and try again.",
  expectedPrice: 900,
  providedPrice: 100
}
```

### ✅ Idempotency

**Enhanced idempotency keys:**
- Include offerId/cart items
- Include email (if provided)
- Include promo code
- Include price hash
- Include timestamp (rounded to minute)

**Benefits:**
- Prevents duplicate payment intents
- Handles network retries
- Ensures consistent pricing

### ✅ Metadata Storage

All pricing details stored in Stripe metadata:
- Original price
- Discount amount
- Promotion details
- Final price

**Use cases:**
- Webhook verification
- Audit trails
- Dispute resolution
- Analytics

## EU Customer Support (SCA)

### Strong Customer Authentication (SCA)

The updated flow includes SCA support:

```typescript
automatic_payment_methods: {
  enabled: true,
  allow_redirects: 'always', // Required for SCA
}

payment_method_options: {
  card: {
    request_three_d_secure: 'automatic', // 3DS when required
  },
}
```

**Benefits:**
- ✅ Compliant with PSD2 regulations
- ✅ Automatic 3DS when required
- ✅ Supports redirect-based authentication
- ✅ Works for all EU customers

## Error Handling

### Price Mismatch
```typescript
{
  error: "Price mismatch. Please refresh and try again.",
  expectedPrice: 900,
  providedPrice: 100
}
```

### Invalid Product
```typescript
{
  error: "Product not found"
}
```

### Invalid Promo Code
```typescript
{
  error: "Promotion is not currently active"
}
```

### Rate Limiting
```typescript
{
  error: "Too many requests. Please try again later."
}
// Headers:
// Retry-After: 60
// X-RateLimit-Limit: 10
// X-RateLimit-Remaining: 0
```

## Migration Guide

### For Existing Clients

**Before:**
```typescript
// Old: Price calculated in payment intent route
const paymentRes = await fetch('/api/create-payment-intent', {
  method: 'POST',
  body: JSON.stringify({
    offerId: 'SA-10GB-7D',
    discountCode: 'RAMADAN10'
  })
});
```

**After (Recommended):**
```typescript
// New: Two-step process with pricing API
// Step 1: Get pricing
const pricing = await fetch('/api/pricing', {
  method: 'POST',
  body: JSON.stringify({
    offerId: 'SA-10GB-7D',
    promoCode: 'RAMADAN10'
  })
}).then(r => r.json());

// Step 2: Create payment intent
const payment = await fetch('/api/create-payment-intent', {
  method: 'POST',
  body: JSON.stringify({
    offerId: 'SA-10GB-7D',
    discountCode: 'RAMADAN10',
    finalPriceCents: pricing.finalPriceCents // Optional validation
  })
}).then(r => r.json());
```

**After (Backward Compatible):**
```typescript
// Still works: Single-step (calculates server-side)
const payment = await fetch('/api/create-payment-intent', {
  method: 'POST',
  body: JSON.stringify({
    offerId: 'SA-10GB-7D',
    discountCode: 'RAMADAN10'
    // No finalPriceCents - will be calculated server-side
  })
}).then(r => r.json());
```

## Testing

### Test Price Validation
```bash
# Correct price
curl -X POST http://localhost:3000/api/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{
    "offerId": "SA-10GB-7D",
    "finalPriceCents": 900
  }'

# Tampered price (should fail)
curl -X POST http://localhost:3000/api/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{
    "offerId": "SA-10GB-7D",
    "finalPriceCents": 100
  }'
```

### Test SCA Support
```bash
# Create payment intent (will request 3DS for EU customers)
curl -X POST http://localhost:3000/api/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{
    "offerId": "SA-10GB-7D",
    "recipientEmail": "customer@example.com"
  }'
```

## Best Practices

1. **Always use pricing API first** - Get server-calculated price
2. **Validate prices** - Pass `finalPriceCents` for validation
3. **Handle errors gracefully** - Check for price mismatches
4. **Display pricing breakdown** - Show original, discount, final
5. **Handle SCA redirects** - Support 3DS authentication flow

## Metadata Reference

### Payment Intent Metadata Fields

| Field | Type | Description |
|-------|------|-------------|
| `offerId` | string | Product offer ID |
| `productName` | string | Product display name |
| `original_price` | string | Base price in cents |
| `discount_applied` | string | Discount amount in cents |
| `discount_percent` | string | Discount percentage |
| `final_price` | string | Final price in cents |
| `currency` | string | Currency code |
| `promotion_id` | string | Promotion UUID (if applied) |
| `promotion_name` | string | Promotion name (if applied) |
| `promo_code` | string | Promo code used (if any) |
| `recipientEmail` | string | Customer email (if provided) |
| `fullName` | string | Customer name (if provided) |

## Summary

✅ **Server-side pricing** - All prices calculated server-side  
✅ **Price validation** - Client prices validated against server  
✅ **Enhanced metadata** - Comprehensive pricing details stored  
✅ **Idempotency** - Prevents duplicate payment intents  
✅ **EU SCA support** - Compliant with PSD2 regulations  
✅ **Backward compatible** - Existing clients still work  
