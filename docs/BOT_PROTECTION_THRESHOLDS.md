# Bot Protection - Recommended Thresholds
**Date:** January 27, 2025

---

## Rate Limit Thresholds

### Tier 1: Strict (Authentication & Checkout)

| Endpoint | Per IP | Per User | Window | Algorithm | Notes |
|----------|--------|----------|--------|-----------|-------|
| **Signup** | 3 | - | 1 hour | Sliding Window | Prevent account creation abuse |
| **Login** | 5 | - | 15 min | Sliding Window | Allow retries, prevent brute force |
| **Password Reset** | 3 | - | 1 hour | Sliding Window | Prevent enumeration |
| **Payment Intent** | 10 | 20 | 1 min | Sliding Window | Allow checkout flow |
| **Checkout Session** | 10 | - | 1 min | Sliding Window | Allow checkout flow |
| **Cart Payment** | 5 | - | 1 min | Sliding Window | Prevent cart abuse |

### Tier 2: Moderate (Product & Order APIs)

| Endpoint | Per IP | Per User | Window | Algorithm | Notes |
|----------|--------|----------|--------|-----------|-------|
| **Products** | 30 | - | 1 min | Sliding Window | Allow browsing, prevent scraping |
| **Orders (GET)** | - | 10 | 1 min | Sliding Window | User-based, authenticated |
| **Orders (POST)** | 5 | 10 | 1 min | Sliding Window | Prevent abuse |
| **Purchase Status** | - | 20 | 1 min | Sliding Window | User-based, authenticated |

### Tier 3: Lenient (Public Content)

| Endpoint | Per IP | Per User | Window | Algorithm | Notes |
|----------|--------|----------|--------|-----------|-------|
| **Health Check** | 60 | - | 1 min | Sliding Window | Monitoring endpoint |

---

## Bot Detection Thresholds

### Bot Score Calculation

| Signal | Weight | Threshold | Action |
|--------|--------|-----------|--------|
| Suspicious User Agent | 30 | Detected | +30 to score |
| Missing Referrer | 20 | Detected | +20 to score |
| Missing Cookies | 25 | Detected | +25 to score |
| Suspicious Headers | 15 | Detected | +15 to score |
| Rapid Requests | 10 | <1s between | +10 to score |

### Bot Score Actions

| Score Range | Action | Challenge Type |
|-------------|--------|----------------|
| 0-39 | No action | None |
| 40-69 | Challenge | Managed (invisible) |
| 70-100 | Challenge | Interactive (visible) |

---

## Challenge Escalation Thresholds

### Escalation Levels

| Level | Trigger | Challenge Type | Duration | Notes |
|-------|---------|----------------|----------|-------|
| **0** | Normal | None | - | Normal request |
| **1** | Rate limit 1x | Warning | - | Informational |
| **2** | Rate limit 2x | Managed | Until verified | Invisible challenge |
| **3** | Rate limit 3x | Interactive | 3 attempts | Visible challenge |
| **4** | Rate limit 5x | IP Block | 15 minutes | Temporary block |
| **5** | Rate limit 10x | IP Block | 1 hour | Extended block |
| **6** | Persistent abuse | IP Block | Manual review | Permanent block |

### Challenge Failure Thresholds

| Failed Attempts | Action | Duration |
|-----------------|--------|----------|
| 1-2 | Retry challenge | - |
| 3-4 | Temporary block | 15 minutes |
| 5+ | Extended block | 1 hour |

---

## Turnstile Configuration

### When to Show Turnstile

| Scenario | Turnstile Mode | Notes |
|----------|----------------|-------|
| **Signup** | Always (Managed) | Required for all signups |
| **Login** | On suspicion | After 3 failed attempts |
| **Password Reset** | Always (Managed) | Required for all resets |
| **Checkout** | On suspicion | After rate limit exceeded |
| **Products** | On scraping | After 100 requests/hour |
| **Cart** | Always (Managed) | Prevent cart abuse |

### Turnstile Modes

| Mode | Visibility | Use Case |
|------|------------|----------|
| **Managed** | Invisible | Normal users, automatic challenge |
| **Interactive** | Visible | Suspicious users, manual challenge |

---

## IP Blocking Thresholds

### Block Duration

| Violation Count | Block Duration | Notes |
|-----------------|----------------|-------|
| 1-2 | No block | Warning only |
| 3-4 | 15 minutes | Temporary block |
| 5-9 | 1 hour | Extended block |
| 10+ | Manual review | Permanent block (admin review) |

### Block Triggers

| Trigger | Block Duration | Notes |
|---------|----------------|-------|
| Rate limit exceeded 5x | 15 minutes | Temporary |
| Rate limit exceeded 10x | 1 hour | Extended |
| Failed challenges 5+ | 1 hour | Extended |
| Persistent abuse | Manual review | Permanent |

---

## Abuse Detection Thresholds

### Scraping Detection

| Pattern | Threshold | Action |
|---------|-----------|--------|
| Requests/min | >100 | Show Turnstile |
| Requests/hour | >500 | IP Block (1 hour) |
| Missing User Agent | >10 requests | Show Turnstile |
| Missing Referrer | >20 requests | Show Turnstile |
| No Cookies | >5 requests | Show Turnstile |

### Automated Purchase Detection

| Pattern | Threshold | Action |
|---------|-----------|--------|
| Purchases/hour | >5 | Require Turnstile |
| Purchases/day | >20 | Require Turnstile + Review |
| Rapid purchases | <30s between | Require Turnstile |
| Same product multiple | >3 in hour | Require Turnstile |

### Inventory Abuse Detection

| Pattern | Threshold | Action |
|---------|-----------|--------|
| Cart size | >10 items | Require Turnstile |
| Cart value | >$1000 | Require Turnstile + Review |
| Multiple carts | >3 active | Require Turnstile |

---

## Monitoring Thresholds

### Alert Thresholds

| Metric | Critical | High | Medium | Low |
|--------|----------|------|--------|-----|
| Rate limit violations/hour | >1000 | >500 | >100 | >10 |
| Bot detections/hour | >500 | >200 | >50 | >10 |
| IP blocks/hour | >100 | >50 | >20 | >5 |
| Challenge escalations/hour | >200 | >100 | >20 | >5 |
| Failed challenges/hour | >100 | >50 | >10 | >1 |

### Performance Thresholds

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Rate limit check latency | <10ms | <50ms | >100ms |
| Turnstile verification | <100ms | <500ms | >1000ms |
| Redis connection | <5ms | <20ms | >50ms |

---

## Recommended Configuration

### Production Settings

```typescript
// Rate limits
const PRODUCTION_RATE_LIMITS = {
  signup: { perIP: 3, window: "1 h" },
  login: { perIP: 5, window: "15 m" },
  passwordReset: { perIP: 3, window: "1 h" },
  paymentIntent: { perIP: 10, perUser: 20, window: "1 m" },
  checkoutSession: { perIP: 10, window: "1 m" },
  cartPayment: { perIP: 5, window: "1 m" },
  products: { perIP: 30, window: "1 m" },
  ordersGet: { perUser: 10, window: "1 m" },
  ordersPost: { perIP: 5, perUser: 10, window: "1 m" },
  purchaseStatus: { perUser: 20, window: "1 m" },
};

// Bot detection
const PRODUCTION_BOT_THRESHOLDS = {
  challengeScore: 40, // Show challenge if score >= 40
  interactiveScore: 70, // Show interactive if score >= 70
  blockScore: 90, // Block if score >= 90
};

// Challenge escalation
const PRODUCTION_CHALLENGE_ESCALATION = {
  rateLimitWarning: 1, // Show warning after 1x rate limit
  managedChallenge: 2, // Show managed challenge after 2x
  interactiveChallenge: 3, // Show interactive after 3x
  temporaryBlock: 5, // Block for 15 min after 5x
  extendedBlock: 10, // Block for 1 hour after 10x
  permanentBlock: 20, // Manual review after 20x
};
```

### Development Settings

```typescript
// More lenient for development
const DEV_RATE_LIMITS = {
  signup: { perIP: 10, window: "1 h" },
  login: { perIP: 20, window: "15 m" },
  // ... other limits increased
};
```

---

## Fine-Tuning Guide

### Adjusting Thresholds

1. **Monitor Metrics:**
   - Rate limit violations
   - Bot detection scores
   - Challenge success rates
   - False positive rate

2. **Identify Issues:**
   - Too many false positives → Lower thresholds
   - Too many bypasses → Raise thresholds
   - Poor user experience → Adjust challenge timing

3. **Iterate:**
   - Start with recommended thresholds
   - Monitor for 1-2 weeks
   - Adjust based on data
   - Repeat

---

**See Design:** `docs/BOT_PROTECTION_DESIGN.md`  
**See Implementation:** `docs/BOT_PROTECTION_IMPLEMENTATION.md`
