# 35% Profit Margin Implementation (1.35)

## Current Configuration

Your application is now configured for **35% profit margin** (1.35x markup).

### Environment Variable
```env
ESIMACCESS_PROFIT_MARGIN=1.35
ESIMACCESS_MIN_PROFIT_CENTS=200
```

## How It Works

### Price Calculation Formula
```
Cost Price: $10.00
Profit Margin: 1.35 (35% markup)
Selling Price: $10.00 × 1.35 = $13.50
Profit: $3.50 (35% of cost)
```

### Minimum Profit Floor
If the calculated price with 35% margin is too low, the minimum profit floor applies:
- Minimum profit: $2.00 (200 cents)
- Example: Cost $5.00 → Margin price $6.75 → But min profit requires $7.00 → **Final price: $7.00**

## Implementation Details

### 1. Centralized Pricing (`src/lib/pricing-config.ts`)
- Reads `ESIMACCESS_PROFIT_MARGIN` dynamically on every call
- No caching - always uses latest value
- Logs calculations in development mode

### 2. Product Pricing (`src/lib/esimaccess.ts`)
- Applies pricing rules when fetching products from eSIM Access API
- Stores both cost price and selling price
- Includes profit margin metadata

### 3. Cache Configuration (`src/lib/products-cache.ts`)
- Development: Cache disabled (0 seconds) - see changes immediately
- Production: 60 second cache with profit margin in cache key
- Cache automatically invalidates when margin changes

### 4. Page Configuration (`src/app/plans/page.tsx`)
- Development: No caching (0 seconds revalidation)
- Production: 60 second revalidation
- Dynamic rendering in development

## Verification Steps

### Step 1: Restart Dev Server
**CRITICAL**: You MUST restart your dev server for the 1.35 margin to take effect:
```bash
# Stop server (Ctrl+C)
pnpm dev
# or npm run dev
```

### Step 2: Test Pricing Endpoint
Visit: `http://localhost:3000/api/test-pricing`

Expected output:
```json
{
  "success": true,
  "configuration": {
    "profitMargin": 1.35,
    "profitMarginPercent": "35%",
    "envVar": "1.35"
  },
  "testCalculation": {
    "basePrice": "$10.00",
    "finalPrice": "$13.50",
    "profit": "$3.50",
    "effectiveMargin": "35%"
  }
}
```

### Step 3: Check Server Logs
Look for these messages in your terminal:
```
[Pricing] Using profit margin: 1.35 (35% markup)
[Pricing] Price calculation: { basePrice: '$10.00', finalPrice: '$13.50', profit: '$3.50', ... }
[Cache] Development mode - bypassing cache, fetching fresh products for SA
```

### Step 4: Verify on Plans Page
Visit: `http://localhost:3000/plans`

Expected behavior:
- Cost $10.00 → Selling Price $13.50
- Cost $20.00 → Selling Price $27.00
- Cost $5.00 → Selling Price $7.00 (min profit floor applies)

## Example Calculations

| Cost Price | 35% Margin | Final Price | Profit |
|------------|------------|-------------|--------|
| $5.00      | $6.75      | **$7.00**   | $2.00  |
| $10.00     | $13.50     | **$13.50**  | $3.50  |
| $20.00     | $27.00     | **$27.00**  | $7.00  |
| $30.00     | $40.50     | **$40.50**  | $10.50 |

*Note: $5.00 cost uses minimum profit floor ($2.00) instead of 35% margin*

## Troubleshooting

### Prices Not Showing 35% Markup?

1. **Restart server** - Environment variables require restart
2. **Check test endpoint** - `/api/test-pricing` should show `profitMargin: 1.35`
3. **Verify env var** - Check `.env.local` has `ESIMACCESS_PROFIT_MARGIN=1.35`
4. **Check logs** - Should see `[Pricing] Using profit margin: 1.35 (35% markup)`
5. **Hard refresh** - Ctrl+Shift+R in browser

### Still Not Working?

1. Verify `.env.local` file is in project root
2. Check server console for any errors
3. Verify no other `.env` files override this value
4. Check that `NODE_ENV` is not set to `production` in development

## Files Involved

1. ✅ `.env.local` - Environment variable configuration
2. ✅ `src/lib/pricing-config.ts` - Centralized pricing logic
3. ✅ `src/lib/esimaccess.ts` - Product fetching with pricing
4. ✅ `src/lib/products-cache.ts` - Cache configuration
5. ✅ `src/app/plans/page.tsx` - Page rendering
6. ✅ `src/app/api/test-pricing/route.ts` - Test endpoint

## Next Steps

After restarting your server:
1. ✅ Visit `/api/test-pricing` to verify 1.35 margin
2. ✅ Check homepage - prices should show 35% markup
3. ✅ Check plans page - all products should have 35% markup
4. ✅ Verify console logs show correct margin

Your application is now configured for **35% profit margin**! 🎉
