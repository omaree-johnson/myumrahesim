import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin as supabase, isSupabaseAdminReady } from "@/lib/supabase";
import { sanitizeString } from "@/lib/security";
import { createDiscountCode } from "@/lib/discounts";
import { sendReviewDiscountEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    if (!isSupabaseAdminReady()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

    const body = await req.json();
    const transactionId = sanitizeString(String(body?.transactionId || "").trim(), 64);
    const rating = Math.max(1, Math.min(5, Number(body?.rating) || 0));
    const title = body?.title ? sanitizeString(String(body.title).trim(), 120) : null;
    const reviewBody = body?.body ? sanitizeString(String(body.body).trim(), 1000) : null;

    if (!transactionId) return NextResponse.json({ error: "Missing transactionId" }, { status: 400 });
    if (!rating) return NextResponse.json({ error: "Invalid rating" }, { status: 400 });

    const { data: customer } = await supabase
      .from("customers")
      .select("email")
      .eq("clerk_user_id", userId)
      .maybeSingle();

    const email = customer?.email ? String(customer.email).toLowerCase().trim() : null;
    if (!email) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    const { data: purchase } = await supabase
      .from("esim_purchases")
      .select("transaction_id, customer_email, customer_name, esim_provider_status, stripe_payment_status")
      .eq("transaction_id", transactionId)
      .maybeSingle();

    if (!purchase?.transaction_id) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (purchase.customer_email?.toLowerCase?.() !== email) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    // Insert review (moderation-ready: published=false)
    const { error: insertError } = await supabase.from("reviews").insert({
      transaction_id: transactionId,
      user_id: userId,
      email,
      rating,
      title,
      body: reviewBody,
      published: false,
    });

    if (insertError) {
      // Unique constraint -> already reviewed
      if (insertError.code === "23505") {
        return NextResponse.json({ error: "You already submitted a review for this order." }, { status: 409 });
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Issue single-use 5% discount (usable on any purchase)
    const percentOff = 5;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const { code } = await createDiscountCode({
      percentOff,
      appliesTo: "any",
      createdReason: "review_5_percent",
      createdForTransactionId: transactionId,
      createdForEmail: email,
      expiresAt,
    });

    // Email the code
    await sendReviewDiscountEmail({
      to: email,
      customerName: purchase.customer_name || "Traveler",
      discountCode: code,
      discountPercentOff: percentOff,
    });

    return NextResponse.json({ ok: true, discountCode: code, discountPercentOff: percentOff });
  } catch (e) {
    console.error("[Reviews] Error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

