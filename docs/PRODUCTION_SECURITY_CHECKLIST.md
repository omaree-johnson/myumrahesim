# Enterprise-Grade Production Security Checklist
**Date:** January 27, 2025  
**Application:** myumrahesim.com  
**Status:** Pre-Production Security Review

---

## Executive Summary

This checklist consolidates all security requirements for production deployment, organized by priority and deployment phase. Use this checklist before every production deploy and for ongoing security maintenance.

**Last Updated:** January 27, 2025  
**Next Review:** Quarterly

---

## 🔴 CRITICAL - Must Complete Before First Deploy

### Authentication & Session Security
- [ ] **Clerk Configuration**
  - [ ] Secure cookies enabled (HttpOnly, Secure, SameSite=Strict)
  - [ ] Session timeout configured (recommended: 30 days)
  - [ ] MFA enforcement enabled for admin accounts
  - [ ] Password policy enforced (min 8 chars, complexity)
  - [ ] Account lockout enabled (5 failed attempts)
  - [ ] Progressive delays enabled
  - [ ] Anomaly detection enabled

- [ ] **Rate Limiting**
  - [ ] Sign-in rate limiting: 5 attempts per 15 minutes per IP
  - [ ] Sign-up rate limiting: 3 attempts per hour per IP
  - [ ] Password reset rate limiting: 3 attempts per hour per IP
  - [ ] Redis-based distributed rate limiting configured (Upstash)
  - [ ] In-memory fallback tested

- [ ] **Database Security**
  - [ ] `failed_login_attempts` table created (migration 012)
  - [ ] `login_history` table created (migration 012)
  - [ ] `security_events` table created (migration 012)
  - [ ] RLS policies enabled
  - [ ] Service role key secured (never in client)

---

### Payment & Checkout Security
- [ ] **Price Verification**
  - [ ] Price verification in webhook handler
  - [ ] Expected prices stored in payment intent metadata
  - [ ] Server-side price calculation only
  - [ ] No client-side price manipulation possible

- [ ] **Payment Intent Security**
  - [ ] Secure idempotency keys (UUID-based)
  - [ ] No price tampering possible
  - [ ] Discount validation server-side
  - [ ] Minimum profit floor enforced

- [ ] **Webhook Security**
  - [ ] Signature verification enabled
  - [ ] Timestamp validation (< 5 minutes)
  - [ ] Event deduplication (event.id)
  - [ ] Atomic payment processing (race condition prevention)
  - [ ] Price verification on every payment

- [ ] **Database**
  - [ ] Payment intent atomic lock function created (migration 013)
  - [ ] Unique constraint on `stripe_payment_intent_id`
  - [ ] Race condition prevention tested

---

### Secrets Management
- [ ] **Environment Variables**
  - [ ] All required variables set in Vercel
  - [ ] No placeholder values (`your_*`, `placeholder`, `example`)
  - [ ] Separate keys for production/preview
  - [ ] Environment validation passes (`src/lib/env-validation.ts`)
  - [ ] No secrets in code or git

- [ ] **Server-Side Secrets (Never Expose)**
  - [ ] `STRIPE_SECRET_KEY` - Set and verified
  - [ ] `STRIPE_WEBHOOK_SECRET` - Set and verified
  - [ ] `CLERK_SECRET_KEY` - Set and verified
  - [ ] `CLERK_WEBHOOK_SECRET` - Set and verified
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` - Set and verified
  - [ ] `RESEND_API_KEY` - Set and verified
  - [ ] `ESIMACCESS_ACCESS_CODE` - Set and verified
  - [ ] `TURNSTILE_SECRET_KEY` - Set and verified
  - [ ] `UPSTASH_REDIS_REST_TOKEN` - Set and verified

- [ ] **Client-Safe Variables (NEXT_PUBLIC_ prefix)**
  - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Set
  - [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Set
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` - Set
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Set
  - [ ] `NEXT_PUBLIC_TURNSTILE_SITE_KEY` - Set
  - [ ] `NEXT_PUBLIC_BASE_URL` - Set to production URL

- [ ] **Logging Security**
  - [ ] No API key previews in logs
  - [ ] All logs use `secureLog()` utility
  - [ ] PII automatically sanitized
  - [ ] Secrets never logged

---

### Browser & Transport Security
- [ ] **HTTPS Enforcement**
  - [ ] HTTP → HTTPS redirect enabled (production)
  - [ ] HSTS header configured (1 year, includeSubDomains, preload)
  - [ ] HSTS only in production (not development)

- [ ] **Security Headers**
  - [ ] Content-Security-Policy configured
  - [ ] CSP uses `strict-dynamic` (no `unsafe-eval`)
  - [ ] X-Frame-Options: DENY (auth pages), SAMEORIGIN (others)
  - [ ] X-Content-Type-Options: nosniff
  - [ ] Referrer-Policy: strict-origin-when-cross-origin
  - [ ] Permissions-Policy: All unnecessary features disabled
  - [ ] Cross-Origin policies configured

- [ ] **Clickjacking Prevention**
  - [ ] CSP `frame-ancestors 'none'` for auth pages
  - [ ] CSP `frame-ancestors 'self'` for other pages
  - [ ] X-Frame-Options header set
  - [ ] Both CSP and X-Frame-Options applied

---

### API Security
- [ ] **Authorization**
  - [ ] All API routes require authentication (where needed)
  - [ ] Ownership verification for user resources
  - [ ] Admin endpoints protected
  - [ ] No IDOR vulnerabilities

- [ ] **Input Validation**
  - [ ] All requests validated with Zod schemas
  - [ ] `validateRequestBody()` used
  - [ ] `validateQueryParams()` used
  - [ ] `validateRouteParams()` used
  - [ ] No trust-on-client bugs

- [ ] **Rate Limiting**
  - [ ] Payment endpoints: 10 requests/minute
  - [ ] Product endpoints: 60 requests/minute
  - [ ] Order endpoints: 30 requests/minute
  - [ ] Distributed rate limiting (Redis) configured

---

### Bot & Abuse Protection
- [ ] **Cloudflare Turnstile**
  - [ ] Site key configured (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`)
  - [ ] Secret key configured (`TURNSTILE_SECRET_KEY`)
  - [ ] CSP allows `challenges.cloudflare.com`
  - [ ] Server-side verification implemented
  - [ ] Challenge escalation working

- [ ] **Upstash Redis**
  - [ ] Redis URL configured (`UPSTASH_REDIS_REST_URL`)
  - [ ] Redis token configured (`UPSTASH_REDIS_REST_TOKEN`)
  - [ ] Rate limiting using Redis
  - [ ] IP blocking using Redis
  - [ ] Challenge tracking using Redis

- [ ] **Bot Detection**
  - [ ] Bot signals detection implemented
  - [ ] Challenge escalation logic working
  - [ ] IP blocking for abuse
  - [ ] Abuse events logged

---

### Logging & Monitoring
- [ ] **Structured Logging**
  - [ ] Authentication events logged
  - [ ] Payment events logged
  - [ ] Abuse events logged
  - [ ] Security events logged
  - [ ] All logs use structured format

- [ ] **PII Protection**
  - [ ] All emails sanitized in logs
  - [ ] All names sanitized in logs
  - [ ] All amounts converted to ranges
  - [ ] All secrets redacted
  - [ ] No PII in console logs

- [ ] **Alert System**
  - [ ] Security alerts table created (migration 014)
  - [ ] Admin emails configured (`ADMIN_EMAILS`)
  - [ ] Critical alerts trigger automatically
  - [ ] High priority alerts trigger automatically
  - [ ] Alert testing completed

- [ ] **Database Logging**
  - [ ] `security_events` table operational
  - [ ] `security_alerts` table operational
  - [ ] `payment_actions` table operational
  - [ ] `webhook_events` table operational
  - [ ] All logging functions tested

---

## 🟠 HIGH PRIORITY - Complete Before First Deploy

### Database Security
- [ ] **Row Level Security (RLS)**
  - [ ] RLS enabled on all tables
  - [ ] Policies tested and verified
  - [ ] Service role bypasses RLS (server-side only)
  - [ ] Anon key respects RLS (client-side)

- [ ] **Database Access**
  - [ ] Service role key never exposed to client
  - [ ] Anon key has minimal permissions
  - [ ] Database connection encrypted (TLS)
  - [ ] Connection pooling configured

---

### Third-Party API Security
- [ ] **API Key Scoping**
  - [ ] Stripe keys have minimum required permissions
  - [ ] Supabase keys properly scoped
  - [ ] Resend API key has send-only access
  - [ ] eSIM Access key has minimum required access
  - [ ] Upstash Redis token has read/write only

- [ ] **Webhook Security**
  - [ ] Stripe webhook signature verification enabled
  - [ ] Clerk webhook signature verification enabled
  - [ ] eSIM Access IP validation enabled (production)
  - [ ] Webhook endpoints use HTTPS only
  - [ ] Webhook event deduplication working

---

### Data Protection
- [ ] **PII Handling**
  - [ ] Customer emails stored securely
  - [ ] Customer names stored securely
  - [ ] Payment data never stored (Stripe handles)
  - [ ] No card numbers in database
  - [ ] No CVV/CVC stored

- [ ] **Data Encryption**
  - [ ] Database encryption at rest (Supabase default)
  - [ ] TLS for all connections
  - [ ] Sensitive data encrypted in transit

---

## 🟡 MEDIUM PRIORITY - Complete Within First Week

### Performance & Reliability
- [ ] **Error Handling**
  - [ ] All errors handled gracefully
  - [ ] No sensitive data in error messages
  - [ ] Error logging implemented
  - [ ] Error monitoring configured

- [ ] **Timeouts**
  - [ ] API timeouts configured (5-10 seconds)
  - [ ] Database query timeouts set
  - [ ] External API timeouts set
  - [ ] Timeout errors handled

---

### Compliance
- [ ] **GDPR/CCPA**
  - [ ] Privacy policy published
  - [ ] Terms of service published
  - [ ] Cookie consent (if required)
  - [ ] Data retention policies defined
  - [ ] Right to deletion implemented

- [ ] **PCI DSS**
  - [ ] No card data stored
  - [ ] Stripe handles all card processing
  - [ ] PCI compliance verified with Stripe

---

### Documentation
- [ ] **Security Documentation**
  - [ ] Threat model documented
  - [ ] Security procedures documented
  - [ ] Incident response plan documented
  - [ ] Runbooks created
  - [ ] Team training completed

---

## 🟢 LOW PRIORITY - Ongoing Maintenance

### Regular Tasks
- [ ] **Weekly**
  - [ ] Review security alerts
  - [ ] Check for failed login spikes
  - [ ] Review payment fraud events
  - [ ] Monitor API error rates

- [ ] **Monthly**
  - [ ] Review and tune alert thresholds
  - [ ] Analyze false positive rates
  - [ ] Review access logs
  - [ ] Update security documentation

- [ ] **Quarterly**
  - [ ] Security audit
  - [ ] Penetration testing
  - [ ] Review and rotate API keys
  - [ ] Update dependencies
  - [ ] Review and update threat model
  - [ ] Incident response drill

---

## 📋 Pre-Deploy Checklist (Every Deploy)

### Code Security
- [ ] **No Secrets in Code**
  - [ ] No hardcoded API keys
  - [ ] No hardcoded passwords
  - [ ] No secrets in comments
  - [ ] No secrets in config files

- [ ] **No PII in Logs**
  - [ ] All logging uses `secureLog()`
  - [ ] No `console.log()` with PII
  - [ ] No email addresses in logs
  - [ ] No payment amounts in logs

- [ ] **Input Validation**
  - [ ] All API routes use Zod validation
  - [ ] All user inputs sanitized
  - [ ] SQL injection prevention verified
  - [ ] XSS prevention verified

---

### Configuration
- [ ] **Environment Variables**
  - [ ] All required variables set
  - [ ] No placeholder values
  - [ ] Environment validation passes
  - [ ] Production values different from dev

- [ ] **Security Headers**
  - [ ] HTTPS enforcement enabled
  - [ ] HSTS header configured
  - [ ] CSP configured correctly
  - [ ] All security headers present

- [ ] **Third-Party Services**
  - [ ] Stripe keys valid
  - [ ] Clerk keys valid
  - [ ] Supabase connection working
  - [ ] Resend API working
  - [ ] eSIM Access API working
  - [ ] Upstash Redis working
  - [ ] Cloudflare Turnstile working

---

### Testing
- [ ] **Security Tests**
  - [ ] Authentication flows tested
  - [ ] Payment flows tested
  - [ ] Rate limiting tested
  - [ ] Bot protection tested
  - [ ] Error handling tested

- [ ] **Integration Tests**
  - [ ] Webhook handlers tested
  - [ ] API routes tested
  - [ ] Database operations tested
  - [ ] Email sending tested

---

## 🔄 Ongoing Maintenance Tasks

### Daily
- [ ] Monitor security alerts
- [ ] Check for critical events
- [ ] Review error logs
- [ ] Verify monitoring systems operational

### Weekly
- [ ] Review security event logs
- [ ] Analyze attack patterns
- [ ] Tune alert thresholds
- [ ] Review blocked IPs
- [ ] Check for suspicious activity

### Monthly
- [ ] Review and update security policies
- [ ] Analyze false positive rates
- [ ] Review access patterns
- [ ] Update security documentation
- [ ] Review third-party service security

### Quarterly
- [ ] Full security audit
- [ ] Penetration testing
- [ ] Dependency updates
- [ ] API key rotation
- [ ] Threat model review
- [ ] Incident response drill
- [ ] Team security training

---

## 🚨 Critical Pre-Deploy Verification

### Must Verify Before Every Deploy

1. **Environment Variables**
   ```bash
   # Verify all required variables set
   # Check for placeholder values
   # Verify production values
   ```

2. **Security Headers**
   ```bash
   # Test HTTPS redirect
   curl -I http://myumrahesim.com
   # Should redirect to HTTPS
   
   # Check security headers
   curl -I https://myumrahesim.com
   # Should include: HSTS, CSP, X-Frame-Options, etc.
   ```

3. **Authentication**
   ```bash
   # Test sign-in flow
   # Test rate limiting
   # Test account lockout
   ```

4. **Payment Security**
   ```bash
   # Test payment intent creation
   # Test webhook signature verification
   # Test price verification
   ```

5. **Logging**
   ```bash
   # Verify no PII in logs
   # Verify no secrets in logs
   # Test structured logging
   ```

---

## 📊 Security Metrics to Monitor

### Key Metrics
- **Mean Time to Detect (MTTD):** < 15 minutes
- **Mean Time to Respond (MTTR):** < 1 hour
- **Alert Accuracy:** > 90%
- **False Positive Rate:** < 10%
- **Security Event Rate:** Monitor trends
- **Failed Login Rate:** Monitor trends
- **Payment Fraud Rate:** Monitor trends

### Dashboards
- [ ] Security events dashboard
- [ ] Payment events dashboard
- [ ] Abuse events dashboard
- [ ] System health dashboard
- [ ] Alert dashboard

---

## 🔍 Future Audit Recommendations

### Quarterly Audits
1. **Security Configuration Review**
   - Review all security settings
   - Verify no configuration drift
   - Check for new vulnerabilities
   - Update security policies

2. **Code Security Audit**
   - Review new code for security issues
   - Check for new dependencies
   - Verify input validation
   - Check for new attack vectors

3. **Third-Party Security**
   - Review third-party service security
   - Check for service updates
   - Verify API key permissions
   - Review service security policies

4. **Access Control Review**
   - Review user access patterns
   - Check for unauthorized access
   - Verify admin access controls
   - Review API access patterns

### Annual Audits
1. **Penetration Testing**
   - External penetration test
   - Internal security review
   - Social engineering test
   - Physical security review

2. **Compliance Audit**
   - GDPR/CCPA compliance
   - PCI DSS compliance (if applicable)
   - Industry-specific compliance
   - Regulatory requirements

3. **Threat Model Update**
   - Review threat model
   - Update based on new threats
   - Review attack patterns
   - Update security controls

4. **Disaster Recovery**
   - Test backup and restore
   - Test failover procedures
   - Review recovery time objectives
   - Update disaster recovery plan

---

## 📚 Security Documentation Checklist

- [ ] Threat model documented (`docs/THREAT_MODEL.md`)
- [ ] Security priority actions (`docs/SECURITY_PRIORITY_ACTIONS.md`)
- [ ] Authentication security audit (`docs/AUTHENTICATION_SECURITY_AUDIT.md`)
- [ ] API security audit (`docs/API_SECURITY_AUDIT.md`)
- [ ] Payment security audit (`docs/PAYMENT_SECURITY_AUDIT.md`)
- [ ] Secrets management audit (`docs/SECRETS_MANAGEMENT_AUDIT.md`)
- [ ] Browser security audit (`docs/BROWSER_SECURITY_AUDIT.md`)
- [ ] Logging strategy (`docs/LOGGING_MONITORING_AUDIT.md`)
- [ ] Incident response plan (`docs/INCIDENT_RESPONSE_CHECKLIST.md`)

---

## ✅ Deployment Readiness Score

### Scoring
- **Critical Items:** All must be ✅ (100%)
- **High Priority:** 90%+ must be ✅
- **Medium Priority:** 80%+ must be ✅
- **Low Priority:** 70%+ must be ✅

### Current Status
- Critical: ___ / ___ (___%)
- High: ___ / ___ (___%)
- Medium: ___ / ___ (___%)
- Low: ___ / ___ (___%)

**Overall Readiness:** ___%

---

## 🎯 Quick Reference

### Critical Before Deploy
1. ✅ All environment variables set
2. ✅ HTTPS enforcement enabled
3. ✅ Security headers configured
4. ✅ Price verification in webhooks
5. ✅ No secrets in logs
6. ✅ Authentication rate limiting
7. ✅ Bot protection enabled
8. ✅ Alert system configured

### Must Test
1. ✅ Sign-in flow
2. ✅ Payment flow
3. ✅ Webhook processing
4. ✅ Rate limiting
5. ✅ Bot detection
6. ✅ Security headers
7. ✅ HTTPS redirect

### Must Monitor
1. ✅ Security alerts
2. ✅ Failed logins
3. ✅ Payment fraud
4. ✅ API errors
5. ✅ System health

---

**Last Updated:** January 27, 2025  
**Next Review:** April 27, 2025 (Quarterly)
