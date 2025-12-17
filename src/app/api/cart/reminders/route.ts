import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { supabaseAdmin as supabase, isSupabaseAdminReady } from "@/lib/supabase";
import { sanitizeString, isValidEmail, checkRateLimit, getClientIP } from "@/lib/security";
import { resend } from "@/lib/email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CartItemPayload = {
  offerId: string;
  name?: string;
  priceLabel?: string;
  quantity: number;
};

function makeToken() {
  return randomBytes(24).toString("base64url"); // ~32 chars
}

function buildCartSummary(items: CartItemPayload[]) {
  return items
    .slice(0, 10)
    .map((i) => `${i.quantity}× ${i.name || i.offerId}`)
    .join(", ");
}

async function sendCartAbandonmentEmail(params: {
  to: string;
  token: string;
  items: CartItemPayload[];
  scheduledAtIso: string;
  reminderNumber: 1 | 2;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "My Umrah eSIM";
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@myumrahesim.com";
  const emailFrom = process.env.EMAIL_FROM || `noreply@${new URL(baseUrl).hostname.replace(/^www\./, "")}`;

  const restoreUrl = `${baseUrl}/cart?restore=${encodeURIComponent(params.token)}`;
  // NOTE: Checkout requires cart items in localStorage; we route via /cart restore first.
  const checkoutUrl = restoreUrl;
  const summary = buildCartSummary(params.items);

  const subject =
    params.reminderNumber === 1
      ? `You left something in your cart – ${brandName}`
      : `Last chance to finish checkout – ${brandName}`;

  const html = `
    <!doctype html>
    <html>
      <head><meta charset="utf-8" /></head>
      <body style="font-family: Arial, sans-serif; background:#f3f4f6; padding:24px;">
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;padding:24px;">
          <h1 style="margin:0 0 12px 0;">Finish your eSIM checkout</h1>
          <p style="margin:0 0 16px 0;color:#374151;">We saved your cart: <strong>${summary || "eSIM plans"}</strong></p>
          <p style="margin:0 0 16px 0;">
            <a href="${checkoutUrl}" style="display:inline-block;background:#0ea5e9;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:700;">
              View my cart
            </a>
          </p>
          <p style="margin:0 0 16px 0;">
            <a href="${restoreUrl}" style="color:#0ea5e9;text-decoration:underline;font-weight:600;">
              View cart
            </a>
          </p>
          <p style="margin-top:24px;font-size:12px;color:#6b7280;">
            Need help? Reply to this email or contact <a href="mailto:${supportEmail}">${supportEmail}</a>.
          </p>
        </div>
      </body>
    </html>
  `;

  // Resend supports scheduled_at (snake_case) for scheduling.
  const { data, error } = await (resend.emails.send as any)({
    from: emailFrom,
    replyTo: supportEmail,
    to: params.to,
    subject,
    html,
    scheduled_at: params.scheduledAtIso,
    tags: [
      { name: "category", value: "cart_abandonment" },
      { name: "cart_token", value: params.token },
      { name: "reminder", value: String(params.reminderNumber) },
    ],
  });

  if (error) throw new Error(error.message);
  return data as { id: string } | null;
}

export async function POST(req: NextRequest) {
  try {
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(`cart-reminders:${clientIP}`, 10, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    if (!isSupabaseAdminReady()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const body = await req.json();
    const emailRaw = body?.email;
    const itemsRaw: unknown = body?.items;
    const tokenRaw = body?.token;

    const email = emailRaw ? sanitizeString(String(emailRaw).toLowerCase().trim(), 254) : "";
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    if (!Array.isArray(itemsRaw) || itemsRaw.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const items: CartItemPayload[] = itemsRaw.slice(0, 10).map((i: any) => ({
      offerId: sanitizeString(String(i?.offerId || ""), 100),
      name: i?.name ? sanitizeString(String(i.name), 200) : undefined,
      priceLabel: i?.priceLabel ? sanitizeString(String(i.priceLabel), 40) : undefined,
      quantity: Math.max(1, Math.min(10, Number(i?.quantity) || 1)),
    }));

    if (items.some((i) => !i.offerId)) {
      return NextResponse.json({ error: "Invalid cart items" }, { status: 400 });
    }

    const token = tokenRaw ? sanitizeString(String(tokenRaw).trim(), 128) : makeToken();

    const nowIso = new Date().toISOString();
    const twoHours = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const oneDay = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Upsert session
    const { data: session, error: upsertError } = await supabase
      .from("cart_sessions")
      .upsert(
        {
          token,
          email,
          items,
          updated_at: nowIso,
        },
        { onConflict: "token" },
      )
      .select(
        "id, token, email, converted_at, reminder1_email_id, reminder2_email_id, reminder1_scheduled_at, reminder2_scheduled_at",
      )
      .single();

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }
    if (session.converted_at) {
      return NextResponse.json({ ok: true, token: session.token, alreadyConverted: true });
    }

    // Schedule reminder 1 and 2 only if not already scheduled
    let reminder1EmailId: string | null = session.reminder1_email_id || null;
    let reminder2EmailId: string | null = session.reminder2_email_id || null;

    try {
      if (!reminder1EmailId) {
        const sent = await sendCartAbandonmentEmail({
          to: email,
          token,
          items,
          scheduledAtIso: twoHours,
          reminderNumber: 1,
        });
        reminder1EmailId = sent?.id || null;
      }

      if (!reminder2EmailId) {
        const sent = await sendCartAbandonmentEmail({
          to: email,
          token,
          items,
          scheduledAtIso: oneDay,
          reminderNumber: 2,
        });
        reminder2EmailId = sent?.id || null;
      }

      await supabase
        .from("cart_sessions")
        .update({
          reminder1_scheduled_at: session.reminder1_scheduled_at || twoHours,
          reminder1_email_id: reminder1EmailId,
          reminder2_scheduled_at: session.reminder2_scheduled_at || oneDay,
          reminder2_email_id: reminder2EmailId,
          last_error: null,
          updated_at: nowIso,
        })
        .eq("id", session.id);
    } catch (e: any) {
      await supabase
        .from("cart_sessions")
        .update({
          last_error: e?.message ? String(e.message).slice(0, 500) : "Failed to schedule reminders",
          updated_at: nowIso,
        })
        .eq("id", session.id);

      return NextResponse.json({ error: "Failed to schedule reminders" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, token });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

