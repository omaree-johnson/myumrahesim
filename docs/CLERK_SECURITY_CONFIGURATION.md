# Clerk Security Configuration Guide
**Date:** January 27, 2025  
**Purpose:** Step-by-step guide to configure Clerk for maximum security

---

## 🔴 CRITICAL: Required Clerk Dashboard Settings

### 1. Session Configuration
**Path:** Clerk Dashboard → Sessions

#### Session Lifetime
- **Active Session Lifetime:** 7 days (recommended)
- **Idle Timeout:** 30 minutes
- **Session Rotation:** ✅ Enabled (regenerate on privilege change)
- **Multi-session Handling:** ✅ Enabled (if users need multiple devices)

**Why:** Prevents long-lived sessions that increase attack window. Idle timeout automatically logs out inactive users.

---

### 2. Password Security
**Path:** Clerk Dashboard → Security → Password

#### Password Requirements
- ✅ **Minimum Length:** 12 characters
- ✅ **Require Uppercase:** Yes
- ✅ **Require Lowercase:** Yes
- ✅ **Require Numbers:** Yes
- ✅ **Require Symbols:** Yes
- ✅ **Disallow Common Passwords:** Yes
- ✅ **Password History:** Remember last 5 passwords

**Why:** Strong passwords prevent brute force and credential stuffing attacks.

---

### 3. Account Lockout
**Path:** Clerk Dashboard → Security → Account Lockout

#### Lockout Settings
- ✅ **Max Failed Attempts:** 5
- ✅ **Lockout Duration:** 30 minutes
- ✅ **Progressive Delays:** ✅ Enabled
  - After 3 failed attempts: 30 second delay
  - After 4 failed attempts: 2 minute delay
  - After 5 failed attempts: Account locked

**Why:** Prevents brute force attacks and credential stuffing.

---

### 4. Multi-Factor Authentication (MFA)
**Path:** Clerk Dashboard → Security → Multi-Factor Authentication

#### MFA Configuration
- ✅ **Enforce MFA:** Yes (for all users OR high-risk users)
- ✅ **MFA Methods:**
  - ✅ TOTP (Authenticator apps)
  - ✅ SMS (if available)
  - ✅ Backup codes: ✅ Enabled
- ✅ **MFA Recovery:** Email + SMS

**Why:** Adds second layer of protection against account takeover.

---

### 5. Cookie Security
**Path:** Clerk Dashboard → Settings → Security

#### Cookie Settings
**Note:** Clerk manages cookies automatically, but verify these settings:

- ✅ **HttpOnly:** Enabled (default - verify)
- ✅ **Secure:** Enabled (HTTPS only - verify)
- ✅ **SameSite:** Strict
- ✅ **Domain:** Set to your domain (e.g., `.myumrahesim.com`)

**Verification:**
1. Login to your app
2. Open browser DevTools → Application → Cookies
3. Find Clerk session cookies (usually `__session` or `__clerk_db_jwt`)
4. Verify:
   - ✅ HttpOnly: Yes
   - ✅ Secure: Yes
   - ✅ SameSite: Strict

**Why:** Prevents XSS cookie theft, CSRF attacks, and session hijacking.

---

### 6. Rate Limiting
**Path:** Clerk Dashboard → Settings → Rate Limits

#### Rate Limit Configuration
- ✅ **Sign-in Attempts:** 5 per 15 minutes per IP
- ✅ **Sign-up Attempts:** 3 per hour per IP
- ✅ **Password Reset Requests:** 3 per hour per email
- ✅ **Magic Link Requests:** 3 per hour per email
- ✅ **Email Verification:** 5 per hour per email

**Why:** Prevents abuse, enumeration, and DoS attacks.

---

### 7. Email Verification
**Path:** Clerk Dashboard → Settings → Email

#### Email Settings
- ✅ **Require Email Verification:** Yes
- ✅ **Verification Link Expiry:** 24 hours
- ✅ **Resend Cooldown:** 5 minutes
- ✅ **Email Templates:** Customize to match your brand

**Why:** Prevents fake accounts and ensures valid email addresses.

---

### 8. OAuth Configuration
**Path:** Clerk Dashboard → Settings → OAuth

#### OAuth Security
- ✅ **Allowed Redirect URLs:** Only your domains
  ```
  https://myumrahesim.com
  https://www.myumrahesim.com
  http://localhost:3000  (dev only)
  ```
- ✅ **State Parameter Validation:** ✅ Enabled
- ✅ **PKCE (Proof Key for Code Exchange):** ✅ Enabled
- ✅ **OAuth Scopes:** Minimal required scopes only

**Why:** Prevents OAuth redirect manipulation and token theft.

---

### 9. Webhook Configuration
**Path:** Clerk Dashboard → Webhooks

#### Webhook Setup
1. **Add Endpoint:**
   ```
   https://myumrahesim.com/api/webhooks/clerk
   ```

2. **Subscribe to Events:**
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
   - ✅ `session.created`
   - ✅ `session.ended`
   - ✅ `session.revoked`
   - ✅ `email.created`
   - ✅ `email.verified`

3. **Signing Secret:**
   - Copy the signing secret
   - Add to `.env.local`: `CLERK_WEBHOOK_SECRET=whsec_...`

**Why:** Enables tracking of authentication events for security monitoring.

---

### 10. Advanced Security Settings

#### IP Allowlisting (Optional)
**Path:** Clerk Dashboard → Settings → Security → IP Allowlisting

- Only enable if you have fixed IP addresses
- Not recommended for public-facing applications

#### Suspicious Activity Detection
**Path:** Clerk Dashboard → Settings → Security

- ✅ **Enable Suspicious Activity Detection:** Yes
- ✅ **Alert on:** New device, new location, unusual patterns

---

## 🔧 Environment Variables

### Required Variables
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_... or pk_live_...
CLERK_SECRET_KEY=sk_test_... or sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...

# Clerk URLs (optional, defaults work)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### Production Checklist
- [ ] Use `pk_live_` and `sk_live_` keys (not test keys)
- [ ] Webhook endpoint is HTTPS
- [ ] Webhook secret is set and secure
- [ ] All redirect URLs are configured
- [ ] MFA is enforced
- [ ] Rate limits are configured
- [ ] Account lockout is enabled

---

## 📊 Security Monitoring

### Clerk Dashboard → Analytics

Monitor:
- Failed login attempts
- Account lockouts
- Suspicious activity
- Session creation/revocation
- MFA usage

### Custom Monitoring

Use webhook events to track:
- Login patterns
- Failed attempts
- Account lockouts
- Suspicious logins

---

## ✅ Verification Checklist

After configuration, verify:

1. **Cookie Security:**
   - [ ] Login to app
   - [ ] Check cookies in DevTools
   - [ ] Verify HttpOnly, Secure, SameSite=Strict

2. **Rate Limiting:**
   - [ ] Try 6 sign-in attempts rapidly
   - [ ] Should be blocked after 5 attempts

3. **Account Lockout:**
   - [ ] Fail login 5 times with same email
   - [ ] Account should be locked for 30 minutes

4. **MFA:**
   - [ ] Create new account
   - [ ] Verify MFA is required (if enforced)

5. **Webhooks:**
   - [ ] Create test user
   - [ ] Check webhook logs in Clerk dashboard
   - [ ] Verify events are received

---

## 🚨 Common Issues

### Issue: Cookies not secure
**Solution:** Verify HTTPS is enabled, check Clerk dashboard cookie settings

### Issue: Rate limiting not working
**Solution:** Check Clerk dashboard rate limit settings, verify IP detection

### Issue: Webhooks not received
**Solution:** Verify endpoint URL, check signing secret, test with Clerk CLI

### Issue: MFA not enforced
**Solution:** Check MFA enforcement settings in Clerk dashboard

---

**Last Updated:** January 27, 2025
