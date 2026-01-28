# Bot Protection - Quick Start Guide
**Date:** January 27, 2025

---

## 🚀 5-Minute Setup

### Step 1: Install Dependencies ✅
```bash
pnpm add @upstash/ratelimit @upstash/redis @marsidev/react-turnstile
```
**Status:** ✅ Already installed

### Step 2: Set Up Upstash Redis
1. Go to https://upstash.com
2. Create account → Create Redis database
3. Copy REST URL and token
4. Add to `.env.local`:
```env
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### Step 3: Set Up Cloudflare Turnstile
1. Go to https://dash.cloudflare.com
2. Navigate to **Turnstile**
3. Click **Add Site**
4. Enter site name: `myumrahesim.com`
5. Copy **Site Key** and **Secret Key**
6. Add to `.env.local`:
```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAA...
TURNSTILE_SECRET_KEY=0x4AAA...
```

### Step 4: Test
```bash
# Start dev server
pnpm dev

# Test rate limiting (should block after 3 attempts)
curl -X POST http://localhost:3000/api/sign-up \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

## 📝 Quick Example

### Protect an Endpoint

```typescript
import { applyBotProtection } from "@/middleware/bot-protection";
import { paymentIntentLimiter } from "@/lib/bot-protection";

export async function POST(req: NextRequest) {
  // Apply protection
  const protection = await applyBotProtection(req, {
    rateLimiter: paymentIntentLimiter,
    requireTurnstile: false,
    challengeOnSuspicion: true,
  });

  if (!protection.allowed) {
    return protection.response;
  }

  // Your endpoint logic here
  return NextResponse.json({ success: true });
}
```

### Add Turnstile to Form

```typescript
import { TurnstileChallenge } from "@/components/turnstile-challenge";

<TurnstileChallenge
  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
  onSuccess={(token) => setToken(token)}
  mode="managed"
/>
```

---

## 🎯 Recommended Thresholds

| Endpoint | Rate Limit | Turnstile |
|----------|------------|-----------|
| Signup | 3/hour | Always |
| Login | 5/15min | On suspicion |
| Checkout | 10/min | On suspicion |
| Products | 30/min | On scraping |

---

## 📚 Full Documentation

- **Design:** `docs/BOT_PROTECTION_DESIGN.md`
- **Implementation:** `docs/BOT_PROTECTION_IMPLEMENTATION.md`
- **Summary:** `docs/BOT_PROTECTION_SUMMARY.md`

---

**Ready to implement!** See implementation guide for detailed code examples.
