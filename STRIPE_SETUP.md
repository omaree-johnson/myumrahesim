# Stripe Payment Integration Setup

This guide explains how to set up Stripe payments for your eSIM platform.

## Overview

The payment flow works as follows:

1. **User selects a plan** → Clicks "Buy Now"
2. **Payment modal opens** → User enters email and name
3. **Stripe Checkout** → User is redirected to Stripe's hosted payment page
4. **Payment completion** → Stripe webhook notifies our server
5. **eSIM purchase** → Server automatically purchases eSIM from Zendit
6. **Email confirmation** → User receives activation details

## Prerequisites

- Stripe account (sign up at https://stripe.com)
- Stripe test keys (for development)
- Stripe CLI (for local webhook testing)

## Step 1: Get Stripe API Keys

1. Go to https://dashboard.stripe.com
2. Click **Developers** → **API Keys**
3. Copy your **Publishable key** and **Secret key**
4. Add them to `.env.local`:

```bash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Step 2: Set Up Webhooks (Local Development)

For local testing, use the Stripe CLI to forward webhooks:

### Install Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows (Scoop)
scoop install stripe

# Linux
# Download from https://github.com/stripe/stripe-cli/releases
```

### Start Webhook Forwarding

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

You'll see output like:
```
> Ready! Your webhook signing secret is whsec_xxxxx
```

Copy the `whsec_xxxxx` value and add it to `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### Keep the Stripe CLI Running

Leave the `stripe listen` command running in a terminal while developing. It will forward all Stripe events to your local server.

## Step 3: Test the Payment Flow

1. **Start your dev server**: `pnpm dev`
2. **Start Stripe CLI**: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. **Open your app**: http://localhost:3000
4. **Select a plan** and click "Buy Now"
5. **Use test card**: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any ZIP code

## Step 4: Production Webhook Setup

For production, you need to create a webhook endpoint in Stripe:

1. Go to https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. Enter your webhook URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add it to your production environment variables

## Stripe Test Cards

Use these test cards in development:

| Card Number         | Description                          |
|---------------------|--------------------------------------|
| 4242 4242 4242 4242 | Successful payment                   |
| 4000 0000 0000 9995 | Payment declined (insufficient funds)|
| 4000 0025 0000 3155 | Requires authentication (3D Secure)  |

More test cards: https://stripe.com/docs/testing

## Webhook Events

The app listens for this Stripe event:

- **`checkout.session.completed`**: Triggered when payment succeeds
  - Purchases eSIM from Zendit
  - Saves transaction to database
  - Sends confirmation email to customer

## Troubleshooting

### Webhook Not Receiving Events

- Ensure `stripe listen` is running
- Check the webhook secret in `.env.local`
- Look for errors in the Stripe CLI output

### Payment Succeeds But No eSIM

- Check server logs for Zendit API errors
- Verify `ZENDIT_API_KEY` is set correctly
- Check the Stripe webhook logs in dashboard

### "No matching signature found"

- The webhook secret is incorrect
- Restart your dev server after updating `.env.local`
- Re-run `stripe listen` to get a fresh secret

## Database Schema

The Stripe integration adds these fields to the `purchases` table:

- `stripe_session_id`: Stripe Checkout Session ID
- `stripe_payment_intent`: Stripe Payment Intent ID

Run the migration to add these fields:

```bash
# If using Supabase
npx supabase migration up
```

## Security Notes

- Never expose `STRIPE_SECRET_KEY` in client code
- Always verify webhook signatures
- Use HTTPS in production
- Keep webhook secrets secure

## Cost Structure

Stripe charges:
- **2.9% + $0.30** per successful card charge (US)
- No monthly fees
- No setup fees

See https://stripe.com/pricing for your region's pricing.
