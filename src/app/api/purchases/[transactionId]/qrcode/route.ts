import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase, isSupabaseAdminReady } from "@/lib/supabase";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/purchases/[transactionId]/qrcode
 * Returns the eSIM activation payload (activation code or universal link)
 * The provider delivers activation data as text, so we return it for client-side QR generation.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const { transactionId } = await params;

    if (!transactionId) {
      return NextResponse.json(
        { error: "Missing transactionId" },
        { status: 400 }
      );
    }

    console.log('[QR Code] Fetching activation code for transaction:', transactionId);

    if (!isSupabaseAdminReady()) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const [{ data: activation }, { data: purchase }] = await Promise.all([
      supabase
        .from('activation_details')
        .select('confirmation_data, activation_code, universal_link, qr_code, iccid, smdp_address')
        .eq('transaction_id', transactionId)
        .maybeSingle(),
      supabase
        .from('esim_purchases')
        .select('confirmation')
        .eq('transaction_id', transactionId)
        .maybeSingle(),
    ]);

    const confirmation =
      (purchase as any)?.confirmation ||
      (activation as any)?.confirmation_data ||
      activation ||
      null;

    if (!confirmation) {
      return NextResponse.json(
        { error: "Activation details not found yet. Please wait and try again." },
        { status: 404 }
      );
    }

    const activationCode =
      confirmation.activationCode ||
      confirmation.activation_code ||
      confirmation.qrCode ||
      confirmation.qr_code ||
      confirmation.universalLink ||
      confirmation.universal_link ||
      null;

    if (!activationCode) {
      return NextResponse.json(
        { error: "Activation link not available yet" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      activationCode,
      transactionId,
      iccid: confirmation.iccid || confirmation.sim?.iccid || null,
      smdpAddress: confirmation.smdpAddress || confirmation.smdp_address || null,
      note: "Use this string or link to activate your eSIM. Generate a QR code client-side if needed.",
    });
  } catch (error) {
    console.error("[QR Code] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch activation code",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
