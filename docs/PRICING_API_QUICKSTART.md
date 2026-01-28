# Server-Side Pricing API - Quick Start

## Overview

The Server-Side Pricing API calculates final prices for Umrah eSIM purchases with automatic promotion application. All pricing is calculated server-side to prevent tampering.

## Quick Example

```typescript
// Get pricing for a product
const response = await fetch('/api/pricing', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    offerId: 'SA-10GB-7D',
    promoCode: 'RAMADAN10' // Optional
  })
});

const pricing = await response.json();

if (pricing.success) {
  console.log(`Original: $${(pricing.originalPriceCents / 100).toFixed(2)}`);
  console.log(`Discount: ${pricing.discountPercent}%`);
  console.log(`Final: $${(pricing.finalPriceCents / 100).toFixed(2)}`);
}
```

## API Endpoints

### Single Product
```
POST /api/pricing
Body: { offerId: string, promoCode?: string }
```

### Cart
```
POST /api/pricing/cart
Body: { items: [{ offerId: string, quantity: number }], promoCode?: string }
```

## Response Format

```typescript
{
  success: true,
  originalPriceCents: 1000,      // $10.00
  discountPercent: 10,            // 10% off
  discountAmountCents: 100,       // $1.00
  finalPriceCents: 900,           // $9.00
  currency: "USD",
  promotionId: "uuid",
  promotionName: "Ramadan Umrah Promotion",
  promoCode: "RAMADAN10",
  appliedPromotion: {
    id: "uuid",
    name: "Ramadan Umrah Promotion",
    code: "RAMADAN10",
    discountPercent: 10
  }
}
```

## Automatic Features

✅ **Auto-applies Ramadan promo** if active (no code needed)  
✅ **Validates promo codes** (rejects expired/inactive)  
✅ **Prevents price tampering** (all calculations server-side)  
✅ **Enforces minimum profit** (sustainable pricing)  

## Integration Example

```typescript
// In your checkout component
async function handleCheckout(offerId: string, promoCode?: string) {
  // 1. Get pricing
  const pricingRes = await fetch('/api/pricing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ offerId, promoCode }),
  });
  
  const pricing = await pricingRes.json();
  
  if (!pricing.success) {
    alert(pricing.error);
    return;
  }
  
  // 2. Display pricing to user
  setPrice(pricing.finalPriceCents / 100);
  setDiscount(pricing.discountPercent);
  
  // 3. Create payment intent
  const paymentRes = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      offerId,
      recipientEmail: email,
      discountCode: pricing.promoCode, // Pass for tracking
    }),
  });
  
  // ... handle payment
}
```

## Error Handling

```typescript
const pricing = await getPricing(offerId, promoCode);

if (!pricing.success) {
  switch (pricing.error) {
    case 'Product not found':
      // Handle invalid product
      break;
    case 'Promotion is not currently active':
      // Handle expired/inactive promo
      break;
    case 'Minimum purchase amount not met':
      // Handle minimum threshold
      break;
    default:
      // Handle other errors
  }
}
```

## Testing

```bash
# Test single product
curl -X POST http://localhost:3000/api/pricing \
  -H "Content-Type: application/json" \
  -d '{"offerId": "SA-10GB-7D"}'

# Test with promo code
curl -X POST http://localhost:3000/api/pricing \
  -H "Content-Type: application/json" \
  -d '{"offerId": "SA-10GB-7D", "promoCode": "RAMADAN10"}'
```

## Key Points

1. **Always use server-side API** - Never calculate prices on client
2. **Pass promo codes** - Optional, but validates if provided
3. **Handle errors** - Check `success` field in response
4. **Use final price** - Use `finalPriceCents` for payment intent

For full documentation, see: `docs/SERVER_SIDE_PRICING_API.md`
