import { NextRequest, NextResponse } from "next/server";
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { clearFailedLoginAttempts, detectAuthAnomaly } from '@/lib/auth-security';
import { supabaseAdmin as supabase, isSupabaseAdminReady } from '@/lib/supabase';
import { dispatchSecurityAlert } from '@/lib/alerts/dispatch';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;

/**
 * POST /api/webhooks/clerk
 * Handles Clerk webhook events for authentication security
 * 
 * Events handled:
 * - user.created: Sync user to database
 * - session.created: Track login, clear failed attempts, detect anomalies
 * - session.ended: Track logout
 * - session.revoked: Track session revocation
 * - user.deleted: Clean up user data
 */
export async function POST(req: NextRequest) {
  // Verify webhook signature
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("[Clerk Webhook] Missing svix headers");
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  if (!webhookSecret) {
    console.error("[Clerk Webhook] Webhook secret not configured");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const payload = await req.text();
  let evt: any;

  try {
    const wh = new Webhook(webhookSecret);
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("[Clerk Webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const eventType = evt.type;
  const { id, email_addresses, ...data } = evt.data;

  try {
    // Handle user.created event - sync to Supabase
    if (eventType === 'user.created') {
      const email = email_addresses?.[0]?.email_address;
      
      if (email && isSupabaseAdminReady()) {
        await supabase
          .from('customers')
          .upsert({
            email: email.toLowerCase(),
            clerk_user_id: id,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'clerk_user_id',
          });
      }
    }

    // Handle session.created event - track login, clear failed attempts, detect anomalies
    if (eventType === 'session.created') {
      const userId = data.user_id || id;
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                 req.headers.get('x-real-ip')?.trim() || 
                 'unknown';
      const userAgent = req.headers.get('user-agent') || 'unknown';

      // Clear failed login attempts on successful login
      const email = email_addresses?.[0]?.email_address;
      if (email) {
        await clearFailedLoginAttempts(email);
      }

      // Detect authentication anomalies
      if (userId) {
        const anomaly = await detectAuthAnomaly(userId, ip, userAgent);
        
        if (anomaly.suspicious) {
          await dispatchSecurityAlert({
            severity: 'high',
            category: 'auth',
            event: 'suspicious_login',
            message: 'Suspicious auth anomaly detected from Clerk session.created webhook',
            userId,
            email,
            ip,
            userAgent,
            details: {
              reasons: anomaly.reasons,
            },
          });
        }
      }
    }

    // Handle session.ended event - track logout
    if (eventType === 'session.ended') {
      // Could log to security_events table if needed
    }

    // Handle session.revoked event - track session revocation
    if (eventType === 'session.revoked') {
      const userId = data.user_id || id;
      
      // Log security event
      if (isSupabaseAdminReady()) {
        await supabase.from('security_events').insert({
          event_type: 'session_revoked',
          user_id: userId,
          ip_address: req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
          details: { reason: 'session_revoked' },
          created_at: new Date().toISOString(),
        });
      }
    }

    // Handle user.deleted event - clean up user data
    if (eventType === 'user.deleted') {
      const userId = id;
      
      if (isSupabaseAdminReady()) {
        // Clean up user data (anonymize, don't delete for audit trail)
        await supabase
          .from('customers')
          .update({
            email: `deleted_${userId}@deleted.local`,
            clerk_user_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq('clerk_user_id', userId);
      }
    }

    return NextResponse.json({ received: true, eventType });
  } catch (error) {
    console.error("[Clerk Webhook] Error processing event:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
