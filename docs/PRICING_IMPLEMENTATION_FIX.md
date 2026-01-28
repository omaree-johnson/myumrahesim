# Pricing Implementation - Complete Redesign

## Problem
Prices weren't updating when `ESIMACCESS_PROFIT_MARGIN` was changed because:
1. Profit margin was read once at module load (cached)
2. Product cache was preventing new prices from showing
3. No way to verify pricing was working

## Solution

### 1. Centralized Pricing Configuration (`src/lib/pricing-config.ts`)
- **New file** with all pricing logic
- Reads profit margin **dynamically** on every call (not cached)
- Includes logging to verify it's working
- Single source of truth for pricing

### 2. Updated `src/lib/esimaccess.ts`
- Imports pricing functions from `pricing-config.ts`
- Removed duplicate local function definitions
- Uses centralized `calculatePrice()` function

### 3. Cache Improvements (`src/lib/products-cache.ts`)
- **Development**: Cache **disabled** (0 seconds) - see changes immediately
- **Production**: 60 second cache with profit margin in cache key
- Cache automatically invalidates when margin changes

### 4. Test Endpoint (`src/app/api/test-pricing/route.ts`)
- Visit `/api/test-pricing` to verify pricing is working
- Shows current margin, sample calculations, and actual product prices

## How It Works Now

### Price Calculation Flow:
```
1. User requests products
2. getCachedEsimProducts() called
3. In dev: Cache bypassed → fetchEsimProducts() called
4. fetchEsimProducts() calls applyPricingRules() for each product
5. applyPricingRules() calls calculatePrice() from pricing-config.ts
6. calculatePrice() reads ESIMACCESS_PROFIT_MARGIN dynamically
7. Price calculated: cost × margin = selling price
8. Product returned with new price
```

### Example with Margin = 2.0 (100% markup):
- Provider cost: $10.00
- Your price: $20.00 (2x)
- Profit: $10.00

## Verification Steps

1. **Check your `.env.local`:**
   ```env
   ESIMACCESS_PROFIT_MARGIN=2
   ESIMACCESS_MIN_PROFIT_CENTS=200
   ```

2. **Restart dev server** (one-time requirement):
   ```bash
   # Stop server (Ctrl+C)
   pnpm dev
   ```

3. **Test pricing endpoint:**
   ```
   http://localhost:3000/api/test-pricing
   ```
   Should show:
   - Profit margin: 2 (100%)
   - Sample calculation with doubled prices

4. **Check homepage/plans page:**
   - Prices should be 2x the cost
   - Example: $10 cost → $20 selling price

5. **Check console logs:**
   - Look for `[Pricing] Using profit margin: 2 (100% markup)`
   - Look for `[Pricing] Price calculation:` logs

## Troubleshooting

### Prices still not updating?

1. **Verify env var is set:**
   ```bash
   # In your terminal
   echo $ESIMACCESS_PROFIT_MARGIN
   # Should show: 2
   ```

2. **Check test endpoint:**
   - Visit `/api/test-pricing`
   - Verify `envVar` shows "2" not "not set"

3. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

4. **Check server logs:**
   - Look for `[Pricing]` log messages
   - Should see margin and price calculations

5. **Verify cache is disabled in dev:**
   - Look for `[Cache] Development mode - bypassing cache` in logs

## Current Configuration

- **Profit Margin**: 2.0 (100% markup)
- **Min Profit Floor**: $2.00 (200 cents)
- **Cache**: Disabled in development, 60s in production

## Files Changed

1. ✅ `src/lib/pricing-config.ts` - NEW: Centralized pricing
2. ✅ `src/lib/esimaccess.ts` - Updated to use centralized pricing
3. ✅ `src/lib/products-cache.ts` - Cache disabled in dev
4. ✅ `src/app/api/test-pricing/route.ts` - NEW: Test endpoint
5. ✅ `src/app/api/revalidate-products/route.ts` - Cache revalidation

## Next Steps

After restarting your server:
1. Visit `/api/test-pricing` to verify
2. Check homepage - prices should be doubled
3. Check console for pricing logs
4. If still not working, check the test endpoint output
