# Threat Model: My Umrah eSIM Application
**Date:** January 27, 2025  
**Application:** myumrahesim.com  
**Technology Stack:** Next.js 16, React 19, Clerk Auth, Stripe Payments, eSIM Access API, Supabase

---

## Executive Summary

This threat model identifies security risks across the My Umrah eSIM application, which handles authentication, payments, and eSIM provisioning. The application processes sensitive financial transactions and personal data, making it a high-value target for attackers.

**Risk Level:** HIGH  
**Primary Concerns:** Payment fraud, account takeover, eSIM theft, financial loss

---

## 1. Application Architecture

### Technology Stack
- **Frontend:** Next.js 16, React 19, TypeScript
- **Authentication:** Clerk (OAuth, email/password)
- **Payments:** Stripe (Payment Intents, Webhooks)
- **eSIM Provisioning:** eSIM Access API
- **Database:** Supabase (PostgreSQL)
- **Email:** Resend API
- **Hosting:** Vercel (assumed)

### Data Flow
1. **User Registration/Login** → Clerk → Supabase (customer sync)
2. **Product Selection** → `/api/products` → eSIM Access API (cached)
3. **Checkout** → `/api/create-payment-intent` → Stripe
4. **Payment Success** → Stripe Webhook → `/api/webhooks/stripe` → eSIM Access API → Email
5. **eSIM Activation** → eSIM Access Webhook → `/api/webhooks/esimaccess` → Email with QR code

### Critical Assets
- **Financial:** Stripe payment intents, customer payment methods
- **Personal Data:** Email addresses, names, transaction IDs
- **eSIM Credentials:** QR codes, activation codes, ICCIDs, SM-DP+ addresses
- **Business Logic:** Discount codes, pricing calculations, profit margins
- **API Credentials:** eSIM Access access code, Stripe keys, Supabase keys

---

## 2. Attack Surfaces

### 2.1 Frontend Attack Surfaces

#### Client-Side JavaScript
- **XSS (Cross-Site Scripting):** User-generated content, React components
- **CSRF (Cross-Site Request Forgery):** API calls, payment intents
- **Clickjacking:** Payment forms, checkout flows
- **Client-Side Data Exposure:** API keys in client code, sensitive data in localStorage

#### User Input Points
- Email addresses (checkout, registration)
- Names (checkout, registration)
- Discount codes (checkout)
- Cart items (quantity, offer IDs)
- Search/filter parameters

#### Authentication Flows
- Clerk sign-in/sign-up pages
- OAuth redirects
- Session management
- Password reset flows

### 2.2 API Endpoints Attack Surfaces

#### Public APIs (No Auth Required)
- `GET /api/products` - Product listing (rate limited: 30/min)
- `GET /api/health` - Health check
- `POST /api/webhooks/stripe` - Stripe webhook (signature verified)
- `POST /api/webhooks/esimaccess` - eSIM Access webhook (IP whitelist, can be disabled)

#### Protected APIs (Auth Required)
- `GET /api/orders` - User orders (Clerk auth)
- `GET /api/purchases/[transactionId]` - Purchase status (rate limited: 20/min)

#### Payment APIs (Rate Limited)
- `POST /api/create-payment-intent` - Create Stripe payment (10/min)
- `POST /api/create-cart-payment-intent` - Cart checkout (10/min)
- `POST /api/create-topup-payment-intent` - Top-up payment (10/min)
- `POST /api/update-payment-intent` - Update payment metadata
- `POST /api/orders` - Direct eSIM purchase (10/min)

#### Other APIs
- `POST /api/cart/reminders` - Cart abandonment emails (10/min)
- `POST /api/reviews` - Customer reviews
- `GET /api/purchases/[transactionId]/qrcode` - QR code retrieval

### 2.3 Authentication Attack Surfaces

#### Clerk Integration
- **Session Hijacking:** Stolen session tokens
- **Account Takeover:** Weak passwords, credential stuffing
- **OAuth Vulnerabilities:** Redirect URI manipulation, state parameter issues
- **Multi-Factor Authentication:** Bypass attempts, SIM swapping

#### Route Protection
- Middleware-based protection (`/orders`, `/dashboard`)
- Client-side auth checks
- Server-side auth verification

### 2.4 Payment Processing Attack Surfaces

#### Stripe Integration
- **Payment Intent Manipulation:** Amount tampering, metadata injection
- **Webhook Replay Attacks:** Duplicate webhook processing
- **Card Testing:** Automated card validation attempts
- **Refund Fraud:** Unauthorized refund requests
- **Chargeback Fraud:** Disputed legitimate transactions

#### Payment Flow Vulnerabilities
- **Race Conditions:** Concurrent payment intent creation
- **Idempotency Issues:** Duplicate payment processing
- **Price Manipulation:** Client-side price validation bypass
- **Discount Code Abuse:** Unlimited discount usage, code enumeration

### 2.5 eSIM Provisioning Attack Surfaces

#### eSIM Access API
- **API Key Exposure:** Access code in environment variables
- **Rate Limiting Bypass:** eSIM Access allows 8 req/sec (not enforced in app)
- **Order Manipulation:** Package code injection, price manipulation
- **Webhook Spoofing:** IP whitelist can be disabled (`ESIMACCESS_SKIP_IP_VALIDATION=true`)

#### eSIM Data Exposure
- **QR Code Theft:** Unauthorized access to activation QR codes
- **ICCID Enumeration:** Sequential transaction ID guessing
- **Activation Code Reuse:** Replay of activation codes

### 2.6 Database Attack Surfaces

#### Supabase
- **SQL Injection:** Parameterized queries (mitigated, but verify all queries)
- **Row Level Security (RLS):** Policy bypass, misconfigured policies
- **Data Exposure:** Unauthorized access to customer data, purchase history
- **Privilege Escalation:** Service role key exposure

### 2.7 Email Attack Surfaces

#### Resend API
- **Email Spoofing:** From address manipulation
- **Email Injection:** SMTP header injection
- **Phishing:** Malicious links in emails
- **Email Enumeration:** User discovery via email validation

### 2.8 Third-Party API Attack Surfaces

#### eSIM Access API
- **API Key Theft:** Access code exposure
- **Rate Limit Abuse:** 8 req/sec limit not enforced
- **Response Manipulation:** Malicious responses from compromised provider
- **Webhook IP Spoofing:** IP whitelist disabled in production

#### Stripe API
- **Webhook Signature Forgery:** Weak signature verification
- **Event Replay:** Duplicate event processing
- **Metadata Injection:** Malicious metadata in payment intents

---

## 3. Threat Actors

### 3.1 Script Kiddies / Automated Bots
**Capability:** Low-Medium  
**Motivation:** Automated scanning, basic attacks  
**Likelihood:** HIGH

**Attack Methods:**
- Automated vulnerability scanning
- SQL injection attempts
- XSS payload testing
- Rate limit testing
- API endpoint enumeration

**Impact:** Low-Medium (DoS, data scraping, resource exhaustion)

### 3.2 Fraudsters / Card Testers
**Capability:** Medium  
**Motivation:** Financial gain, free eSIMs  
**Likelihood:** HIGH

**Attack Methods:**
- Stolen credit card testing
- Payment amount manipulation
- Discount code enumeration
- Free eSIM acquisition via refund abuse
- Chargeback fraud

**Impact:** HIGH (Financial loss, inventory theft, chargeback fees)

### 3.3 Account Takeover (ATO) Attackers
**Capability:** Medium-High  
**Motivation:** Access to user accounts, purchase history  
**Likelihood:** MEDIUM

**Attack Methods:**
- Credential stuffing
- Password spraying
- Session hijacking
- OAuth redirect manipulation
- Social engineering

**Impact:** HIGH (User data exposure, unauthorized purchases, reputation damage)

### 3.4 Advanced Persistent Threats (APTs)
**Capability:** High  
**Motivation:** Long-term access, data exfiltration  
**Likelihood:** LOW

**Attack Methods:**
- Supply chain attacks
- Zero-day exploits
- Advanced malware
- Insider threats
- Infrastructure compromise

**Impact:** CRITICAL (Complete system compromise, data breach, business disruption)

### 3.5 Competitors / Business Intelligence
**Capability:** Medium  
**Motivation:** Competitive intelligence, pricing data  
**Likelihood:** LOW-MEDIUM

**Attack Methods:**
- Price scraping
- Product catalog enumeration
- Business logic reverse engineering
- API endpoint discovery

**Impact:** LOW-MEDIUM (Competitive disadvantage, pricing strategy exposure)

### 3.6 Insiders
**Capability:** High (legitimate access)  
**Motivation:** Financial gain, data theft, sabotage  
**Likelihood:** LOW

**Attack Methods:**
- Privilege abuse
- Data exfiltration
- Backdoor installation
- Credential sharing
- Unauthorized access

**Impact:** CRITICAL (Complete data access, financial fraud, system compromise)

---

## 4. Risk Assessment Matrix

### Risk Calculation
**Risk Score = Impact × Likelihood**

**Impact Levels:**
- **CRITICAL (5):** Complete system compromise, financial loss >$10k, data breach
- **HIGH (4):** Significant financial loss ($1k-$10k), user data exposure, service disruption
- **MEDIUM (3):** Moderate financial loss ($100-$1k), limited data exposure, degraded service
- **LOW (2):** Minor financial loss (<$100), minimal data exposure, no service impact
- **VERY LOW (1):** Negligible impact

**Likelihood Levels:**
- **VERY HIGH (5):** Expected to occur frequently (daily/weekly)
- **HIGH (4):** Likely to occur (monthly)
- **MEDIUM (3):** Possible occurrence (quarterly)
- **LOW (2):** Unlikely but possible (annually)
- **VERY LOW (1):** Rare occurrence (once every few years)

---

## 5. Top 10 Most Critical Risks

### Risk #1: Payment Amount Manipulation
**Risk Score: 25 (Impact: 5 × Likelihood: 5)**  
**CRITICAL**

**Description:**  
Attacker manipulates payment amount client-side or intercepts payment intent creation to pay less than intended.

**Attack Vector:**
- Client-side price validation bypass
- Payment intent metadata manipulation
- Race condition in price calculation
- Discount code abuse (unlimited usage)

**Current Mitigations:**
- ✅ Server-side price validation
- ✅ Discount code reservation system
- ⚠️ In-memory rate limiting (not distributed)
- ❌ No server-side price verification against eSIM Access API

**Recommendations:**
1. **IMMEDIATE:** Verify payment amount against eSIM Access API before creating payment intent
2. **IMMEDIATE:** Implement server-side price calculation (never trust client)
3. **HIGH:** Add Redis-based distributed rate limiting
4. **HIGH:** Implement idempotency keys for all payment operations
5. **MEDIUM:** Add fraud detection (unusual amounts, velocity checks)

**Priority:** 🔴 **LOCK DOWN FIRST**

---

### Risk #2: Webhook Signature Bypass / Replay Attacks
**Risk Score: 20 (Impact: 5 × Likelihood: 4)**  
**CRITICAL**

**Description:**  
Attacker replays Stripe webhook events or bypasses signature verification to trigger duplicate eSIM provisioning.

**Attack Vector:**
- Webhook signature forgery
- Event replay attacks
- Duplicate webhook processing
- eSIM Access webhook IP whitelist disabled

**Current Mitigations:**
- ✅ Stripe webhook signature verification
- ✅ Idempotency checks (payment intent ID)
- ⚠️ eSIM Access IP whitelist can be disabled (`ESIMACCESS_SKIP_IP_VALIDATION=true`)
- ⚠️ No webhook event deduplication beyond payment intent ID

**Recommendations:**
1. **IMMEDIATE:** Never disable eSIM Access IP validation in production
2. **IMMEDIATE:** Add webhook event ID deduplication (Stripe event.id)
3. **HIGH:** Implement webhook event logging with unique constraints
4. **HIGH:** Add timestamp validation (reject events >5 minutes old)
5. **MEDIUM:** Monitor for duplicate webhook patterns

**Priority:** 🔴 **LOCK DOWN FIRST**

---

### Risk #3: Discount Code Enumeration & Abuse
**Risk Score: 20 (Impact: 4 × Likelihood: 5)**  
**HIGH**

**Description:**  
Attacker enumerates discount codes or abuses discount system to get free/cheap eSIMs.

**Attack Vector:**
- Code enumeration (brute force, pattern guessing)
- Unlimited discount usage (bypass max_redemptions)
- Discount code reuse (same code multiple times)
- Race conditions in discount reservation

**Current Mitigations:**
- ✅ Discount code normalization
- ✅ Reservation system (prevents double-spend)
- ✅ Max redemptions check
- ⚠️ In-memory rate limiting (bypassable in multi-instance)
- ❌ No CAPTCHA on discount code entry
- ❌ No discount code complexity requirements

**Recommendations:**
1. **IMMEDIATE:** Add CAPTCHA to discount code entry
2. **IMMEDIATE:** Implement Redis-based distributed rate limiting
3. **HIGH:** Add discount code complexity (longer, random codes)
4. **HIGH:** Monitor for discount code enumeration patterns
5. **MEDIUM:** Add per-IP discount attempt limits

**Priority:** 🔴 **LOCK DOWN FIRST**

---

### Risk #4: eSIM QR Code Theft / Unauthorized Access
**Risk Score: 20 (Impact: 5 × Likelihood: 4)**  
**CRITICAL**

**Description:**  
Attacker gains unauthorized access to eSIM activation QR codes, allowing them to activate eSIMs on their devices.

**Attack Vector:**
- Transaction ID enumeration (sequential guessing)
- Unauthorized access to `/api/purchases/[transactionId]/qrcode`
- Email interception (SMTP compromise, email account takeover)
- Database breach (Supabase compromise)
- API response interception (man-in-the-middle)

**Current Mitigations:**
- ✅ Transaction ID validation (format check)
- ⚠️ Rate limiting on purchase endpoints (20/min, in-memory)
- ⚠️ No authentication required for QR code endpoint (if transaction ID known)
- ❌ No transaction ID complexity (predictable patterns)
- ❌ No email encryption (QR codes sent in plaintext)

**Recommendations:**
1. **IMMEDIATE:** Require authentication OR email verification for QR code access
2. **IMMEDIATE:** Use cryptographically secure transaction IDs (UUIDs, not sequential)
3. **HIGH:** Add time-limited access tokens for QR code URLs
4. **HIGH:** Implement email encryption (PGP, or use secure links)
5. **MEDIUM:** Add audit logging for QR code access

**Priority:** 🔴 **LOCK DOWN FIRST**

---

### Risk #5: Account Takeover (ATO) via Credential Stuffing
**Risk Score: 18 (Impact: 4 × Likelihood: 4.5)**  
**HIGH**

**Description:**  
Attacker uses stolen credentials to gain unauthorized access to user accounts, accessing purchase history and personal data.

**Attack Vector:**
- Credential stuffing (automated login attempts)
- Password spraying (common passwords)
- Session hijacking (XSS, MITM)
- OAuth redirect manipulation
- Weak password policies

**Current Mitigations:**
- ✅ Clerk handles authentication (industry-standard)
- ✅ OAuth providers (Google, etc.)
- ⚠️ No account lockout after failed attempts (Clerk default)
- ⚠️ No password complexity requirements visible
- ❌ No MFA enforcement
- ❌ No suspicious login detection

**Recommendations:**
1. **HIGH:** Enable MFA enforcement in Clerk
2. **HIGH:** Configure account lockout policies
3. **HIGH:** Monitor for credential stuffing patterns
4. **MEDIUM:** Add suspicious login detection (new device, location)
5. **MEDIUM:** Implement password strength requirements

**Priority:** 🟡 **HIGH PRIORITY**

---

### Risk #6: Rate Limiting Bypass (Multi-Instance)
**Risk Score: 18 (Impact: 3 × Likelihood: 6)**  
**HIGH**

**Description:**  
In-memory rate limiting is bypassed in multi-instance deployments (Vercel serverless), allowing unlimited API abuse.

**Attack Vector:**
- Distributed requests across multiple instances
- Rate limit store not shared (in-memory Map)
- DoS attacks bypass rate limits
- API scraping at scale

**Current Mitigations:**
- ✅ Rate limiting implemented (in-memory)
- ✅ Rate limit headers in responses
- ❌ **CRITICAL:** Not distributed (won't work in serverless)
- ❌ No Redis-based rate limiting
- ❌ No WAF (Web Application Firewall)

**Recommendations:**
1. **IMMEDIATE:** Implement Redis-based rate limiting (Upstash, Vercel Edge Config)
2. **IMMEDIATE:** Add WAF (Cloudflare, AWS WAF)
3. **HIGH:** Implement per-user rate limits (not just IP)
4. **HIGH:** Add progressive rate limiting (stricter after violations)
5. **MEDIUM:** Monitor rate limit violations

**Priority:** 🔴 **LOCK DOWN FIRST**

---

### Risk #7: SQL Injection / Database Compromise
**Risk Score: 16 (Impact: 5 × Likelihood: 3.2)**  
**HIGH**

**Description:**  
Attacker injects malicious SQL queries to access, modify, or delete database records.

**Attack Vector:**
- Unparameterized queries
- Supabase client injection
- RLS policy bypass
- Service role key exposure

**Current Mitigations:**
- ✅ Supabase client (parameterized queries by default)
- ✅ RLS policies (if configured)
- ⚠️ Service role key in environment (if exposed, full access)
- ❌ No query audit logging
- ❌ No input validation on all database queries

**Recommendations:**
1. **HIGH:** Audit all database queries for parameterization
2. **HIGH:** Implement RLS policies on all tables
3. **HIGH:** Rotate service role keys regularly
4. **MEDIUM:** Add database query logging
5. **MEDIUM:** Implement database access monitoring

**Priority:** 🟡 **HIGH PRIORITY**

---

### Risk #8: eSIM Access API Key Exposure
**Risk Score: 15 (Impact: 5 × Likelihood: 3)**  
**HIGH**

**Description:**  
eSIM Access API access code is exposed, allowing attacker to provision eSIMs directly or drain account balance.

**Attack Vector:**
- Environment variable exposure (Git commits, logs, error messages)
- Client-side code inspection (if accidentally exposed)
- Server compromise
- Third-party service breach

**Current Mitigations:**
- ✅ Access code in server-side environment variables
- ✅ Not exposed in client code
- ⚠️ No key rotation policy
- ⚠️ No API key usage monitoring
- ❌ No IP whitelisting on eSIM Access account (if available)

**Recommendations:**
1. **HIGH:** Implement API key rotation schedule
2. **HIGH:** Add API key usage monitoring (unusual patterns)
3. **HIGH:** Enable IP whitelisting on eSIM Access account (if available)
4. **MEDIUM:** Implement API key scoping (read-only keys where possible)
5. **MEDIUM:** Add alerts for unusual API activity

**Priority:** 🟡 **HIGH PRIORITY**

---

### Risk #9: Cross-Site Scripting (XSS)
**Risk Score: 15 (Impact: 4 × Likelihood: 3.75)**  
**HIGH**

**Description:**  
Attacker injects malicious JavaScript that executes in user's browser, stealing session tokens, payment data, or performing actions on behalf of user.

**Attack Vector:**
- User-generated content (reviews, names, emails)
- React component vulnerabilities
- Third-party script injection
- DOM manipulation attacks

**Current Mitigations:**
- ✅ React's built-in XSS protection (JSX escaping)
- ✅ Input sanitization (`sanitizeString`, `sanitizeHTML`)
- ⚠️ Basic HTML sanitization (not comprehensive)
- ❌ No Content Security Policy (CSP) enforcement
- ❌ No output encoding verification

**Recommendations:**
1. **HIGH:** Implement strict Content Security Policy (CSP)
2. **HIGH:** Use DOMPurify for HTML sanitization (replace basic implementation)
3. **HIGH:** Add output encoding for all user-generated content
4. **MEDIUM:** Regular XSS vulnerability scanning
5. **MEDIUM:** Implement Subresource Integrity (SRI) for third-party scripts

**Priority:** 🟡 **HIGH PRIORITY**

---

### Risk #10: Email Enumeration & Phishing
**Risk Score: 12 (Impact: 3 × Likelihood: 4)**  
**MEDIUM-HIGH**

**Description:**  
Attacker enumerates valid email addresses or sends phishing emails to users, leading to account compromise or credential theft.

**Attack Vector:**
- Email validation endpoint enumeration
- Password reset flow enumeration
- Phishing emails (fake activation emails)
- Email spoofing (From address manipulation)

**Current Mitigations:**
- ✅ Resend API (handles email sending)
- ⚠️ Email validation in checkout (may reveal valid emails)
- ❌ No rate limiting on email-related endpoints
- ❌ No email verification requirements
- ❌ No SPF/DKIM/DMARC verification

**Recommendations:**
1. **MEDIUM:** Implement consistent error messages (don't reveal email existence)
2. **MEDIUM:** Add rate limiting on email-related endpoints
3. **MEDIUM:** Configure SPF/DKIM/DMARC for email domain
4. **LOW:** Add email verification for account creation
5. **LOW:** Monitor for email enumeration patterns

**Priority:** 🟢 **MEDIUM PRIORITY**

---

## 6. Areas That Must Be Locked Down First

### 🔴 CRITICAL - Lock Down Immediately

#### 1. Payment Security
**Why:** Direct financial impact, high attack frequency

**Actions:**
- [ ] **Server-side price verification:** Always verify price against eSIM Access API
- [ ] **Payment intent idempotency:** Ensure all payment operations are idempotent
- [ ] **Amount validation:** Never trust client-side price calculations
- [ ] **Fraud detection:** Add velocity checks, unusual amount detection
- [ ] **Redis rate limiting:** Replace in-memory rate limiting with distributed solution

**Timeline:** Within 1 week

---

#### 2. Webhook Security
**Why:** Critical for payment processing, high impact if compromised

**Actions:**
- [ ] **Never disable IP validation:** Remove `ESIMACCESS_SKIP_IP_VALIDATION` or make it dev-only
- [ ] **Webhook event deduplication:** Track Stripe event.id, eSIM Access eventId
- [ ] **Timestamp validation:** Reject webhooks older than 5 minutes
- [ ] **Webhook logging:** Comprehensive audit trail for all webhook events
- [ ] **Signature verification:** Ensure all webhooks verify signatures

**Timeline:** Within 1 week

---

#### 3. eSIM Data Protection
**Why:** Theft of eSIM credentials = direct financial loss

**Actions:**
- [ ] **Secure transaction IDs:** Use UUIDs, not sequential/guessable IDs
- [ ] **QR code access control:** Require auth OR email verification
- [ ] **Time-limited access:** QR code URLs expire after 24 hours
- [ ] **Audit logging:** Log all QR code access attempts
- [ ] **Email encryption:** Consider encrypted email delivery for QR codes

**Timeline:** Within 2 weeks

---

#### 4. Rate Limiting Infrastructure
**Why:** DoS protection, prevents abuse, currently broken in production

**Actions:**
- [ ] **Redis-based rate limiting:** Implement Upstash or Vercel Edge Config
- [ ] **Per-user limits:** Not just IP-based (prevents VPN bypass)
- [ ] **Progressive limits:** Stricter limits after violations
- [ ] **WAF integration:** Add Cloudflare or AWS WAF
- [ ] **Rate limit monitoring:** Alert on rate limit violations

**Timeline:** Within 1 week

---

#### 5. Discount Code Security
**Why:** Direct financial impact, easy to exploit

**Actions:**
- [ ] **CAPTCHA on discount entry:** Prevent automated enumeration
- [ ] **Complex discount codes:** Longer, random codes (not guessable)
- [ ] **Distributed rate limiting:** Prevent enumeration via multiple instances
- [ ] **Usage monitoring:** Alert on unusual discount patterns
- [ ] **Per-IP limits:** Limit discount attempts per IP

**Timeline:** Within 1 week

---

### 🟡 HIGH PRIORITY - Lock Down Within 2 Weeks

#### 6. Authentication Hardening
- [ ] Enable MFA enforcement in Clerk
- [ ] Configure account lockout policies
- [ ] Add suspicious login detection
- [ ] Implement password strength requirements
- [ ] Monitor for credential stuffing

#### 7. Database Security
- [ ] Audit all queries for parameterization
- [ ] Implement RLS policies on all tables
- [ ] Rotate service role keys
- [ ] Add database access monitoring
- [ ] Implement query audit logging

#### 8. API Key Management
- [ ] Implement API key rotation schedule
- [ ] Add API key usage monitoring
- [ ] Enable IP whitelisting on eSIM Access (if available)
- [ ] Implement key scoping (read-only where possible)
- [ ] Add alerts for unusual API activity

#### 9. XSS Protection
- [ ] Implement strict CSP headers
- [ ] Replace basic HTML sanitization with DOMPurify
- [ ] Add output encoding verification
- [ ] Regular XSS vulnerability scanning
- [ ] Implement SRI for third-party scripts

---

### 🟢 MEDIUM PRIORITY - Lock Down Within 1 Month

#### 10. Email Security
- [ ] Consistent error messages (no email enumeration)
- [ ] Rate limiting on email endpoints
- [ ] SPF/DKIM/DMARC configuration
- [ ] Email verification for accounts
- [ ] Monitor for email enumeration

#### 11. Monitoring & Detection
- [ ] Security event logging (SIEM integration)
- [ ] Anomaly detection (unusual patterns)
- [ ] Fraud detection system
- [ ] Real-time alerting
- [ ] Security dashboard

#### 12. Incident Response
- [ ] Incident response plan
- [ ] Security playbooks
- [ ] Communication templates
- [ ] Forensic capabilities
- [ ] Regular security drills

---

## 7. Security Controls Matrix

### Current Security Controls

| Control | Status | Effectiveness | Notes |
|---------|--------|---------------|-------|
| Input Validation | ✅ Implemented | Medium | Basic sanitization, needs DOMPurify |
| Rate Limiting | ⚠️ Partial | Low | In-memory only, not distributed |
| Webhook Signatures | ✅ Implemented | High | Stripe verified, eSIM Access IP check can be disabled |
| Authentication | ✅ Implemented | High | Clerk handles, but no MFA enforcement |
| HTTPS | ✅ Implemented | High | Next.js default |
| SQL Injection Protection | ✅ Implemented | High | Supabase parameterized queries |
| XSS Protection | ⚠️ Partial | Medium | React escaping + basic sanitization |
| CSRF Protection | ✅ Implemented | Medium | Next.js built-in |
| Security Headers | ✅ Implemented | High | CSP, HSTS, etc. in next.config.ts |
| Audit Logging | ⚠️ Partial | Low | Some logging, not comprehensive |
| Fraud Detection | ❌ Not Implemented | N/A | No fraud detection system |
| WAF | ❌ Not Implemented | N/A | No Web Application Firewall |
| MFA | ⚠️ Optional | Low | Available but not enforced |

---

## 8. Attack Scenarios

### Scenario 1: Payment Fraud via Price Manipulation
**Attacker:** Fraudster  
**Method:** Intercepts payment intent creation, modifies amount  
**Impact:** Pays $1 for $20 eSIM  
**Likelihood:** Medium  
**Mitigation:** Server-side price verification ✅ (needs verification)

### Scenario 2: eSIM Theft via Transaction ID Enumeration
**Attacker:** Script kiddie  
**Method:** Guesses sequential transaction IDs, accesses QR codes  
**Impact:** Free eSIM activation  
**Likelihood:** Medium  
**Mitigation:** UUID transaction IDs, auth required ❌ (needs implementation)

### Scenario 3: DoS via Rate Limit Bypass
**Attacker:** Botnet  
**Method:** Distributed requests bypass in-memory rate limits  
**Impact:** Service unavailability, resource exhaustion  
**Likelihood:** High  
**Mitigation:** Redis-based rate limiting ❌ (needs implementation)

### Scenario 4: Discount Code Abuse
**Attacker:** Fraudster  
**Method:** Enumerates discount codes, uses unlimited times  
**Impact:** Financial loss, inventory theft  
**Likelihood:** High  
**Mitigation:** CAPTCHA, complex codes, distributed rate limiting ❌ (needs implementation)

### Scenario 5: Account Takeover via Credential Stuffing
**Attacker:** ATO specialist  
**Method:** Automated login attempts with stolen credentials  
**Impact:** User data exposure, unauthorized purchases  
**Likelihood:** Medium  
**Mitigation:** MFA enforcement, account lockout ❌ (needs configuration)

---

## 9. Compliance Considerations

### GDPR (EU Users)
- ✅ Data minimization (only collect necessary data)
- ✅ User consent (Clerk handles)
- ⚠️ Data retention policies (not documented)
- ⚠️ Right to deletion (not implemented)
- ⚠️ Data breach notification (no process)

### PCI DSS (Payment Processing)
- ✅ Stripe handles card data (PCI compliant)
- ✅ No card data storage
- ✅ Secure transmission (HTTPS)
- ⚠️ Access controls (verify Clerk integration)
- ⚠️ Audit logging (needs improvement)

### Data Protection
- ✅ Encryption in transit (HTTPS)
- ⚠️ Encryption at rest (Supabase default)
- ⚠️ Key management (no rotation policy)
- ⚠️ Data backup security (not verified)

---

## 10. Security Testing Recommendations

### Immediate Testing
1. **Penetration Testing:** External security audit
2. **Code Review:** Security-focused code review
3. **Dependency Scanning:** Check for vulnerable packages
4. **API Security Testing:** Test all API endpoints
5. **Authentication Testing:** Test auth flows, session management

### Ongoing Testing
1. **Automated Scanning:** SAST/DAST tools
2. **Dependency Updates:** Regular security updates
3. **Security Monitoring:** SIEM, anomaly detection
4. **Red Team Exercises:** Quarterly security assessments
5. **Bug Bounty Program:** Consider for production

---

## 11. Monitoring & Detection

### Key Metrics to Monitor
- **Payment Anomalies:** Unusual amounts, velocity, patterns
- **Rate Limit Violations:** Frequency, IPs, endpoints
- **Failed Authentication:** Credential stuffing patterns
- **Webhook Anomalies:** Duplicate events, signature failures
- **API Errors:** Unusual error rates, patterns
- **Database Access:** Unusual queries, access patterns
- **eSIM Provisioning:** Unusual order patterns, failures

### Alerting Thresholds
- **Critical:** Payment fraud detected, webhook signature failure, database breach
- **High:** Rate limit violations >100/min, ATO attempts >10/min, API errors >5%
- **Medium:** Unusual discount usage, email enumeration, XSS attempts

---

## 12. Incident Response Plan

### Detection
1. **Automated Alerts:** SIEM, monitoring tools
2. **Manual Detection:** User reports, security team review
3. **Third-Party Reports:** Bug bounty, security researchers

### Response
1. **Immediate:** Isolate affected systems, revoke compromised credentials
2. **Short-term:** Investigate, contain, remediate
3. **Long-term:** Post-incident review, security improvements

### Communication
1. **Internal:** Security team, engineering, management
2. **External:** Affected users, regulators (if required), law enforcement (if criminal)

---

## 13. Security Roadmap

### Phase 1: Critical Fixes (Week 1-2)
- ✅ Payment security hardening
- ✅ Webhook security improvements
- ✅ eSIM data protection
- ✅ Distributed rate limiting
- ✅ Discount code security

### Phase 2: High Priority (Week 3-4)
- ✅ Authentication hardening
- ✅ Database security audit
- ✅ API key management
- ✅ XSS protection improvements

### Phase 3: Medium Priority (Month 2)
- ✅ Email security
- ✅ Monitoring & detection
- ✅ Incident response planning
- ✅ Security testing

### Phase 4: Ongoing (Continuous)
- ✅ Security monitoring
- ✅ Regular audits
- ✅ Dependency updates
- ✅ Security training

---

## 14. Conclusion

The My Umrah eSIM application has a solid security foundation but requires immediate attention in several critical areas:

1. **Payment security** must be hardened to prevent financial fraud
2. **Rate limiting** must be distributed to work in production
3. **eSIM data protection** needs stronger access controls
4. **Webhook security** requires stricter validation
5. **Discount code system** needs anti-abuse measures

**Overall Security Posture:** 6/10  
**Production Readiness:** Requires critical fixes before full production deployment

**Next Steps:**
1. Implement critical fixes (Week 1-2)
2. Conduct security audit
3. Deploy monitoring & detection
4. Establish incident response process

---

**Document Version:** 1.0  
**Last Updated:** January 27, 2025  
**Next Review:** February 27, 2025
