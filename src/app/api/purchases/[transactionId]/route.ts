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

    // Authorization: Check if user owns this transaction (if authenticated)
    let isAuthorized = false;
    try {
      const authResult = await auth();
      const userId = authResult.userId;

      if (userId && isSupabaseAdminReady()) {
        // Check if this transaction belongs to the authenticated user
        const { data: purchase } = await supabase
          .from('esim_purchases')
          .select('customer_email, user_id')
          .eq('transaction_id', transactionId)
          .single();

        if (purchase) {
          // Check if user is linked to this purchase
          const { data: customer } = await supabase
            .from('customers')
            .select('id, email')
            .eq('clerk_user_id', userId)
            .single();

          if (customer && (
            purchase.user_id === customer.id || 
            purchase.customer_email === customer.email
          )) {
            isAuthorized = true;
          }
        }
      }
    } catch (authError) {
      // If auth fails, allow unauthenticated access (for guest checkout)
      // But we'll still check if transaction exists
      isAuthorized = true; // Allow guest access for now
    }

    if (!isSupabaseAdminReady()) {
      return Response.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { data: purchaseRecord } = await supabase
      .from('esim_purchases')
      .select(`
        *,
        activation_details (
          smdp_address,
          activation_code,
          iccid,
          confirmation_data
        )
      `)
      .eq('transaction_id', transactionId)
      .single();

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
      purchaseRecord.activation_details?.confirmation_data ||
      purchaseRecord.activation_details ||
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
