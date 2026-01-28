# Pricing Debug Steps

## Current Issue
Prices are not updating on the website despite changes to `ESIMACCESS_PROFIT_MARGIN`.

## Root Causes Found

1. **Page Caching**: The plans page was cached for 5 minutes (`revalidate = 300`)
2. **Environment Variable**: Your `.env.local` shows `ESIMACCESS_PROFIT_MARGIN=1.35` (35% markup), not 2.0 (100% markup)
3. **Server Restart Required**: Environment variables require a server restart to take effect

## Fixes Applied

1. ✅ **Page Revalidation**: Changed to 0 seconds in development, 60 seconds in production
2. ✅ **Loop Prevention**: Memoized `filteredProducts` to prevent infinite re-renders
3. ✅ **Debug Logging**: Added console logs to verify pricing calculations

## Steps to See Price Changes

### Step 1: Update Environment Variable
Edit `.env.local`:
```env
ESIMACCESS_PROFIT_MARGIN=2.0
ESIMACCESS_MIN_PROFIT_CENTS=200
```

### Step 2: Restart Dev Server
**CRITICAL**: You MUST restart your dev server for env var changes to take effect:
```bash
# Stop server (Ctrl+C)
pnpm dev
# or npm run dev
```

### Step 3: Verify Pricing
1. **Check test endpoint**: `http://localhost:3000/api/test-pricing`
   - Should show `profitMargin: 2` and `profitMarginPercent: "100%"`
   
2. **Check console logs** (in terminal where server is running):
   - Look for: `[Pricing] Using profit margin: 2 (100% markup)`
   - Look for: `[Plans Page] Product: ...` logs showing cost vs selling price
   - Look for: `[Cache] Development mode - bypassing cache`

3. **Check browser console** (F12):
   - Should see pricing calculation logs

4. **Visit plans page**: `http://localhost:3000/plans`
   - Prices should be 2x the cost
   - Example: $10 cost → $20 selling price

## Expected Behavior

With `ESIMACCESS_PROFIT_MARGIN=2.0`:
- **Cost**: $10.00 → **Price**: $20.00 (100% markup)
- **Cost**: $20.00 → **Price**: $40.00 (100% markup)
- **Cost**: $5.00 → **Price**: $10.00 (or $7.00 if min profit floor applies)

## Troubleshooting

### Prices Still Not Updating?

1. **Verify env var is loaded**:
   - Visit `/api/test-pricing`
   - Check `envVar` field - should show "2" not "1.35" or "not set"

2. **Check server logs**:
   - Should see `[Pricing] Using profit margin: 2 (100% markup)` on every request
   - Should see `[Cache] Development mode - bypassing cache`

3. **Hard refresh browser**:
   - Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear browser cache

4. **Verify cache is disabled**:
   - In dev mode, cache should be bypassed
   - Look for `[Cache] Development mode - bypassing cache` in logs

5. **Check if page is regenerating**:
   - In dev mode, page should regenerate on every request
   - Check network tab - should see fresh requests, not cached responses

## Current Configuration

- **Profit Margin**: Check your `.env.local` - currently shows `1.35` (35% markup)
- **To get 100% markup**: Set `ESIMACCESS_PROFIT_MARGIN=2.0`
- **Min Profit Floor**: $2.00 (200 cents)
- **Cache**: Disabled in development (0 seconds)
- **Page Revalidation**: 0 seconds in development, 60 seconds in production

## Loop Fix

The infinite loop on the plans page was caused by `filteredProducts` not being memoized. This has been fixed by wrapping it in `useMemo` with proper dependencies.
