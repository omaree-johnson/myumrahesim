/**
 * Secure Logging Utilities
 * Sanitizes PII and sensitive data from logs to prevent data exposure
 */

/**
 * Sanitize email for logging
 * Example: "user@example.com" → "us***@example.com"
 */
export function sanitizeEmail(email: string | null | undefined): string {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return '[invalid-email]';
  }
  
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  
  return `${local.substring(0, 2)}***@${domain}`;
}

/**
 * Sanitize name for logging
 * Example: "John Doe" → "J***e"
 */
export function sanitizeName(name: string | null | undefined): string {
  if (!name || typeof name !== 'string' || name.length <= 2) {
    return '[***]';
  }
  
  return `${name.substring(0, 1)}***${name.substring(name.length - 1)}`;
}

/**
 * Sanitize payment amount (show range, not exact)
 */
export function sanitizeAmount(amountCents: number | null | undefined): string {
  if (typeof amountCents !== 'number' || amountCents < 0) {
    return '[invalid-amount]';
  }
  
  const amount = amountCents / 100;
  if (amount < 10) {
    return '<$10';
  } else if (amount < 50) {
    return '$10-$50';
  } else if (amount < 100) {
    return '$50-$100';
  } else if (amount < 500) {
    return '$100-$500';
  } else {
    return `>$${Math.floor(amount / 100) * 100}`;
  }
}

/**
 * Sanitize payment intent ID
 * Example: "pi_1234567890abcdef" → "pi_1234...cdef"
 */
export function sanitizePaymentIntentId(id: string | null | undefined): string {
  if (!id || typeof id !== 'string' || id.length < 10) {
    return '[invalid-id]';
  }
  
  return `${id.substring(0, 8)}...${id.substring(id.length - 4)}`;
}

/**
 * Sanitize transaction ID
 */
export function sanitizeTransactionId(id: string | null | undefined): string {
  if (!id || typeof id !== 'string' || id.length < 10) {
    return '[invalid-id]';
  }
  
  return `${id.substring(0, 8)}...${id.substring(id.length - 4)}`;
}

/**
 * Sanitize card number (if accidentally logged)
 */
export function sanitizeCardNumber(card: string | null | undefined): string {
  if (!card || typeof card !== 'string') {
    return '[invalid-card]';
  }
  
  // Remove spaces and dashes
  const cleaned = card.replace(/[\s-]/g, '');
  if (cleaned.length < 4) {
    return '[invalid-card]';
  }
  
  return `****${cleaned.substring(cleaned.length - 4)}`;
}

/**
 * Sanitize object for logging
 */
export function sanitizeLogData(data: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    const keyLower = key.toLowerCase();

    // Email fields
    if (keyLower.includes('email') || keyLower.includes('recipientemail')) {
      sanitized[key] = sanitizeEmail(String(value));
    }
    // Name fields
    else if (keyLower.includes('name') || keyLower.includes('fullname') || keyLower.includes('customername')) {
      sanitized[key] = sanitizeName(String(value));
    }
    // Amount/price fields
    else if (keyLower.includes('amount') || keyLower.includes('price') || keyLower.includes('total')) {
      sanitized[key] = typeof value === 'number' ? sanitizeAmount(value) : value;
    }
    // Payment intent fields
    else if (keyLower.includes('payment_intent') || keyLower.includes('paymentintent')) {
      sanitized[key] = sanitizePaymentIntentId(String(value));
    }
    // Transaction ID fields
    else if (keyLower.includes('transaction_id') || keyLower.includes('transactionid')) {
      sanitized[key] = sanitizeTransactionId(String(value));
    }
    // Card fields
    else if (keyLower.includes('card') || keyLower.includes('cvv') || keyLower.includes('cvc') || keyLower.includes('pan')) {
      sanitized[key] = '[REDACTED]';
    }
    // API keys
    else if (keyLower.includes('key') || keyLower.includes('secret') || keyLower.includes('token')) {
      if (typeof value === 'string' && value.length > 10) {
        sanitized[key] = `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
      } else {
        sanitized[key] = '[REDACTED]';
      }
    }
    // Nested objects
    else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeLogData(value);
    }
    // Arrays
    else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'object' && item !== null 
          ? sanitizeLogData(item) 
          : item
      );
    }
    // Other values
    else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Secure log function
 * Automatically sanitizes PII and sensitive data
 */
export function secureLog(
  level: 'info' | 'warn' | 'error' | 'debug',
  message: string,
  data?: Record<string, any>
): void {
  const sanitized = data ? sanitizeLogData(data) : undefined;

  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  if (level === 'error') {
    console.error(`${prefix} ${message}`, sanitized || '');
  } else if (level === 'warn') {
    console.warn(`${prefix} ${message}`, sanitized || '');
  } else if (level === 'debug') {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`${prefix} ${message}`, sanitized || '');
    }
  } else {
    console.log(`${prefix} ${message}`, sanitized || '');
  }
}

/**
 * Log payment event securely
 */
export function logPaymentEvent(
  event: string,
  paymentIntentId: string,
  data?: Record<string, any>
): void {
  secureLog('info', `[Payment] ${event}`, {
    paymentIntentId,
    ...data,
  });
}

/**
 * Log security event securely
 */
export async function logSecurityEvent(
  event: string,
  details?: Record<string, any>
): Promise<void> {
  secureLog('warn', `[Security] ${event}`, details);
  
  // Also log to database if available
  try {
    const { isSupabaseAdminReady, supabaseAdmin } = await import('./supabase');
    if (isSupabaseAdminReady()) {
      await supabaseAdmin.from('security_events').insert({
        event_type: event,
        ip_address: details?.ip || 'system',
        details: details || {},
        created_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    // Don't fail if logging fails
    console.error('[Secure Logging] Failed to log to database:', error);
  }
}
