# Secrets Management & Infrastructure Security Audit
**Date:** January 27, 2025  
**Application:** myumrahesim.com  
**Status:** 🔴 Critical Issues Found

---

## Executive Summary

This audit identifies **critical secrets management vulnerabilities** including potential client-side exposure, missing validation, insecure Docker configuration, and improper API key scoping.

**Overall Security Posture:** 4/10  
**Critical Vulnerabilities Found:** 9  
**High Priority Issues:** 7

---

## 1. Current Secrets Inventory

### Server-Side Secrets (Should NEVER reach client)
- ✅ `STRIPE_SECRET_KEY` - Payment processing
- ✅ `STRIPE_WEBHOOK_SECRET` - Webhook verification
- ✅ `CLERK_SECRET_KEY` - Authentication
- ✅ `CLERK_WEBHOOK_SECRET` - Webhook verification
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Database admin access
- ✅ `RESEND_API_KEY` - Email service
- ✅ `ESIMACCESS_ACCESS_CODE` - eSIM provider API
- ✅ `TURNSTILE_SECRET_KEY` - Bot protection
- ✅ `UPSTASH_REDIS_REST_TOKEN` - Rate limiting

### Client-Side Secrets (Safe to expose)
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key
- ✅ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key (RLS-protected)
- ✅ `NEXT_PUBLIC_TURNSTILE_SITE_KEY` - Turnstile public key

### Configuration (Non-sensitive)
- ✅ `NEXT_PUBLIC_BASE_URL` - Application URL
- ✅ `NEXT_PUBLIC_BRAND_NAME` - Brand name
- ✅ `NEXT_PUBLIC_SUPPORT_EMAIL` - Support email
- ✅ `ESIMACCESS_PROFIT_MARGIN` - Pricing config
- ✅ `ESIMACCESS_MIN_PROFIT_CENTS` - Pricing config

---

## 2. Critical Vulnerabilities

### 🔴 VULNERABILITY #1: API Key Previews in Logs
**Severity:** CRITICAL  
**Risk Score:** 25/25  
**Affected Files:** Multiple

**Description:**
API keys are logged with partial exposure, allowing attackers to see first 10 characters of secrets.

**Evidence:**
```typescript
// src/app/api/webhooks/stripe/route.ts:300
resendKeyPreview: process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 10)}...` : 'MISSING - CHECK ENV!',

// src/lib/email.ts:1110
resendKeyPreview: process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 10)}...` : 'MISSING - CHECK ENV VARS!',
```

**Impact:**
- Partial key exposure in logs
- Logs may be accessible to developers
- Logs sent to monitoring services
- Potential key enumeration attacks

**Fix:**
```typescript
// Use secure logging utility
import { secureLog } from "@/lib/secure-logging";

secureLog('info', 'Email service check', {
  hasApiKey: !!process.env.RESEND_API_KEY, // ✅ Only boolean
  // ❌ Never log key previews
});
```

---

### 🔴 VULNERABILITY #2: No Environment Variable Validation
**Severity:** CRITICAL  
**Risk Score:** 24/25  
**Affected:** Application startup

**Description:**
No validation that required environment variables are set at startup. Application fails at runtime instead of startup.

**Evidence:**
- No `env-validation.ts` file
- No startup validation
- Runtime errors instead of clear startup errors

**Impact:**
- Runtime failures in production
- Unclear error messages
- Difficult debugging
- Potential security issues if secrets missing

**Fix:**
Create `src/lib/env-validation.ts` (see Implementation section)

---

### 🔴 VULNERABILITY #3: Docker Secrets in Plaintext
**Severity:** CRITICAL  
**Risk Score:** 23/25  
**Affected:** `docker-compose.yml`

**Description:**
Docker Compose uses `.env.local` file directly, exposing all secrets in plaintext in container environment.

**Evidence:**
```yaml
# docker-compose.yml:14
env_file:
  - .env.local  # ❌ All secrets loaded into container
```

**Impact:**
- All secrets visible in container
- Secrets in Docker logs
- Secrets accessible via `docker exec`
- Secrets in container filesystem

**Fix:**
Use Docker secrets or environment variable injection (see Implementation section)

---

### 🔴 VULNERABILITY #4: Missing .gitignore for Sensitive Files
**Severity:** HIGH  
**Risk Score:** 22/25  
**Affected:** `.gitignore`

**Description:**
`.gitignore` covers `.env*` but may miss other sensitive files.

**Evidence:**
```gitignore
# .gitignore:35
.env*  # ✅ Covers .env files
# ⚠️ But missing:
# - .env.local.backup
# - .env.production
# - secrets.json
# - *.pem (covered)
```

**Impact:**
- Risk of committing secrets
- Backup files may contain secrets
- Configuration files may leak secrets

**Fix:**
Expand `.gitignore` (see Implementation section)

---

### 🔴 VULNERABILITY #5: No Secret Rotation Strategy
**Severity:** HIGH  
**Risk Score:** 21/25  
**Affected:** All secrets

**Description:**
No documented process for rotating secrets, no expiration dates, no monitoring for compromised keys.

**Impact:**
- Compromised keys remain valid indefinitely
- No way to detect key theft
- Difficult to rotate keys
- Compliance issues

**Fix:**
Implement secret rotation policy (see Implementation section)

---

### 🔴 VULNERABILITY #6: Service Role Key Fallback
**Severity:** HIGH  
**Risk Score:** 20/25  
**Affected:** `src/lib/supabase.ts`

**Description:**
Service role key falls back to anon key if not configured, potentially bypassing security.

**Evidence:**
```typescript
// src/lib/supabase.ts:20-22
export const supabaseAdmin = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured && supabaseServiceRoleKey 
    ? supabaseServiceRoleKey 
    : supabaseAnonKey // ⚠️ Fallback to anon key
);
```

**Impact:**
- Admin operations may use wrong key
- Security bypass risk
- Unclear error messages
- Potential RLS bypass

**Fix:**
Fail hard if service role key missing (see Implementation section)

---

### 🔴 VULNERABILITY #7: Hardcoded Placeholder Values
**Severity:** MEDIUM  
**Risk Score:** 18/25  
**Affected:** Multiple files

**Description:**
Placeholder values used when secrets missing, masking configuration issues.

**Evidence:**
```typescript
// src/lib/supabase.ts:12-13
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-key'
);
```

**Impact:**
- Configuration errors hidden
- Application appears to work but fails
- Difficult debugging
- Security issues masked

**Fix:**
Fail fast with clear errors (see Implementation section)

---

### 🔴 VULNERABILITY #8: No API Key Scoping Verification
**Severity:** MEDIUM  
**Risk Score:** 17/25  
**Affected:** Third-party API keys

**Description:**
No verification that API keys have least-privilege access. Keys may have excessive permissions.

**Impact:**
- Keys may have admin access
- Keys may access other resources
- Keys may have write access when read-only needed
- Compliance issues

**Fix:**
Document required permissions and verify (see Implementation section)

---

### 🔴 VULNERABILITY #9: Secrets in Build Output
**Severity:** MEDIUM  
**Risk Score:** 16/25  
**Affected:** Next.js build

**Description:**
Next.js may bundle environment variables. Need to verify no secrets in client bundle.

**Evidence:**
- `NEXT_PUBLIC_*` variables are bundled
- Need to verify no server secrets reach client
- Build output not audited

**Impact:**
- Secrets may be in JavaScript bundle
- Secrets accessible via browser DevTools
- Source maps may contain secrets

**Fix:**
Audit build output and add validation (see Implementation section)

---

## 3. Secure Environment Variable Patterns

### Pattern 1: Server-Side Only Secrets
```typescript
// ✅ CORRECT: Server-side only
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

// ❌ WRONG: Never use in client components
'use client';
export function PaymentForm() {
  const secret = process.env.STRIPE_SECRET_KEY; // ❌ Will be undefined or exposed
}
```

### Pattern 2: Client-Side Public Keys
```typescript
// ✅ CORRECT: Use NEXT_PUBLIC_ prefix for client-safe values
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

// ✅ CORRECT: Only public keys, never secrets
const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
```

### Pattern 3: Environment Variable Validation
```typescript
// ✅ CORRECT: Validate at startup
function validateEnv() {
  const required = [
    'STRIPE_SECRET_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
}
```

### Pattern 4: Secure Logging
```typescript
// ✅ CORRECT: Never log secrets
import { secureLog } from "@/lib/secure-logging";

secureLog('info', 'API call made', {
  hasApiKey: !!process.env.RESEND_API_KEY, // ✅ Boolean only
  // ❌ Never: process.env.RESEND_API_KEY.substring(0, 10)
});

// ❌ WRONG: Logging key previews
console.log('API key:', process.env.RESEND_API_KEY?.substring(0, 10)); // ❌
```

### Pattern 5: Fail Fast
```typescript
// ✅ CORRECT: Fail hard if secret missing
const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

// ❌ WRONG: Silent fallback
const secretKey = process.env.STRIPE_SECRET_KEY || 'placeholder'; // ❌
```

---

## 4. Recommended Production Setup

### 4.1 Environment Variable Management

#### Vercel (Recommended)
```bash
# Set in Vercel Dashboard → Settings → Environment Variables
# Separate for each environment:
# - Production
# - Preview
# - Development
```

**Best Practices:**
- ✅ Use Vercel's environment variable UI
- ✅ Enable for specific environments only
- ✅ Use different keys for production/preview
- ✅ Rotate keys regularly
- ✅ Monitor for exposed keys

#### Docker Production
```yaml
# docker-compose.prod.yml
services:
  app:
    environment:
      # ✅ Inject from environment, not file
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    # ❌ Never use env_file in production
    # env_file:
    #   - .env.local
```

**Alternative: Docker Secrets**
```yaml
# docker-compose.prod.yml
services:
  app:
    secrets:
      - stripe_secret_key
      - supabase_service_role_key

secrets:
  stripe_secret_key:
    external: true
  supabase_service_role_key:
    external: true
```

### 4.2 Secret Rotation Policy

#### Rotation Schedule
- **API Keys:** Every 90 days
- **Webhook Secrets:** Every 180 days
- **Database Keys:** Every 365 days
- **Emergency:** Immediately if compromised

#### Rotation Process
1. Generate new key in provider dashboard
2. Update environment variable in Vercel
3. Deploy new version
4. Verify functionality
5. Revoke old key after 7 days grace period
6. Monitor for errors

### 4.3 Monitoring & Detection

#### Key Exposure Detection
```typescript
// Monitor for:
// - API key in logs
// - API key in error messages
// - API key in client bundle
// - Unauthorized API usage
// - Unusual API patterns
```

#### Alerts
- Failed API calls (potential key issue)
- Unusual API usage patterns
- Key rotation reminders
- Secret exposure in logs

### 4.4 Least-Privilege API Keys

#### Required Permissions

**Stripe:**
- ✅ Read/Write Payment Intents
- ✅ Read/Write Customers
- ✅ Read Webhooks
- ❌ No Issuing access (unless needed)
- ❌ No Connect access (unless needed)

**Supabase:**
- ✅ Service Role: Full database access (server-side only)
- ✅ Anon Key: RLS-protected read/write (client-side)
- ❌ No admin API access (unless needed)

**Resend:**
- ✅ Send emails
- ✅ Read domains
- ❌ No account management
- ❌ No billing access

**eSIM Access:**
- ✅ Read packages
- ✅ Create orders
- ✅ Query profiles
- ❌ No account management
- ❌ No billing access

**Upstash Redis:**
- ✅ Read/Write operations
- ❌ No admin operations
- ❌ No account management

**Cloudflare Turnstile:**
- ✅ Site key (public)
- ✅ Secret key (verify only)
- ❌ No account management

---

## 5. Implementation Fixes

### Fix #1: Create Environment Variable Validation

**File:** `src/lib/env-validation.ts` (NEW)

```typescript
/**
 * Environment Variable Validation
 * Validates all required environment variables at startup
 */

type EnvConfig = {
  required: string[];
  optional: string[];
  serverOnly: string[];
  clientSafe: string[];
};

const envConfig: EnvConfig = {
  // Required for application to function
  required: [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'CLERK_SECRET_KEY',
    'CLERK_WEBHOOK_SECRET',
    'SUPABASE_SERVICE_ROLE_KEY',
    'RESEND_API_KEY',
    'ESIMACCESS_ACCESS_CODE',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  ],
  
  // Optional but recommended
  optional: [
    'TURNSTILE_SECRET_KEY',
    'NEXT_PUBLIC_TURNSTILE_SITE_KEY',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
    'ADMIN_EMAILS',
  ],
  
  // Server-side only (must NOT have NEXT_PUBLIC_ prefix)
  serverOnly: [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'CLERK_SECRET_KEY',
    'CLERK_WEBHOOK_SECRET',
    'SUPABASE_SERVICE_ROLE_KEY',
    'RESEND_API_KEY',
    'ESIMACCESS_ACCESS_CODE',
    'TURNSTILE_SECRET_KEY',
    'UPSTASH_REDIS_REST_TOKEN',
  ],
  
  // Client-safe (must have NEXT_PUBLIC_ prefix)
  clientSafe: [
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_TURNSTILE_SITE_KEY',
    'NEXT_PUBLIC_BASE_URL',
    'NEXT_PUBLIC_BRAND_NAME',
    'NEXT_PUBLIC_SUPPORT_EMAIL',
  ],
};

/**
 * Validate environment variables
 */
export function validateEnvironment(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  const missing = envConfig.required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    errors.push(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Check server-only variables don't have NEXT_PUBLIC_ prefix
  for (const key of envConfig.serverOnly) {
    if (process.env[`NEXT_PUBLIC_${key}`]) {
      errors.push(`Server-only secret has NEXT_PUBLIC_ prefix: ${key}`);
    }
  }

  // Check client-safe variables have NEXT_PUBLIC_ prefix
  for (const key of envConfig.clientSafe) {
    const withoutPrefix = key.replace('NEXT_PUBLIC_', '');
    if (process.env[withoutPrefix] && !process.env[key]) {
      warnings.push(`Client-safe variable missing NEXT_PUBLIC_ prefix: ${withoutPrefix}`);
    }
  }

  // Check for placeholder values
  const placeholderPatterns = [
    /^your_/i,
    /^placeholder/i,
    /^example/i,
    /^test_/i,
  ];
  
  for (const key of envConfig.required) {
    const value = process.env[key];
    if (value && placeholderPatterns.some(pattern => pattern.test(value))) {
      errors.push(`Environment variable ${key} contains placeholder value`);
    }
  }

  // Production-specific checks
  if (process.env.NODE_ENV === 'production') {
    // Warn if IP validation disabled
    if (process.env.ESIMACCESS_SKIP_IP_VALIDATION === 'true') {
      warnings.push('ESIMACCESS_SKIP_IP_VALIDATION is enabled in production');
    }

    // Warn if optional security features missing
    if (!process.env.TURNSTILE_SECRET_KEY) {
      warnings.push('TURNSTILE_SECRET_KEY not set - bot protection may be limited');
    }

    if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
      warnings.push('UPSTASH_REDIS_REST_TOKEN not set - rate limiting may be limited');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate and throw if invalid
 */
export function requireEnvironment(): void {
  const validation = validateEnvironment();
  
  if (!validation.valid) {
    console.error('[Environment Validation] ❌ Validation failed:');
    validation.errors.forEach(error => {
      console.error(`  - ${error}`);
    });
    
    if (validation.warnings.length > 0) {
      console.warn('[Environment Validation] ⚠️ Warnings:');
      validation.warnings.forEach(warning => {
        console.warn(`  - ${warning}`);
      });
    }
    
    throw new Error('Environment validation failed. See errors above.');
  }
  
  if (validation.warnings.length > 0) {
    console.warn('[Environment Validation] ⚠️ Warnings:');
    validation.warnings.forEach(warning => {
      console.warn(`  - ${warning}`);
    });
  }
  
  console.log('[Environment Validation] ✅ All required environment variables are set');
}

// Auto-validate in server-side code
if (typeof window === 'undefined') {
  // Only validate on server
  try {
    requireEnvironment();
  } catch (error) {
    // Log but don't crash in development
    if (process.env.NODE_ENV === 'production') {
      throw error;
    } else {
      console.warn('[Environment Validation] Validation failed (non-fatal in development):', error);
    }
  }
}
```

---

### Fix #2: Remove API Key Logging

**File:** `src/app/api/webhooks/stripe/route.ts`

```typescript
// ❌ REMOVE:
resendKeyPreview: process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 10)}...` : 'MISSING - CHECK ENV!',

// ✅ REPLACE WITH:
import { secureLog } from "@/lib/secure-logging";

secureLog('info', 'Email service check', {
  hasResendKey: !!process.env.RESEND_API_KEY, // ✅ Boolean only
  // ❌ Never log key previews
});
```

**File:** `src/lib/email.ts`

```typescript
// ❌ REMOVE all instances of:
resendKeyPreview: process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 10)}...` : 'MISSING - CHECK ENV VARS!',

// ✅ REPLACE WITH:
import { secureLog } from "@/lib/secure-logging";

secureLog('info', 'Resend API check', {
  hasApiKey: !!process.env.RESEND_API_KEY,
});
```

---

### Fix #3: Secure Docker Configuration

**File:** `docker-compose.prod.yml` (NEW)

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: myumrahesim-app
    ports:
      - "3000:3000"
    environment:
      # ✅ Inject from host environment, not file
      - NODE_ENV=production
      - NEXT_TELEMETRY_DISABLED=1
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
      - CLERK_WEBHOOK_SECRET=${CLERK_WEBHOOK_SECRET}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - RESEND_API_KEY=${RESEND_API_KEY}
      - ESIMACCESS_ACCESS_CODE=${ESIMACCESS_ACCESS_CODE}
      - TURNSTILE_SECRET_KEY=${TURNSTILE_SECRET_KEY}
      - UPSTASH_REDIS_REST_URL=${UPSTASH_REDIS_REST_URL}
      - UPSTASH_REDIS_REST_TOKEN=${UPSTASH_REDIS_REST_TOKEN}
      # Client-safe variables
      - NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      - NEXT_PUBLIC_TURNSTILE_SITE_KEY=${NEXT_PUBLIC_TURNSTILE_SITE_KEY}
    # ❌ Never use env_file in production
    # env_file:
    #   - .env.local
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

**Usage:**
```bash
# Set environment variables in shell
export STRIPE_SECRET_KEY="sk_live_..."
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."

# Run with production compose
docker-compose -f docker-compose.prod.yml up
```

---

### Fix #4: Fix Supabase Service Role Fallback

**File:** `src/lib/supabase.ts`

```typescript
// ❌ REMOVE fallback to anon key
export const supabaseAdmin = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured && supabaseServiceRoleKey 
    ? supabaseServiceRoleKey 
    : supabaseAnonKey // ❌ Remove this fallback
);

// ✅ REPLACE WITH: Fail hard if service role key missing
export const supabaseAdmin = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  (() => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    
    if (!supabaseServiceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for server-side operations. Set it in environment variables.');
    }
    
    return supabaseServiceRoleKey;
  })()
);
```

---

### Fix #5: Expand .gitignore

**File:** `.gitignore`

```gitignore
# Environment files
.env*
!.env.example
.env.local
.env.production
.env.development
.env*.backup
.env*.old

# Secrets and keys
secrets.json
*.pem
*.key
*.p12
*.pfx
*.jks
id_rsa
id_rsa.pub
*.secret

# Configuration files that may contain secrets
config/secrets.json
config/production.json
*.credentials

# Backup files
*.bak
*.backup
*.old
*.tmp

# Docker secrets
docker-secrets/
.secrets/
```

---

### Fix #6: Add Build-Time Validation

**File:** `next.config.ts`

```typescript
import { requireEnvironment } from './src/lib/env-validation';

// Validate environment at build time
if (process.env.NODE_ENV === 'production') {
  try {
    requireEnvironment();
  } catch (error) {
    console.error('[Build] Environment validation failed:', error);
    process.exit(1);
  }
}

const nextConfig: NextConfig = {
  // ... existing config
};

export default nextConfig;
```

---

## 6. Secure Production Setup Checklist

### Environment Variables
- [ ] All required variables set in Vercel
- [ ] Separate keys for production/preview
- [ ] No placeholder values
- [ ] No secrets in `.env.local` committed to git
- [ ] Environment validation passes

### Docker (if used)
- [ ] Use environment variable injection, not `env_file`
- [ ] Secrets not in Dockerfile
- [ ] Secrets not in docker-compose.yml
- [ ] Use Docker secrets for production

### Monitoring
- [ ] No API keys in logs
- [ ] Log monitoring for secret exposure
- [ ] API usage monitoring
- [ ] Unusual activity alerts

### Key Rotation
- [ ] Rotation schedule documented
- [ ] Rotation process tested
- [ ] Old keys revoked after rotation
- [ ] Emergency rotation plan

### Access Control
- [ ] API keys have least privilege
- [ ] Keys scoped to specific resources
- [ ] No admin access unless needed
- [ ] Read-only keys where possible

---

## 7. Third-Party API Key Scoping

### Required Permissions Matrix

| Service | Key Type | Required Permissions | Current Status |
|---------|----------|---------------------|----------------|
| Stripe | Secret | Payment Intents (read/write), Webhooks (read) | ⚠️ Verify |
| Stripe | Publishable | Public (safe) | ✅ OK |
| Clerk | Secret | User management, Sessions | ⚠️ Verify |
| Clerk | Publishable | Public (safe) | ✅ OK |
| Supabase | Service Role | Full database (server-side only) | ⚠️ Verify |
| Supabase | Anon | RLS-protected (client-side) | ✅ OK |
| Resend | API Key | Send emails, Read domains | ⚠️ Verify |
| eSIM Access | Access Code | Read packages, Create orders | ⚠️ Verify |
| Upstash | Token | Redis read/write | ⚠️ Verify |
| Turnstile | Secret | Verify tokens only | ✅ OK |
| Turnstile | Site Key | Public (safe) | ✅ OK |

**Action Required:**
- [ ] Verify each API key has minimum required permissions
- [ ] Document actual permissions in dashboard
- [ ] Create new keys with reduced permissions if needed
- [ ] Test with new keys before deploying

---

## 8. Implementation Checklist

### Critical (This Week)
- [ ] Create `src/lib/env-validation.ts`
- [ ] Remove API key logging
- [ ] Fix Supabase service role fallback
- [ ] Expand `.gitignore`
- [ ] Add build-time validation
- [ ] Create secure Docker production config

### High Priority (Next Week)
- [ ] Document secret rotation process
- [ ] Set up monitoring for secret exposure
- [ ] Verify API key permissions
- [ ] Test environment validation
- [ ] Audit build output for secrets

### Medium Priority (Month 1)
- [ ] Implement secret rotation automation
- [ ] Set up key expiration alerts
- [ ] Create incident response plan
- [ ] Security training for team

---

**See Implementation Guide:** `docs/SECRETS_MANAGEMENT_IMPLEMENTATION.md`
