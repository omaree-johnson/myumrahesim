# Stripe Payment Integration - Quick Start

## ✅ What's Been Implemented

The Stripe payment flow is now fully integrated:

1. **Checkout Session Creation** (`/api/create-checkout-session`)
   - Creates Stripe checkout session with product details
   - Redirects user to Stripe's hosted payment page

2. **Stripe Webhook Handler** (`/api/webhooks/stripe`)
   - Processes payment completion events
   - Automatically purchases eSIM from Zendit after successful payment
   - Saves transaction to database
   - Sends confirmation email

3. **Success Page** (`/app/success/page.tsx`)
   - Handles return from Stripe
   - Displays payment confirmation
   - Shows next steps

4. **Database Migration** (`002_add_stripe_fields.sql`)
   - Adds Stripe session and payment intent tracking

## 🚀 Testing Right Now (Development)

### 1. Set Up Stripe Webhook Forwarding

Open a **new terminal** and run:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

You'll see:
```
> Ready! Your webhook signing secret is whsec_xxxxx
```

### 2. Add Webhook Secret to .env.local

Copy the `whsec_xxxxx` value and update your `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

**Important**: Restart your dev server after updating `.env.local`

### 3. Test a Purchase

1. Go to http://localhost:3000
2. Click "Buy Now" on any plan
3. Enter your email and name
4. Click "Complete Purchase"
5. You'll be redirected to Stripe Checkout
6. Use test card: **4242 4242 4242 4242**
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
7. Complete payment
8. You'll be redirected back to success page

### 4. Watch the Magic Happen

In your terminal with `stripe listen`, you'll see:
- ✅ Payment completed
- ✅ Webhook received
- ✅ eSIM purchased from Zendit
- ✅ Email sent

## 📋 Current Flow

```
User clicks "Buy Now"
    ↓
Payment Modal (collects email/name)
    ↓
Creates Stripe Checkout Session
    ↓
Redirects to Stripe (user pays)
    ↓
Payment succeeds → Stripe sends webhook
    ↓
Webhook handler purchases eSIM from Zendit
    ↓
User redirected to success page
    ↓
Activation email sent with QR code
```

## 🔧 What You Need To Do

1. **Install Stripe CLI** (if not installed):
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. **Start Stripe webhook forwarding**:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. **Copy the webhook secret** to `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

4. **Restart your dev server**:
   ```bash
   # Press Ctrl+C in the dev server terminal, then:
   pnpm dev
   ```

5. **Test the payment flow** with card `4242 4242 4242 4242`

## 📝 Environment Variables Needed

Your `.env.local` should have:

```bash
# Stripe (already set)
STRIPE_SECRET_KEY=sk_test_51SRma6Rd2iBN1C867Ufq...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SRma6Rd2iBN1C86sHs9...

# Stripe Webhook (get from stripe listen command)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Other required variables
ZENDIT_API_KEY=sand_1bd81b52...
RESEND_API_KEY=re_EzfxzLiS...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 🐛 Troubleshooting

**Problem**: Payment succeeds but no eSIM is purchased

**Solution**: 
- Check if `stripe listen` is running
- Verify webhook secret in `.env.local`
- Check server logs for errors

**Problem**: "No signature found" error

**Solution**:
- Restart dev server after adding webhook secret
- Make sure `stripe listen` is running

**Problem**: Can't install Stripe CLI

**Solution**:
```bash
# macOS alternative
curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
```

## 🎉 What's Next

Once tested locally:
1. Deploy to production
2. Set up production webhook in Stripe Dashboard
3. Update `STRIPE_WEBHOOK_SECRET` in production environment
4. Switch to live Stripe keys (not test keys)

See `STRIPE_SETUP.md` for detailed production setup.
