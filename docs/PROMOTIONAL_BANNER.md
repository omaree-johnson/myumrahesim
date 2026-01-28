# Promotional Banner Component

## Overview

A lightweight, performant promotional banner component that displays during active promotions. Automatically shows/hides based on promotion status and supports session-based dismissal.

## Component: `PromotionalBanner`

**Location:** `src/components/promotional-banner.tsx`

### Features

✅ **Active Promo Detection** - Only displays during active promotion windows  
✅ **Ramadan Messaging** - Shows "🌙 Ramadan Blessing – 10% off Umrah eSIMs"  
✅ **Countdown Timer** - Optional countdown until promo ends  
✅ **Session-Based Dismissal** - Dismissible with sessionStorage  
✅ **Lightweight** - Minimal bundle size, fast performance  
✅ **Auto-Hide on Expiry** - Automatically hides when promo expires  
✅ **Accessible** - ARIA labels and keyboard navigation  
✅ **Mobile-First** - Responsive design with Tailwind CSS  

## Usage

### Basic Usage

```tsx
import { PromotionalBanner } from "@/components/promotional-banner";

<PromotionalBanner position="top" showCountdown={true} />
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `position` | `"top" \| "bottom"` | No | `"top"` | Banner position |
| `showCountdown` | `boolean` | No | `true` | Show countdown timer |
| `className` | `string` | No | `""` | Additional CSS classes |

## Integration

### Layout Integration

The banner is integrated into the root layout (`src/app/layout.tsx`):

```tsx
<Navbar />
<PromotionalBanner position="top" showCountdown={true} />
<main>{children}</main>
```

### Standalone Usage

You can also use it on specific pages:

```tsx
<PromotionalBanner 
  position="top" 
  showCountdown={true}
  className="mb-4"
/>
```

## How It Works

### 1. Promotion Status Check

The component fetches active promotion status from `/api/promotions/active`:

```typescript
const response = await fetch("/api/promotions/active");
const data = await response.json();
// { active: true, name: "Ramadan Umrah Promotion", discountPercent: 10, endsAt: "2025-04-10T23:59:59Z" }
```

### 2. Auto-Hide on Expiry

When promotion expires:
- Server returns `active: false`
- Component automatically hides
- No manual cleanup needed

### 3. Session-Based Dismissal

Dismissal state stored in `sessionStorage`:
- Key: `"promo-banner-dismissed"`
- Value: `"true"`
- Persists for browser session only
- Cleared when browser closes

### 4. Countdown Timer

If `showCountdown={true}` and `endsAt` is provided:
- Calculates time remaining
- Updates every second
- Formats: `"2d 5h"`, `"3h 45m"`, `"15m 30s"`
- Auto-hides when countdown reaches zero

## API Endpoint

### GET `/api/promotions/active`

Lightweight endpoint to check active promotions.

**Response:**
```typescript
{
  active: boolean;
  name?: string;
  discountPercent?: number;
  endsAt?: string; // ISO timestamp
}
```

**Example:**
```json
{
  "active": true,
  "name": "Ramadan Umrah Promotion",
  "discountPercent": 10,
  "endsAt": "2025-04-10T23:59:59.000Z"
}
```

## Visual Design

### Banner Appearance

- **Background**: Gradient from amber to orange
- **Text**: White, bold
- **Moon Emoji**: 🌙 (for Ramadan promotions)
- **Countdown**: White badge with semi-transparent background
- **Dismiss Button**: X icon, hover effect

### Responsive Design

- **Mobile**: Compact layout, smaller text
- **Tablet**: Medium spacing
- **Desktop**: Full-width banner

### Styling

```css
/* Banner Background */
bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600

/* Countdown Badge */
bg-white/20 dark:bg-white/10
px-2 py-0.5 rounded-full

/* Dismiss Button */
hover:bg-white/20 dark:hover:bg-white/10
```

## Performance

### Optimizations

1. **Lightweight API** - Dedicated endpoint for fast checks
2. **Caching** - Status refreshed every 5 minutes
3. **Conditional Rendering** - Only renders when active
4. **Session Storage** - Fast dismissal check
5. **Minimal Re-renders** - Efficient state management

### Bundle Size

- Component: ~2KB (gzipped)
- API endpoint: ~1KB
- Total impact: ~3KB

## Accessibility

### ARIA Labels

```tsx
<div role="banner" aria-label="Promotional offer">
  {/* Banner content */}
</div>

<button aria-label="Dismiss promotional banner">
  <X />
</button>
```

### Keyboard Navigation

- **Tab**: Navigate to dismiss button
- **Enter/Space**: Dismiss banner
- **Escape**: (Can be added for dismissal)

## Behavior

### Display Logic

1. **Check if dismissed** - Read from sessionStorage
2. **Fetch promo status** - Call `/api/promotions/active`
3. **Render if active** - Show banner if `active: true`
4. **Auto-hide on expiry** - Hide when `active: false`

### Dismissal Flow

1. User clicks dismiss button
2. Set `sessionStorage.setItem("promo-banner-dismissed", "true")`
3. Component hides immediately
4. Stays hidden for browser session

### Countdown Timer

1. Check if `endsAt` provided
2. Calculate time remaining
3. Update every second
4. Format based on time remaining:
   - Days: `"2d 5h"`
   - Hours: `"3h 45m"`
   - Minutes: `"15m 30s"`
5. Auto-hide when reaches zero

## Testing

### Manual Testing

1. **Active Promotion:**
   - Visit site during Ramadan
   - Verify banner appears
   - Check countdown timer
   - Test dismissal

2. **Expired Promotion:**
   - Visit site after Ramadan
   - Verify banner hidden
   - No errors in console

3. **Dismissal:**
   - Click dismiss button
   - Verify banner hides
   - Refresh page
   - Verify banner stays hidden (session)

4. **New Session:**
   - Close browser
   - Reopen and visit site
   - Verify banner appears again (if active)

### Browser Testing

- Chrome (desktop & mobile)
- Safari (desktop & mobile)
- Firefox (desktop)
- Edge (desktop)

## Customization

### Custom Messaging

The component automatically detects Ramadan promotions:

```typescript
const isRamadan = promoStatus.name?.toLowerCase().includes("ramadan");
const message = isRamadan 
  ? "Ramadan Blessing" 
  : "Special Offer";
```

### Custom Position

```tsx
<PromotionalBanner position="bottom" />
```

### Disable Countdown

```tsx
<PromotionalBanner showCountdown={false} />
```

## Troubleshooting

### Banner Not Showing

**Check:**
1. Promotion is active in database
2. `promotions` table has valid dates
3. `is_active = true`
4. Current date within `starts_at` and `ends_at`
5. Not dismissed in sessionStorage

### Countdown Not Working

**Check:**
1. `showCountdown={true}`
2. `endsAt` provided in API response
3. Valid ISO timestamp format
4. JavaScript enabled

### Dismissal Not Working

**Check:**
1. sessionStorage available
2. No browser restrictions
3. Button click handler working

## Future Enhancements

Potential improvements:
- [ ] LocalStorage option (persist across sessions)
- [ ] Custom dismissal duration
- [ ] Multiple promotion support
- [ ] Animation variants
- [ ] Analytics tracking
- [ ] A/B testing support

## Summary

✅ **Lightweight** - ~3KB total impact  
✅ **Performant** - Fast API, efficient rendering  
✅ **Auto-hide** - Disappears when promo expires  
✅ **Dismissible** - Session-based dismissal  
✅ **Accessible** - ARIA labels, keyboard nav  
✅ **Mobile-first** - Responsive design  
✅ **Countdown** - Optional timer until expiry  
