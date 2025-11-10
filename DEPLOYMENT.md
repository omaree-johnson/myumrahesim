# Deployment Guide

This guide covers deploying your white-label eSIM PWA to production.

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Supabase database migrations run
- [ ] Supabase RLS policies configured
- [ ] Clerk production instance created
- [ ] Resend domain verified
- [ ] Zendit production API key obtained
- [ ] PWA icons generated (192x192, 512x512)
- [ ] Custom domain configured (if applicable)

## Recommended Hosting: Vercel

### 1. Install Vercel CLI

```bash
npm i -g vercel
```

### 2. Deploy to Vercel

```bash
# Login
vercel login

# Deploy
vercel

# For production
vercel --prod
```

### 3. Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

#### Production Variables
```
ZENDIT_API_KEY=prod_your_production_key
ZENDIT_WEBHOOK_SECRET=your_webhook_secret

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...

RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com

NEXT_PUBLIC_BRAND_NAME=Your Brand
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NEXT_PUBLIC_SUPPORT_EMAIL=support@yourdomain.com
```

### 4. Configure Domain

1. Go to Vercel Dashboard → Domains
2. Add your custom domain
3. Configure DNS as instructed
4. Update `NEXT_PUBLIC_BASE_URL` to match your domain

### 5. Configure Webhooks

After deployment, update webhook URLs in:

#### Zendit Dashboard
- Endpoint: `https://yourdomain.com/api/webhooks/zendit`
- Method: POST
- Events: All purchase events

#### Clerk Dashboard  
- Endpoint: `https://yourdomain.com/api/webhooks/clerk`
- Events: `user.created`, `user.updated`

## Alternative Hosting Options

### Netlify

1. Build command: `pnpm build`
2. Publish directory: `.next`
3. Add environment variables in Site settings
4. Configure redirects for PWA

### Self-Hosted (Docker)

```dockerfile
# Dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t esim-pwa .
docker run -p 3000:3000 --env-file .env.local esim-pwa
```

## Post-Deployment

### 1. Test PWA Installation

1. Visit your site on mobile
2. Check "Add to Home Screen" appears
3. Install and test offline functionality
4. Verify manifest.json loads correctly

### 2. Test Purchase Flow

1. Browse products
2. Complete checkout
3. Verify purchase saves to database
4. Check email delivery
5. Confirm activation page works
6. Test webhook by checking Supabase after purchase completes

### 3. Monitor & Debug

#### Vercel Logs
```bash
vercel logs
```

#### Supabase Logs
Dashboard → Logs → API Logs

#### Clerk Logs
Dashboard → Logs

#### Email Delivery
Resend Dashboard → Logs

### 4. Performance Optimization

#### Enable Caching
Already configured in `next.config.ts`

#### Image Optimization
Use Next.js Image component (already implemented)

#### Database Indexes
Already included in migration

#### API Rate Limiting
Consider adding rate limiting to API routes:

```typescript
// Example with upstash/ratelimit
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  
  // Continue with request...
}
```

## Security Hardening

### 1. Environment Variables
- Never expose secrets in client-side code
- Use `NEXT_PUBLIC_` prefix only for non-sensitive values
- Rotate API keys periodically

### 2. Database Security
- Enable RLS on all tables
- Review and test security policies
- Use service role key only server-side

### 3. Authentication
- Enable MFA in Clerk
- Configure session timeouts
- Set up email verification

### 4. API Protection
- Implement rate limiting
- Validate webhook signatures
- Use CORS appropriately

### 5. Content Security Policy

Add to `next.config.ts`:
```typescript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
        },
      ],
    },
  ];
}
```

## Monitoring & Analytics

### Recommended Tools

1. **Vercel Analytics** - Page performance
2. **Sentry** - Error tracking
3. **PostHog** - User analytics
4. **Supabase Insights** - Database performance
5. **Clerk Analytics** - Authentication metrics

### Setup Error Tracking (Sentry)

```bash
pnpm add @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

## Scaling Considerations

### Database
- Monitor query performance in Supabase
- Add indexes for frequently queried columns
- Consider read replicas for high traffic

### API Routes
- Implement caching for product listings
- Use CDN for static assets
- Consider serverless function cold starts

### Email Delivery
- Monitor Resend quota
- Implement email queue for high volume
- Set up SPF/DKIM for deliverability

## Rollback Plan

If issues arise after deployment:

```bash
# Rollback to previous deployment
vercel rollback

# Or deploy specific commit
vercel --prod --force
```

## Maintenance

### Regular Tasks
- [ ] Monitor error logs weekly
- [ ] Review Supabase usage monthly
- [ ] Rotate API keys quarterly
- [ ] Update dependencies monthly
- [ ] Backup database regularly
- [ ] Test webhook endpoints monthly

### Updates

```bash
# Update dependencies
pnpm update

# Check for breaking changes
pnpm outdated

# Test before deploying
pnpm build
pnpm start
```

## Support

After deployment, users can contact support via:
- Email: Set in `NEXT_PUBLIC_SUPPORT_EMAIL`
- In-app: Support link in footer and activation page
- Dashboard: Clerk's built-in user management

## Production URLs

Document your production endpoints:

- **Website**: https://yourdomain.com
- **API**: https://yourdomain.com/api
- **Zendit Webhook**: https://yourdomain.com/api/webhooks/zendit
- **Clerk Webhook**: https://yourdomain.com/api/webhooks/clerk
- **Admin Dashboard**: (if implemented)

## Troubleshooting Production Issues

### Purchases Not Saving
1. Check Supabase connection
2. Verify RLS policies
3. Check API logs for errors

### Emails Not Sending
1. Verify Resend domain authentication
2. Check email quota
3. Review email logs in Resend

### Authentication Issues
1. Verify Clerk keys
2. Check middleware configuration
3. Review Clerk logs

### Webhook Failures
1. Check webhook signature verification
2. Verify endpoint URLs
3. Monitor provider dashboards

## Success Metrics

Track these KPIs post-launch:

- Purchase conversion rate
- Activation success rate
- Email delivery rate
- API response times
- Error rates
- User retention
- PWA install rate
