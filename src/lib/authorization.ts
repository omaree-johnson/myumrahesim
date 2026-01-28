import { auth, currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin as supabase, isSupabaseAdminReady } from '@/lib/supabase';
import { getClientIP } from './security';

/**
 * Verify user is authenticated
 * Throws error if not authenticated
 */
export async function requireAuth(): Promise<{ userId: string }> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('UNAUTHORIZED');
  }
  return { userId };
}

/**
 * Get customer record for authenticated user
 */
export async function getCustomerForUser(userId: string) {
  if (!isSupabaseAdminReady()) {
    return null;
  }

  const { data: customer } = await supabase
    .from('customers')
    .select('id, email, clerk_user_id')
    .eq('clerk_user_id', userId)
    .single();

  return customer;
}

/**
 * Verify user owns a purchase
 */
export async function verifyPurchaseOwnership(
  transactionId: string,
  userId: string
): Promise<{ authorized: boolean; purchase?: any; customer?: any }> {
  const customer = await getCustomerForUser(userId);
  if (!customer) {
    return { authorized: false };
  }

  if (!isSupabaseAdminReady()) {
    return { authorized: false };
  }

  const { data: purchase } = await supabase
    .from('esim_purchases')
    .select('transaction_id, customer_email, user_id')
    .eq('transaction_id', transactionId)
    .single();

  if (!purchase) {
    return { authorized: false };
  }

  const isOwner = 
    purchase.user_id === customer.id ||
    purchase.customer_email?.toLowerCase() === customer.email.toLowerCase();

  return { authorized: isOwner, purchase, customer };
}

/**
 * Verify user is admin
 * Admin emails are configured in ADMIN_EMAILS environment variable
 */
export async function requireAdmin(): Promise<{ userId: string; email: string }> {
  const { userId } = await requireAuth();
  
  const user = await currentUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }

  const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase();
  if (!userEmail) {
    throw new Error('UNAUTHORIZED');
  }

  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  if (ADMIN_EMAILS.length === 0) {
    console.warn('[Authorization] No admin emails configured. Set ADMIN_EMAILS environment variable.');
    throw new Error('FORBIDDEN');
  }

  if (!ADMIN_EMAILS.includes(userEmail)) {
    throw new Error('FORBIDDEN');
  }

  return { userId, email: userEmail };
}

/**
 * Log unauthorized access attempt
 */
export async function logUnauthorizedAccess(
  eventType: string,
  userId: string | null,
  ip: string,
  details: Record<string, any>
): Promise<void> {
  if (!isSupabaseAdminReady()) return;

  try {
    const { logSecurityEvent } = await import('@/lib/auth-security');
    await logSecurityEvent({
      eventType,
      userId: userId || undefined,
      ip,
      details,
    });
  } catch (error) {
    console.error('[Authorization] Failed to log security event:', error);
  }
}
