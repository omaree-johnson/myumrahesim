import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getEsimUsage, queryEsimProfiles } from '@/lib/esimaccess';
import { supabaseAdmin as supabase, isSupabaseAdminReady } from '@/lib/supabase';
import { isValidTransactionId, checkRateLimit, getClientIP } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const { transactionId } = await params;

    if (!transactionId) {
      return Response.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // Validate transaction ID format
    if (!isValidTransactionId(transactionId)) {
      return Response.json(
        { error: 'Invalid transaction ID format' },
        { status: 400 }
      );
    }

    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`purchase:${clientIP}`, 20, 60000); // 20 requests per minute
    if (!rateLimit.allowed) {
      return Response.json(
        { error: "Too many requests. Please try again later." },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetAt.toString()
          }
        }
      );
    }

    // CRITICAL: Require authentication for purchase data access
    // Guest checkout is handled at purchase time, but viewing purchase data requires auth
    let userId: string | null = null;
    try {
      const authResult = await auth();
      userId = authResult.userId;
    } catch (authError) {
      // Auth error - require authentication
      return Response.json(
        { error: 'Authentication required to view purchase details' },
        { status: 401 }
      );
    }

    if (!userId) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify user owns this transaction
    let isAuthorized = false;
    if (isSupabaseAdminReady()) {
      // Check if this transaction belongs to the authenticated user
      const { data: purchase } = await supabase
        .from('esim_purchases')
        .select('customer_email, user_id')
        .eq('transaction_id', transactionId)
        .single();

      if (!purchase) {
        return Response.json(
          { error: 'Purchase not found' },
          { status: 404 }
        );
      }

      // Check if user is linked to this purchase
      const { data: customer } = await supabase
        .from('customers')
        .select('id, email')
        .eq('clerk_user_id', userId)
        .single();

      if (!customer) {
        return Response.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }

      // Verify ownership
      const isOwner = 
        purchase.user_id === customer.id || 
        purchase.customer_email?.toLowerCase() === customer.email.toLowerCase();

      if (!isOwner) {
        // Log unauthorized access attempt
        const { logSecurityEvent } = await import('@/lib/auth-security');
        await logSecurityEvent({
          eventType: 'unauthorized_access_attempt',
          userId,
          ip: getClientIP(request),
          details: { transactionId, attemptedEmail: customer.email },
        });

        return Response.json(
          { error: 'Unauthorized - You do not have access to this purchase' },
          { status: 403 }
        );
      }

      isAuthorized = true;
    }

    if (!isSupabaseAdminReady()) {
      return Response.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Query esim_purchases and activation_details separately (no FK relationship exists)
    const { data: purchaseRecord } = await supabase
      .from('esim_purchases')
      .select('*')
      .eq('transaction_id', transactionId)
      .single();

    // Get activation details separately
    let activationDetails = null;
    if (purchaseRecord) {
      const { data: ad } = await supabase
        .from('activation_details')
        .select('smdp_address, activation_code, iccid, confirmation_data, qr_code, universal_link')
        .eq('transaction_id', transactionId)
        .single();
      activationDetails = ad;
    }

    if (!purchaseRecord) {
      return Response.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }

    const providerStatus = purchaseRecord.esim_provider_status;
    const status = providerStatus || purchaseRecord.stripe_payment_status || 'PROCESSING';

    const confirmationData =
      purchaseRecord.confirmation ||
      activationDetails?.confirmation_data ||
      activationDetails ||
      null;

    const confirmation = {
      iccid: confirmationData?.iccid || confirmationData?.sim?.iccid || null,
      smdpAddress: confirmationData?.smdpAddress || confirmationData?.smdp_address || null,
      activationCode: confirmationData?.activationCode || confirmationData?.activation_code || null,
      activationLink: confirmationData?.universalLink || confirmationData?.universal_link || confirmationData?.qr || null,
      simId: confirmationData?.simId || confirmationData?.sim_id || confirmationData?.sim?.id || null,
    };

    // Fetch current usage if we have an esimTranNo or orderNo
    let usageData = undefined;
    const orderNo = purchaseRecord.order_no;
    const esimTranNo =
      purchaseRecord.esim_tran_no ||
      purchaseRecord.esim_provider_response?.esimTranNo ||
      purchaseRecord.esim_provider_response?.esim_tran_no;
    
    if (esimTranNo) {
      try {
        const usage = await getEsimUsage(esimTranNo);
        if (usage) {
          const totalData = usage.totalData || 0; // in bytes
          const dataUsage = usage.dataUsage || 0; // in bytes
          const remaining = totalData - dataUsage;
          
          // Convert bytes to GB
          const totalGB = totalData / (1024 * 1024 * 1024);
          const usedGB = dataUsage / (1024 * 1024 * 1024);
          const remainingGB = remaining / (1024 * 1024 * 1024);
          
          usageData = {
            data: parseFloat(usedGB.toFixed(2)),
            dataLimit: parseFloat(totalGB.toFixed(2)),
            remaining: parseFloat(remainingGB.toFixed(2)),
            unit: 'GB',
            lastUpdateTime: usage.lastUpdateTime,
          };
        }
      } catch (usageError) {
        console.error('[Purchase Status] Usage fetch failed:', usageError);
      }
    }

    return Response.json({
      success: true,
      transactionId,
      status,
      confirmation,
      usage: usageData,
      rawData: purchaseRecord.esim_provider_response
    }, {
      headers: {
        'X-RateLimit-Limit': '20',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetAt.toString()
      }
    });

  } catch (error) {
    console.error('[Purchase Status] Error:', error);
    // Don't expose internal error details to client
    return Response.json(
      { 
        error: 'Failed to fetch purchase status. Please try again later.'
      },
      { status: 500 }
    );
  }
}
