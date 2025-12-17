import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Zendit is no longer used; keep route to avoid breaking old links.
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { status: "gone", message: "Zendit is no longer used. This endpoint is deprecated." },
    { status: 410 },
  );
}

