# Secure Logging & Monitoring for Attack Detection
**Date:** January 27, 2025  
**Application:** myumrahesim.com  
**Status:** ✅ Design Complete

---

## Executive Summary

This document defines a comprehensive logging and monitoring strategy for attack detection, including structured logging for authentication, abuse, and payments, with alert conditions and incident response procedures.

**Logging Strategy:** ✅ Defined  
**Alert Conditions:** ✅ Defined  
**Incident Response:** ✅ Defined

---

## 1. Logging Strategy

### 1.1 Logging Principles

1. **No PII in Logs:** All PII automatically sanitized
2. **No Secrets in Logs:** API keys, tokens, passwords never logged
3. **Structured Format:** JSON-like structure for easy parsing
4. **Dual Logging:** Console (for debugging) + Database (for analysis)
5. **Severity Levels:** info, warn, error, critical
6. **Event Categories:** auth, payment, abuse, webhook, api, system, security

### 1.2 Log Categories

#### Authentication Logs
- Sign in attempts (success/failure)
- Sign up attempts
- Password reset requests
- Account lockouts
- Suspicious login patterns
- Session management events

#### Payment Logs
- Payment intent creation
- Payment success/failure
- Price verification results
- Refunds
- Disputes
- Fraud detection events

#### Abuse Logs
- Rate limit violations
- Bot detection
- IP blocking events
- Challenge requirements
- Scraping attempts
- Inventory abuse

#### Webhook Logs
- Webhook receipt
- Webhook processing
- Webhook failures
- Signature verification

#### API Logs
- Request/response logging
- Error tracking
- Performance metrics
- Authorization failures

#### Security Logs
- Security events
- Anomaly detection
- Policy violations
- Attack attempts

---

## 2. Structured Logging Implementation

### 2.1 Log Entry Structure

```typescript
interface StructuredLogEntry {
  timestamp: string;        // ISO 8601
  level: LogLevel;         // info, warn, error, critical
  category: EventCategory; // auth, payment, abuse, etc.
  event: string;           // Specific event name
  message: string;         // Human-readable message
  userId?: string;         // User ID (if applicable)
  email?: string;          // Sanitized email
  ip?: string;             // IP address
  userAgent?: string;      // User agent
  requestId?: string;      // Request ID for tracing
  transactionId?: string;  // Transaction ID
  paymentIntentId?: string;// Payment intent ID
  endpoint?: string;       // API endpoint
  method?: string;         // HTTP method
  statusCode?: number;      // HTTP status code
  duration?: number;       // Request duration (ms)
  details?: Record<string, any>; // Additional context (sanitized)
  severity?: 'low' | 'medium' | 'high' | 'critical';
  requiresAlert?: boolean; // Whether to trigger alert
}
```

### 2.2 PII Sanitization

**Email:**
```typescript
"user@example.com" → "us***@example.com"
```

**Name:**
```typescript
"John Doe" → "J***e"
```

**Amount:**
```typescript
1500 (cents) → "$10-$50"
```

**Payment Intent ID:**
```typescript
"pi_1234567890abcdef" → "pi_1234...cdef"
```

**Secrets/Keys:**
```typescript
"sk_live_abc123..." → "[REDACTED]"
```

---

## 3. Alert Conditions

### 3.1 Critical Alerts (Immediate Response)

| Condition | Threshold | Action |
|-----------|-----------|--------|
| Price mismatch detected | Any occurrence | Block payment, alert admins |
| Account takeover attempt | 3+ failed logins from new IP | Lock account, alert user |
| Payment fraud detected | Any fraud signal | Block transaction, alert admins |
| API key exposure | Secret in logs | Rotate key immediately |
| Database breach attempt | SQL injection pattern | Block IP, alert admins |

### 3.2 High Priority Alerts (Response within 1 hour)

| Condition | Threshold | Action |
|-----------|-----------|--------|
| Suspicious login | Impossible travel | Require MFA, alert user |
| Rate limit exceeded | 10x normal rate | Block IP temporarily |
| Bot detected | High confidence | Require challenge |
| Payment failure spike | 20%+ failure rate | Investigate payment system |
| Unauthorized access | Admin endpoint access | Block IP, alert admins |

### 3.3 Medium Priority Alerts (Response within 4 hours)

| Condition | Threshold | Action |
|-----------|-----------|--------|
| Failed login spike | 50+ failures/hour | Investigate |
| API error spike | 10%+ error rate | Investigate |
| Unusual traffic pattern | 3x normal volume | Monitor |
| Challenge failures | 10+ failures/hour | Investigate |

### 3.4 Low Priority Alerts (Daily Review)

| Condition | Threshold | Action |
|-----------|-----------|--------|
| Rate limit warnings | Normal operation | Log only |
| Bot detection (low confidence) | Normal operation | Log only |
| Performance degradation | < 5% impact | Monitor |

---

## 4. Alert Implementation

### 4.1 Alert Severity Levels

**Critical:**
- Immediate threat to security or data
- Requires immediate response
- Examples: Price mismatch, account takeover, fraud

**High:**
- Significant security concern
- Requires response within 1 hour
- Examples: Suspicious login, bot detection, unauthorized access

**Medium:**
- Security concern requiring investigation
- Requires response within 4 hours
- Examples: Failed login spike, API errors

**Low:**
- Informational or minor concern
- Daily review
- Examples: Rate limit warnings, performance issues

### 4.2 Alert Triggers

**Automatic Triggers:**
- Severity = 'critical' → Always alert
- Severity = 'high' → Always alert
- Severity = 'medium' + category = 'security' → Alert
- Multiple events from same IP → Escalate

**Manual Triggers:**
- Admin can acknowledge/resolve alerts
- Admin can create custom alerts
- Admin can set alert thresholds

---

## 5. Incident Response Readiness

### 5.1 Incident Response Checklist

#### Preparation
- [ ] Alert system configured
- [ ] Admin emails configured (`ADMIN_EMAILS`)
- [ ] Incident response team identified
- [ ] Response procedures documented
- [ ] Communication channels established
- [ ] Escalation path defined

#### Detection
- [ ] Logging system operational
- [ ] Alerts configured and tested
- [ ] Monitoring dashboard available
- [ ] Real-time alert notifications working

#### Response
- [ ] Incident response plan documented
- [ ] Team roles assigned
- [ ] Communication templates ready
- [ ] Escalation procedures clear

#### Recovery
- [ ] Backup and restore procedures tested
- [ ] Rollback procedures documented
- [ ] Post-incident review process defined

---

## 6. Logging Implementation

### 6.1 Authentication Logging

**Events Logged:**
- `sign_in` - User sign in (success/failure)
- `sign_up` - User registration
- `sign_out` - User sign out
- `password_reset` - Password reset request
- `account_locked` - Account locked due to failed attempts
- `suspicious_login` - Anomaly detected
- `failed_login` - Failed login attempt

**Example:**
```typescript
await logAuthEvent({
  event: 'suspicious_login',
  userId: 'user_123',
  email: 'user@example.com',
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  success: false,
  reason: 'Impossible travel detected',
  details: {
    previousLocation: 'US',
    currentLocation: 'UK',
    timeDiff: '30 minutes',
  },
});
```

---

### 6.2 Payment Logging

**Events Logged:**
- `payment_intent_created` - Payment intent created
- `payment_succeeded` - Payment successful
- `payment_failed` - Payment failed
- `price_mismatch` - Price verification failed (CRITICAL)
- `refund` - Refund processed
- `dispute` - Payment dispute

**Example:**
```typescript
await logPaymentEvent({
  event: 'price_mismatch',
  transactionId: 'txn_123',
  paymentIntentId: 'pi_123',
  userId: 'user_123',
  email: 'user@example.com',
  ip: '192.168.1.1',
  amount: 1000,
  currency: 'USD',
  success: false,
  reason: 'Paid amount does not match expected price',
  details: {
    paidAmount: 1000,
    expectedAmount: 2000,
    difference: 1000,
  },
});
```

---

### 6.3 Abuse Logging

**Events Logged:**
- `rate_limit_exceeded` - Rate limit violation
- `bot_detected` - Bot detected
- `ip_blocked` - IP address blocked
- `challenge_required` - Challenge required
- `scraping_attempt` - Scraping detected
- `inventory_abuse` - Inventory manipulation attempt

**Example:**
```typescript
await logAbuseEvent({
  event: 'bot_detected',
  ip: '192.168.1.1',
  endpoint: '/api/products',
  userAgent: 'bot',
  reason: 'Missing user agent, high request rate',
  details: {
    requestRate: '100/min',
    challengeRequired: true,
  },
});
```

---

## 7. Monitoring Dashboard Queries

### 7.1 Critical Events (Last 24 Hours)

```sql
SELECT 
  event_type,
  severity,
  COUNT(*) as count,
  MAX(triggered_at) as last_occurrence
FROM security_alerts
WHERE triggered_at > NOW() - INTERVAL '24 hours'
  AND severity IN ('critical', 'high')
GROUP BY event_type, severity
ORDER BY count DESC;
```

### 7.2 Failed Login Attempts (Last Hour)

```sql
SELECT 
  email,
  ip_address,
  COUNT(*) as attempts,
  MAX(created_at) as last_attempt
FROM security_events
WHERE event_type = 'failed_login'
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY email, ip_address
HAVING COUNT(*) >= 5
ORDER BY attempts DESC;
```

### 7.3 Payment Fraud Events (Last 24 Hours)

```sql
SELECT 
  event_type,
  transaction_id,
  payment_intent_id,
  details->>'paidAmount' as paid_amount,
  details->>'expectedAmount' as expected_amount,
  triggered_at
FROM security_alerts
WHERE category = 'payment'
  AND event_type = 'price_mismatch'
  AND triggered_at > NOW() - INTERVAL '24 hours'
ORDER BY triggered_at DESC;
```

### 7.4 Top Blocked IPs (Last 24 Hours)

```sql
SELECT 
  ip_address,
  COUNT(*) as events,
  array_agg(DISTINCT event_type) as event_types,
  MAX(triggered_at) as last_event
FROM security_alerts
WHERE triggered_at > NOW() - INTERVAL '24 hours'
  AND ip_address IS NOT NULL
GROUP BY ip_address
HAVING COUNT(*) >= 10
ORDER BY events DESC;
```

---

## 8. Alert Notification System

### 8.1 Email Alerts

**Recipients:**
- Configured via `ADMIN_EMAILS` environment variable
- Comma-separated list of admin emails

**Alert Content:**
- Event type and severity
- Timestamp
- User ID (if applicable)
- IP address
- Sanitized details
- Link to dashboard

**Frequency:**
- Critical: Immediate
- High: Immediate
- Medium: Batched (every 15 minutes)
- Low: Daily digest

### 8.2 Dashboard Alerts

**Real-time Dashboard:**
- Show unacknowledged alerts
- Filter by severity
- Filter by category
- Sort by timestamp

**Alert Status:**
- `triggered` - Alert created
- `acknowledged` - Admin acknowledged
- `resolved` - Issue resolved

---

## 9. Log Retention Policy

### 9.1 Retention Periods

| Log Type | Retention Period | Reason |
|----------|----------------|--------|
| Security Events | 90 days | Compliance, investigation |
| Payment Logs | 365 days | Financial audit |
| Authentication Logs | 90 days | Security investigation |
| Abuse Logs | 30 days | Pattern analysis |
| API Logs | 30 days | Performance monitoring |
| Webhook Logs | 90 days | Debugging |

### 9.2 Archival

- Logs older than retention period archived
- Archived logs stored in cold storage
- Archived logs accessible for compliance

---

## 10. Compliance & Privacy

### 10.1 GDPR/CCPA Compliance

- ✅ No PII in logs (automatically sanitized)
- ✅ Log retention policies defined
- ✅ Right to deletion (logs can be purged)
- ✅ Data minimization (only necessary data logged)

### 10.2 Audit Trail

- ✅ All security events logged
- ✅ All payment events logged
- ✅ All authentication events logged
- ✅ Immutable audit trail (database)

---

## 11. Implementation Checklist

### Phase 1: Core Logging (Week 1)
- [x] Secure logging utility created
- [x] PII sanitization implemented
- [x] Structured logging functions created
- [ ] Integrate into auth flows
- [ ] Integrate into payment flows
- [ ] Integrate into abuse detection

### Phase 2: Alert System (Week 2)
- [ ] Security alerts table created
- [ ] Alert trigger logic implemented
- [ ] Email alert system integrated
- [ ] Dashboard for alerts created
- [ ] Alert acknowledgment system

### Phase 3: Monitoring (Week 3)
- [ ] Monitoring dashboard created
- [ ] Real-time alert notifications
- [ ] Log aggregation and analysis
- [ ] Performance monitoring
- [ ] Incident response procedures

### Phase 4: Optimization (Month 2)
- [ ] Log retention automation
- [ ] Alert tuning based on false positives
- [ ] Performance optimization
- [ ] Compliance reporting
- [ ] Team training

---

**See Implementation Guide:** `docs/LOGGING_MONITORING_IMPLEMENTATION.md`
