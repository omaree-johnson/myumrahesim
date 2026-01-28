# Profit Margin Analysis & Recommendations

## Current Situation

**Your Current Margin:** 20% markup (1.20 multiplier)
**Stripe Fees:** 2.9% + $0.30 per transaction

## Real-World Profitability Examples

### Example 1: $10.00 eSIM Plan (Current 20% Margin)

| Item | Amount |
|------|--------|
| Provider Cost | $10.00 |
| Your Selling Price (20% markup) | $12.00 |
| **Gross Profit** | **$2.00** |
| Stripe Fee (2.9% + $0.30) | -$0.65 |
| **Net Profit After Fees** | **$1.35** |
| **Net Profit %** | **13.5%** |

### Example 2: $10.00 eSIM Plan (30% Margin)

| Item | Amount |
|------|--------|
| Provider Cost | $10.00 |
| Your Selling Price (30% markup) | $13.00 |
| **Gross Profit** | **$3.00** |
| Stripe Fee (2.9% + $0.30) | -$0.68 |
| **Net Profit After Fees** | **$2.32** |
| **Net Profit %** | **23.2%** |

### Example 3: $10.00 eSIM Plan (50% Margin)

| Item | Amount |
|------|--------|
| Provider Cost | $10.00 |
| Your Selling Price (50% markup) | $15.00 |
| **Gross Profit** | **$5.00** |
| Stripe Fee (2.9% + $0.30) | -$0.74 |
| **Net Profit After Fees** | **$4.26** |
| **Net Profit %** | **42.6%** |

## Impact of Stripe Fees on Low-Priced Plans

### Problem: Small Plans Get Eaten by Fees

**$5.00 Plan with 20% Margin:**
- Provider Cost: $5.00
- Selling Price: $6.00
- Gross Profit: $1.00
- Stripe Fee: -$0.47
- **Net Profit: $0.53** ⚠️ (Only 10.6% net margin!)

**$5.00 Plan with 30% Margin:**
- Provider Cost: $5.00
- Selling Price: $6.50
- Gross Profit: $1.50
- Stripe Fee: -$0.49
- **Net Profit: $1.01** ✅ (20.2% net margin)

## Recommendations

### Option 1: Moderate Increase (Recommended)
**Set margin to 30% (1.30)**

**Pros:**
- ✅ 50% more profit per sale ($2.32 vs $1.35 on $10 plan)
- ✅ Still competitive pricing
- ✅ Better protection against Stripe fees
- ✅ More sustainable for business growth

**Cons:**
- ⚠️ Slightly higher prices (may reduce some sales)
- ⚠️ Need to monitor conversion rates

**Impact:**
- $10 plan: $12.00 → $13.00 (+$1.00)
- $20 plan: $24.00 → $26.00 (+$2.00)
- $50 plan: $60.00 → $65.00 (+$5.00)

### Option 2: Aggressive Increase
**Set margin to 40-50% (1.40 - 1.50)**

**Pros:**
- ✅ Much higher profit per sale
- ✅ Better for scaling business
- ✅ More room for marketing/advertising

**Cons:**
- ⚠️ Significantly higher prices
- ⚠️ May reduce sales volume
- ⚠️ Less competitive vs. other providers

**Best For:**
- Established brand with loyal customers
- Niche market (Umrah/Hajj specific)
- Premium positioning

### Option 3: Hybrid Approach (Best of Both Worlds)
**Set margin to 30% + Minimum Profit Floor**

```env
ESIMACCESS_PROFIT_MARGIN=1.30
ESIMACCESS_MIN_PROFIT_CENTS=200
```

**How it works:**
- Plans use 30% margin OR minimum $2.00 profit (whichever is higher)
- Protects small plans from being wiped out by fees
- Keeps larger plans at competitive 30% margin

**Example:**
- $5 plan: max($5 × 1.30 = $6.50, $5 + $2 = $7.00) = **$7.00** (40% margin)
- $10 plan: max($10 × 1.30 = $13.00, $10 + $2 = $12.00) = **$13.00** (30% margin)
- $20 plan: max($20 × 1.30 = $26.00, $20 + $2 = $22.00) = **$26.00** (30% margin)

## Market Comparison

### Typical eSIM Provider Margins:
- **Budget providers:** 15-25% markup
- **Standard providers:** 25-35% markup
- **Premium providers:** 35-50% markup

### Your Niche (Umrah/Hajj):
- Specialized market = less price-sensitive
- Customers value reliability over lowest price
- Travelers willing to pay for convenience
- **30-40% margin is reasonable**

## Financial Projections

### Scenario: 100 Sales/Month

**Current (20% margin):**
- Average sale: $12.00
- Gross profit: $2.00/sale
- Net profit after fees: ~$1.35/sale
- **Monthly net profit: ~$135**

**With 30% margin:**
- Average sale: $13.00
- Gross profit: $3.00/sale
- Net profit after fees: ~$2.32/sale
- **Monthly net profit: ~$232** (+72% increase!)

**With 40% margin:**
- Average sale: $14.00
- Gross profit: $4.00/sale
- Net profit after fees: ~$3.36/sale
- **Monthly net profit: ~$336** (+149% increase!)

*Note: Assumes same sales volume. Higher prices may reduce volume slightly.*

## Action Plan

### Recommended Next Steps:

1. **Test 30% margin first** (safest increase)
   ```env
   ESIMACCESS_PROFIT_MARGIN=1.30
   ```

2. **Monitor for 2-4 weeks:**
   - Track conversion rates
   - Monitor sales volume
   - Check customer feedback

3. **If successful, consider:**
   - Adding minimum profit floor for small plans
   - Gradually increasing to 35-40% if market accepts it

4. **Set minimum profit floor** (protect small plans):
   ```env
   ESIMACCESS_MIN_PROFIT_CENTS=200
   ```

## How to Implement

1. **Update `.env.local` (development):**
   ```env
   ESIMACCESS_PROFIT_MARGIN=1.30
   ESIMACCESS_MIN_PROFIT_CENTS=200
   ```

2. **Update Vercel environment variables (production):**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Update `ESIMACCESS_PROFIT_MARGIN` to `1.30`
   - Add/Update `ESIMACCESS_MIN_PROFIT_CENTS` to `200`

3. **Redeploy:**
   - Vercel will auto-deploy on env var changes
   - Or manually trigger a deployment

4. **Verify:**
   - Check product prices on your site
   - Should reflect new margins immediately
   - Old purchases keep original prices (as expected)

## Conclusion

**Current 20% margin is on the low side** for a specialized travel eSIM business. 

**Recommendation: Increase to 30% (1.30) with $2.00 minimum profit floor**

This gives you:
- ✅ 72% more profit per sale
- ✅ Better protection against payment fees
- ✅ Still competitive pricing
- ✅ Sustainable business model
- ✅ Room for growth and marketing

The specialized Umrah/Hajj market can support higher margins than generic eSIM providers.
