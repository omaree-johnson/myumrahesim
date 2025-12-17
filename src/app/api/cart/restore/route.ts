import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase, isSupabaseAdminReady } from "@/lib/supabase";
import { sanitizeString } from "@/lib/security";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    if (!isSupabaseAdminReady()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const tokenRaw = req.nextUrl.searchParams.get("token");
    const token = tokenRaw ? sanitizeString(tokenRaw, 128) : "";
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("cart_sessions")
      .select("token, email, items, currency, converted_at")
      .eq("token", token)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Cart session not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      token: data.token,
      email: data.email,
      currency: data.currency,
      convertedAt: data.converted_at,
      items: data.items,
    });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

