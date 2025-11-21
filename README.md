# eSIM PWA - White-Label eSIM Store

A complete, production-ready Progressive Web App (PWA) for selling eSIM plans, built with Next.js 16, Tailwind CSS 4, and fully integrated with the **eSIMCard Reseller API** (with legacy Zendit hooks still available).

## ✨ Features

### Core Functionality
- 🚀 **Next.js 16** with App Router, React Server Components, and Turbopack
- 📱 **PWA Support** - Installable on mobile devices with offline capability
- 🎨 **Tailwind CSS 4** - Modern, responsive design system
- 🔌 **eSIMCard Reseller API Integration** - Complete eSIM provisioning workflow (catalog, purchase, usage)
- 🏷️ **White-Label Ready** - Full branding customization
- ✅ **TypeScript** - End-to-end type safety

### Advanced Features
- 🔐 **Clerk Authentication** - Secure user accounts with social login
- 💾 **Supabase Database** - Purchase history and customer management
- 📧 **Email Notifications** - Automated activation emails via Resend
- 🔔 **Webhook Handler** - Real-time status updates via Stripe fulfillment
- 📊 **Order History** - User dashboard for tracking purchases
- � **QR Code Display** - Instant eSIM activation codes
- 🔒 **Row Level Security** - Database protection with Supabase RLS
- 🎯 **Status Polling** - Auto-refresh activation status

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm (recommended) - `npm install -g pnpm`
- Accounts with:
  - [eSIMCard](https://portal.esimcard.com) - Reseller API provider
  - [Supabase](https://supabase.com) - Database
  - [Clerk](https://clerk.com) - Authentication
  - [Resend](https://resend.com) - Email delivery

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository>
   cd umrahesim
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your API keys (see [ENV_SETUP.md](./ENV_SETUP.md))

3. **Configure database:**
   - Create Supabase project
   - Run migrations (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
   - Configure RLS policies

4. **Set up authentication:**
   - Create Clerk application
   - Configure OAuth providers
   - Add webhooks (see [CLERK_SETUP.md](./CLERK_SETUP.md))

5. **Run development server:**
   ```bash
   pnpm dev
   ```

6. **Open http://localhost:3000**

## 🔌 eSIMCard Reseller API Integration

✅ **Fully Integrated** – Catalog, purchase, balance, and usage flows built on the eSIMCard reseller API (`resellerApiDocs.json`).

### Implemented Features
- ✅ Login + token caching (`POST /login`)
- ✅ Country-specific catalog (`GET /packages/country/{id}`)
- ✅ Package details (`GET /package/details/{uuid}`)
- ✅ Purchase provisioning (`POST /package/purchase`)
- ✅ Activation polling (`GET /my-esims/{id}`)
- ✅ Usage lookups (`GET /my-sim/{id}/usage`)
- ✅ Balance checks before fulfillment (`GET /balance`)
- ✅ Stripe webhook automatically refunds on provider errors

See [ESIMCARD_SETUP.md](./ESIMCARD_SETUP.md) for setup details. Legacy Zendit documentation is kept in [ZENDIT_API_INTEGRATION.md](./ZENDIT_API_INTEGRATION.md) for reference.

## 🎨 White-Labeling

Customize your brand in `.env.local`:

```env
NEXT_PUBLIC_BRAND_NAME=Your Brand Name
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NEXT_PUBLIC_SUPPORT_EMAIL=support@yourdomain.com
NEXT_PUBLIC_PRIMARY_COLOR=#0ea5e9
NEXT_PUBLIC_SECONDARY_COLOR=#0284c7
```

Add your PWA icons to `public/icons/`:
- `icon-192.png` (192x192)
- `icon-512.png` (512x512)

Update `public/manifest.json` with your branding.

## 📦 Building for Production

```bash
pnpm build
pnpm start
```

## 🚢 Deployment

Full deployment guide: [DEPLOYMENT.md](./DEPLOYMENT.md)

### Quick Deploy to Vercel

```bash
vercel --prod
```

Configure environment variables in Vercel dashboard:
- All variables from `.env.example`
- Update `NEXT_PUBLIC_BASE_URL` to production URL
- Use production API keys (not sandbox)

### Configure Webhooks

After deployment, update webhook URLs in:
- **Stripe**: `https://yourdomain.com/api/webhooks/stripe`
- **Clerk**: `https://yourdomain.com/api/webhooks/clerk`

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── products/            # Product listing API
│   │   ├── orders/              # Order creation with DB save
│   │   ├── purchases/[id]/      # Purchase status check
│   │   └── webhooks/
│   │       └── stripe/          # Stripe webhook (fulfills provider orders)
│   ├── sign-in/                 # Clerk sign-in page
│   ├── sign-up/                 # Clerk sign-up page
│   ├── orders/                  # User order history
│   ├── activation/              # eSIM activation details
│   ├── checkout/                # Checkout with payment modal
│   ├── success/                 # Purchase success page
│   └── page.tsx                 # Product catalog homepage
├── components/
│   ├── payment-modal.tsx        # Custom payment form
│   └── payment-success-dialog.tsx # Success celebration
├── lib/
│   ├── esimcard.ts              # Primary eSIM provider client
│   ├── zendit.ts                # Legacy Zendit client (kept for reference)
│   ├── supabase.ts              # Supabase client
│   └── email.ts                 # Email templates
├── middleware.ts                # Clerk auth middleware
└── supabase/
    └── migrations/              # Database schema
```

## 📚 Documentation

- **[ENV_SETUP.md](./ENV_SETUP.md)** - Environment variables configuration
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Database setup and migrations
- **[CLERK_SETUP.md](./CLERK_SETUP.md)** - Authentication configuration
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
- **[ESIMCARD_SETUP.md](./ESIMCARD_SETUP.md)** - Current provider configuration
- **[ESIMCARD_MIGRATION.md](./ESIMCARD_MIGRATION.md)** - Summary of the latest migration
- **[ZENDIT_API_INTEGRATION.md](./ZENDIT_API_INTEGRATION.md)** - Legacy reference
- **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** - Technical implementation notes

## 🔄 User Flow

1. **Browse Plans** → User views available eSIM plans on homepage
2. **Select Plan** → Click "Get This Plan" to go to checkout
3. **Checkout** → Fill in name and email in payment modal
4. **Purchase** → Order created in database, sent to the eSIMCard reseller API
5. **Success** → Celebration dialog with transaction ID
6. **Activation** → View QR code and activation details
7. **Email** → Receive activation email with instructions
8. **Webhook** → Status updated automatically when ready

## 🔐 Authentication Flow

- **Guest Checkout**: Users can purchase without account
- **Optional Sign-In**: Sign in to view order history
- **Protected Routes**: `/orders` requires authentication
- **User Association**: Purchases linked to account if signed in

## 🗄️ Database Schema

### Tables
- **customers**: User accounts linked to Clerk
- **purchases**: All eSIM purchases with status tracking
- **activation_details**: QR codes and activation codes

### Security
- Row Level Security (RLS) enabled
- Users can only view their own data
- Service role for webhook updates

## 🎯 Testing

### Unit & Integration Tests
```bash
# Install test dependencies (first time only)
pnpm add -D @testing-library/jest-dom @testing-library/react @types/jest jest jest-environment-jsdom

# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage
```

### Test Purchase Flow
```bash
# Start dev server
pnpm dev

# Test endpoints
curl http://localhost:3000/api/products
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"offerId":"test","recipientEmail":"test@example.com","fullName":"Test User"}'
```

### Test Webhooks Locally

ngrok is installed and ready! Use the helper script:
```bash
# Option 1: Use npm script
npm run ngrok

# Option 2: Use script directly
./start-ngrok.sh

# Option 3: Manual
ngrok http 3000
```

📖 See [NGROK_SETUP.md](./NGROK_SETUP.md) for detailed setup instructions.

Once ngrok is running, update webhook URLs in:
- **Stripe webhook**: `https://your-ngrok-url.ngrok-free.app/api/webhooks/stripe`
- **Stripe dashboard**: `https://your-ngrok-url.ngrok-free.app/api/webhooks/stripe`

## 🐛 Troubleshooting

### Common Issues

**Hydration Errors**
- Solution: `export const dynamic = 'force-dynamic'` already added to pages

**Missing Environment Variables**
- Check `.env.local` exists and has all required variables
- Restart dev server after adding variables

**Database Connection Failed**
- Verify Supabase URL and keys
- Check if migrations ran successfully

**Authentication Not Working**
- Verify Clerk keys
- Check middleware.ts is in project root

**Emails Not Sending**
- Verify Resend API key
- Check EMAIL_FROM is verified domain

See [ENV_SETUP.md](./ENV_SETUP.md) for detailed troubleshooting.

## 🚀 Performance

- ⚡ Server-side rendering for fast initial load
- 📦 Automatic code splitting
- 🖼️ Optimized images with Next.js Image
- 💾 Database indexes for fast queries
- 🔄 Auto-polling for purchase status
- 📱 PWA caching for offline support

## 🔒 Security Features

- ✅ API keys server-side only
- ✅ Webhook signature verification
- ✅ Row Level Security on database
- ✅ HTTPS enforced in production
- ✅ Rate limiting implemented
- ✅ Input validation on all forms
- ✅ Content Security Policy (CSP) headers
- ✅ Request body size limits
- ✅ CSRF protection
- ✅ Comprehensive security testing

See [SECURITY_TESTING_SUMMARY.md](./SECURITY_TESTING_SUMMARY.md) for detailed security information.

## 🌍 Production Checklist

Before going live:
- [ ] Replace sandbox eSIMCard credentials with production credentials
- [ ] Set up custom domain
- [ ] Configure production Clerk instance
- [ ] Verify Resend domain for emails
- [ ] Run Supabase migrations
- [ ] Configure RLS policies
- [ ] Test complete purchase flow
- [ ] Set up webhook endpoints
- [ ] Add PWA icons (192x192, 512x512)
- [ ] Update manifest.json with branding
- [ ] Configure error monitoring (Sentry)
- [ ] Set up analytics

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full checklist.

## 📈 Roadmap

Potential enhancements:
- [ ] Admin dashboard for managing orders
- [ ] Multi-currency support
- [ ] Subscription plans
- [ ] Referral system
- [ ] Customer reviews
- [ ] Usage analytics dashboard
- [ ] Multi-language support
- [ ] Advanced filtering/search

## 🤝 Contributing

This is a white-label template. Customize it for your needs!

## 📄 License

Provided as-is for commercial and personal use.

## 💬 Support

- **Technical Issues**: Check documentation files
- **eSIMCard Reseller API**: Contact provider support
- **Next.js**: https://nextjs.org/docs
- **Clerk**: https://clerk.com/docs
- **Supabase**: https://supabase.com/docs

---

**Built with:**
- Next.js 16
- React 19
- Tailwind CSS 4
- TypeScript 5
- eSIMCard API
- Clerk Authentication
- Supabase Database
- Resend Email

**Perfect for:**
- eSIM resellers
- Travel companies
- Telecom startups
- White-label services

---

🌟 **Ready to launch your eSIM business!** 🌟
