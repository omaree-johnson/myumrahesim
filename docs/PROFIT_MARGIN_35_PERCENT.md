# 35% Profit Margin Configuration
**Date:** January 27, 2025  
**Status:** ✅ Configured

---

## Current Configuration

The application is configured with a **35% profit margin** (1.35x multiplier) as the default.

### Environment Variable

```env
ESIMACCESS_PROFIT_MARGIN=1.35
ESIMACCESS_MIN_PROFIT_CENTS=200
```

---

## How 35% Margin Works

### Price Calculation

**Formula:**
```
Selling Price = Cost Price × 1.35
Profit = Selling Price - Cost Price
Profit Percentage = 35%
```

**Example:**
- Provider cost: **$10.00**
- Your selling price: **$13.50** ($10.00 × 1.35)
- Your profit: **$3.50** (35% of cost)

### Minimum Profit Floor

The `ESIMACCESS_MIN_PROFIT_CENTS=200` ensures a minimum profit of **$2.00** per order, even for very low-cost plans.

**How it works:**
- If `cost × 1.35` is less than `cost + $2.00`, use `cost + $2.00`
- This protects against Stripe fees on low-priced plans

**Example:**
- Cost: **$5.00**
- 35% margin price: **$6.75** ($5.00 × 1.35)
- Minimum profit price: **$7.00** ($5.00 + $2.00)
- **Final price: $7.00** (uses minimum profit floor)

---

## Implementation

### 1. Default Value

**File:** `src/lib/pricing-config.ts`

```typescript
// Default to 35% if not set
const marginStr = process.env.ESIMACCESS_PROFIT_MARGIN || "1.35";
```

### 2. Dynamic Reading

The profit margin is read **dynamically** on every price calculation:
- No caching
- Changes take effect immediately
- No server restart needed (in development)

### 3. Applied Everywhere

The 35% margin is applied to:
- ✅ Product listings (`/api/products`)
- ✅ Payment intent creation
- ✅ Cart payment intents
- ✅ Top-up payment intents
- ✅ Price verification in webhooks

---

## Verification

### Test Pricing Endpoint

Visit: `http://localhost:3000/api/test-pricing`

**Expected Output:**
```json
{
  "success": true,
  "profitMargin": 1.35,
  "profitMarginPercent": "35%",
  "sampleCalculation": {
    "basePrice": 10.00,
    "costCents": 1000,
    "finalPriceCents": 1350,
    "finalPrice": "$13.50",
    "profit": "$3.50",
    "effectiveMargin": "35%"
  }
}
```

### Check Environment Variable

```bash
# In .env.local or Vercel
echo $ESIMACCESS_PROFIT_MARGIN
# Should output: 1.35
```

### Verify in Logs

When pricing is calculated, you'll see:
```
[Pricing] ✅ Using profit margin: 1.35 (35% markup)
```

---

## Updating the Margin

### To Change Margin

1. **Update Environment Variable:**
   ```env
   ESIMACCESS_PROFIT_MARGIN=1.50  # For 50% margin
   ```

2. **Restart Server (Development):**
   ```bash
   # Stop and restart
   pnpm dev
   ```

3. **Redeploy (Production):**
   - Update in Vercel Dashboard → Environment Variables
   - Redeploy application

4. **Verify:**
   - Visit `/api/test-pricing`
   - Check product prices
   - Verify calculations

---

## Price Calculation Examples

### Example 1: Standard Plan
- **Provider Cost:** $10.00
- **35% Margin:** $10.00 × 1.35 = **$13.50**
- **Profit:** $3.50

### Example 2: Low-Cost Plan (Minimum Profit Floor)
- **Provider Cost:** $5.00
- **35% Margin:** $5.00 × 1.35 = $6.75
- **Minimum Profit:** $5.00 + $2.00 = $7.00
- **Final Price:** **$7.00** (uses minimum)
- **Profit:** $2.00

### Example 3: High-Cost Plan
- **Provider Cost:** $50.00
- **35% Margin:** $50.00 × 1.35 = **$67.50**
- **Profit:** $17.50

---

## Important Notes

### ✅ Already Configured
- Default margin set to 1.35 (35%)
- Minimum profit floor: $2.00
- Dynamic reading (no caching)
- Applied to all pricing calculations

### ⚠️ To Verify
1. Check `.env.local` has `ESIMACCESS_PROFIT_MARGIN=1.35`
2. Check Vercel has `ESIMACCESS_PROFIT_MARGIN=1.35`
3. Restart dev server if changed
4. Test pricing endpoint
5. Verify product prices reflect 35% margin

---

## Troubleshooting

### Prices Not Updating

**Issue:** Prices still showing old margin

**Solutions:**
1. Restart dev server
2. Clear product cache (visit `/api/revalidate-products`)
3. Check environment variable is set correctly
4. Verify no caching in development mode

### Wrong Prices

**Issue:** Prices don't match 35% margin

**Check:**
1. Environment variable value: `ESIMACCESS_PROFIT_MARGIN=1.35`
2. Check logs for margin value
3. Visit `/api/test-pricing` to verify
4. Check minimum profit floor isn't overriding

---

**See Also:**
- `docs/PRICING_AND_MARGINS.md` - Full pricing documentation
- `docs/PRICING_35_PERCENT_IMPLEMENTATION.md` - Implementation details
