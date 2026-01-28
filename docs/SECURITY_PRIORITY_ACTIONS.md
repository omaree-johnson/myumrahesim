# Security Priority Actions - Quick Reference
**Date:** January 27, 2025  
**Based on:** Threat Model Analysis

---

## 🔴 CRITICAL - Fix Immediately (Week 1)

### 1. Payment Amount Manipulation
**Risk Score: 25/25**  
**Fix:** Server-side price verification against eSIM Access API

**Actions:**
```typescript
// In create-payment-intent route
const packageData = await getEsimPackage(offerId);
const expectedPrice = calculatePrice(packageData); // Server-side calculation
if (clientPrice !== expectedPrice) {
  return error("Price mismatch");
}
```

**Files to Update:**
- `src/app/api/create-payment-intent/route.ts`
- `src/app/api/create-cart-payment-intent/route.ts`
- `src/app/api/create-topup-payment-intent/route.ts`

---

### 2. Webhook Security
**Risk Score: 20/25**  
**Fix:** Never disable IP validation, add event deduplication

**Actions:**
- Remove or restrict `ESIMACCESS_SKIP_IP_VALIDATION` (dev-only)
- Add Stripe event.id deduplication
- Add timestamp validation (reject >5 min old)

**Files to Update:**
- `src/app/api/webhooks/stripe/route.ts`
- `src/app/api/webhooks/esimaccess/route.ts`

---

### 3. Rate Limiting (Multi-Instance)
**Risk Score: 18/25**  
**Fix:** Implement Redis-based distributed rate limiting

**Actions:**
```bash
pnpm add @upstash/ratelimit @upstash/redis
```

**Files to Update:**
- `src/lib/security.ts` (replace in-memory Map)
- All API routes using `checkRateLimit`

---

### 4. eSIM QR Code Protection
**Risk Score: 20/25**  
**Fix:** Secure transaction IDs, require auth for QR access

**Actions:**
- Use UUIDs for transaction IDs (not sequential)
- Require email verification OR auth for QR code endpoint
- Add time-limited access tokens

**Files to Update:**
- `src/app/api/webhooks/stripe/route.ts` (transaction ID generation)
- `src/app/api/purchases/[transactionId]/qrcode/route.ts`

---

### 5. Discount Code Abuse
**Risk Score: 20/25**  
**Fix:** CAPTCHA, complex codes, distributed rate limiting

**Actions:**
- Add CAPTCHA to discount code entry
- Generate longer, random discount codes
- Implement Redis rate limiting

**Files to Update:**
- `src/lib/discounts.ts`
- Checkout components

---

## 🟡 HIGH PRIORITY - Fix Within 2 Weeks

### 6. Account Takeover Prevention
- Enable MFA enforcement in Clerk dashboard
- Configure account lockout policies
- Add suspicious login detection

### 7. Database Security
- Audit all Supabase queries
- Implement RLS policies
- Rotate service role keys

### 8. API Key Management
- Implement key rotation schedule
- Add usage monitoring
- Enable IP whitelisting on eSIM Access

### 9. XSS Protection
- Implement strict CSP
- Replace basic sanitization with DOMPurify
- Add output encoding

---

## 📊 Risk Summary

| Risk | Score | Priority | Timeline |
|------|-------|----------|----------|
| Payment Amount Manipulation | 25 | 🔴 Critical | Week 1 |
| Webhook Security | 20 | 🔴 Critical | Week 1 |
| eSIM QR Code Theft | 20 | 🔴 Critical | Week 1 |
| Discount Code Abuse | 20 | 🔴 Critical | Week 1 |
| Rate Limiting Bypass | 18 | 🔴 Critical | Week 1 |
| Account Takeover | 18 | 🟡 High | Week 2 |
| SQL Injection | 16 | 🟡 High | Week 2 |
| API Key Exposure | 15 | 🟡 High | Week 2 |
| XSS Attacks | 15 | 🟡 High | Week 2 |
| Email Enumeration | 12 | 🟢 Medium | Month 1 |

---

## 🚨 Immediate Actions Checklist

### This Week
- [ ] Implement server-side price verification
- [ ] Fix webhook IP validation (never disable in prod)
- [ ] Add Redis-based rate limiting
- [ ] Secure transaction ID generation (UUIDs)
- [ ] Add CAPTCHA to discount codes
- [ ] Add webhook event deduplication

### Next Week
- [ ] Enable MFA enforcement
- [ ] Audit database queries
- [ ] Implement RLS policies
- [ ] Add API key monitoring
- [ ] Implement strict CSP
- [ ] Replace HTML sanitization with DOMPurify

---

**See full threat model:** `docs/THREAT_MODEL.md`
