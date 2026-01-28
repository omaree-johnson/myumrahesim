# Server-Side Pricing API Documentation

## Overview

The Server-Side Pricing API ensures all pricing calculations happen on the server, preventing client-side price tampering. It automatically applies active promotions (including Ramadan promo) and validates promo codes.

## Security Features

✅ **Base price never modified on client** - All prices fetched server-side  
✅ **Promotion validation** - Expired/inactive promos are rejected  
✅ **Secure Supabase access** - Uses service role key (never exposed to client)  
✅ **Minimum profit floor** - Ensures sustainable pricing even with discounts  

## API Endpoints

### 1. Single Product Pricing

**Endpoint:** `POST /api/pricing`

**Request Body:**
```typescript
{
  offerId: string;      // Product offer ID (packageCode/slug)
  promoCode?: string;   // Optional promo code
}
```

**Response (Success):**
```typescript
{
  success: true;
  originalPriceCents: number;      // Base price in cents
  discountPercent: number;         // Applied discount percentage (0-90)
  discountAmountCents: number;       // Discount amount in cents
  finalPriceCents: number;          // Final price after discount
  currency: string;                  // Currency code (e.g., "USD")
  promotionId?: string;             // Promotion ID (if applied)
  promotionName?: string;            // Promotion name (if applied)
  promoCode?: string;                // Promo code used (if any)
  appliedPromotion?: {              // Full promotion details
    id: string;
    name: string;
    code: string | null;
    discountPercent: number;
  };
}
```

**Response (Error):**
```typescript
{
  success: false;
  error: string;
}
```

### 2. Cart Pricing

**Endpoint:** `POST /api/pricing/cart`

**Request Body:**
```typescript
{
  items: Array<{
    offerId: string;
    quantity: number;
  }>;
  promoCode?: string;   // Optional promo code
}
```

**Response:** Same structure as single product pricing

## Usage Examples

### TypeScript/React

```typescript
// Single product pricing
async function getProductPricing(offerId: string, promoCode?: string) {
  const response = await fetch('/api/pricing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ offerId, promoCode }),
  });

  const result = await response.json();
  
  if (result.success) {
    console.log('Original price:', result.originalPriceCents / 100);
    console.log('Discount:', result.discountPercent + '%');
    console.log('Final price:', result.finalPriceCents / 100);
    
    if (result.appliedPromotion) {
      console.log('Promotion:', result.appliedPromotion.name);
    }
  } else {
    console.error('Error:', result.error);
  }
  
  return result;
}

// Cart pricing
async function getCartPricing(items: Array<{ offerId: string; quantity: number }>, promoCode?: string) {
  const response = await fetch('/api/pricing/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, promoCode }),
  });

  return await response.json();
}
```

### JavaScript

```javascript
// Get pricing for a product
fetch('/api/pricing', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    offerId: 'SA-10GB-7D',
    promoCode: 'RAMADAN10' // Optional
  })
})
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      const originalPrice = (data.originalPriceCents / 100).toFixed(2);
      const finalPrice = (data.finalPriceCents / 100).toFixed(2);
      const discount = data.discountPercent;
      
      console.log(`Original: $${originalPrice}`);
      console.log(`Discount: ${discount}%`);
      console.log(`Final: $${finalPrice}`);
    }
  });
```

## How It Works

### 1. Product Lookup
- Fetches product from server-side cache (never trusts client)
- Validates product exists and is enabled
- Gets base price (already includes profit margin)

### 2. Promotion Lookup
- Checks `promotions` table for active promotions
- If `promoCode` provided: Looks up by code
- If no code: Checks for auto-applied promotions (e.g., Ramadan)
- Uses database function `get_active_promotion()` for fast lookup

### 3. Validation
- Checks promotion is active (`is_active = true`)
- Verifies current date is within `starts_at` and `ends_at`
- Validates minimum purchase amount (if set)
- Ensures promotion applies to product type (`esim`, `cart`, etc.)

### 4. Discount Calculation
- Applies discount percentage to original price
- Respects minimum profit floor (ensures sustainable pricing)
- Applies maximum discount cap (if set)
- Calculates final price

### 5. Response
- Returns all pricing details
- Includes promotion information
- Never exposes internal cost prices

## Promotion Priority

When multiple promotions are active:
- **Highest priority wins** (prevents stacking)
- Auto-applied promotions have priority 100 (high)
- Code-based promotions typically have lower priority

## Error Handling

Common errors:
- `"Product not found"` - Invalid offerId
- `"Product is not available"` - Product disabled
- `"Promotion is not currently active"` - Outside date range
- `"Promotion is inactive"` - Manually disabled
- `"Minimum purchase amount not met"` - Below minimum threshold

## Integration with Payment Intent

Use the pricing API before creating payment intents:

```typescript
// 1. Get pricing
const pricing = await getProductPricing(offerId, promoCode);

if (!pricing.success) {
  // Handle error
  return;
}

// 2. Create payment intent with final price
const paymentIntent = await fetch('/api/create-payment-intent', {
  method: 'POST',
  body: JSON.stringify({
    offerId,
    recipientEmail: email,
    discountCode: pricing.promoCode, // Pass promo code for tracking
  }),
});

// 3. Verify server-side price matches
// (Payment intent creation also validates pricing server-side)
```

## Automatic Promotion Application

The API automatically applies active promotions:

1. **Ramadan Promotion**: Auto-applied if active (no code needed)
2. **Other Auto-Applied Promos**: Applied if `promo_code IS NULL` and active
3. **Code-Based Promos**: Only applied if code is provided and valid

## Security Considerations

### ✅ Secure Implementation
- All pricing logic is server-side
- Base prices fetched from server cache
- Supabase service role key never exposed
- Promotions validated against database
- Minimum profit floor enforced

### ❌ What's Prevented
- Client-side price modification
- Expired promotion usage
- Inactive promotion usage
- Stacking multiple promotions
- Price tampering attacks

## Testing

### Test Single Product
```bash
curl -X POST http://localhost:3000/api/pricing \
  -H "Content-Type: application/json" \
  -d '{"offerId": "SA-10GB-7D"}'
```

### Test with Promo Code
```bash
curl -X POST http://localhost:3000/api/pricing \
  -H "Content-Type: application/json" \
  -d '{"offerId": "SA-10GB-7D", "promoCode": "RAMADAN10"}'
```

### Test Cart
```bash
curl -X POST http://localhost:3000/api/pricing/cart \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"offerId": "SA-10GB-7D", "quantity": 1},
      {"offerId": "SA-20GB-14D", "quantity": 2}
    ],
    "promoCode": "RAMADAN10"
  }'
```

## Database Schema

The API uses the `promotions` table:
- `id` - Promotion UUID
- `name` - Human-readable name
- `promo_code` - Optional code (NULL for auto-applied)
- `discount_percent` - Discount percentage (1-90)
- `starts_at` - Start timestamp
- `ends_at` - End timestamp
- `is_active` - Active status
- `applies_to` - Applicability ('esim', 'cart', 'topup', 'any')
- `priority` - Priority level (higher wins)
- `min_purchase_amount_cents` - Minimum purchase required
- `max_discount_amount_cents` - Maximum discount cap

## Performance

- **Fast lookups**: Uses database function `get_active_promotion()`
- **Cached products**: Product data cached server-side
- **Efficient queries**: Indexed database lookups
- **Typical response time**: < 100ms

## Future Enhancements

Potential improvements:
- [ ] Caching promotion lookups
- [ ] Bulk pricing calculation
- [ ] Price history tracking
- [ ] A/B testing support
- [ ] Regional pricing
