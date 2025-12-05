# Stripe Issuing Setup - Quick Guide

## ✅ What You've Completed

1. ✅ Run database migration (`003_esim_purchases_issuing_cards.sql`)
2. ✅ Enable Stripe Issuing in Stripe Dashboard
3. ✅ Set environment variables

## 📝 Remaining Steps

### Step 4: Create Supabase Storage Bucket for QR Codes

1. Go to your Supabase Dashboard
2. Navigate to **Storage** → **Buckets**
3. Click **New bucket**
4. Name: `esim-qrcodes`
5. Make it **Public** (or configure signed URLs later)
6. Click **Create bucket**

**Why?** QR codes from Zendit need to be stored and served to customers.

---

### Step 5: Verify Environment Variables

Check your `.env.local` has all these variables:

```env
# Stripe Issuing (Required)
STRIPE_ISSUING_AVAILABLE=true

# Stripe Issuing Cardholder (Optional - will be auto-created if missing)
STRIPE_ISSUING_CARDHOLDER_NAME=Platform Cardholder
STRIPE_ISSUING_COMPANY_NAME=Your Company Name
STRIPE_ISSUING_ADDRESS_LINE1=123 Main St
STRIPE_ISSUING_ADDRESS_CITY=City
STRIPE_ISSUING_ADDRESS_STATE=State
STRIPE_ISSUING_ADDRESS_POSTAL=12345
STRIPE_ISSUING_ADDRESS_COUNTRY=US

# Supabase Service Role (Required for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Service Owner Email (Required for cardholder)
SERVICE_OWNER_EMAIL=admin@yourdomain.com

# Existing variables (should already be set)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
ZENDIT_API_KEY=your-zendit-key
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**To get Supabase Service Role Key:**
1. Go to Supabase Dashboard → Settings → API
2. Find **service_role** key (NOT the anon key)
3. Copy and add to `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`

---

### Step 6: Verify Zendit Wallet Endpoint (Important!)

The code uses `/wallet/topup` by default. You need to verify this is correct:

1. Check your Zendit API documentation
2. The endpoint might be:
   - `/wallet/topup` (current default)
   - `/wallets/topup`
   - `/wallet/top-up`
   - Something else

**To test the endpoint manually:**

```bash
curl -X POST "https://api.zendit.io/v1/wallet/topup" \
  -H "Authorization: Bearer YOUR_ZENDIT_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "currency": "USD",
    "card": {
      "number": "4242424242424242",
      "exp_month": 12,
      "exp_year": 2026,
      "cvc": "123"
    },
    "reference": "test-topup"
  }'
```

**If the endpoint is different:**
- Update `src/lib/zendit.ts` line 251
- Change `/wallet/topup` to the correct endpoint

---

### Step 7: Test the Flow

#### 7a. Start Your Dev Server

```bash
npm run dev
# or
pnpm dev
```

#### 7b. Start Stripe Webhook Listener (in a separate terminal)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe \
  --events payment_intent.succeeded,checkout.session.completed
```

You'll see:
```
> Ready! Your webhook signing secret is whsec_xxxxx
```

**Important:** Copy the `whsec_xxxxx` value and make sure it matches `STRIPE_WEBHOOK_SECRET` in your `.env.local`

#### 7c. Test a Purchase

1. Go to `http://localhost:3000`
2. Select an eSIM plan
3. Click "Buy Now"
4. Enter test details:
   - Email: `test@example.com`
   - Name: `Test User`
5. Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
6. Complete payment

#### 7d. Watch the Logs

In your webhook listener terminal, you should see:
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

---

## 🔍 Troubleshooting

### Issue: "Stripe Issuing is not available"
- Check `STRIPE_ISSUING_AVAILABLE=true` in `.env.local`
- Restart your dev server after adding env vars

### Issue: "Card details retrieval not fully implemented"
- **This is normal in test mode** - the code uses test card numbers automatically
- In production, you may need to adjust based on your Stripe Issuing permissions

### Issue: "Zendit wallet top-up endpoint not found"
- Verify the correct endpoint in Zendit docs
- Update `src/lib/zendit.ts` if needed
- Test with curl first (see Step 6)

### Issue: "QR code upload fails"
- Make sure `esim-qrcodes` bucket exists in Supabase
- Check bucket is public
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly

### Issue: "Database error" or "Table not found"
- Make sure you ran the migration: `003_esim_purchases_issuing_cards.sql`
- Check in Supabase Dashboard → Table Editor that `esim_purchases` and `issuing_cards` tables exist

---

## ✅ Verification Checklist

Before going to production:

- [ ] Supabase Storage bucket `esim-qrcodes` created
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set in `.env.local`
- [ ] `SERVICE_OWNER_EMAIL` set in `.env.local`
- [ ] All Stripe Issuing env vars set
- [ ] Zendit wallet endpoint verified
- [ ] Test purchase completed successfully
- [ ] Webhook logs show successful flow
- [ ] QR code uploaded to Supabase Storage
- [ ] Email confirmation sent

---

## 🚀 Next Steps After Testing

1. **Monitor First Few Purchases**: Watch logs carefully
2. **Set Up Alerts**: Monitor for failures
3. **Reconciliation**: Use `/api/admin/reconcile-zendit` endpoint to check balances
4. **Production Testing**: Test with small amounts first
5. **Optimize**: Consider reusing virtual cards for multiple top-ups (future optimization)

---

## 📞 Need Help?

If you encounter issues:
1. Check the logs (both dev server and webhook listener)
2. Verify all environment variables are set
3. Test Zendit wallet endpoint manually with curl
4. Check Supabase tables exist and have correct schema

