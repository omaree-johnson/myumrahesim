# 🚨 Email Not Received After Payment - SOLUTION

## Problem
You completed a payment successfully but didn't receive the order confirmation email.

## Root Cause
The Stripe CLI webhook listener is **NOT listening for the `payment_intent.succeeded` event**, which is required for embedded checkout flow.

## What's Happening

### Current Flow (Not Working):
1. ✅ Payment Intent created
2. ✅ Customer completes payment in embedded form  
3. ✅ Stripe processes payment successfully
4. ❌ **Webhook doesn't receive `payment_intent.succeeded` event**
5. ❌ No email sent
6. ❌ No eSIM purchased from Zendit

### Looking at Your Logs:
```
[Stripe] Payment intent created: pi_3SRpkIRd2iBN1C861nX3Hiwg
GET /success?payment_intent=pi_3SRpkIRd2iBN1C861nX3Hiwg&redirect_status=succeeded
```

✅ Payment succeeded  
❌ NO webhook log showing `[Stripe Webhook] Payment intent succeeded`

## Solution

### Stop Your Current Stripe CLI

In the terminal running Stripe CLI, press `Ctrl+C` to stop it.

### Restart with Correct Event Types

Run this command instead:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe \
  --events payment_intent.succeeded,checkout.session.completed
```

### What This Does:
- Listens for **both** `payment_intent.succeeded` (embedded checkout) AND `checkout.session.completed` (redirect checkout)
- Forwards events to your local webhook endpoint
- Ensures emails are sent for both checkout flows

## Verification

### 1. Check Terminal Output
You should see:
```
Ready! You are using Stripe API Version [VERSION]. Your webhook signing secret is whsec_... (^C to quit)
```

### 2. Update Environment Variable (if needed)
Copy the `whsec_...` value and make sure it matches `STRIPE_WEBHOOK_SECRET` in your `.env.local`

### 3. Test Again
1. Go to: `http://localhost:3000/checkout?product=ESIM-AD-15D-2GB-NOROAM&name=Test+Plan&price=14.50`
2. Enter your email and name
3. Use test card: `4242 4242 4242 4242`
4. Complete payment

### 4. Watch for These Logs

In your dev server terminal, you should see:
```
[Stripe Webhook] Received event: payment_intent.succeeded
[Stripe Webhook] Payment intent succeeded: pi_xxxxx
[Stripe Webhook] Purchasing eSIM from Zendit...
[Stripe Webhook] eSIM purchased successfully: ACCEPTED
[Stripe Webhook] Sending order confirmation to: your@email.com
[Stripe Webhook] Order confirmation email sent successfully
```

In your Stripe CLI terminal, you should see:
```
payment_intent.succeeded [evt_xxxxx]
```

## What Emails Will You Receive?

### 1. Order Confirmation (Immediate)
- Sent from Stripe webhook when payment succeeds
- Contains order details and transaction ID
- Subject: "Order Confirmation - Your Brand"

### 2. eSIM Activation Details (1-2 minutes later)
- Sent from Zendit webhook after eSIM is provisioned
- Contains QR code and activation instructions
- Subject: "Your eSIM is Ready to Activate!"

## Still Not Working?

### Check These:

1. **Resend API Key**
   ```bash
   # In .env.local
   RESEND_API_KEY=re_...  # Must be valid
   ```

2. **Email FROM Address**
   ```bash
   # In .env.local
   EMAIL_FROM=onboarding@resend.dev  # For testing
   # OR
   EMAIL_FROM=noreply@yourdomain.com  # Must be verified in Resend
   ```

3. **Check Spam Folder**
   Test emails sometimes go to spam

4. **View Logs in Resend Dashboard**
   - Go to https://resend.com/emails
   - Check if emails are being sent
   - Check for any delivery errors

## Quick Test Command

Run this to verify everything is configured:

```bash
./test-email-flow.sh
```

## Summary

**The fix is simple:**
```bash
# Stop current Stripe CLI (Ctrl+C)
# Then run:
stripe listen --forward-to localhost:3000/api/webhooks/stripe \
  --events payment_intent.succeeded,checkout.session.completed
```

That's it! Now try making another test payment and you should receive both emails. 📧✨
