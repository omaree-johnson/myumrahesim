/**
 * Security Monitoring & Alerting
 * Structured logging and alert conditions for attack detection
 */

import { secureLog, sanitizeEmail } from './secure-logging';
import { isSupabaseAdminReady, supabaseAdmin } from './supabase';
import { dispatchSecurityAlert } from '@/lib/alerts/dispatch';

/**
 * Log levels for structured logging
 */
export type LogLevel = 'info' | 'warn' | 'error' | 'critical';

/**
 * Event categories for structured logging
 */
export type EventCategory = 
  | 'auth'
  | 'payment'
  | 'abuse'
  | 'webhook'
  | 'api'
  | 'system'
  | 'security';

/**
 * Structured log entry
 */
export interface StructuredLogEntry {
  timestamp: string;
  level: LogLevel;
  category: EventCategory;
  event: string;
  message: string;
  userId?: string;
  email?: string; // Sanitized
  ip?: string;
  userAgent?: string;
  requestId?: string;
  transactionId?: string;
  paymentIntentId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  duration?: number; // milliseconds
  details?: Record<string, any>; // Sanitized
  severity?: 'low' | 'medium' | 'high' | 'critical';
  requiresAlert?: boolean;
}

/**
 * Log structured event
 */
export async function logStructuredEvent(entry: StructuredLogEntry): Promise<void> {
  const timestamp = entry.timestamp || new Date().toISOString();
  
  // Sanitize entry before logging
  const sanitized: StructuredLogEntry = {
    ...entry,
    timestamp,
    email: entry.email ? sanitizeEmail(entry.email) : undefined,
    details: entry.details ? sanitizeDetails(entry.details) : undefined,
  };

  // Log to console (with sanitization)
  const logLevel = entry.level === 'critical' ? 'error' : entry.level;
  secureLog(logLevel, `[${entry.category.toUpperCase()}] ${entry.event}`, {
    message: entry.message,
    userId: entry.userId,
    email: sanitized.email,
    ip: entry.ip,
    transactionId: entry.transactionId,
    endpoint: entry.endpoint,
    statusCode: entry.statusCode,
    severity: entry.severity,
  });

  // Log to database if available
  if (isSupabaseAdminReady()) {
    try {
      await supabaseAdmin.from('security_events').insert({
        event_type: entry.event,
        user_id: entry.userId || null,
        email: sanitized.email || null,
        ip_address: entry.ip || null,
        details: {
          category: entry.category,
          level: entry.level,
          message: entry.message,
          userAgent: entry.userAgent,
          requestId: entry.requestId,
          transactionId: entry.transactionId,
          paymentIntentId: entry.paymentIntentId,
          endpoint: entry.endpoint,
          method: entry.method,
          statusCode: entry.statusCode,
          duration: entry.duration,
          severity: entry.severity,
          ...sanitized.details,
        },
        created_at: timestamp,
      });

      // Trigger alert if required
      if (entry.requiresAlert && entry.severity) {
        await checkAndTriggerAlert(entry);
      }
    } catch (error) {
      // Don't fail if logging fails
      console.error('[Monitoring] Failed to log to database:', error);
    }
  }
}

// sanitizeEmail is imported from secure-logging

/**
 * Sanitize details object
 */
function sanitizeDetails(details: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(details)) {
    const keyLower = key.toLowerCase();
    
    // Sanitize sensitive fields
    if (keyLower.includes('email')) {
      sanitized[key] = sanitizeEmail(String(value));
    } else if (keyLower.includes('password') || keyLower.includes('secret') || keyLower.includes('key') || keyLower.includes('token')) {
      sanitized[key] = '[REDACTED]';
    } else if (keyLower.includes('card') || keyLower.includes('cvv') || keyLower.includes('cvc')) {
      sanitized[key] = '[REDACTED]';
    } else if (keyLower.includes('amount') || keyLower.includes('price')) {
      // Sanitize amounts to ranges
      if (typeof value === 'number') {
        const amount = value / 100;
        if (amount < 10) sanitized[key] = '<$10';
        else if (amount < 50) sanitized[key] = '$10-$50';
        else if (amount < 100) sanitized[key] = '$50-$100';
        else sanitized[key] = `>$${Math.floor(amount / 100) * 100}`;
      } else {
        sanitized[key] = value;
      }
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Check alert conditions and trigger alerts
 */
async function checkAndTriggerAlert(entry: StructuredLogEntry): Promise<void> {
  if (!isSupabaseAdminReady()) return;
  const occurredAt = entry.timestamp || new Date().toISOString();

  try {
    // Check if alert should be triggered based on severity and event type
    const shouldAlert = 
      entry.severity === 'critical' ||
      entry.severity === 'high' ||
      (entry.severity === 'medium' && entry.category === 'security');

    if (!shouldAlert) return;

    // Get admin emails from environment
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()).filter(Boolean) || [];
    
    if (adminEmails.length === 0) {
      secureLog('warn', '[Monitoring] No admin emails configured for alerts', {});
      return;
    }

    // Log alert to database
    await supabaseAdmin.from('security_alerts').insert({
      event_type: entry.event,
      severity: entry.severity || 'medium',
      category: entry.category,
      message: entry.message,
      user_id: entry.userId || null,
      email: entry.email ? sanitizeEmail(entry.email) : null,
      ip_address: entry.ip || null,
      details: entry.details || {},
      triggered_at: new Date().toISOString(),
      acknowledged: false,
    });

    await dispatchSecurityAlert({
      severity: entry.severity || 'medium',
      category: entry.category,
      event: entry.event,
      message: entry.message,
      userId: entry.userId,
      email: entry.email,
      ip: entry.ip,
      userAgent: entry.userAgent,
      details: entry.details,
      occurredAt,
    });

    secureLog('error', `[Alert] ${entry.severity?.toUpperCase()} alert triggered: ${entry.event}`, {
      category: entry.category,
      message: entry.message,
    });
  } catch (error) {
    secureLog('error', '[Monitoring] Failed to trigger alert', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Log authentication event
 */
export async function logAuthEvent(params: {
  event: 'sign_in' | 'sign_up' | 'sign_out' | 'password_reset' | 'account_locked' | 'suspicious_login' | 'failed_login';
  userId?: string;
  email?: string;
  ip: string;
  userAgent?: string;
  success: boolean;
  reason?: string;
  details?: Record<string, any>;
}): Promise<void> {
  const severity: 'low' | 'medium' | 'high' | 'critical' = params.event === 'suspicious_login' || params.event === 'account_locked' 
    ? 'high' 
    : params.success 
      ? 'low' 
      : 'medium';

  await logStructuredEvent({
    timestamp: new Date().toISOString(),
    level: severity === 'high' ? 'warn' : params.success ? 'info' : 'warn',
    category: 'auth',
    event: params.event,
    message: params.reason || `${params.event} ${params.success ? 'succeeded' : 'failed'}`,
    userId: params.userId,
    email: params.email,
    ip: params.ip,
    userAgent: params.userAgent,
    details: params.details,
    severity,
    requiresAlert: severity === 'high',
  });
}

/**
 * Log payment event
 */
export async function logPaymentEvent(params: {
  event: 'payment_intent_created' | 'payment_succeeded' | 'payment_failed' | 'price_mismatch' | 'refund' | 'dispute';
  transactionId: string;
  paymentIntentId?: string;
  userId?: string;
  email?: string;
  ip?: string;
  amount?: number;
  currency?: string;
  success: boolean;
  reason?: string;
  details?: Record<string, any>;
}): Promise<void> {
  const severity = params.event === 'price_mismatch' 
    ? 'critical' 
    : params.event === 'payment_failed' 
      ? 'medium' 
      : params.success 
        ? 'low' 
        : 'high';

  await logStructuredEvent({
    timestamp: new Date().toISOString(),
    level: severity === 'critical' ? 'error' : params.success ? 'info' : 'warn',
    category: 'payment',
    event: params.event,
    message: params.reason || `${params.event} ${params.success ? 'succeeded' : 'failed'}`,
    userId: params.userId,
    email: params.email,
    ip: params.ip,
    transactionId: params.transactionId,
    paymentIntentId: params.paymentIntentId,
    details: {
      amount: params.amount,
      currency: params.currency,
      ...params.details,
    },
    severity,
    requiresAlert: severity === 'critical' || severity === 'high',
  });
}

/**
 * Log abuse event
 */
export async function logAbuseEvent(params: {
  event: 'rate_limit_exceeded' | 'bot_detected' | 'ip_blocked' | 'challenge_required' | 'scraping_attempt' | 'inventory_abuse';
  ip: string;
  userId?: string;
  email?: string;
  endpoint?: string;
  userAgent?: string;
  reason: string;
  details?: Record<string, any>;
}): Promise<void> {
  const severity = params.event === 'ip_blocked' || params.event === 'inventory_abuse'
    ? 'high'
    : params.event === 'bot_detected' || params.event === 'scraping_attempt'
      ? 'medium'
      : 'low';

  await logStructuredEvent({
    timestamp: new Date().toISOString(),
    level: severity === 'high' ? 'warn' : 'info',
    category: 'abuse',
    event: params.event,
    message: params.reason,
    userId: params.userId,
    email: params.email,
    ip: params.ip,
    userAgent: params.userAgent,
    endpoint: params.endpoint,
    details: params.details,
    severity,
    requiresAlert: severity === 'high',
  });
}

/**
 * Log API event
 */
export async function logApiEvent(params: {
  event: string;
  endpoint: string;
  method: string;
  statusCode: number;
  duration?: number;
  userId?: string;
  ip?: string;
  userAgent?: string;
  requestId?: string;
  details?: Record<string, any>;
}): Promise<void> {
  const severity = params.statusCode >= 500
    ? 'high'
    : params.statusCode >= 400
      ? 'medium'
      : 'low';

  await logStructuredEvent({
    timestamp: new Date().toISOString(),
    level: params.statusCode >= 500 ? 'error' : params.statusCode >= 400 ? 'warn' : 'info',
    category: 'api',
    event: params.event,
    message: `${params.method} ${params.endpoint} - ${params.statusCode}`,
    userId: params.userId,
    ip: params.ip,
    userAgent: params.userAgent,
    requestId: params.requestId,
    endpoint: params.endpoint,
    method: params.method,
    statusCode: params.statusCode,
    duration: params.duration,
    details: params.details,
    severity,
    requiresAlert: params.statusCode >= 500 && params.endpoint.includes('/api/'),
  });
}

/**
 * Log security event
 */
export async function logSecurityEvent(params: {
  event: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  message: string;
  details?: Record<string, any>;
}): Promise<void> {
  await logStructuredEvent({
    timestamp: new Date().toISOString(),
    level: params.severity === 'critical' ? 'error' : params.severity === 'high' ? 'warn' : 'info',
    category: 'security',
    event: params.event,
    message: params.message,
    userId: params.userId,
    email: params.email,
    ip: params.ip,
    userAgent: params.userAgent,
    details: params.details,
    severity: params.severity,
    requiresAlert: params.severity === 'critical' || params.severity === 'high',
  });
}
