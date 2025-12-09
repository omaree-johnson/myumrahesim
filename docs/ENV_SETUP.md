# Environment Setup Guide

This application requires several environment variables to function correctly. Follow these steps to set up your environment.

## 1. Copy Environment Template

```bash
cp .env.example .env.local
```

## 2. Required Services & API Keys

### eSIM Access (eSIM Provider)
1. Sign up at https://esimaccess.com
2. Get your Access Code from dashboard
3. Set up webhook endpoint in eSIM Access dashboard
4. Add to `.env.local`:
   - `ESIMACCESS_ACCESS_CODE` - Your eSIM Access API access code
   - `ESIMACCESS_PROFIT_MARGIN` - (Optional) Profit margin multiplier (default: 1.20 = 20% markup)
     - Examples: `1.20` = 20% markup, `1.30` = 30% markup, `1.50` = 50% markup
   - `ESIMACCESS_WEBHOOK_SECRET` - (Optional) Webhook secret for HMAC verification
5. **Note**: eSIM Access uses IP whitelisting for webhooks (see documentation)

### Supabase (Database)
1. Create project at https://supabase.com
2. Go to Settings → API
3. Copy URL and anon key
4. Add to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your anon/public key
5. Run database migrations (see SUPABASE_SETUP.md)

### Clerk (Authentication)
1. Create application at https://clerk.com
2. Go to API Keys
3. Add to `.env.local`:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Publishable key
   - `CLERK_SECRET_KEY` - Secret key
   - `CLERK_WEBHOOK_SECRET` - Webhook secret (from Webhooks section)
4. Configure routes as shown in `.env.example`
5. See CLERK_SETUP.md for detailed instructions

### Resend (Email Service)
1. Sign up at https://resend.com
2. Create API key
3. Verify your sending domain
4. Add to `.env.local`:
   - `RESEND_API_KEY` - Your API key
   - `EMAIL_FROM` - Your verified sending email address

### Meta Pixel (Facebook Ads Tracking) - Optional
1. Go to Meta Events Manager: https://business.facebook.com/events_manager
2. Create or select your Pixel
3. Copy your Pixel ID (e.g., `740367905137416`)
4. Add to `.env.local`:
   - `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` - Your Meta Pixel ID
5. The Pixel will automatically:
   - Track PageView on all pages
   - Track Purchase events on successful payments
   - Send purchase value and currency for better ad optimization

## 3. Branding Configuration

Customize your white-label eSIM store:

```env
NEXT_PUBLIC_BRAND_NAME=Your Brand Name
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NEXT_PUBLIC_SUPPORT_EMAIL=support@yourdomain.com
NEXT_PUBLIC_PRIMARY_COLOR=#yourcolor
NEXT_PUBLIC_SECONDARY_COLOR=#yourcolor
```

## 4. Webhook Configuration

### Zendit Webhooks
Configure in Zendit Dashboard:
- **Endpoint**: `https://yourdomain.com/api/webhooks/zendit`
- **Select Type**: Production or Sandbox (match your API key)
- **Webhook Header**: Optional (not required)
- **IP Whitelisting**: Zendit uses IP verification (18.209.125.75, 3.217.45.95, 54.243.153.139)
- **Note**: No webhook secret needed - authentication via IP addresses

### Clerk Webhooks (Optional)
Configure in Clerk Dashboard → Webhooks:
- **Endpoint**: `https://yourdomain.com/api/webhooks/clerk`
- **Events**: `user.created`, `user.updated`
- **Secret**: Save to `CLERK_WEBHOOK_SECRET`

## 5. Development vs Production

### Development (.env.local)
```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
ZENDIT_API_KEY=sand_... # Sandbox key
EMAIL_FROM=onboarding@resend.dev # Resend test email
```

### Production (Vercel/Hosting)
```env
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
ZENDIT_API_KEY=prod_... # Production key
EMAIL_FROM=noreply@yourdomain.com # Your verified domain
```

## 6. Verify Setup

Run the development server:

```bash
pnpm dev
```

Check console for any missing environment variable warnings.

## 7. Security Checklist

- ✅ Never commit `.env.local` to git (already in .gitignore)
- ✅ Use different API keys for development and production
- ✅ Rotate webhook secrets periodically
- ✅ Enable Supabase Row Level Security (RLS)
- ✅ Configure Clerk production instance separately
- ✅ Use verified domain for production emails

## Troubleshooting

### Missing Environment Variables
If you see errors about missing env vars:
1. Check `.env.local` exists in project root
2. Verify all required variables are set
3. Restart dev server after adding variables

### Database Connection Issues
1. Verify Supabase URL and keys
2. Check if database migrations ran successfully
3. Ensure RLS policies are configured

### Authentication Not Working
1. Check Clerk keys are correct
2. Verify middleware.ts is in project root
3. Ensure sign-in/sign-up URLs match env config

### Emails Not Sending
1. Verify Resend API key
2. Check EMAIL_FROM is verified in Resend
3. Check logs for specific error messages

### Webhook Errors
1. Ensure webhooks are configured in provider dashboards
2. Verify webhook secrets match
3. Test with webhook testing tools (e.g., ngrok for local)
