import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getPurchaseDetails, getEsimQRCode, getEsimUsage } from '@/lib/zendit';
import { supabase, isSupabaseReady } from '@/lib/supabase';
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

      if (userId && isSupabaseReady()) {
        // Check if this transaction belongs to the authenticated user
        const { data: purchase } = await supabase
          .from('purchases')
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

    // Fetch from Zendit
    const purchaseDetails = await getPurchaseDetails(transactionId);

    if (!purchaseDetails) {
      return Response.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }

    // Parse activation details from Zendit response
    const confirmation = purchaseDetails.confirmation || {};
    const status = purchaseDetails.status || 'PENDING';

    // Fetch or generate QR code if available
    let qrCodeUrl = null;
    if (status === 'DONE' && confirmation.iccid) {
      try {
        const qrBlob = await getEsimQRCode(transactionId);
        // In production, upload blob to storage and get URL
        // For now, we'll return a data URL
        const buffer = await qrBlob.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        qrCodeUrl = `data:image/png;base64,${base64}`;
      } catch (qrError) {
        console.error('[Purchase Status] QR code error:', qrError);
        // Continue without QR code
      }
    }

    // Update database with latest status if Supabase is configured
    if (isSupabaseReady()) {
      const { error: dbError } = await supabase
        .from('purchases')
        .update({
          status: status,
          zendit_response: purchaseDetails
        })
        .eq('transaction_id', transactionId);

      if (dbError) {
        console.error('[Purchase Status] Database update error:', dbError);
      }

      // Upsert activation details if confirmation data exists
      if (confirmation.iccid || confirmation.activationCode) {
        const { error: activationError } = await supabase
          .from('activation_details')
          .upsert({
            transaction_id: transactionId,
            qr_code_url: qrCodeUrl,
            smdp_address: confirmation.smdpAddress || null,
            activation_code: confirmation.activationCode || null,
            iccid: confirmation.iccid || null,
            confirmation_data: confirmation
          }, {
            onConflict: 'transaction_id'
          });

        if (activationError) {
          console.error('[Purchase Status] Activation details error:', activationError);
        }
      }
    }

    // Fetch real usage data from Zendit if eSIM is active
    let usageData = undefined;
    if (status === 'DONE' && confirmation.iccid) {
      try {
        const usageResponse = await getEsimUsage(confirmation.iccid);
        console.log('[Purchase Status] Usage data:', usageResponse);
        
        // Parse Zendit usage response
        // Zendit returns: { list: [...plans], total: number }
        // Each plan has usage information
        if (usageResponse.list && usageResponse.list.length > 0) {
          // Get the first active plan's usage
          const activePlan = usageResponse.list[0];
          
          // Calculate usage based on Zendit's plan structure
          // Plan typically includes: dataGB, dataUsageGB, status, etc.
          const dataLimit = activePlan.dataGB || purchaseDetails.dataGB || 0;
          const dataUsed = activePlan.dataUsageGB || 0;
          
          usageData = {
            data: parseFloat(dataUsed.toFixed(2)),
            dataLimit: dataLimit,
            unit: 'GB'
          };
          
          console.log('[Purchase Status] Parsed usage:', usageData);
        }
      } catch (usageError) {
        console.error('[Purchase Status] Failed to fetch usage:', usageError);
        // Don't fail the entire request if usage fetch fails
        // Usage will remain undefined
      }
    }

    return Response.json({
      success: true,
      transactionId,
      status,
      confirmation: {
        iccid: confirmation.iccid || null,
        smdpAddress: confirmation.smdpAddress || null,
        activationCode: confirmation.activationCode || null,
        qrCode: qrCodeUrl
      },
      usage: usageData,
      rawData: purchaseDetails
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
