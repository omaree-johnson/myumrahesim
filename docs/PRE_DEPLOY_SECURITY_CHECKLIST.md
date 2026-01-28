# Pre-Deploy Security Checklist
**Date:** January 27, 2025  
**Use:** Before every production deployment

---

## ⚡ Quick Pre-Deploy Check (5 minutes)

### Critical Items (Must Pass)
- [ ] Environment validation passes (`npm run build` should not fail)
- [ ] No secrets in code (grep for `sk_`, `pk_`, `secret`, `password`)
- [ ] No PII in logs (all use `secureLog()`)
- [ ] HTTPS redirect works (`curl -I http://myumrahesim.com`)
- [ ] Security headers present (`curl -I https://myumrahesim.com`)
- [ ] All required env vars set in Vercel
- [ ] No placeholder values in env vars

---

## 🔴 Critical Checks (15 minutes)

### 1. Environment Variables
```bash
# Verify in Vercel Dashboard → Settings → Environment Variables
- [ ] STRIPE_SECRET_KEY (production key)
- [ ] STRIPE_WEBHOOK_SECRET
- [ ] CLERK_SECRET_KEY (production key)
- [ ] CLERK_WEBHOOK_SECRET
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] RESEND_API_KEY
- [ ] ESIMACCESS_ACCESS_CODE
- [ ] TURNSTILE_SECRET_KEY
- [ ] UPSTASH_REDIS_REST_TOKEN
- [ ] ADMIN_EMAILS (comma-separated)
```

### 2. Security Headers
```bash
# Test HTTPS redirect
curl -I http://myumrahesim.com
# Expected: 301 redirect to HTTPS

# Test security headers
curl -I https://myumrahesim.com | grep -i "strict-transport-security\|content-security-policy\|x-frame-options"
# Expected: All headers present
```

### 3. Authentication
- [ ] Sign-in works
- [ ] Rate limiting works (try 6+ failed logins)
- [ ] Account lockout works
- [ ] Suspicious login detection works

### 4. Payment Security
- [ ] Payment intent creation works
- [ ] Webhook signature verification works
- [ ] Price verification in webhook works
- [ ] No price tampering possible

### 5. Logging
- [ ] No API keys in logs (grep logs for key patterns)
- [ ] No PII in logs (grep logs for emails)
- [ ] Structured logging works
- [ ] Alerts trigger correctly

---

## 🟠 High Priority Checks (10 minutes)

### 1. Bot Protection
- [ ] Turnstile configured
- [ ] Redis rate limiting works
- [ ] IP blocking works
- [ ] Challenge escalation works

### 2. API Security
- [ ] All routes require auth (where needed)
- [ ] Input validation works (Zod schemas)
- [ ] Rate limiting works
- [ ] No IDOR vulnerabilities

### 3. Database
- [ ] RLS enabled
- [ ] Service role key secured
- [ ] All migrations applied
- [ ] Backup working

---

## 🟡 Medium Priority Checks (5 minutes)

### 1. Third-Party Services
- [ ] Stripe webhooks configured
- [ ] Clerk webhooks configured
- [ ] Resend emails working
- [ ] eSIM Access API working

### 2. Monitoring
- [ ] Alerts configured
- [ ] Dashboard accessible
- [ ] Logs centralized
- [ ] Metrics tracked

---

## ✅ Deployment Approval

### Sign-Off Required
- [ ] **Security Lead:** All critical items verified
- [ ] **Technical Lead:** All systems operational
- [ ] **QA Lead:** All tests passed

### Deployment Notes
```
Date: ___________
Deployed by: ___________
Version: ___________
Critical Changes: ___________
Security Notes: ___________
```

---

**See Full Checklist:** `docs/PRODUCTION_SECURITY_CHECKLIST.md`
