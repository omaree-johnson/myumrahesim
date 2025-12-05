# Email Setup Verification Checklist

## ✅ Pre-requisites

### 1. Database Migration
**CRITICAL:** Run the migration to add customer email/name columns:

```sql
-- Run this in Supabase SQL Editor or via CLI
ALTER TABLE esim_purchases 
ADD COLUMN IF NOT EXISTS customer_email text,
ADD COLUMN IF NOT EXISTS customer_name text;

CREATE INDEX IF NOT EXISTS idx_esim_purchases_customer_email ON esim_purchases(customer_email);
```

Or run the migration file:
```bash
# If using Supabase CLI
supabase db push

# Or manually in Supabase Dashboard → SQL Editor
# Copy contents of: supabase/migrations/006_add_customer_fields_esim_purchases.sql
```

### 2. Environment Variables
Verify these are set in `.env.local` (or production env):

```env
# Required for email sending
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=onboarding@resend.dev  # or your verified domain email

# Required for webhook
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### 3. Resend Setup
- ✅ API key created at https://resend.com/api-keys
- ✅ Domain verified (or using `onboarding@resend.dev` for testing)
- ✅ `EMAIL_FROM` matches verified domain

## ✅ How It Works Now

### Payment Flow:
1. **Customer completes payment** → Stripe webhook fires
2. **Webhook processes payment** → Returns 200 immediately (non-blocking)
3. **Email sent asynchronously** → Order confirmation email fires in background
4. **Customer receives email** → Within seconds of payment

### Activation Email Flow:
1. **eSIM Access processes order** → QR code becomes available
2. **eSIM Access webhook fires** → `ORDER_STATUS: GOT_RESOURCE`
3. **Activation email sent** → With QR code and activation details

## ✅ Testing

### Test 1: Check Webhook Logs
After a test payment, look for these logs:

**✅ Success:**
```
[Stripe Webhook] Received event: payment_intent.succeeded
[Stripe Webhook] ✅ Payment intent succeeded: {...}
[Stripe Webhook] Preparing to send order confirmation email: {...}
[Stripe Webhook] ✅ Order confirmation email sent successfully: {...}
```

**❌ If you see errors:**
```
[Stripe Webhook] ❌ Failed to send order confirmation email: {...}
```
→ Check `RESEND_API_KEY` and `EMAIL_FROM` are set correctly

### Test 2: Check Stripe Dashboard
- Go to Stripe Dashboard → Webhooks
- Check recent webhook attempts
- Should see **200 status** (not 500)
- Failed count should stop increasing

### Test 3: Check Resend Dashboard
- Go to https://resend.com/emails
- Should see emails being sent
- Check for any delivery errors

## ✅ Common Issues

### Issue: "RESEND_API_KEY is not configured"
**Fix:** Add `RESEND_API_KEY` to `.env.local` and restart server

### Issue: "Invalid API key"
**Fix:** Generate new API key at https://resend.com/api-keys

### Issue: "Email not received"
**Check:**
1. Check spam folder
2. Verify email address is correct
3. Check Resend dashboard for delivery status
4. Check server logs for email sending errors

### Issue: "Webhook still failing"
**Check:**
1. Webhook returns 200 (not 500)
2. Email sending is non-blocking (shouldn't fail webhook)
3. Check server logs for actual errors

## ✅ Verification Steps

1. **Run database migration** (if not done)
2. **Verify environment variables** are set
3. **Make a test payment**
4. **Check server logs** for email sending
5. **Check Stripe dashboard** - webhook should return 200
6. **Check Resend dashboard** - email should be sent
7. **Check email inbox** (and spam folder)

If all steps pass, emails should be working! 🎉

