# eSIMCard Reseller Setup Guide

This project now uses the **eSIMCard Reseller API** (`resellerApiDocs.json`). Follow the steps below to configure credentials, database fields, and operational workflows so everything works end-to-end like the previous providers.

---

## 1. Environment Variables

Add these to `.env.local` (and production env):

```env
# Required account credentials
ESIMCARD_API_EMAIL=your_reseller_email
ESIMCARD_API_PASSWORD=super_secure_password

# Optional overrides
ESIMCARD_BASE_URL=https://portal.esimcard.com/api/developer/reseller
ESIMCARD_COUNTRY_NAME=Saudi Arabia
ESIMCARD_COUNTRY_CODE=SA
ESIMCARD_DEFAULT_CURRENCY=USD
```

> The API issues a short‑lived bearer token using the email/password pair. `src/lib/esimcard.ts` caches and refreshes tokens automatically.

---

## 2. Database Migration

Two migrations are relevant:

1. `supabase/migrations/004_add_esimaccess_fields.sql` (adds provider columns if you never ran it).
2. `supabase/migrations/005_esimcard_provider_fields.sql` (renames those columns to `esim_provider_*`).

Apply them with:

```bash
supabase migration up
# or run the SQL files manually in Supabase Studio
```

After migrating, you will see:

- `esim_provider_response`
- `esim_provider_status`
- `esim_provider_cost`

in both `purchases` and `esim_purchases` tables.

---

## 3. Provider Capabilities

| Feature | Endpoint | Notes |
|---------|----------|-------|
| Login (JWT) | `POST /login` | Credentials from env vars |
| Country list | `GET /packages/country` | Used to resolve Saudi Arabia ID |
| Packages per country | `GET /packages/country/{id}?package_type=DATA-ONLY` | Source for storefront |
| Package details | `GET /package/details/{uuid}` | Pricing + coverage info |
| Purchase | `POST /package/purchase` | Requires pseudo IMEI (auto-generated) |
| eSIM details | `GET /my-esims/{id}` | Activation code, QR link, ICCID |
| Usage | `GET /my-sim/{id}/usage` | Remaining vs total data |
| Balance | `GET /balance` | Prefunded wallet status |

There are no webhooks yet; the Stripe webhook queries the provider for activation data and usage.

---

## 4. Application Flow (unchanged UX)

1. **Plan listing** – `/api/products`, `/plans`, `/home` call `getEsimProducts("SA")`, which fetches and normalises Saudi-only packages.
2. **Checkout** – Customer selects a plan; Stripe collects traveler name + email directly inside the payment sheet. We start a Payment Intent as soon as the checkout loads.
3. **Stripe Webhook** – `src/app/api/webhooks/stripe/route.ts`:
   - Pulls package info (`getEsimPackage`)
   - Checks reseller wallet via `getBalance()`
   - Purchases the package (`createEsimPurchase`)
   - Polls `/my-esims/{id}` for activation data and stores it in Supabase
   - Sends Resend order confirmation + activation emails
4. **Status endpoints** – `/api/purchases/[transactionId]` and `/api/purchases/by-session` read from Supabase and call `getEsimUsage` when a `simId` is available.
5. **QR endpoint** – `/api/purchases/[transactionId]/qrcode` returns the universal link / activation code so the frontend can render a QR.

The entire buyer experience (browse, pay, receive activation email) stays the same.

---

## 5. Testing & Verification

```bash
# Ensure env vars are set, then run dev server
pnpm dev

# Verify catalog
curl http://localhost:3000/api/products

# Simulate direct order (bypasses Stripe)
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"offerId":"<PACKAGE_UUID>","recipientEmail":"test@example.com","fullName":"Traveler"}'
```

Use the eSIMCard portal to confirm balance, orders, and SIM statuses.

---

## 6. Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `Unauthenticated.` responses | Wrong email/password or token expired | Double-check `ESIMCARD_API_*` env vars; restart server to refresh token |
| Country lookup fails | Country name mismatch | Set `ESIMCARD_COUNTRY_NAME` to the exact spelling used by eSIMCard |
| Purchase returns `sim_applied: false` | Provisioning delay | Poll `GET /my-esims/{id}` (handled automatically with retries) |
| Account balance errors | Wallet empty | Fund balance inside the reseller dashboard |
| Stripe checkout stuck | Backend can’t log in | Check server logs for `/login` failures |

---

## 7. Deployment Checklist

- [ ] `ESIMCARD_API_EMAIL` / `ESIMCARD_API_PASSWORD` configured in production
- [ ] Migrations `004` and `005` applied in Supabase
- [ ] Stripe webhook secret (`STRIPE_WEBHOOK_SECRET`) set and listener running
- [ ] Resend API key configured (`RESEND_API_KEY`, `EMAIL_FROM`)
- [ ] Balance funded in the reseller portal
- [ ] `NEXT_PUBLIC_BRAND_NAME`, colors, and support email set
- [ ] Supabase service role envs configured for webhook updates

---

## 8. Key Files

- `src/lib/esimcard.ts` – API client (login, packages, purchase, usage, balance)
- `src/app/api/create-payment-intent/route.ts` – Embedded checkout flow
- `src/app/api/orders/route.ts` – Manual order endpoint (uses eSIMCard directly)
- `src/app/api/webhooks/stripe/route.ts` – Payment fulfillment + Resend emails
- `src/app/api/purchases/[transactionId]/route.ts` – Purchase detail API
- `src/components/embedded-checkout-form.tsx` – Frontend Stripe sheet (traveler name inside form)

With these pieces in place, the application behaves exactly like the previous Zendit/eSIM Access integrations but uses the new eSIMCard reseller platform under the hood.


