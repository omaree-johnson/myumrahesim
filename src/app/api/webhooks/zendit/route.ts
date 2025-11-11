import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendActivationEmail } from '@/lib/email';

// Handle webhook verification (HEAD request - used by Zendit to verify endpoint)
export async function HEAD() {
  return new Response(null, { 
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Content-Length': '0',
    }
  });
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Allow': 'GET, POST, HEAD, OPTIONS',
      'Content-Length': '0',
    }
  });
}

// Handle webhook verification (GET request)
export async function GET() {
  return Response.json({ 
    status: 'ok',
    message: 'Zendit webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  try {
    // Verify request is from Zendit IP addresses
    const allowedIPs = ['18.209.125.75', '3.217.45.95', '54.243.153.139'];
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    console.log('[Zendit Webhook] Request from IP:', clientIP);
    
    // Skip IP verification in development (ngrok changes IPs)
    const isDev = process.env.NODE_ENV === 'development';
    if (!isDev && !allowedIPs.includes(clientIP)) {
      console.error('[Zendit Webhook] Unauthorized IP:', clientIP);
      return Response.json({ error: 'Unauthorized IP' }, { status: 403 });
    }

    const payload = await request.json();
    console.log('[Zendit Webhook] Received:', JSON.stringify(payload, null, 2));

    const {
      transactionId,
      status,
      confirmation,
      offerId,
      error: purchaseError
    } = payload;

    if (!transactionId) {
      return Response.json({ error: 'Missing transactionId' }, { status: 400 });
    }

    // Update purchase status in database
    const { data: purchase, error: updateError } = await supabase
      .from('purchases')
      .update({
        status: status || 'PENDING',
        zendit_response: payload,
        updated_at: new Date().toISOString()
      })
      .eq('transaction_id', transactionId)
      .select()
      .single();

    if (updateError) {
      console.error('[Zendit Webhook] Database update error:', updateError);
      return Response.json({ error: 'Database error' }, { status: 500 });
    }

    // If purchase is complete, save activation details
    if (status === 'DONE' && confirmation) {
      const { error: activationError } = await supabase
        .from('activation_details')
        .upsert({
          transaction_id: transactionId,
          smdp_address: confirmation.smdpAddress || null,
          activation_code: confirmation.activationCode || null,
          iccid: confirmation.iccid || null,
          confirmation_data: confirmation,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'transaction_id'
        });

      if (activationError) {
        console.error('[Zendit Webhook] Activation details error:', activationError);
      }

      // Send activation email
      if (purchase) {
        try {
          await sendActivationEmail({
            to: purchase.customer_email,
            customerName: purchase.customer_name,
            transactionId: transactionId,
            smdpAddress: confirmation.smdpAddress,
            activationCode: confirmation.activationCode,
            iccid: confirmation.iccid
          });
          
          console.log('[Zendit Webhook] Activation email sent to:', purchase.customer_email);
        } catch (emailError) {
          console.error('[Zendit Webhook] Email error:', emailError);
          // Don't fail the webhook if email fails
        }
      }
    }

    // If purchase failed, log the error
    if (status === 'FAILED') {
      console.error('[Zendit Webhook] Purchase failed:', {
        transactionId,
        error: purchaseError,
        offerId
      });
    }

    return Response.json({ 
      success: true,
      received: true,
      transactionId 
    });

  } catch (error) {
    console.error('[Zendit Webhook] Error:', error);
    return Response.json(
      { 
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
