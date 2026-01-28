# Profit Margin 35% - Verification Guide
**Date:** January 27, 2025  
**Status:** ✅ Configured for 35% Profit Margin

---

## ✅ Configuration Complete

The application is now configured with a **35% profit margin (1.35x)** as the default.

---

## Current Settings

### Environment Variables

**`.env.local` (Development):**
```env
ESIMACCESS_PROFIT_MARGIN=1.35
ESIMACCESS_MIN_PROFIT_CENTS=200
```

**`.env.example`:**
```env
ESIMACCESS_PROFIT_MARGIN=1.35
ESIMACCESS_MIN_PROFIT_CENTS=200
```

**Vercel (Production):**
- Set `ESIMACCESS_PROFIT_MARGIN=1.35` in Vercel Dashboard
- Set `ESIMACCESS_MIN_PROFIT_CENTS=200` in Vercel Dashboard

---

## Code Configuration

### Default Values Updated

**File:** `src/lib/pricing-config.ts`
- ✅ Default changed from `1.20` to `1.35`
- ✅ Fallback changed from `1.20` to `1.35`

**File:** `src/lib/products-cache.ts`
- ✅ Default changed from `1.20` to `1.35`

**File:** `src/lib/esimaccess.ts`
- ✅ Comments updated to reflect 35% as default

---

## How to Verify

### 1. Check Environment Variable

```bash
# In your terminal
echo $ESIMACCESS_PROFIT_MARGIN
# Should output: 1.35

# Or check .env.local
cat .env.local | grep ESIMACCESS_PROFIT_MARGIN
# Should show: ESIMACCESS_PROFIT_MARGIN=1.35
```

### 2. Test Pricing Endpoint

Visit: `http://localhost:3000/api/test-pricing`

**Expected Output:**
```json
{
  "success": true,
  "profitMargin": 1.35,
  "profitMarginPercent": "35%",
  "envVar": "1.35",
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

### 3. Check Product Prices

1. Visit homepage: `http://localhost:3000`
2. Check product prices
3. Prices should reflect 35% markup

**Example:**
- If provider cost is $10.00
- Your price should be $13.50
- Profit: $3.50 (35%)

### 4. Check Logs

When pricing is calculated, you should see:
```
[Pricing] ✅ Using profit margin: 1.35 (35% markup)
```

---

## Price Calculation Examples

### Example 1: Standard Plan
- **Provider Cost:** $10.00
- **35% Margin:** $10.00 × 1.35 = **$13.50**
- **Your Profit:** $3.50

### Example 2: Low-Cost Plan (Minimum Profit Floor)
- **Provider Cost:** $5.00
- **35% Margin:** $5.00 × 1.35 = $6.75
- **Minimum Profit:** $5.00 + $2.00 = $7.00
- **Final Price:** **$7.00** (uses minimum)
- **Your Profit:** $2.00

### Example 3: High-Cost Plan
- **Provider Cost:** $50.00
- **35% Margin:** $50.00 × 1.35 = **$67.50**
- **Your Profit:** $17.50

---

## Where 35% Margin is Applied

### ✅ Product Listings
- All products shown to customers
- Applied when fetching from eSIM Access API
- Stored in `price.fixed` field

### ✅ Payment Intent Creation
- Single product purchases
- Cart purchases
- Top-up purchases

### ✅ Price Verification
- Webhook price verification
- Payment amount validation
- Fraud detection

---

## Important Notes

### ✅ Already Configured
- Default margin: 1.35 (35%)
- Minimum profit floor: $2.00
- Dynamic reading (no caching)
- Applied to all pricing calculations

### ⚠️ Action Required

1. **Verify `.env.local`:**
   ```env
   ESIMACCESS_PROFIT_MARGIN=1.35
   ```

2. **Verify Vercel (Production):**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Ensure `ESIMACCESS_PROFIT_MARGIN=1.35` is set
   - Redeploy if changed

3. **Restart Dev Server:**
   ```bash
   # Stop server (Ctrl+C)
   pnpm dev
   ```

4. **Test:**
   - Visit `/api/test-pricing`
   - Check product prices
   - Verify calculations

---

## Troubleshooting

### Prices Still Showing Old Margin

**Solution:**
1. Restart dev server
2. Clear browser cache
3. Visit `/api/revalidate-products` to clear product cache
4. Check environment variable is set correctly

### Wrong Prices

**Check:**
1. Environment variable: `ESIMACCESS_PROFIT_MARGIN=1.35`
2. Visit `/api/test-pricing` to verify margin
3. Check logs for margin value
4. Verify minimum profit floor isn't overriding

### Prices Not Updating

**Solution:**
1. Restart dev server (required for env var changes)
2. Clear product cache
3. Check environment variable
4. Verify no caching in development

---

## Summary

✅ **Default Margin:** 1.35 (35% markup)  
✅ **Minimum Profit:** $2.00 per order  
✅ **Applied To:** All products, all payment flows  
✅ **Dynamic:** Changes take effect immediately (after restart)  
✅ **Verified:** Test endpoint available at `/api/test-pricing`

---

**See Also:**
- `docs/PROFIT_MARGIN_35_PERCENT.md` - Detailed 35% margin guide
- `docs/PRICING_AND_MARGINS.md` - Full pricing documentation
