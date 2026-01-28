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
