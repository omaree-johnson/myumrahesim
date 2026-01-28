# Promotional Pricing UI Implementation

## Overview

The promotional pricing UI automatically displays Ramadan promotions and other active discounts across the application. All pricing calculations are done server-side to prevent client-side manipulation.

## Component: `PromotionalPricing`

**Location:** `src/components/promotional-pricing.tsx`

### Features

✅ **Server-Side Pricing** - Fetches pricing from `/api/pricing` endpoint  
✅ **Automatic Promotion Detection** - Detects and displays active promotions  
✅ **Original Price with Strikethrough** - Shows original price when discounted  
✅ **Highlighted Discounted Price** - Emphasizes final price  
✅ **Ramadan Badge** - Displays "Ramadan Offer Applied – 10% Off 🌙"  
✅ **Auto-Hide on Expiry** - Badge disappears when promo expires  
✅ **Accessible** - Screen reader support and ARIA labels  
✅ **Mobile-First** - Responsive design with Tailwind CSS  
✅ **No Client Math** - All calculations server-side  

### Usage

```tsx
import { PromotionalPricing } from "@/components/promotional-pricing";

<PromotionalPricing
  offerId="SA-10GB-7D"
  originalPrice="$10.00"
  currency="USD"
  size="md" // "sm" | "md" | "lg"
/>
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `offerId` | `string` | Yes | Product offer ID (packageCode/slug) |
| `originalPrice` | `string` | Yes | Display string like "$10.00" |
| `currency` | `string` | No | Currency code (default: "USD") |
| `className` | `string` | No | Additional CSS classes |
| `size` | `"sm" \| "md" \| "lg"` | No | Size variant (default: "md") |

### Visual States

#### No Discount
```
$10.00
```

#### With Discount
```
$10.00  $9.00
[Ramadan Offer Applied – 10% Off 🌙]
```

### Size Variants

- **sm**: Small text (product cards, lists)
- **md**: Medium text (default, most use cases)
- **lg**: Large text (featured plans, hero sections)

## Integration Points

### 1. Product List (`product-list.tsx`)

**Before:**
```tsx
<div className="price">
  {displayPrice}
</div>
```

**After:**
```tsx
<PromotionalPricing
  offerId={product.id}
  originalPrice={displayPrice}
  currency={product.price?.currency}
  size="md"
/>
```

### 2. Featured Plans (`featured-plans.tsx`)

**Before:**
```tsx
<span className="text-2xl font-bold">
  {displayPrice}
</span>
```

**After:**
```tsx
<PromotionalPricing
  offerId={product.id}
  originalPrice={displayPrice}
  currency={product.price?.currency}
  size="lg"
/>
```

## How It Works

### 1. Price Fetching

The component fetches pricing from the server-side API:

```typescript
const response = await fetch("/api/pricing", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ offerId }),
});
```

### 2. Promotion Detection

The component checks if a promotion is applied:

```typescript
const hasDiscount = pricing.discountPercent > 0;
const isRamadanPromo = pricing.appliedPromotion?.name?.toLowerCase().includes("ramadan");
```

### 3. Auto-Hide on Expiry

When the promotion expires:
- Server returns `discountPercent: 0`
- Component automatically hides the badge
- Shows regular price only

### 4. Fallback Behavior

If pricing fetch fails:
- Shows original price (no discount)
- No error displayed to user
- Graceful degradation

## Styling

### Tailwind CSS Classes

**Original Price (Strikethrough):**
```css
text-gray-500 dark:text-gray-400 line-through
```

**Discounted Price (Highlighted):**
```css
text-sky-600 dark:text-sky-400 font-bold
```

**Ramadan Badge:**
```css
bg-gradient-to-r from-amber-100 to-orange-100
dark:from-amber-900/30 dark:to-orange-900/30
border border-amber-300 dark:border-amber-700
text-amber-800 dark:text-amber-200
```

### Responsive Design

- **Mobile**: Smaller text, compact spacing
- **Tablet**: Medium text, comfortable spacing
- **Desktop**: Larger text, generous spacing

## Accessibility

### ARIA Labels

```tsx
<span aria-label={`Original price: ${originalPriceFormatted}`}>
  {originalPriceFormatted}
</span>

<span aria-label={`Discounted price: ${finalPriceFormatted}`}>
  {finalPriceFormatted}
</span>

<div role="status" aria-label="Ramadan promotional discount applied">
  {/* Badge */}
</div>
```

### Screen Reader Support

```tsx
<span className="sr-only">
  You save $1.00 (10% off)
</span>
```

## Performance

### Loading States

- Shows skeleton loader while fetching
- Prevents layout shift
- Smooth transitions

### Caching

- Pricing API caches product data
- Reduces server load
- Faster response times

## Testing

### Manual Testing

1. **Active Promotion:**
   - Visit product page during Ramadan
   - Verify badge appears
   - Check strikethrough on original price

2. **Expired Promotion:**
   - Visit product page after Ramadan
   - Verify badge hidden
   - Check regular price display

3. **No Promotion:**
   - Visit product page (no active promo)
   - Verify regular price only
   - No badge displayed

### Browser Testing

- Chrome (desktop & mobile)
- Safari (desktop & mobile)
- Firefox (desktop)
- Edge (desktop)

## Future Enhancements

Potential improvements:
- [ ] Price animation on discount change
- [ ] Countdown timer for expiring promotions
- [ ] Multiple promotion badges support
- [ ] A/B testing for badge designs
- [ ] Analytics tracking for promotion views

## Troubleshooting

### Badge Not Showing

**Check:**
1. Promotion is active in database
2. `promotions` table has valid dates
3. `is_active = true`
4. Current date within `starts_at` and `ends_at`

### Price Mismatch

**Check:**
1. Server-side pricing API working
2. Product `offerId` matches database
3. Currency conversion correct

### Styling Issues

**Check:**
1. Tailwind CSS classes applied
2. Dark mode styles present
3. Responsive breakpoints correct

## Summary

✅ **Server-side pricing** - All calculations on server  
✅ **Automatic promotion display** - Detects active promotions  
✅ **Accessible** - Screen reader support  
✅ **Mobile-first** - Responsive design  
✅ **Auto-hide** - Badge disappears on expiry  
✅ **No client math** - Prevents price tampering  
