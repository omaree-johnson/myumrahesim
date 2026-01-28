# Ramadan Promotional Discount Implementation

## Overview
Time-bound promotional discount that automatically applies 10% off during the Ramadan period (from 15 Sha'ban until the end of Ramadan).

## Features
- **Auto-apply**: Discount automatically applies when promo is active (no code required)
- **Manual code**: Optional `RAMADAN10` code for manual entry
- **Hijri calendar**: Uses Hijri (Islamic) calendar for accurate date calculation
- **Server-side validation**: All pricing logic enforced server-side

## Implementation Details

### Files Created/Modified

1. **`src/lib/hijri-calendar.ts`** (NEW)
   - `isRamadanPromoActive()`: Checks if current date is within promo period
   - `getRamadanPromoStartDate()`: Returns Gregorian date for 15 Sha'ban
   - `getRamadanPromoEndDate()`: Returns Gregorian date for last day of Ramadan

2. **`src/lib/discounts.ts`** (MODIFIED)
   - `getRamadanPromoDiscount()`: Returns virtual discount code row for promo
   - `validateDiscountForContext()`: Updated to handle `RAMADAN10` code
   - `reserveDiscountForPaymentIntent()`: Skips database reservation for virtual codes
   - `redeemDiscountFromPaymentIntent()`: Handles virtual promo code redemption

3. **`src/app/api/create-payment-intent/route.ts`** (MODIFIED)
   - Auto-applies Ramadan promo when active and no discount code provided
   - Supports manual `RAMADAN10` code entry

4. **`src/app/api/create-cart-payment-intent/route.ts`** (MODIFIED)
   - Auto-applies Ramadan promo for cart purchases

5. **`src/app/api/create-topup-payment-intent/route.ts`** (MODIFIED)
   - Auto-applies Ramadan promo for top-up purchases

### Promo Period Rules
- **Start**: 15 Sha'ban (inclusive) - Hijri month 8, day 15
- **End**: Last day of Ramadan (inclusive) - Hijri month 9, day 30
- **Discount**: 10% off
- **Applies to**: All purchase types (eSIM, cart, top-up)

### How It Works

1. **Auto-apply flow**:
   - User initiates checkout without entering a discount code
   - System checks if Ramadan promo is active via `isRamadanPromoActive()`
   - If active, applies 10% discount automatically
   - Discount code `RAMADAN10` is stored in payment intent metadata

2. **Manual code flow**:
   - User enters `RAMADAN10` in discount code field
   - System validates code and checks if promo is active
   - If active, applies discount
   - If inactive, returns error message

3. **Payment verification**:
   - Payment verification logic already handles discount codes from metadata
   - No changes needed - works automatically

### Security Considerations
- All discount logic is server-side only
- Virtual promo codes don't require database reservations (time-bound)
- Minimum profit floor still enforced (discount cannot reduce price below cost + minimum profit)
- Payment verification validates discounted amounts

### Testing
To test the promo:
1. Set system date to a date within the promo period (15 Sha'ban - end of Ramadan)
2. Create a payment intent without a discount code
3. Verify 10% discount is automatically applied
4. Test manual `RAMADAN10` code entry
5. Test outside promo period (should not apply)

### Dependencies
- `hijri-date@0.2.2`: Hijri calendar conversion library

### Notes
- Promo period is calculated dynamically based on current Hijri date
- If Hijri calendar conversion fails, promo defaults to inactive (safe fallback)
- Promo automatically renews each Hijri year
- No database entries needed for virtual promo codes
