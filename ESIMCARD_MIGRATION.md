# eSIMCard Reseller Migration Summary

The project has been fully migrated from the eSIM Access integration to the **eSIMCard Reseller API** while keeping the same user experience (plans → checkout → activation email). This document highlights the key changes and how to operate the new flow.

---

## ✅ Completed Changes

| Area | Status | Notes |
|------|--------|-------|
| API client | ✅ `src/lib/esimcard.ts` | Handles login, catalog, purchase, usage, balance |
| Checkout & payment | ✅ `create-payment-intent`, `create-checkout-session`, `checkout` page | Uses new catalog + metadata |
| Stripe webhook | ✅ `/api/webhooks/stripe` | Purchases via eSIMCard, stores activation + handles refunds |
| Manual orders | ✅ `/api/orders` | Calls provider directly for admin/manual purchases |
| Purchases API | ✅ `/api/purchases/*` | Reads new confirmation/usage shape |
| Supabase schema | ✅ `005_esimcard_provider_fields.sql` | Renames `esimaccess_*` → `esim_provider_*` |
| Emails | ✅ `src/lib/email.ts` | No change needed; uses stored activation data |
| Documentation | ✅ `ESIMCARD_SETUP.md`, README updates | Explains new env vars + workflow |

---

## 🔧 Environment Variables

```env
ESIMCARD_API_EMAIL=your_reseller_login
ESIMCARD_API_PASSWORD=your_reseller_password
ESIMCARD_COUNTRY_NAME=Saudi Arabia
ESIMCARD_COUNTRY_CODE=SA
ESIMCARD_DEFAULT_CURRENCY=USD
```

> Remove old `ESIMACCESS_*` variables; they are no longer used.

---

## 🗄️ Database Notes

1. Run both migrations if you haven’t yet:
   - `004_add_esimaccess_fields.sql`
   - `005_esimcard_provider_fields.sql`
2. The application now uses the provider-agnostic columns:
   - `esim_provider_response`
   - `esim_provider_status`
   - `esim_provider_cost`
3. Activation data is stored in `activation_details` the same way as before, so existing UI continues to work.

---

## 🔁 Stripe Fulfillment Flow

1. Payment succeeds → webhook receives `payment_intent`.
2. Webhook looks up package via `getEsimPackage(offerId)`.
3. Balance check via `getBalance()`.
4. Purchase via `createEsimPurchase()` (auto-generates IMEI).
5. Polls `/my-esims/{simId}` for activation data, stores in Supabase.
6. Sends Resend order confirmation email.

If purchase fails or balance is low, the webhook automatically refunds the Stripe payment.

---

## 🧪 Testing

```bash
pnpm dev
curl http://localhost:3000/api/products                # verify catalog
# Start checkout from the UI, complete with Stripe test card
# or create an order manually:
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"offerId":"<PACKAGE_UUID>","recipientEmail":"test@example.com","fullName":"Traveler"}'
```

After a successful purchase, check:
- Supabase `purchases` / `esim_purchases` rows → `esim_provider_status = GOT_RESOURCE`
- Resend dashboard → activation email sent
- eSIMCard portal → SIM appears under “My eSIMs”

---

## 📚 Reference

- Provider spec: `resellerApiDocs.json`
- Setup guide: `ESIMCARD_SETUP.md`
- Key source files:
  - `src/lib/esimcard.ts`
  - `src/app/api/webhooks/stripe/route.ts`
  - `src/app/api/orders/route.ts`
  - `src/app/api/create-payment-intent/route.ts`
  - `src/app/api/purchases/[transactionId]/route.ts`

With these changes, the system behaves exactly as before—only the upstream provider has changed.


