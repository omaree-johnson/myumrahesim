# Payment Flow Review & Fixes

## Date: 2024
## Status: ✅ Payment Flow Verified & Fixed

## Issues Found & Fixed

### 1. Database Table Mismatch ✅ FIXED
**Problem**: 
- Stripe webhook saves purchases to `esim_purchases` table with `stripe_payment_intent_id`
- Success page polls `/api/purchases/by-session` which only checked `purchases` table with `stripe_payment_intent`
- This caused the success page to never find the transaction, showing "processing" indefinitely

**Fix**: 
- Updated `/api/purchases/by-session/route.ts` to check both tables:
  1. First checks `esim_purchases` table (newer, used by webhook)
  2. Falls back to `purchases` table (legacy compatibility)
- Handles different field names between tables:
  - `esim_purchases`: `stripe_payment_intent_id`, `price` (cents), `currency`
  - `purchases`: `stripe_payment_intent`, `price_amount`, `price_currency`

**Result**: Success page now correctly finds transactions and displays confirmation

## Payment Flow Overview

### Current Flow (Embedded Checkout)

```
1. User clicks "Buy Now" on product
   ↓
2. Checkout Page (/checkout)
   - User enters email and full name
   - Creates Payment Intent via /api/create-payment-intent
   ↓
3. Stripe Embedded Checkout Form
   - User enters payment details
   - Stripe processes payment
   ↓
4. Payment Success
   - Stripe redirects to /success?payment_intent=pi_xxx
   ↓
5. Success Page
   - Polls /api/purchases/by-session?payment_intent=pi_xxx
   - Waits for webhook to process (up to 30 seconds)
   - Displays transaction ID and confirmation
   ↓
6. Stripe Webhook (/api/webhooks/stripe)
   - Receives payment_intent.succeeded event
   - Saves to esim_purchases table
   - Purchases eSIM from Zendit
   - Sends confirmation email
   - Updates database with Zendit response
   ↓
7. User receives email with:
   - Transaction ID
   - Order confirmation
   - eSIM activation details (when ready)
```

## Components Verified

### ✅ Checkout Page (`/checkout`)
- Collects email and full name
- Validates input (email format, name length)
- Creates payment intent
- Shows Stripe embedded checkout form
- Handles errors gracefully

### ✅ Payment Intent Creation (`/api/create-payment-intent`)
- Validates and sanitizes inputs
- Rate limiting (10 requests/minute)
- Fetches product from Zendit
- Creates Stripe Payment Intent with metadata
- Returns client secret

### ✅ Embedded Checkout Form
- Uses Stripe Payment Element
- Supports Apple Pay and Google Pay
- Handles payment confirmation
- Redirects to success page with payment intent ID

### ✅ Success Page (`/success`)
- Receives payment intent ID from URL
- Polls for transaction ID (up to 30 seconds)
- Shows loading state while processing
- Displays success dialog with transaction details
- Handles payment failures

### ✅ Webhook Handler (`/api/webhooks/stripe`)
- Verifies Stripe signature
- Handles `payment_intent.succeeded` event
- Saves to `esim_purchases` table
- Purchases eSIM from Zendit
- Sends confirmation email
- Updates database with Zendit response
- Fetches QR code when available

### ✅ Purchase Lookup (`/api/purchases/by-session`)
- **FIXED**: Now checks both `esim_purchases` and `purchases` tables
- Handles different field names between tables
- Returns transaction ID, status, price, product name
- Returns 202 (Accepted) if still processing

## Database Tables

### `purchases` (Legacy)
- Used by `/api/orders` endpoint
- Fields: `stripe_payment_intent`, `price_amount`, `price_currency`
- Status: Still used for backward compatibility

### `esim_purchases` (Current)
- Used by Stripe webhook
- Fields: `stripe_payment_intent_id`, `price` (cents), `currency`
- Includes Stripe Issuing fields for wallet top-up flow
- Status: Primary table for new purchases

## Error Handling

### ✅ Payment Failures
- Success page detects `redirect_status=failed`
- Shows error message with retry option
- User can return to checkout

### ✅ Webhook Failures
- Database errors logged but don't fail webhook
- Email failures logged but don't fail webhook
- Zendit purchase failures update database status
- All errors are logged for debugging

### ✅ Network Issues
- Success page polls with exponential backoff
- Maximum 30 polls (60 seconds)
- Falls back to email notification if polling fails

## Security Features

### ✅ Input Validation
- Email format validation (RFC 5322)
- Name length validation (2-200 characters)
- Offer ID format validation
- All inputs sanitized

### ✅ Rate Limiting
- Payment intent creation: 10 requests/minute
- Order creation: 10 requests/minute
- IP-based rate limiting

### ✅ Webhook Security
- Stripe signature verification
- Rejects unsigned requests
- Validates event structure

## Testing Checklist

- [x] Checkout page loads correctly
- [x] Payment intent creation works
- [x] Stripe embedded checkout displays
- [x] Payment processing works
- [x] Success page receives payment intent ID
- [x] Success page finds transaction in database
- [x] Webhook processes payment correctly
- [x] Email sent after payment
- [x] Database updated with purchase details
- [x] Error handling works for failed payments
- [x] Polling works for delayed webhooks

## Known Limitations

1. **Two Database Tables**: 
   - `purchases` (legacy) and `esim_purchases` (current)
   - Both are checked for compatibility
   - Consider consolidating in future migration

2. **Polling Timeout**: 
   - Success page polls for up to 60 seconds
   - If webhook is delayed beyond this, user must check email

3. **Currency Conversion**: 
   - Prices displayed in user's selected currency
   - Actual payment uses product's native currency
   - Conversion happens on frontend only

## Recommendations

1. **Consolidate Database Tables**: 
   - Migrate all purchases to `esim_purchases`
   - Deprecate `purchases` table
   - Update all queries to use single table

2. **Add Webhook Retry Logic**: 
   - Implement retry mechanism for failed webhooks
   - Use queue system (e.g., BullMQ) for reliability

3. **Improve Error Messages**: 
   - Add more specific error messages for different failure types
   - Provide actionable guidance to users

4. **Add Payment Status Tracking**: 
   - Real-time status updates via WebSocket or Server-Sent Events
   - Reduce polling overhead

---

**Status**: ✅ Payment flow is working correctly after fixes
**Last Updated**: 2024
**Next Review**: After consolidating database tables

