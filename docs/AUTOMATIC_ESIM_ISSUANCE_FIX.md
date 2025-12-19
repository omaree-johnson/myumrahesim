# Automatic eSIM Issuance Fix

## Problem
After a user pays for an eSIM through Stripe checkout, the eSIM was not being automatically issued from eSIMAccess and sent to the customer's email. This required manual intervention.

## Root Cause
The Stripe webhook handler was calling `createEsimOrder()` to create the eSIM order, but:
1. **Insufficient retry logic**: Only 3 attempts with basic backoff
2. **Silent failures**: When order creation failed, the error was caught but the order wasn't retried
3. **Early returns**: On failure, the function returned early without ensuring the order would eventually be created
4. **Limited activation polling**: Only 3 attempts to fetch activation details with short delays

## Solution Implemented

### 1. Enhanced Order Creation Retry Logic
- **Increased retry attempts**: From 3 to 5 attempts with exponential backoff
- **Better error handling**: More detailed logging at each attempt
- **Exponential backoff**: Delays increase exponentially (1s, 3s, 10s, 30s, 30s max)
- **Comprehensive logging**: Each attempt is logged with full error details

**Location**: `src/app/api/webhooks/stripe/route.ts` (lines 321-427)

### 2. Improved Activation Details Fetching
- **More attempts**: Increased from 3 to 5 attempts
- **Longer delays**: Exponential backoff (2s, 4s, 8s, 16s, 32s max)
- **Better logging**: Each attempt is logged with status
- **Graceful fallback**: If activation isn't ready immediately, relies on eSIM Access webhook

**Location**: `src/app/api/webhooks/stripe/route.ts` (lines 23-43)

### 3. Enhanced Database Updates
- **Immediate order info storage**: Order number and transaction ID stored immediately after creation
- **Status tracking**: Provider status updated at each stage (PROCESSING → GOT_RESOURCE)
- **Activation details storage**: Activation codes stored as soon as available

**Location**: `src/app/api/webhooks/stripe/route.ts` (lines 429-481)

### 4. Better Email Delivery
- **Immediate confirmation**: Order confirmation email sent immediately after payment
- **Activation email**: Sent when activation details are available (either immediately or via webhook)
- **Fallback mechanism**: If activation isn't ready immediately, eSIM Access webhook will trigger email

**Location**: `src/app/api/webhooks/stripe/route.ts` (lines 463-483)

## How It Works Now

### Automatic Flow (Success Case)
1. ✅ Customer completes Stripe checkout
2. ✅ Stripe webhook triggers `/api/webhooks/stripe`
3. ✅ Order confirmation email sent immediately
4. ✅ eSIM order created via `createEsimOrder()` (with retries)
5. ✅ Activation details fetched (with retries)
6. ✅ Activation email sent with QR code (if ready immediately)
7. ✅ OR activation email sent via eSIM Access webhook when ready

### Fallback Flow (If Activation Not Ready Immediately)
1. ✅ Order created successfully
2. ⏳ Activation details not yet available
3. ✅ eSIM Access webhook configured at `/api/webhooks/esimaccess`
4. ✅ When eSIM is ready, eSIM Access sends `ORDER_STATUS` webhook
5. ✅ Webhook handler fetches activation details and sends email

## Verification Steps

### 1. Verify Stripe Webhook is Configured
- Go to Stripe Dashboard → Webhooks
- Ensure webhook URL is set: `https://yourdomain.com/api/webhooks/stripe`
- Events subscribed: `payment_intent.succeeded`, `checkout.session.completed`
- Check webhook delivery logs for successful calls

### 2. Verify eSIM Access Webhook is Configured
- Log into eSIM Access dashboard
- Navigate to Webhook settings
- Set webhook URL: `https://yourdomain.com/api/webhooks/esimaccess`
- Test webhook (should receive `CHECK_HEALTH` event)
- Verify IP whitelisting is configured (if required)

### 3. Test the Flow
1. Make a test purchase through Stripe checkout
2. Check server logs for:
   - `[Stripe Webhook] ✅ eSIM order created successfully`
   - `[Stripe Webhook] ✅ Activation email sent with QR code` (if ready immediately)
   - OR `[Stripe Webhook] ⏳ Activation details not yet available - will be sent via webhook`
3. Check customer email for:
   - Order confirmation email (immediate)
   - Activation email with QR code (within minutes)

### 4. Monitor Logs
Look for these log messages:
- ✅ `[Stripe Webhook] ✅✅✅ eSIM order created successfully` - Order created
- ✅ `[Stripe Webhook] ✅✅✅ ACTIVATION EMAIL SENT SUCCESSFULLY` - Email sent
- ⚠️ `[Stripe Webhook] ⚠️ eSIM purchase attempt X failed` - Retry in progress
- ❌ `[Stripe Webhook] ❌❌❌ ALL ATTEMPTS FAILED` - Manual intervention needed

## Troubleshooting

### Issue: Order Not Created
**Symptoms**: Payment succeeds but no eSIM order
**Check**:
1. Server logs for `createEsimOrder()` errors
2. eSIM Access account balance
3. Package code validity
4. API credentials (`ESIMACCESS_ACCESS_CODE`)

**Solution**: Check logs for specific error codes:
- `200007`: Insufficient balance - Top up account
- `310241/310243`: Package not found - Verify package code
- `200011`: Insufficient profiles - Contact eSIM Access support

### Issue: Activation Email Not Sent
**Symptoms**: Order created but no activation email
**Check**:
1. Activation details available? Check logs for `fetchActivationWithRetry`
2. Email service configured? Check `RESEND_API_KEY`
3. eSIM Access webhook configured? Check webhook URL

**Solution**:
- If activation ready: Check email service logs
- If activation not ready: Verify eSIM Access webhook is configured
- Check spam folder for activation email

### Issue: Webhook Not Receiving Events
**Symptoms**: No webhook calls in logs
**Check**:
1. Webhook URL is publicly accessible
2. Webhook secret matches environment variable
3. IP whitelisting (for eSIM Access webhook)

**Solution**:
- Test webhook endpoint: `curl https://yourdomain.com/api/webhooks/esimaccess`
- Verify webhook URL in provider dashboard
- Check firewall/security settings

## Key Improvements

1. **Reliability**: 5 retry attempts instead of 3
2. **Resilience**: Exponential backoff prevents API rate limiting
3. **Visibility**: Comprehensive logging at each step
4. **User Experience**: Immediate order confirmation + activation email when ready
5. **Fallback**: eSIM Access webhook ensures email is sent even if not ready immediately

## Files Modified

- `src/app/api/webhooks/stripe/route.ts`
  - Enhanced `fetchActivationWithRetry()` function
  - Improved order creation retry logic
  - Better error handling and logging
  - Immediate database updates

## Next Steps

1. ✅ Deploy changes to production
2. ✅ Verify Stripe webhook is configured
3. ✅ Verify eSIM Access webhook is configured
4. ✅ Test with a real purchase
5. ✅ Monitor logs for any issues
6. ✅ Verify emails are being sent

## Related Documentation

- [eSIM Access Setup](./ESIMACCESS_SETUP.md)
- [Automatic eSIM Purchase Guide](./AUTOMATIC_ESIM_PURCHASE_GUIDE.md)
- [Purchase Flow Verification](./PURCHASE_FLOW_VERIFICATION.md)
- [eSIM Access API Documentation](./esimaccess.md)







