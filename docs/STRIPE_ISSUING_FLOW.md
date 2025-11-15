# Stripe Issuing eSIM Fulfillment Flow

## Overview

This document describes the implementation of **Option 3: Customer-funded automatic Zendit wallet top-up using Stripe Issuing virtual cards** for automated eSIM fulfillment.

## Architecture

The flow implements a fully-automated system where:
1. Customer pays via Stripe
2. Stripe balance is used to create a Stripe Issuing virtual card
3. Virtual card is used to top-up Zendit wallet
4. eSIM is automatically purchased and delivered to customer

## Flow Diagram

```
Customer Payment (Stripe)
    ↓
Payment Succeeded Webhook
    ↓
Calculate Zendit Cost (from offer details)
    ↓
Check Zendit Wallet Balance
    ↓
[If balance < cost]
    Create Stripe Issuing Virtual Card
    Top-up Zendit Wallet
    ↓
Purchase eSIM from Zendit
    ↓
Fetch QR Code
    ↓
Store QR Code & Send Email
```

## Database Schema

### New Tables

#### `esim_purchases`
Stores purchase records with Stripe Issuing integration fields:
- `user_id`: Clerk user ID
- `offer_id`: Zendit offer ID
- `price`: Selling price in cents
- `currency`: Currency code
- `zendit_cost`: Cost to Zendit in cents
- `transaction_id`: Unique transaction ID
- `stripe_payment_intent_id`: Stripe payment intent
- `stripe_issuing_card_id`: Stripe Issuing card ID (if used)
- `zendit_transaction_id`: Zendit transaction ID
- `zendit_status`: Status of Zendit purchase
- `qr_code_url`: URL to QR code image

#### `issuing_cards`
Stores Stripe Issuing card metadata:
- `card_id`: Stripe card ID
- `card_last4`: Last 4 digits
- `card_exp`: Expiration date
- `active`: Whether card is active

## Environment Variables

Add these to your `.env.local`:

```env
# Stripe Issuing
STRIPE_ISSUING_AVAILABLE=true
STRIPE_ISSUING_CARDHOLDER_ID=ich_xxx  # Optional: will be created if not set
STRIPE_ISSUING_CARDHOLDER_NAME=Platform Cardholder
STRIPE_ISSUING_COMPANY_NAME=Your Company Name
STRIPE_ISSUING_ADDRESS_LINE1=123 Main St
STRIPE_ISSUING_ADDRESS_CITY=City
STRIPE_ISSUING_ADDRESS_STATE=State
STRIPE_ISSUING_ADDRESS_POSTAL=12345
STRIPE_ISSUING_ADDRESS_COUNTRY=US

# Supabase Service Role (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Service Owner Email (for cardholder)
SERVICE_OWNER_EMAIL=admin@yourdomain.com
```

## Setup Instructions

### 1. Enable Stripe Issuing

1. Go to Stripe Dashboard → Issuing
2. Complete Issuing setup (requires business verification)
3. Verify Issuing is available in your region (US, UK, EEA)
4. Note: Issuing may require additional verification and approval

### 2. Run Database Migration

```bash
# Option A: Using Supabase CLI
supabase db push

# Option B: Manual via Supabase Dashboard
# Copy contents of supabase/migrations/003_esim_purchases_issuing_cards.sql
# Paste and run in SQL Editor
```

### 3. Configure Zendit Wallet Top-up

**Important**: Verify the exact Zendit wallet top-up endpoint:
- The implementation uses `/wallet/topup` as a default
- Check Zendit API documentation for the correct endpoint
- Update `src/lib/zendit.ts` if the endpoint differs

### 4. Set Up QR Code Storage

The implementation attempts to upload QR codes to Supabase Storage:

1. Create a storage bucket in Supabase:
   - Go to Storage → Create bucket
   - Name: `esim-qrcodes`
   - Make it public (or configure signed URLs)

2. Update RLS policies if needed:
```sql
-- Allow service role to upload
CREATE POLICY "Service role can upload QR codes"
  ON storage.objects FOR INSERT
  WITH CHECK (true);
```

## API Endpoints

### Updated Endpoints

#### `POST /api/create-checkout-session`
Now includes `transactionId` in metadata for idempotency.

**Response:**
```json
{
  "sessionId": "cs_xxx",
  "url": "https://checkout.stripe.com/...",
  "transactionId": "txn_xxx"
}
```

#### `POST /api/webhooks/stripe`
Enhanced webhook handler that:
1. Checks Zendit wallet balance
2. Creates virtual card if needed
3. Tops up wallet
4. Purchases eSIM
5. Fetches and stores QR code

### New Endpoints

#### `POST /api/admin/reconcile-zendit`
Admin endpoint for reconciliation.

**Actions:**
- `check_balance`: Get current Zendit wallet balance
- `list_failed_topups`: List purchases with failed top-ups
- `list_failed_purchases`: List purchases with failed eSIM purchases
- `reconcile`: Full reconciliation with statistics

**Example:**
```bash
curl -X POST https://yourdomain.com/api/admin/reconcile-zendit \
  -H "Content-Type: application/json" \
  -d '{"action": "reconcile"}'
```

## Implementation Details

### Stripe Issuing Card Details Retrieval

**Important Note**: Stripe Issuing has restrictions on programmatic PAN retrieval. The implementation includes:

1. **Test Mode**: Uses test card numbers (4242...)
2. **Production**: Requires proper implementation based on your Stripe Issuing setup

Options for production:
- Use single-use authorizations
- Retrieve via Stripe Dashboard and store securely
- Use Stripe's card details API (if available with your permissions)

See `src/lib/stripe-issuing.ts` for current implementation.

### Retry Logic

The implementation includes retry logic with exponential backoff:
- **Top-up failures**: 3 retries (1s, 3s, 10s delays)
- **Purchase failures**: 3 retries (1s, 3s, 10s delays)

### Error Handling

#### Top-up Failure
If wallet top-up fails:
1. Purchase marked as `topup_failed` in database
2. Stripe refund automatically initiated
3. Customer notified via email

#### Purchase Failure
If eSIM purchase fails after top-up:
1. Purchase marked as `purchase_failed` in database
2. Zendit may release authorization (verify in logs)
3. Consider refund or retry workflow

### Idempotency

- Transaction IDs are generated upfront and stored in Stripe metadata
- Webhook handler checks for existing records before processing
- Zendit purchases use transaction ID for idempotency

## Testing

### Test Mode

1. Use Stripe test mode keys
2. Test card numbers will be used for wallet top-up
3. Verify webhook receives events correctly

### Test Flow

```bash
# 1. Start webhook listener
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# 2. Create checkout session
curl -X POST http://localhost:3000/api/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "offerId": "ESIM-GLOBAL-30D-5GB",
    "recipientEmail": "test@example.com",
    "fullName": "Test User"
  }'

# 3. Complete payment with test card: 4242 4242 4242 4242

# 4. Watch webhook logs for:
#    - Wallet balance check
#    - Virtual card creation (if needed)
#    - Wallet top-up
#    - eSIM purchase
#    - QR code retrieval
```

## Monitoring

### Key Metrics

Track these metrics:
- `esim_success_rate`: Percentage of successful eSIM deliveries
- `zendit_topup_failures`: Count of failed top-ups
- `stripe_refunds_issued`: Count of refunds due to failures
- `average_time_to_issue_esim_ms`: Time from payment to eSIM delivery

### Logging

All critical operations are logged:
- Wallet balance checks
- Virtual card creation
- Top-up attempts
- Purchase attempts
- QR code retrieval

**Security**: Card PANs and CVCs are never logged (only last4 and expiry).

## Troubleshooting

### Issue: "Stripe Issuing is not available"

**Solution**: 
- Set `STRIPE_ISSUING_AVAILABLE=true` in `.env.local`
- Verify Stripe Issuing is enabled in your Stripe account
- Check region availability (US, UK, EEA)

### Issue: "Card details retrieval not fully implemented"

**Solution**:
- In test mode, this is handled automatically
- For production, implement proper PAN retrieval based on your Stripe Issuing permissions
- See `src/lib/stripe-issuing.ts` for implementation details

### Issue: "Zendit wallet top-up endpoint not found"

**Solution**:
- Verify the correct Zendit wallet top-up endpoint
- Check Zendit API documentation
- Update `src/lib/zendit.ts` with the correct endpoint

### Issue: "QR code upload fails"

**Solution**:
- Verify Supabase Storage bucket `esim-qrcodes` exists
- Check storage bucket permissions
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly

## Security Considerations

1. **Service Role Key**: Never expose `SUPABASE_SERVICE_ROLE_KEY` to client
2. **Card Details**: Store only minimal PCI data (last4, expiry)
3. **Webhook Verification**: Always verify Stripe webhook signatures
4. **Key Rotation**: Rotate API keys periodically
5. **Logging**: Never log full PANs or CVCs

## Next Steps

1. **Production Testing**: Test with small amounts in production
2. **Monitoring**: Set up alerts for failures
3. **Reconciliation**: Schedule daily reconciliation runs
4. **Optimization**: Consider reusing virtual cards for multiple top-ups
5. **Documentation**: Update with actual Zendit wallet endpoint once confirmed

## References

- [Stripe Issuing Docs](https://docs.stripe.com/issuing)
- [Zendit Wallet Docs](https://zendit.io/user-guide/zendit-wallet/)
- [Stripe Webhooks](https://docs.stripe.com/webhooks)

