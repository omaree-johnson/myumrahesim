# Pricing & Profit Margins

## Current Configuration

**Default Profit Margin:** `1.20` (20% markup)

This means:
- If eSIM Access charges you **$10.00**
- You sell it to customers for **$12.00**
- Your profit: **$2.00** (20% markup)

## How It Works

### Price Calculation

```typescript
// 1. Get base price from eSIM Access API
const basePrice = pkg.price / 10000; // eSIM Access uses price * 10,000

// 2. Apply profit margin
const actualPrice = basePrice * PROFIT_MARGIN;

// Example:
// basePrice = $10.00
// PROFIT_MARGIN = 1.20
// actualPrice = $10.00 * 1.20 = $12.00
```

### Margin vs Markup

**Profit Margin Multiplier:**
- `1.20` = 20% markup (20% above cost)
- `1.30` = 30% markup (30% above cost)
- `1.50` = 50% markup (50% above cost)
- `2.00` = 100% markup (double the price)

**Formula:**
```
Selling Price = Cost × Profit Margin
Profit = Selling Price - Cost
Profit % = ((Selling Price - Cost) / Cost) × 100
```

## Configuration

### Environment Variable

Set in `.env.local` or production environment:

```env
ESIMACCESS_PROFIT_MARGIN=1.20
```

**Examples:**
- `ESIMACCESS_PROFIT_MARGIN=1.20` → 20% markup
- `ESIMACCESS_PROFIT_MARGIN=1.30` → 30% markup
- `ESIMACCESS_PROFIT_MARGIN=1.50` → 50% markup
- `ESIMACCESS_PROFIT_MARGIN=2.00` → 100% markup (double)

### Where It's Applied

1. **Product Listing** (`getEsimProducts`)
   - All products shown to customers have margin applied
   - Original cost stored in `costPrice` field (for reference)

2. **Purchase Processing** (`createEsimOrder`)
   - Customer pays the marked-up price
   - System pays eSIM Access the original cost
   - Profit is the difference

3. **Webhook Logging** (`stripe/route.ts`)
   - Logs profit margin and percentage for each purchase
   - Shows: cost, selling price, profit amount, profit percentage

## Example Calculations

### Example 1: 20% Markup (Default)
```
eSIM Access Cost: $10.00
PROFIT_MARGIN: 1.20
Customer Price: $10.00 × 1.20 = $12.00
Your Profit: $12.00 - $10.00 = $2.00
Profit %: ($2.00 / $10.00) × 100 = 20%
```

### Example 2: 30% Markup
```
eSIM Access Cost: $10.00
PROFIT_MARGIN: 1.30
Customer Price: $10.00 × 1.30 = $13.00
Your Profit: $13.00 - $10.00 = $3.00
Profit %: ($3.00 / $10.00) × 100 = 30%
```

### Example 3: 50% Markup
```
eSIM Access Cost: $10.00
PROFIT_MARGIN: 1.50
Customer Price: $10.00 × 1.50 = $15.00
Your Profit: $15.00 - $10.00 = $5.00
Profit %: ($5.00 / $10.00) × 100 = 50%
```

## What's Stored in Database

### Product Data
```typescript
{
  price: {
    fixed: 1200, // $12.00 in cents (with margin)
    currency: "USD"
  },
  costPrice: {
    fixed: 1000, // $10.00 in cents (original cost)
    currency: "USD"
  },
  profitMargin: 1.20 // Margin multiplier
}
```

### Purchase Record
```typescript
{
  price: 1200, // What customer paid (in cents)
  esim_provider_cost: 1000, // What you paid eSIM Access (in cents)
  // Profit = price - esim_provider_cost = 200 cents = $2.00
}
```

## Profit Tracking

### In Stripe Webhook Logs

When a purchase is processed, you'll see:

```javascript
[Stripe Webhook] Package cost and profit: {
  providerCostInCents: 1000,        // $10.00
  providerCurrency: 'USD',
  sellingPrice: 1200,               // $12.00
  profitInCents: 200,                // $2.00
  profitPercentage: '20.00%',
  profitMargin: '20.00%',
  packageCode: 'SA-1GB-7D'
}
```

### In Database

Check `esim_purchases` table:
```sql
SELECT 
  transaction_id,
  price / 100.0 as customer_paid,
  esim_provider_cost / 100.0 as your_cost,
  (price - esim_provider_cost) / 100.0 as profit,
  ((price - esim_provider_cost)::float / esim_provider_cost * 100) as profit_percentage
FROM esim_purchases
ORDER BY created_at DESC;
```

## Changing the Margin

### To Change Margin

1. **Update Environment Variable:**
   ```env
   ESIMACCESS_PROFIT_MARGIN=1.30  # Change to 30% markup
   ```

2. **Restart Server:**
   - Development: Restart `pnpm dev`
   - Production: Redeploy (Vercel auto-deploys on env var changes)

3. **Verify:**
   - Check product prices on homepage
   - Should reflect new margin
   - Old purchases keep their original prices

### Important Notes

- **Existing purchases** keep their original prices
- **New purchases** use the updated margin
- **Product listings** update immediately after restart
- **Margin applies to all products** (can't set per-product)

## Recommended Margins

### Conservative (Lower Risk)
- **15-20% markup** (`1.15` - `1.20`)
- Good for competitive pricing
- Lower profit but more sales

### Standard
- **20-30% markup** (`1.20` - `1.30`)
- Balanced approach
- Good profit while remaining competitive

### Aggressive (Higher Profit)
- **30-50% markup** (`1.30` - `1.50`)
- Higher profit per sale
- May reduce sales volume

## Current Status

**Your Current Margin:** `1.20` (20% markup)

**To Check Your Current Setting:**
```bash
# Check environment variable
echo $ESIMACCESS_PROFIT_MARGIN

# Or check in code
# src/lib/esimaccess.ts line 14
```

**To Change:**
1. Set `ESIMACCESS_PROFIT_MARGIN` in your environment
2. Restart/redeploy
3. New product prices will reflect the change

## Summary

✅ **Yes, prices are marked up** - Default 20% markup  
✅ **Configurable** - Set via `ESIMACCESS_PROFIT_MARGIN` env var  
✅ **Tracked** - Cost and profit logged in webhook and database  
✅ **Transparent** - Original cost stored in `costPrice` field  

The system is designed to automatically apply your desired profit margin to all eSIM products.

