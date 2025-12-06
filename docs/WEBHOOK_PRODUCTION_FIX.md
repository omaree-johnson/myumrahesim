# eSIM Access Webhook Production Fixes

## Issues Fixed

### 1. IP Validation Blocking Webhooks
**Problem:** Strict IP validation was blocking legitimate webhooks in production (Vercel proxy chains).

**Fix:**
- IP validation now logs warnings but doesn't block requests
- Can be disabled with `ESIMACCESS_SKIP_IP_VALIDATION=true` environment variable
- Always allows webhook to proceed (logs warning for monitoring)

### 2. Missing Customer Lookup
**Problem:** If `transactionId` wasn't in webhook payload, customer couldn't be found.

**Fix:**
- Enhanced `findTransactionId()` to search both `esim_purchases` and `purchases` tables
- Improved customer lookup by `orderNo` with better error handling
- Uses `maybeSingle()` to avoid errors when record not found
- Falls back to `orderNo` lookup if `transactionId` lookup fails

### 3. Email Not Sending When transactionId Missing
**Problem:** Email sending required `transactionId`, but webhook might not include it.

**Fix:**
- Email can now be sent using `orderNo` or `esimTranNo` as fallback identifier
- Validates contact info exists before attempting to send
- Better error messages when customer info is missing

### 4. Webhook Returning Errors
**Problem:** Webhook returning 500 errors caused eSIM Access to retry, potentially causing duplicates.

**Fix:**
- Webhook **always returns 200 OK** even on errors
- Errors are logged but don't fail the webhook
- Prevents infinite retry loops from eSIM Access

### 5. Database Update Failures
**Problem:** Database updates might fail silently if using wrong identifier.

**Fix:**
- Updates database using both `transactionId` AND `orderNo` (whichever is available)
- Updates both `esim_purchases` and `purchases` tables
- Better error handling with `maybeSingle()` to avoid crashes

## Production Verification Steps

### 1. Check Webhook Endpoint is Accessible

```bash
# Test the webhook health endpoint
curl https://myumrahesim.com/api/webhooks/esimaccess

# Should return:
{
  "status": "ok",
  "service": "eSIM Access Webhook Handler",
  "timestamp": "...",
  "webhookUrl": "https://myumrahesim.com/api/webhooks/esimaccess"
}
```

### 2. Configure Webhook in eSIM Access Dashboard

1. Log into eSIM Access dashboard
2. Go to Webhook Settings
3. Set webhook URL: `https://myumrahesim.com/api/webhooks/esimaccess`
4. Save and test (they'll send a `CHECK_HEALTH` event)

### 3. Test Complete Flow

1. **Make a test purchase** (use a small plan)
2. **Check logs** for:
   ```
   [Stripe Webhook] ✅ Order created successfully
   [Stripe Webhook] ✅ Database updated with order info
   ```
3. **Wait for ORDER_STATUS webhook** (usually 1-5 minutes)
4. **Check logs** for:
   ```
   [eSIM Access Webhook] 📦 ORDER_STATUS GOT_RESOURCE received
   [eSIM Access Webhook] ✅ Profile data retrieved
   [eSIM Access Webhook] ✅✅✅✅✅ ACTIVATION EMAIL SENT SUCCESSFULLY
   ```

### 4. Monitor Logs

**Vercel Dashboard:**
```bash
# View real-time logs
vercel logs --follow

# Or check in Vercel dashboard → Your Project → Logs
```

**Look for:**
- ✅ `ORDER_STATUS GOT_RESOURCE received` - Webhook received
- ✅ `Profile data retrieved` - Query successful
- ✅ `ACTIVATION EMAIL SENT SUCCESSFULLY` - Email sent
- ❌ Any errors with `CRITICAL` tag

### 5. Verify Database Records

Check that records are being updated:

```sql
-- Check if orderNo is stored
SELECT transaction_id, order_no, customer_email, esim_provider_status 
FROM esim_purchases 
WHERE order_no IS NOT NULL 
ORDER BY created_at DESC 
LIMIT 5;

-- Check activation details
SELECT transaction_id, activation_code, smdp_address, iccid
FROM activation_details
ORDER BY updated_at DESC
LIMIT 5;
```

## Troubleshooting

### "Webhook not receiving events"

**Check:**
1. ✅ Webhook URL is set in eSIM Access dashboard
2. ✅ URL is publicly accessible (test with curl)
3. ✅ IP validation is not blocking (check logs)
4. ✅ Webhook endpoint returns 200 OK

**Solution:**
- Set `ESIMACCESS_SKIP_IP_VALIDATION=true` in Vercel environment variables
- Check Vercel logs for incoming requests

### "Activation email never sent"

**Check logs for:**
1. ✅ Is webhook being received? (`ORDER_STATUS GOT_RESOURCE received`)
2. ✅ Is query successful? (`Profile data retrieved`)
3. ✅ Is customer found? (`Contact lookup by transactionId/orderNo`)
4. ✅ Is email sending? (`ACTIVATION EMAIL SENT SUCCESSFULLY`)

**Common issues:**
- Customer email not in database → Check `order_no` is stored correctly
- Query failing → Check eSIM Access API credentials
- Email service failing → Check Resend API key

### "Cannot find customer info"

**Check:**
1. ✅ `order_no` is stored in `esim_purchases` table
2. ✅ `customer_email` is stored in `esim_purchases` table
3. ✅ Webhook includes `orderNo` in payload

**Solution:**
- Verify Stripe webhook is storing `order_no` correctly
- Check database schema matches expected fields

## Environment Variables

**Required:**
- `ESIMACCESS_ACCESS_CODE` - Your eSIM Access API key
- `RESEND_API_KEY` - For sending emails
- `EMAIL_FROM` - Email sender address

**Optional (for troubleshooting):**
- `ESIMACCESS_SKIP_IP_VALIDATION=true` - Disable IP validation if webhooks are blocked

## Testing Checklist

- [ ] Webhook endpoint is accessible (GET request returns 200)
- [ ] Webhook URL configured in eSIM Access dashboard
- [ ] Test webhook received (CHECK_HEALTH event)
- [ ] Order confirmation email sent after purchase
- [ ] `order_no` stored in database after purchase
- [ ] ORDER_STATUS webhook received when eSIM ready
- [ ] `/esim/query` returns activation data
- [ ] Activation email sent with QR code
- [ ] Database updated with activation details

## Key Changes Summary

1. **Non-blocking IP validation** - Logs but doesn't block
2. **Better customer lookup** - Tries multiple methods
3. **Flexible email sending** - Works with or without transactionId
4. **Always returns 200 OK** - Prevents retry loops
5. **Robust database updates** - Uses multiple identifiers
6. **Enhanced logging** - Better debugging in production

## Next Steps

1. Deploy to production (already pushed to main)
2. Configure webhook URL in eSIM Access dashboard
3. Test with a real purchase
4. Monitor logs for any issues
5. Verify customers receive activation emails

