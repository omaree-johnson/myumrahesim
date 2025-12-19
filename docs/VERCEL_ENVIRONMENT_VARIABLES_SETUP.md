# Vercel Environment Variables Setup Guide

This guide explains how to configure all required environment variables in Vercel for the My Umrah eSIM application to work correctly.

---

## Critical: Supabase Configuration

The application requires Supabase environment variables to be set in Vercel. Without these, you'll see "Database not configured" errors (503 status).

### Required Supabase Variables

1. **NEXT_PUBLIC_SUPABASE_URL**
   - **Description:** Your Supabase project URL
   - **Format:** `https://[project-id].supabase.co`
   - **Where to find:** Supabase Dashboard → Settings → API → Project URL
   - **Example:** `https://abcdefghijklmnop.supabase.co`

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - **Description:** Supabase anonymous/public key (safe for client-side)
   - **Format:** Long JWT token
   - **Where to find:** Supabase Dashboard → Settings → API → Project API keys → `anon` `public`
   - **Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. **SUPABASE_SERVICE_ROLE_KEY** ⚠️ **CRITICAL**
   - **Description:** Supabase service role key (server-side only, bypasses RLS)
   - **Format:** Long JWT token
   - **Where to find:** Supabase Dashboard → Settings → API → Project API keys → `service_role` `secret`
   - **⚠️ SECURITY WARNING:** Never expose this in client-side code. Only use in API routes.
   - **Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### How to Set in Vercel

1. **Navigate to Vercel Dashboard**
   - Go to your project: `myumrahesim`
   - Click **Settings** → **Environment Variables**

2. **Add Each Variable**
   - Click **Add New**
   - Enter variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - Enter variable value
   - Select environments:
     - ✅ **Production** (for production domain)
     - ✅ **Preview** (for preview deployments)
     - ✅ **Development** (optional, for local dev)
   - Click **Save**

3. **Redeploy After Adding Variables**
   - After adding environment variables, you **must redeploy** for them to take effect
   - Go to **Deployments** tab
   - Click **⋯** (three dots) on latest deployment
   - Click **Redeploy**

### Verification

After setting variables and redeploying, test:

1. **Check API Endpoint:**
   ```
   GET https://your-domain.com/api/orders
   ```
   - Should return orders (if authenticated) or 401 (if not)
   - Should NOT return 503 "Database not configured"

2. **Check Orders Page:**
   - Visit `/orders` while logged in
   - Should show orders or "No orders found"
   - Should NOT show "Orders database is not configured"

3. **Check Cart Reminders:**
   ```
   POST https://your-domain.com/api/cart/reminders
   ```
   - Should work (if email provided)
   - Should NOT return 503

---

## Other Required Environment Variables

### Stripe

- **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**
  - Stripe publishable key (safe for client-side)
  - Format: `pk_live_...` or `pk_test_...`

- **STRIPE_SECRET_KEY**
  - Stripe secret key (server-side only)
  - Format: `sk_live_...` or `sk_test_...`

- **STRIPE_WEBHOOK_SECRET**
  - Stripe webhook signing secret
  - Format: `whsec_...`
  - Get from: Stripe Dashboard → Developers → Webhooks → Your webhook → Signing secret

### Clerk Authentication

- **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY**
  - Clerk publishable key
  - Format: `pk_live_...` or `pk_test_...`

- **CLERK_SECRET_KEY**
  - Clerk secret key (server-side only)
  - Format: `sk_live_...` or `sk_test_...`

**Note:** Clerk production keys only work on your production domain (`myumrahesim.com`). Preview deployments will show errors - this is expected. Use test keys for preview deployments if needed.

### eSIM Access API

- **ESIMACCESS_API_KEY**
  - eSIM Access API key
  - Format: API key string
  - Get from: eSIM Access dashboard

- **ESIMACCESS_API_URL**
  - eSIM Access API base URL
  - Format: `https://api.esimaccess.com` (or your provider's URL)

### Email (Resend)

- **RESEND_API_KEY**
  - Resend API key
  - Format: `re_...`
  - Get from: Resend Dashboard → API Keys

- **EMAIL_FROM** (Optional)
  - Email sender address
  - Format: `noreply@myumrahesim.com`
  - Defaults to `noreply@[domain]` if not set

### Site Configuration

- **NEXT_PUBLIC_BASE_URL**
  - Your site's base URL
  - Production: `https://myumrahesim.com`
  - Preview: `https://myumrahesim-[hash].vercel.app`

- **NEXT_PUBLIC_BRAND_NAME**
  - Brand name for display
  - Example: `My Umrah eSIM`

- **NEXT_PUBLIC_SUPPORT_EMAIL**
  - Support email address
  - Example: `support@myumrahesim.com`

- **NEXT_PUBLIC_WHATSAPP_NUMBER** (Optional)
  - WhatsApp support number
  - Format: `+1234567890`

---

## Environment-Specific Configuration

### Production Environment

Set all variables with production values:
- Use `pk_live_` and `sk_live_` for Stripe
- Use production Supabase project
- Use production Clerk instance
- Use production domain in `NEXT_PUBLIC_BASE_URL`

### Preview Environment

For preview deployments (Vercel preview URLs):
- Can use test/development keys for Stripe and Clerk
- Use same Supabase project (or separate test project)
- Set `NEXT_PUBLIC_BASE_URL` to preview URL (or use auto-detection)

**Note:** Clerk production keys won't work on preview URLs. You'll see errors like:
```
Clerk: Production Keys are only allowed for domain "myumrahesim.com"
```

This is expected. Either:
1. Use Clerk test keys for preview deployments, OR
2. Add preview URLs to Clerk's allowed domains (if supported)

---

## Quick Setup Checklist

- [ ] **NEXT_PUBLIC_SUPABASE_URL** - Set in all environments
- [ ] **NEXT_PUBLIC_SUPABASE_ANON_KEY** - Set in all environments
- [ ] **SUPABASE_SERVICE_ROLE_KEY** - Set in all environments ⚠️ **CRITICAL**
- [ ] **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY** - Set in all environments
- [ ] **STRIPE_SECRET_KEY** - Set in all environments
- [ ] **STRIPE_WEBHOOK_SECRET** - Set in all environments
- [ ] **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY** - Set in all environments
- [ ] **CLERK_SECRET_KEY** - Set in all environments
- [ ] **ESIMACCESS_API_KEY** - Set in all environments
- [ ] **ESIMACCESS_API_URL** - Set in all environments
- [ ] **RESEND_API_KEY** - Set in all environments
- [ ] **NEXT_PUBLIC_BASE_URL** - Set appropriately per environment
- [ ] **NEXT_PUBLIC_BRAND_NAME** - Set in all environments
- [ ] **NEXT_PUBLIC_SUPPORT_EMAIL** - Set in all environments

---

## Troubleshooting

### "Database not configured" Error (503)

**Cause:** `SUPABASE_SERVICE_ROLE_KEY` is missing or empty

**Fix:**
1. Check Vercel Environment Variables
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set
3. Verify it's enabled for the correct environment (Production/Preview)
4. **Redeploy** after adding/updating variables

### "Clerk: Production Keys are only allowed for domain..."

**Cause:** Using Clerk production keys on preview URL

**Fix:**
- This is expected behavior
- Use Clerk test keys for preview deployments
- Or test only on production domain

### CSP Violations

**Cause:** Content Security Policy blocking external scripts

**Fix:**
- CSP is configured in `next.config.ts`
- If you add new external services, update CSP headers
- See `docs/STRUCTURED_DATA_TESTING_GUIDE.md` for CSP details

### API Routes Return 503

**Cause:** Missing environment variables for that service

**Fix:**
1. Check which service is failing (Supabase, Stripe, Resend, etc.)
2. Verify corresponding environment variables are set
3. Check Vercel logs for specific error messages
4. Redeploy after fixing variables

---

## Security Best Practices

1. **Never commit environment variables to Git**
   - All secrets should be in Vercel Environment Variables only
   - Use `.env.local` for local development (gitignored)

2. **Use different keys for production vs. preview**
   - Production: Use production API keys
   - Preview: Use test/development keys when possible

3. **Rotate keys periodically**
   - Update keys in Vercel
   - Redeploy to apply changes

4. **Monitor for exposed keys**
   - Regularly check Vercel logs
   - Use tools like `git-secrets` to prevent accidental commits

---

## Testing After Setup

1. **Test Supabase Connection:**
   ```bash
   curl https://your-domain.com/api/orders
   # Should return 401 (not authenticated) or 200 (with orders)
   # Should NOT return 503
   ```

2. **Test Stripe:**
   - Try to create a payment intent
   - Check Vercel logs for Stripe errors

3. **Test Email:**
   - Trigger an email (e.g., order confirmation)
   - Check Resend dashboard for sent emails

4. **Test Authentication:**
   - Try to sign in/sign up
   - Check Clerk dashboard for user activity

---

## Additional Resources

- **Supabase Setup:** `docs/SUPABASE_SETUP.md`
- **Stripe Setup:** `docs/STRIPE_SETUP.md`
- **Clerk Setup:** `docs/CLERK_SETUP.md`
- **Deployment Guide:** `docs/DEPLOYMENT.md`

---

**Last Updated:** December 17, 2025
