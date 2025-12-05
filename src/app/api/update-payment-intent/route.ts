import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/update-payment-intent
 * Updates a Payment Intent with email and name before payment confirmation
 */
export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId, email, fullName } = await req.json();

    console.log('[Update Payment Intent] Request received:', {
      paymentIntentId,
      email: email ? `${email.substring(0, 3)}***` : 'MISSING',
      hasFullName: !!fullName,
    });

    if (!paymentIntentId || !email) {
      console.error('[Update Payment Intent] ❌ Missing required fields:', {
        hasPaymentIntentId: !!paymentIntentId,
        hasEmail: !!email,
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!email.includes('@')) {
      console.error('[Update Payment Intent] ❌ Invalid email format:', email);
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Retrieve current metadata to preserve it
    console.log('[Update Payment Intent] Retrieving current payment intent...');
    const currentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const currentMetadata = currentIntent.metadata || {};
    
    console.log('[Update Payment Intent] Current payment intent:', {
      id: currentIntent.id,
      status: currentIntent.status,
      currentMetadata: Object.keys(currentMetadata),
      currentReceiptEmail: currentIntent.receipt_email,
    });

    // Update payment intent with email/name
    console.log('[Update Payment Intent] Updating payment intent with email...');
    const updatedIntent = await stripe.paymentIntents.update(paymentIntentId, {
      metadata: {
        ...currentMetadata,
        recipientEmail: email.trim(),
        ...(fullName && { fullName: fullName.trim() }),
      },
      receipt_email: email.trim(),
    });

    console.log('[Update Payment Intent] ✅ Payment intent updated successfully:', {
      id: updatedIntent.id,
      receiptEmail: updatedIntent.receipt_email,
      metadataRecipientEmail: updatedIntent.metadata.recipientEmail,
      allMetadata: Object.keys(updatedIntent.metadata),
    });

    // Verify the update worked
    if (!updatedIntent.metadata.recipientEmail || updatedIntent.metadata.recipientEmail !== email.trim()) {
      console.error('[Update Payment Intent] ❌ Email not saved correctly:', {
        expected: email.trim(),
        actual: updatedIntent.metadata.recipientEmail,
      });
      return NextResponse.json(
        { error: "Email was not saved correctly" },
        { status: 500 }
      );
    }

    if (!updatedIntent.receipt_email || updatedIntent.receipt_email !== email.trim()) {
      console.error('[Update Payment Intent] ❌ Receipt email not saved correctly:', {
        expected: email.trim(),
        actual: updatedIntent.receipt_email,
      });
      return NextResponse.json(
        { error: "Receipt email was not saved correctly" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentIntentId: updatedIntent.id,
      email: updatedIntent.metadata.recipientEmail,
      receiptEmail: updatedIntent.receipt_email,
    });
  } catch (error) {
    console.error("[Update Payment Intent] ❌ Error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { 
        error: "Failed to update payment intent",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

