import { NextRequest, NextResponse } from "next/server";
import { getEsimQRCode } from "@/lib/zendit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/purchases/[transactionId]/qrcode
 * Returns the eSIM QR code image as PNG
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

    console.log('[QR Code] Fetching QR code for transaction:', transactionId);

    // Get QR code from Zendit
    const qrCodeBlob = await getEsimQRCode(transactionId);

    // Convert blob to buffer
    const buffer = Buffer.from(await qrCodeBlob.arrayBuffer());

    // Return image with proper headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error("[QR Code] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch QR code",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
