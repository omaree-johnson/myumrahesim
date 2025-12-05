# Email Debugging Guide

If you're not receiving confirmation emails after payment, follow this step-by-step guide to diagnose the issue.

## Step 1: Check if Webhook is Being Triggered

### Check Your Server Logs

After completing a payment, look for these log messages in your server console/terminal:

**✅ Good Signs:**
```
[Stripe Webhook] Received event: payment_intent.succeeded
[Stripe Webhook] ✅ Payment intent succeeded: {...}
[Stripe Webhook] Processing payment fulfillment: {...}
```

**❌ Bad Signs:**
- No webhook logs at all → Webhook not being called
- `[Stripe Webhook] Signature verification failed` → Wrong webhook secret
- `[Stripe Webhook] No signature found` → Webhook not configured correctly

### If Webhook is NOT Being Triggered:

1. **Check Stripe Dashboard:**
   - Go to https://dashboard.stripe.com/webhooks
   - Verify your webhook endpoint is configured
   - Check if events are being sent (look for recent attempts)

2. **For Local Development:**
   - Make sure Stripe CLI is running:
     ```bash
     stripe listen --forward-to localhost:3000/api/webhooks/stripe \
       --events payment_intent.succeeded,checkout.session.completed
     ```
   - Copy the webhook signing secret and add to `.env.local`:
     ```env
     STRIPE_WEBHOOK_SECRET=whsec_...
     ```

3. **For Production:**
   - Verify webhook URL in Stripe Dashboard matches your domain
   - Check that webhook secret in environment variables matches Stripe

## Step 2: Check Email Extraction

Look for this log message after payment:

```
[Stripe Webhook] Email extraction attempt: {...}
```

**What to Check:**
- `finalEmail` should have a value
- If `finalEmail` is `null` or `undefined`, the email wasn't found

**Common Issues:**
- Email not in payment intent metadata
- Email not in billing details
- Payment intent update didn't complete before webhook fired

## Step 3: Check Email Sending

Look for these log messages:

**✅ Success:**
```
[Stripe Webhook] Preparing to send order confirmation email: {...}
[Email] Sending order confirmation: {...}
[Email] ✅ Order confirmation sent successfully: {...}
[Stripe Webhook] ✅ Order confirmation email sent successfully: {...}
```

**❌ Failure:**
```
[Stripe Webhook] ❌ Failed to send order confirmation email: {...}
[Email] ❌ Resend API error: {...}
```

### If Email Sending Fails:

1. **Check Resend API Key:**
   ```env
   RESEND_API_KEY=re_...
   ```
   - Verify it's set in your `.env.local` (local) or environment variables (production)
   - Check if the key is valid at https://resend.com/api-keys

2. **Check Email From Address:**
   ```env
   EMAIL_FROM=noreply@yourdomain.com
   ```
   - For testing: Use `onboarding@resend.dev`
   - For production: Must be a verified domain in Resend

3. **Check Resend Dashboard:**
   - Go to https://resend.com/emails
   - See if emails are being sent but failing delivery
   - Check for rate limits or errors

## Step 4: Verify Email Address

Make sure:
- Email field is visible in checkout form ✅
- Customer enters a valid email address ✅
- Email is being captured before payment ✅

## Step 5: Test Email Sending Directly

Create a test script to verify Resend is working:

```bash
# Create test-email.js
node -e "
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
resend.emails.send({
  from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
  to: 'your-email@example.com',
  subject: 'Test Email',
  html: '<p>If you receive this, Resend is working!</p>'
}).then(console.log).catch(console.error);
"
```

Run with:
```bash
RESEND_API_KEY=re_... EMAIL_FROM=onboarding@resend.dev node test-email.js
```

## Common Issues & Solutions

### Issue 1: "Missing customer email from Stripe payment details"

**Cause:** Email not being passed to payment intent

**Solution:**
1. Verify email field is in checkout form
2. Check that payment intent is being updated with email before confirmation
3. Check logs for `[Checkout] Updated payment intent with email and name`

### Issue 2: "RESEND_API_KEY is not configured"

**Cause:** Environment variable not set

**Solution:**
1. Add `RESEND_API_KEY` to `.env.local`
2. Restart your dev server
3. For production, add to hosting platform's environment variables

### Issue 3: "Failed to send email: Invalid API key"

**Cause:** Invalid or expired Resend API key

**Solution:**
1. Generate new API key at https://resend.com/api-keys
2. Update `RESEND_API_KEY` in environment variables
3. Restart server

### Issue 4: Webhook not receiving events

**Cause:** Webhook not configured or not accessible

**Solution:**
1. **Local:** Use Stripe CLI with correct events
2. **Production:** 
   - Verify webhook URL is accessible
   - Check webhook secret matches
   - Ensure endpoint returns 200 status

## Quick Checklist

- [ ] Webhook is being triggered (check logs)
- [ ] Email is being extracted (check logs)
- [ ] `RESEND_API_KEY` is set and valid
- [ ] `EMAIL_FROM` is set and verified
- [ ] Email field is in checkout form
- [ ] Customer enters email before payment
- [ ] Payment intent is updated with email
- [ ] No errors in server logs
- [ ] Resend dashboard shows emails being sent

## Still Not Working?

1. **Share your server logs** - Look for any `[Stripe Webhook]` or `[Email]` log messages
2. **Check Resend dashboard** - See if emails are being sent
3. **Test with a simple email** - Use the test script above
4. **Verify webhook is working** - Check Stripe dashboard for webhook attempts

