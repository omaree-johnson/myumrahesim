# Enterprise-Grade Bot & Abuse Protection Design
**Date:** January 27, 2025  
**Application:** myumrahesim.com  
**Framework:** Next.js 16.1.5

---

## Executive Summary

This document outlines a comprehensive bot and abuse protection strategy using:
- **Distributed Rate Limiting** (Redis/Upstash)
- **Cloudflare Turnstile** (Bot detection)
- **Challenge Escalation** (Progressive challenges)
- **Multi-layer Protection** (IP, User, Endpoint)

**Protection Coverage:**
- Signup, Login, Password Reset
- Checkout, Payment Intent Creation
- eSIM Provisioning APIs
- Product Scraping Prevention
- Inventory Abuse Prevention
- Automated Purchase Prevention

---

## 1. Architecture Overview

### Protection Layers

```
┌─────────────────────────────────────────────────┐
│  Layer 1: Cloudflare WAF (Edge)                │
│  - DDoS Protection                              │
│  - IP Reputation                                 │
│  - Geo-blocking                                  │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Layer 2: Middleware (Next.js)                  │
│  - IP-based Rate Limiting                       │
│  - User-based Rate Limiting                     │
│  - Bot Detection (Turnstile)                    │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Layer 3: Endpoint Protection                   │
│  - Endpoint-specific Rate Limits                │
│  - Challenge Escalation                         │
│  - Ownership Verification                       │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Layer 4: Business Logic                        │
│  - Inventory Checks                             │
│  - Fraud Detection                              │
│  - Anomaly Detection                            │
└─────────────────────────────────────────────────┘
```

---

## 2. Rate Limiting Strategy

### Rate Limit Tiers

#### Tier 1: Strict (Authentication & Checkout)
- **Signup:** 3 per hour per IP
- **Login:** 5 per 15 minutes per IP
- **Password Reset:** 3 per hour per email
- **Checkout:** 10 per minute per IP
- **Payment Intent:** 10 per minute per IP

#### Tier 2: Moderate (Product & Order APIs)
- **Products:** 30 per minute per IP
- **Orders:** 10 per minute per user
- **Purchase Status:** 20 per minute per user

#### Tier 3: Lenient (Public Content)
- **Health Check:** 60 per minute per IP
- **Static Assets:** No limit (CDN cached)

### Rate Limit Identifiers

1. **IP-based:** `ip:${clientIP}`
2. **User-based:** `user:${userId}`
3. **Email-based:** `email:${email}`
4. **Endpoint-based:** `endpoint:${path}:${ip}`
5. **Combined:** `ip:${ip}:user:${userId}`

### Rate Limit Algorithms

- **Sliding Window:** For authentication (prevents burst attacks)
- **Fixed Window:** For API endpoints (simpler, predictable)
- **Token Bucket:** For checkout (allows bursts with refill)

---

## 3. Bot Detection Strategy

### Cloudflare Turnstile Integration

**When to Show Turnstile:**
1. **Always:** Signup, Login, Password Reset
2. **On Suspicion:** After rate limit violation
3. **On Anomaly:** Unusual patterns detected
4. **On Challenge:** Progressive challenge escalation

**Turnstile Modes:**
- **Managed:** Automatic challenge (default)
- **Non-interactive:** Invisible for trusted users
- **Interactive:** Visible challenge for suspicious users

### Bot Detection Signals

1. **Request Patterns:**
   - High request rate
   - Missing user agent
   - Suspicious user agent
   - Missing referrer
   - Unusual headers

2. **Behavioral Patterns:**
   - Rapid sequential requests
   - No mouse movement
   - No keyboard events
   - Missing cookies
   - JavaScript disabled

3. **IP Reputation:**
   - Known botnet IPs
   - VPN/Proxy IPs (if suspicious)
   - High-risk countries
   - Recent abuse history

---

## 4. Challenge Escalation System

### Escalation Levels

```
Level 0: Normal Request
  ↓ (Rate limit exceeded)
Level 1: Rate Limit Warning
  ↓ (Continued abuse)
Level 2: Turnstile Challenge (Managed)
  ↓ (Challenge failed)
Level 3: Turnstile Challenge (Interactive)
  ↓ (Still failing)
Level 4: Temporary IP Block (15 minutes)
  ↓ (Continued abuse)
Level 5: Extended IP Block (1 hour)
  ↓ (Persistent abuse)
Level 6: Permanent IP Block (Manual review)
```

### Challenge Triggers

| Trigger | Action | Duration |
|---------|--------|----------|
| Rate limit exceeded | Show Turnstile | Until verified |
| Failed Turnstile | Retry with interactive | 3 attempts |
| Multiple failures | Temporary block | 15 minutes |
| Persistent abuse | Extended block | 1 hour |
| Critical abuse | Permanent block | Manual review |

---

## 5. Protection by Endpoint

### Authentication Endpoints

**Signup (`POST /api/sign-up`)**
- Rate Limit: 3/hour per IP
- Turnstile: Always required
- Challenge: After 2 failed attempts
- Block: After 5 failed attempts

**Login (`POST /api/sign-in`)**
- Rate Limit: 5/15min per IP
- Turnstile: After 3 failed attempts
- Challenge: Progressive escalation
- Block: After 10 failed attempts

**Password Reset (`POST /api/password-reset`)**
- Rate Limit: 3/hour per email
- Turnstile: Always required
- Challenge: After 1 failed attempt
- Block: After 3 failed attempts

### Checkout Endpoints

**Create Payment Intent (`POST /api/create-payment-intent`)**
- Rate Limit: 10/minute per IP, 20/minute per user
- Turnstile: After rate limit exceeded
- Challenge: On suspicious patterns
- Block: After 50 attempts/hour

**Create Checkout Session (`POST /api/create-checkout-session`)**
- Rate Limit: 10/minute per IP
- Turnstile: After rate limit exceeded
- Challenge: On high-value purchases
- Block: After 30 attempts/hour

**Cart Payment Intent (`POST /api/create-cart-payment-intent`)**
- Rate Limit: 5/minute per IP
- Turnstile: Always required (cart abuse)
- Challenge: On large carts (>5 items)
- Block: After 20 attempts/hour

### Product & Order Endpoints

**Products (`GET /api/products`)**
- Rate Limit: 30/minute per IP
- Turnstile: After 100 requests/hour
- Challenge: On scraping patterns
- Block: After 500 requests/hour

**Orders (`GET /api/orders`)**
- Rate Limit: 10/minute per user
- Turnstile: Not required (authenticated)
- Challenge: On anomaly detection
- Block: After 50 requests/hour

**Purchase Status (`GET /api/purchases/[id]`)**
- Rate Limit: 20/minute per user
- Turnstile: Not required (authenticated)
- Challenge: On enumeration attempts
- Block: After 100 requests/hour

### Provisioning Endpoints

**eSIM Provisioning (`POST /api/orders`)**
- Rate Limit: 5/minute per IP, 10/minute per user
- Turnstile: Always required
- Challenge: On duplicate purchases
- Block: After 20 attempts/hour

---

## 6. Recommended Thresholds

### Rate Limit Thresholds

| Endpoint | Per IP | Per User | Window | Algorithm |
|----------|--------|----------|--------|-----------|
| Signup | 3 | - | 1 hour | Sliding Window |
| Login | 5 | - | 15 min | Sliding Window |
| Password Reset | 3 | - | 1 hour | Sliding Window |
| Payment Intent | 10 | 20 | 1 min | Fixed Window |
| Checkout Session | 10 | - | 1 min | Fixed Window |
| Cart Payment | 5 | - | 1 min | Token Bucket |
| Products | 30 | - | 1 min | Fixed Window |
| Orders (GET) | - | 10 | 1 min | Fixed Window |
| Orders (POST) | 5 | 10 | 1 min | Token Bucket |
| Purchase Status | - | 20 | 1 min | Fixed Window |

### Bot Detection Thresholds

| Signal | Threshold | Action |
|--------|-----------|--------|
| Requests/min | >100 | Show Turnstile |
| Failed Turnstile | >3 | Temporary block |
| Suspicious UA | Detected | Show Turnstile |
| Missing Referrer | >10 requests | Show Turnstile |
| No Cookies | >5 requests | Show Turnstile |
| Rapid Sequential | <1s between | Show Turnstile |

### Challenge Escalation Thresholds

| Level | Trigger | Challenge Type | Duration |
|-------|---------|----------------|----------|
| 1 | Rate limit | Warning | - |
| 2 | 2x rate limit | Turnstile (Managed) | Until verified |
| 3 | 3x rate limit | Turnstile (Interactive) | 3 attempts |
| 4 | 5x rate limit | IP Block | 15 minutes |
| 5 | 10x rate limit | IP Block | 1 hour |
| 6 | Persistent | IP Block | Manual review |

---

## 7. Implementation Strategy

### Phase 1: Foundation (Week 1)
1. Install dependencies (Upstash, Turnstile)
2. Set up Redis/Upstash
3. Create rate limiting utilities
4. Implement basic rate limiting

### Phase 2: Bot Detection (Week 2)
1. Integrate Cloudflare Turnstile
2. Create challenge escalation system
3. Add bot detection signals
4. Implement progressive challenges

### Phase 3: Advanced Protection (Week 3)
1. Add IP reputation checking
2. Implement anomaly detection
3. Add fraud detection
4. Create monitoring dashboard

### Phase 4: Optimization (Week 4)
1. Fine-tune thresholds
2. Optimize performance
3. Add caching
4. Create analytics

---

## 8. Monitoring & Analytics

### Key Metrics

1. **Rate Limit Violations:**
   - Per endpoint
   - Per IP
   - Per user
   - Time series

2. **Bot Detection:**
   - Turnstile challenges shown
   - Turnstile success rate
   - Bot detection signals
   - False positive rate

3. **Challenge Escalation:**
   - Escalation levels reached
   - Block duration
   - Unblock requests
   - Manual reviews

4. **Abuse Patterns:**
   - Scraping attempts
   - Inventory abuse
   - Automated purchases
   - Fraud attempts

### Alerting

- **Critical:** >1000 rate limit violations/hour
- **High:** >100 bot detections/hour
- **Medium:** >50 IP blocks/hour
- **Low:** >10 challenge escalations/hour

---

## 9. Cloudflare WAF Configuration

### Recommended Rules

1. **Rate Limiting Rules:**
   - Signup: 3/hour per IP
   - Login: 5/15min per IP
   - Checkout: 10/minute per IP

2. **Bot Fight Mode:**
   - Enable for all routes
   - Challenge suspicious traffic
   - Log all challenges

3. **IP Access Rules:**
   - Block known bad IPs
   - Allow trusted IPs
   - Geo-block if needed

4. **Custom Rules:**
   - Block requests without user agent
   - Block requests with suspicious headers
   - Rate limit by country if needed

---

## 10. Cost Considerations

### Upstash Redis
- **Free Tier:** 10,000 commands/day
- **Paid Tier:** $0.20 per 100K commands
- **Estimated:** ~$10-50/month (depending on traffic)

### Cloudflare Turnstile
- **Free Tier:** Unlimited challenges
- **Paid Tier:** Not required for most use cases

### Cloudflare WAF
- **Free Tier:** Basic protection
- **Paid Tier:** $20/month (Pro) or $200/month (Business)

---

**Next:** See `docs/BOT_PROTECTION_IMPLEMENTATION.md` for code examples
