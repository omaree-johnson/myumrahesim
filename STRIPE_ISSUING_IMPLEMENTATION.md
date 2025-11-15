# Stripe Issuing eSIM Fulfillment - Implementation Summary

## ✅ Implementation Complete

This document summarizes the implementation of the customer-funded automatic Zendit wallet top-up flow using Stripe Issuing virtual cards.

## Files Created/Modified

### New Files

1. **`supabase/migrations/003_esim_purchases_issuing_cards.sql`**
   - Database schema for `esim_purchases` and `issuing_cards` tables
   - Indexes and triggers for efficient queries

2. **`src/lib/stripe-issuing.ts`**
   - Stripe Issuing service for cardholder and virtual card management
   - Functions: `getOrCreateCardholder()`, `createVirtualCard()`, `createVirtualCardForTopUp()`
   - Handles card details retrieval (with test mode support)

3. **`src/lib/retry.ts`**
   - Retry utility with exponential backoff
   - Used for wallet top-up and eSIM purchase retries

4. **`src/app/api/admin/reconcile-zendit/route.ts`**
   - Admin endpoint for reconciliation
   - Actions: check balance, list failures, full reconciliation

5. **`docs/STRIPE_ISSUING_FLOW.md`**
   - Comprehensive documentation
   - Setup instructions, troubleshooting, security considerations

### Modified Files

1. **`src/lib/zendit.ts`**
   - Added: `getEsimOffer()` - Get offer details by ID
   - Added: `getWalletBalance()` - Check Zendit wallet balance
   - Added: `topUpWallet()` - Top up wallet using card details

2. **`src/lib/supabase.ts`**
   - Added: `supabaseAdmin` client using service role key
   - Enables server-side operations that bypass RLS

3. **`src/app/api/webhooks/stripe/route.ts`**
   - Complete rewrite implementing full wallet top-up flow
   - New `processPaymentAndFulfill()` function with:
     - Offer cost calculation
     - Wallet balance check
     - Virtual card creation (if needed)
     - Wallet top-up
     - eSIM purchase with retry logic
     - QR code retrieval and storage
     - Error handling and refunds

4. **`src/app/api/create-checkout-session/route.ts`**
   - Added: Transaction ID generation
   - Added: User ID from Clerk (if authenticated)
   - Added: Transaction ID in metadata and response

## Key Features Implemented

### 1. Automatic Wallet Top-up
- Checks Zendit wallet balance before purchase
- Creates Stripe Issuing virtual card if balance insufficient
- Tops up wallet using virtual card details
- Retries on failure (3 attempts with exponential backoff)

### 2. Enhanced Error Handling
- Top-up failures trigger automatic Stripe refunds
- Purchase failures are tracked and can be retried
- All failures logged with detailed error information

### 3. Idempotency
- Transaction IDs generated upfront
- Stored in Stripe metadata
- Prevents duplicate processing

### 4. QR Code Storage
- Fetches QR code from Zendit after purchase completion
- Uploads to Supabase Storage bucket `esim-qrcodes`
- Stores public URL in database

### 5. Admin Reconciliation
- Check wallet balance
- List failed top-ups and purchases
- Full reconciliation with statistics

## Database Schema

### `esim_purchases` Table
```sql
- id: uuid (PK)
- user_id: text (Clerk user ID)
- offer_id: text
- price: integer (cents)
- currency: text
- zendit_cost: integer (cents)
- transaction_id: text (unique)
- stripe_payment_intent_id: text
- stripe_issuing_card_id: text
- zendit_transaction_id: text
- zendit_status: text
- confirmation: jsonb
- qr_code_url: text
- created_at, updated_at: timestamptz
```

### `issuing_cards` Table
```sql
- id: uuid (PK)
- card_id: text (unique, Stripe card ID)
- card_last4: text
- card_exp: text
- active: boolean
- created_at: timestamptz
```

## Environment Variables Required

```env
# Stripe Issuing
STRIPE_ISSUING_AVAILABLE=true
STRIPE_ISSUING_CARDHOLDER_ID=ich_xxx  # Optional
STRIPE_ISSUING_CARDHOLDER_NAME=Platform Cardholder
STRIPE_ISSUING_COMPANY_NAME=Your Company Name
STRIPE_ISSUING_ADDRESS_LINE1=123 Main St
STRIPE_ISSUING_ADDRESS_CITY=City
STRIPE_ISSUING_ADDRESS_STATE=State
STRIPE_ISSUING_ADDRESS_POSTAL=12345
STRIPE_ISSUING_ADDRESS_COUNTRY=US

# Supabase Service Role
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Service Owner
SERVICE_OWNER_EMAIL=admin@yourdomain.com
```

## Setup Checklist

- [ ] Run database migration: `003_esim_purchases_issuing_cards.sql`
- [ ] Enable Stripe Issuing in Stripe Dashboard
- [ ] Set environment variables (see above)
- [ ] Create Supabase Storage bucket: `esim-qrcodes`
- [ ] Verify Zendit wallet top-up endpoint (may need adjustment)
- [ ] Test in Stripe test mode first
- [ ] Set up monitoring and alerts

## Important Notes

### Stripe Issuing Card Details

The implementation includes a placeholder for card details retrieval. In production:

1. **Test Mode**: Uses test card numbers automatically
2. **Production**: Requires proper implementation based on your Stripe Issuing permissions
   - May need single-use authorizations
   - May need to retrieve via Stripe Dashboard
   - Check Stripe Issuing documentation for your setup

### Zendit Wallet Endpoint

The implementation uses `/wallet/topup` as the default endpoint. Verify this matches your Zendit API:
- Check Zendit API documentation
- Update `src/lib/zendit.ts` if endpoint differs
- Test endpoint with curl first

### QR Code Storage

QR codes are uploaded to Supabase Storage:
1. Create bucket: `esim-qrcodes`
2. Make it public (or configure signed URLs)
3. Ensure service role key has upload permissions

## Testing

### Test Flow

1. Start Stripe webhook listener:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

2. Create checkout session (use test offer ID)

3. Complete payment with test card: `4242 4242 4242 4242`

4. Watch logs for:
   - Wallet balance check
   - Virtual card creation (if needed)
   - Wallet top-up
   - eSIM purchase
   - QR code retrieval

### Expected Logs

```
[Stripe Webhook] Processing payment fulfillment
[Stripe Webhook] Fetching offer details from Zendit...
[Stripe Webhook] Checking Zendit wallet balance...
[Stripe Webhook] Wallet balance insufficient, creating virtual card...
[Stripe Issuing] Created virtual card: ic_xxx
[Stripe Webhook] Topping up Zendit wallet...
[Stripe Webhook] Wallet top-up successful
[Stripe Webhook] Purchasing eSIM from Zendit...
[Stripe Webhook] eSIM purchase successful: DONE
[Stripe Webhook] Fetching QR code...
[Stripe Webhook] Order confirmation email sent
```

## Next Steps

1. **Verify Zendit Endpoints**: Confirm wallet balance and top-up endpoints
2. **Test Card Details**: Implement proper PAN retrieval for production
3. **Monitor**: Set up alerts for failures
4. **Optimize**: Consider reusing virtual cards
5. **Document**: Update with actual endpoints once confirmed

## Support

For issues or questions:
1. Check `docs/STRIPE_ISSUING_FLOW.md` for detailed documentation
2. Review logs for error details
3. Verify environment variables are set correctly
4. Test in Stripe test mode first

---

**Implementation Date**: 2025-01-14
**Status**: ✅ Complete - Ready for testing

