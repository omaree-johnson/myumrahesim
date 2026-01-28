# Secrets Management - Implementation Guide
**Date:** January 27, 2025

---

## Quick Start

### 1. Environment Variable Validation ✅
**File:** `src/lib/env-validation.ts` (CREATED)

Already created - validates all required environment variables at startup.

---

## Step-by-Step Implementation

### Step 1: Remove API Key Logging

**File:** `src/app/api/webhooks/stripe/route.ts`

**Find and Replace:**
```typescript
// ❌ REMOVE:
resendKeyPreview: process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 10)}...` : 'MISSING - CHECK ENV!',

// ✅ REPLACE WITH:
import { secureLog } from "@/lib/secure-logging";

secureLog('info', 'Email service check', {
  hasResendKey: !!process.env.RESEND_API_KEY,
});
```

**Locations:**
- Line ~300: `resendKeyPreview` in email details log
- Line ~338: `resendKeyPreview` in error log

---

**File:** `src/lib/email.ts`

**Find and Replace:**
```typescript
// ❌ REMOVE:
resendKeyPreview: process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 10)}...` : 'MISSING - CHECK ENV VARS!',

// ✅ REPLACE WITH:
import { secureLog } from "@/lib/secure-logging";

secureLog('info', 'Resend API check', {
  hasApiKey: !!process.env.RESEND_API_KEY,
});
```

**Locations:**
- Line ~1110: `resendKeyPreview` in email function

---

### Step 2: Fix Supabase Service Role Fallback

**File:** `src/lib/supabase.ts`

**Replace:**
```typescript
// Current (lines 18-23):
export const supabaseAdmin = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured && supabaseServiceRoleKey 
    ? supabaseServiceRoleKey 
    : supabaseAnonKey // ❌ Remove this fallback
);

// With:
export const supabaseAdmin = createClient(
  (() => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    return supabaseUrl;
  })(),
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

### Step 3: Expand .gitignore

**File:** `.gitignore`

**Add to end of file:**
```gitignore
# Secrets and keys (additional)
secrets.json
*.credentials
config/secrets.json
config/production.json

# Environment file backups
.env*.backup
.env*.old
.env.production
.env.development

# Docker secrets
docker-secrets/
.secrets/

# Backup files
*.bak
*.backup
*.tmp
```

---

### Step 4: Add Build-Time Validation

**File:** `next.config.ts`

**Add at top:**
```typescript
import { requireEnvironment } from './src/lib/env-validation';

// Validate environment at build time (production only)
if (process.env.NODE_ENV === 'production') {
  try {
    requireEnvironment();
  } catch (error) {
    console.error('[Build] Environment validation failed:', error);
    process.exit(1);
  }
}
```

---

### Step 5: Create Secure Docker Production Config

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
      - NODE_ENV=production
      - NEXT_TELEMETRY_DISABLED=1
      # Server-side secrets (inject from host environment)
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
      - NEXT_PUBLIC_BRAND_NAME=${NEXT_PUBLIC_BRAND_NAME}
      - NEXT_PUBLIC_SUPPORT_EMAIL=${NEXT_PUBLIC_SUPPORT_EMAIL}
    # ❌ Never use env_file in production
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
# Set environment variables
export STRIPE_SECRET_KEY="sk_live_..."
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."

# Run production compose
docker-compose -f docker-compose.prod.yml up -d
```

---

## Testing

### Test Environment Validation
```bash
# Should pass with all variables set
npm run build

# Should fail with missing variables
unset STRIPE_SECRET_KEY
npm run build  # Should exit with error
```

### Test Secure Logging
```typescript
// Check logs don't contain API key previews
// Search logs for:
// - "resendKeyPreview"
// - "substring(0, 10)"
// - Any API key patterns
```

### Test Docker Production
```bash
# Set required variables
export STRIPE_SECRET_KEY="sk_test_..."
export SUPABASE_SERVICE_ROLE_KEY="test_key"

# Build and run
docker-compose -f docker-compose.prod.yml up

# Verify no secrets in container
docker exec myumrahesim-app env | grep SECRET
# Should show variables but not actual values in logs
```

---

## Verification Checklist

- [ ] Environment validation runs at startup
- [ ] No API key previews in logs
- [ ] Supabase service role fails hard if missing
- [ ] `.gitignore` covers all sensitive files
- [ ] Build fails if required variables missing
- [ ] Docker production config doesn't use `env_file`
- [ ] All secrets use environment variable injection

---

**See Full Audit:** `docs/SECRETS_MANAGEMENT_AUDIT.md`
