# Setup Checklist

Use this checklist to set up your eSIM PWA step by step.

## ✅ Initial Setup

- [ ] **Clone repository**
- [ ] **Install dependencies**: `pnpm install`
- [ ] **Copy environment template**: `cp .env.example .env.local`

## ✅ Supabase Setup

- [ ] Create Supabase account at https://supabase.com
- [ ] Create new project
- [ ] Go to Settings → API
- [ ] Copy Project URL → Add to `.env.local` as `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Copy anon/public key → Add to `.env.local` as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Go to SQL Editor in Supabase dashboard
- [ ] Copy contents of `supabase/migrations/001_initial_schema.sql`
- [ ] Paste and run in SQL Editor
- [ ] Verify tables created: customers, purchases, activation_details
- [ ] Run RLS policies from `SUPABASE_SETUP.md`
- [ ] Test connection: should see no errors when running dev server

## ✅ Clerk Setup

- [ ] Create Clerk account at https://clerk.com
- [ ] Create new application
- [ ] Choose authentication methods (Email, Google, etc.)
- [ ] Go to API Keys
- [ ] Copy Publishable Key → Add to `.env.local` as `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [ ] Copy Secret Key → Add to `.env.local` as `CLERK_SECRET_KEY`
- [ ] Add sign-in/sign-up URLs to `.env.local` (use values from `.env.example`)
- [ ] Go to Webhooks section
- [ ] Add endpoint (after deployment): `https://yourdomain.com/api/webhooks/clerk`
- [ ] Subscribe to events: `user.created`, `user.updated`
- [ ] Copy Signing Secret → Add to `.env.local` as `CLERK_WEBHOOK_SECRET`

## ✅ Resend Setup

- [ ] Create Resend account at https://resend.com
- [ ] Go to API Keys
- [ ] Create new API key
- [ ] Copy API key → Add to `.env.local` as `RESEND_API_KEY`
- [ ] Go to Domains
- [ ] Add and verify your domain (or use resend.dev for testing)
- [ ] Add verified email → Add to `.env.local` as `EMAIL_FROM`
  - For testing: `onboarding@resend.dev`
  - For production: `noreply@yourdomain.com`

## ✅ Zendit Setup

- [ ] Sign up at https://zendit.io
- [ ] Get sandbox API key for testing
- [ ] Add to `.env.local` as `ZENDIT_API_KEY`
- [ ] For production: Get production API key
- [ ] Go to Webhooks in Zendit dashboard
- [ ] Add endpoint (after deployment): `https://yourdomain.com/api/webhooks/zendit`
- [ ] Subscribe to all purchase events
- [ ] Copy Webhook Secret → Add to `.env.local` as `ZENDIT_WEBHOOK_SECRET`

## ✅ Branding Configuration

- [ ] Set `NEXT_PUBLIC_BRAND_NAME` in `.env.local`
- [ ] Set `NEXT_PUBLIC_BASE_URL` (http://localhost:3000 for dev)
- [ ] Set `NEXT_PUBLIC_SUPPORT_EMAIL`
- [ ] Optional: Set custom colors with `NEXT_PUBLIC_PRIMARY_COLOR` and `NEXT_PUBLIC_SECONDARY_COLOR`

## ✅ PWA Assets

- [ ] Create or generate icon images:
  - `public/icons/icon-192.png` (192x192)
  - `public/icons/icon-512.png` (512x512)
- [ ] Update `public/manifest.json` with your brand name and colors
- [ ] Test PWA installation on mobile device

## ✅ Development Testing

- [ ] Start dev server: `pnpm dev`
- [ ] Visit http://localhost:3000
- [ ] Verify products load on homepage
- [ ] Test sign-in flow
- [ ] Complete test purchase
- [ ] Check Supabase for purchase record
- [ ] Visit activation page
- [ ] Check `/orders` page when signed in
- [ ] Verify no console errors

## ✅ Database Verification

- [ ] Open Supabase dashboard
- [ ] Go to Table Editor
- [ ] Check `customers` table exists
- [ ] Check `purchases` table exists
- [ ] Check `activation_details` table exists
- [ ] Verify test purchase appears in database
- [ ] Check indexes are created
- [ ] Verify RLS policies are active

## ✅ Email Testing

- [ ] Trigger a test purchase
- [ ] Manually trigger webhook or wait for Zendit
- [ ] Check Resend dashboard logs
- [ ] Verify email received
- [ ] Check email formatting and links
- [ ] Test activation link in email

## ✅ Authentication Testing

- [ ] Click "Sign In" button in header
- [ ] Complete sign-up flow
- [ ] Verify user appears in Clerk dashboard
- [ ] Check user synced to Supabase customers table
- [ ] Test sign-out
- [ ] Test protected routes

## ✅ Pre-Deployment

- [ ] Review all environment variables
- [ ] Change Zendit to production API key
- [ ] Use production Clerk instance
- [ ] Verify email domain
- [ ] Update `NEXT_PUBLIC_BASE_URL` to production domain
- [ ] Test build: `pnpm build`
- [ ] Fix any build errors
- [ ] Run production mode locally: `pnpm start`

## ✅ Deployment (Vercel)

- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Login: `vercel login`
- [ ] Deploy: `vercel --prod`
- [ ] Add all environment variables in Vercel dashboard
- [ ] Verify deployment successful
- [ ] Test production site
- [ ] Configure custom domain (optional)

## ✅ Post-Deployment

- [ ] Update Zendit webhook URL to production
- [ ] Update Clerk webhook URL to production
- [ ] Test complete purchase flow on production
- [ ] Verify webhook receives events
- [ ] Test email delivery
- [ ] Test PWA installation
- [ ] Check mobile responsiveness
- [ ] Monitor error logs

## ✅ Production Verification

- [ ] Browse products
- [ ] Complete real purchase
- [ ] Check database for purchase
- [ ] Verify webhook triggered
- [ ] Confirm email received
- [ ] View activation details
- [ ] Test QR code display
- [ ] Check order history
- [ ] Test authentication flow
- [ ] Verify all links work

## ✅ Monitoring Setup (Optional)

- [ ] Set up Sentry for error tracking
- [ ] Configure Vercel Analytics
- [ ] Set up uptime monitoring
- [ ] Create alerts for webhook failures
- [ ] Monitor email delivery rates
- [ ] Track purchase conversion rates

## ✅ Security Review

- [ ] Verify `.env.local` not in git
- [ ] Check all API keys are secret
- [ ] Verify RLS policies working
- [ ] Test webhook signature verification
- [ ] Review Clerk security settings
- [ ] Enable MFA for admin accounts
- [ ] Set up backup procedures

## ✅ Documentation Review

- [ ] Read through README.md
- [ ] Review ENV_SETUP.md
- [ ] Study DEPLOYMENT.md
- [ ] Check CLERK_SETUP.md
- [ ] Review SUPABASE_SETUP.md
- [ ] Read IMPLEMENTATION_COMPLETE.md

## 🎉 Launch Checklist

- [ ] All tests passing
- [ ] Production environment configured
- [ ] Webhooks working
- [ ] Emails delivering
- [ ] Authentication working
- [ ] Database backups configured
- [ ] Monitoring active
- [ ] Support email configured
- [ ] Domain DNS configured
- [ ] SSL certificate active

## 📞 Support Resources

If you encounter issues:

1. **Check documentation** in project root
2. **Review logs**:
   - Vercel deployment logs
   - Supabase API logs
   - Clerk logs
   - Resend email logs
3. **Test webhooks** with tools like ngrok
4. **Verify environment variables** are set correctly
5. **Check service status** of third-party providers

## Common Issues & Solutions

### "Missing environment variables"
→ Ensure `.env.local` exists and has all required variables  
→ Restart dev server after adding variables

### "Database connection failed"
→ Check Supabase URL and keys  
→ Verify migrations ran successfully  
→ Check RLS policies

### "Authentication not working"
→ Verify Clerk keys correct  
→ Check middleware.ts in project root  
→ Ensure routes configured properly

### "Emails not sending"
→ Verify Resend API key  
→ Check EMAIL_FROM is verified  
→ Review Resend logs

### "Webhook errors"
→ Verify webhook URLs point to production  
→ Check webhook secrets match  
→ Test with webhook testing tools

---

**Estimated Setup Time**: 2-3 hours  
**Difficulty**: Intermediate  
**Prerequisites**: Basic knowledge of Next.js, React, and environment variables

**You're all set!** 🚀
