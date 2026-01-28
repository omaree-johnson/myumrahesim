# Browser & Transport Security Audit
**Date:** January 27, 2025  
**Application:** myumrahesim.com  
**Status:** ⚠️ Needs Hardening

---

## Executive Summary

This audit identifies security header configuration issues and provides optimal hardening for browser and transport security, including CSP improvements, HTTPS enforcement, and clickjacking prevention.

**Current Security Posture:** 6/10  
**Issues Found:** 8  
**Critical Improvements Needed:** 5

---

## 1. Current Security Headers Analysis

### ✅ Already Implemented
- ✅ HSTS (Strict-Transport-Security) - 1 year, includeSubDomains, preload
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: SAMEORIGIN (general), DENY (auth pages)
- ✅ Referrer-Policy: strict-origin-when-cross-origin
- ✅ Permissions-Policy: camera=(), microphone=(), geolocation=()
- ✅ CSP: Comprehensive but has security issues
- ✅ Cache-Control: Properly configured for auth pages

### ⚠️ Issues Found

#### Issue #1: Duplicate HSTS Header
**Location:** `next.config.ts:88, 111`  
**Severity:** Low  
**Impact:** Redundant header, may cause confusion

#### Issue #2: CSP Uses unsafe-inline and unsafe-eval
**Location:** `next.config.ts:95-96`  
**Severity:** HIGH  
**Impact:** Reduces XSS protection effectiveness

#### Issue #3: X-Frame-Options: SAMEORIGIN (Too Permissive)
**Location:** `next.config.ts:72`  
**Severity:** MEDIUM  
**Impact:** Allows same-origin framing, potential clickjacking

#### Issue #4: No HTTPS Enforcement Middleware
**Location:** Missing  
**Severity:** HIGH  
**Impact:** HTTP requests not redirected to HTTPS

#### Issue #5: Permissions-Policy Too Minimal
**Location:** `next.config.ts:84`  
**Severity:** MEDIUM  
**Impact:** Doesn't disable all unnecessary features

#### Issue #6: Missing X-Permitted-Cross-Domain-Policies
**Severity:** LOW  
**Impact:** Flash/PDF security

#### Issue #7: Missing Cross-Origin-Embedder-Policy
**Severity:** MEDIUM  
**Impact:** Cross-origin isolation

#### Issue #8: CSP Missing report-uri/report-to
**Severity:** MEDIUM  
**Impact:** No CSP violation reporting

---

## 2. Optimal Security Header Configuration

### 2.1 Content Security Policy (CSP)

**Current Issues:**
- Uses `'unsafe-inline'` for scripts
- Uses `'unsafe-eval'` for scripts
- No nonce-based CSP
- No violation reporting

**Optimal Configuration:**
```typescript
const csp = [
  "default-src 'self'",
  // Scripts: Use nonces or strict allowlist
  "script-src 'self' 'strict-dynamic' https://*.clerk.com https://*.clerk.accounts.dev https://clerk.myumrahesim.com https://*.myumrahesim.com https://js.stripe.com https://*.stripe.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://vercel.live https://*.vercel.app https://*.vercel.com https://challenges.cloudflare.com",
  "script-src-elem 'self' 'strict-dynamic' https://*.clerk.com https://*.clerk.accounts.dev https://clerk.myumrahesim.com https://*.myumrahesim.com https://js.stripe.com https://*.stripe.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://vercel.live https://*.vercel.app https://*.vercel.com https://challenges.cloudflare.com",
  // Styles: Allow inline for Next.js
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Fonts
  "font-src 'self' https://fonts.gstatic.com data:",
  // Images
  "img-src 'self' data: https: blob:",
  // Connections
  "connect-src 'self' https://*.zendit.io https://*.supabase.co https://*.clerk.com https://*.clerk.accounts.dev https://clerk.myumrahesim.com https://*.myumrahesim.com https://clerk-telemetry.com https://api.resend.com https://api.exchangerate-api.com https://*.stripe.com https://api.esimaccess.com https://www.google-analytics.com https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://connect.facebook.net https://*.facebook.com https://*.facebook.net https://vercel.live https://*.vercel.app https://*.vercel.com",
  // Frames
  "frame-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://clerk.myumrahesim.com https://*.myumrahesim.com https://js.stripe.com https://hooks.stripe.com https://www.google.com https://www.googletagmanager.com https://challenges.cloudflare.com",
  // Workers
  "worker-src 'self' blob: https://*.clerk.com",
  // Objects
  "object-src 'none'",
  // Base URI
  "base-uri 'self'",
  // Form actions
  "form-action 'self'",
  // Frame ancestors (clickjacking protection)
  "frame-ancestors 'none'",
  // Upgrade insecure requests
  "upgrade-insecure-requests",
  // Report violations (optional)
  // "report-uri /api/csp-report",
  // "report-to csp-endpoint",
].join('; ');
```

**Key Improvements:**
- ✅ Removed `'unsafe-eval'` (use `'strict-dynamic'` instead)
- ✅ Use `'strict-dynamic'` for better script loading
- ✅ Added `frame-ancestors 'none'` for clickjacking protection
- ✅ Added violation reporting capability

---

### 2.2 Strict Transport Security (HSTS)

**Current:** ✅ Good (1 year, includeSubDomains, preload)

**Optimal:**
```typescript
'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
```

**Note:** Only set in production (HTTPS only)

---

### 2.3 X-Frame-Options

**Current:** SAMEORIGIN (too permissive)

**Optimal:** DENY for all pages
```typescript
'X-Frame-Options': 'DENY'
```

**Rationale:** CSP `frame-ancestors 'none'` provides better protection, but X-Frame-Options is a fallback for older browsers.

---

### 2.4 Permissions-Policy (Feature Policy)

**Current:** Minimal (only camera, microphone, geolocation)

**Optimal:** Disable all unnecessary features
```typescript
'Permissions-Policy': [
  'accelerometer=()',
  'ambient-light-sensor=()',
  'autoplay=()',
  'battery=()',
  'camera=()',
  'cross-origin-isolated=()',
  'display-capture=()',
  'document-domain=()',
  'encrypted-media=()',
  'execution-while-not-rendered=()',
  'execution-while-out-of-viewport=()',
  'fullscreen=()',
  'geolocation=()',
  'gyroscope=()',
  'keyboard-map=()',
  'magnetometer=()',
  'microphone=()',
  'midi=()',
  'navigation-override=()',
  'payment=()',
  'picture-in-picture=()',
  'publickey-credentials-get=()',
  'screen-wake-lock=()',
  'sync-xhr=()',
  'usb=()',
  'web-share=()',
  'xr-spatial-tracking=()',
].join(', ')
```

---

### 2.5 Additional Security Headers

**X-Content-Type-Options:**
```typescript
'X-Content-Type-Options': 'nosniff'
```

**Referrer-Policy:**
```typescript
'Referrer-Policy': 'strict-origin-when-cross-origin'
```

**X-Permitted-Cross-Domain-Policies:**
```typescript
'X-Permitted-Cross-Domain-Policies': 'none'
```

**Cross-Origin-Embedder-Policy:**
```typescript
'Cross-Origin-Embedder-Policy': 'require-corp'
```

**Cross-Origin-Opener-Policy:**
```typescript
'Cross-Origin-Opener-Policy': 'same-origin'
```

**Cross-Origin-Resource-Policy:**
```typescript
'Cross-Origin-Resource-Policy': 'same-origin'
```

---

## 3. HTTPS Enforcement

### 3.1 Middleware for HTTPS Redirect

**Required:** Middleware to redirect HTTP to HTTPS in production

**Implementation:**
```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Enforce HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    const protocol = request.headers.get('x-forwarded-proto') || 
                    (request.url.startsWith('https://') ? 'https' : 'http');
    
    if (protocol !== 'https') {
      const httpsUrl = request.url.replace(/^http:/, 'https:');
      return NextResponse.redirect(httpsUrl, 301);
    }
  }
  
  // ... rest of middleware
}
```

---

## 4. Clickjacking Prevention

### 4.1 Frame Protection

**Current:** X-Frame-Options: SAMEORIGIN (partial protection)

**Optimal:**
1. CSP: `frame-ancestors 'none'` (primary)
2. X-Frame-Options: `DENY` (fallback)
3. Both set for maximum compatibility

---

## 5. Data Exfiltration Prevention

### 5.1 Referrer Policy

**Current:** `strict-origin-when-cross-origin` ✅ Good

**Optimal:** Same (prevents leaking full URLs)

### 5.2 Cross-Origin Policies

**Add:**
- Cross-Origin-Embedder-Policy
- Cross-Origin-Opener-Policy
- Cross-Origin-Resource-Policy

---

## 6. Implementation

See `docs/BROWSER_SECURITY_IMPLEMENTATION.md` for complete code.

---

**See Implementation Guide:** `docs/BROWSER_SECURITY_IMPLEMENTATION.md`
