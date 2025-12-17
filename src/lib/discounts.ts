import { supabaseAdmin as supabase, isSupabaseAdminReady } from "@/lib/supabase";

export type DiscountAppliesTo = "any" | "esim" | "cart" | "topup";

export type DiscountCodeRow = {
  id: string;
  code: string;
  percent_off: number;
  applies_to: DiscountAppliesTo | string;
  created_reason: string | null;
  created_for_transaction_id: string | null;
  created_for_email: string | null;
  max_redemptions: number;
  redeemed_count: number;
  expires_at: string | null;
};

export type DiscountCalculation = {
  originalTotalCents: number;
  discountedTotalCents: number;
  discountAmountCents: number;
  percentOff: number;
};

export function normalizeDiscountCode(raw?: string | null) {
  const code = String(raw || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "");
  return code.length ? code : null;
}

export function generateDiscountCode(prefix: string) {
  const safePrefix = prefix.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10) || "DISC";
  const rand = Math.random().toString(36).slice(2, 10).toUpperCase();
  const ts = Date.now().toString(36).slice(-6).toUpperCase();
  return `${safePrefix}-${ts}-${rand}`.slice(0, 32);
}

export function applyPercentDiscountWithFloor(params: {
  totalCents: number;
  percentOff: number;
  minTotalCents: number;
}): DiscountCalculation {
  const total = Math.max(0, Math.round(params.totalCents));
  const pct = Math.max(0, Math.min(90, Math.round(params.percentOff)));
  const minTotal = Math.max(0, Math.round(params.minTotalCents));

  const desiredDiscount = Math.round((total * pct) / 100);
  const maxDiscountAllowed = Math.max(0, total - minTotal);
  const discount = Math.min(desiredDiscount, maxDiscountAllowed);
  const discounted = total - discount;

  return {
    originalTotalCents: total,
    discountedTotalCents: discounted,
    discountAmountCents: discount,
    percentOff: pct,
  };
}

async function getDiscountByCode(code: string): Promise<DiscountCodeRow | null> {
  if (!isSupabaseAdminReady()) return null;
  const { data } = await supabase
    .from("discount_codes")
    .select(
      "id, code, percent_off, applies_to, created_reason, created_for_transaction_id, created_for_email, max_redemptions, redeemed_count, expires_at",
    )
    .eq("code", code)
    .maybeSingle();

  return (data as any) ?? null;
}

function isExpired(expiresAt?: string | null) {
  if (!expiresAt) return false;
  const t = Date.parse(expiresAt);
  return Number.isFinite(t) ? t <= Date.now() : false;
}

export async function createDiscountCode(params: {
  code?: string;
  percentOff: number;
  appliesTo?: DiscountAppliesTo;
  createdReason?: string;
  createdForTransactionId?: string;
  createdForEmail?: string;
  expiresAt?: Date;
}): Promise<{ codeRow: DiscountCodeRow; code: string }> {
  if (!isSupabaseAdminReady()) {
    throw new Error("Database not configured");
  }

  const code = normalizeDiscountCode(params.code) || generateDiscountCode("DISC");
  const percentOff = Math.max(1, Math.min(90, Math.round(params.percentOff)));
  const appliesTo = (params.appliesTo || "any") as DiscountAppliesTo;

  const payload: any = {
    code,
    percent_off: percentOff,
    applies_to: appliesTo,
    created_reason: params.createdReason || null,
    created_for_transaction_id: params.createdForTransactionId || null,
    created_for_email: params.createdForEmail ? String(params.createdForEmail).toLowerCase().trim() : null,
    max_redemptions: 1,
    redeemed_count: 0,
    expires_at: params.expiresAt ? params.expiresAt.toISOString() : null,
  };

  const { data, error } = await supabase
    .from("discount_codes")
    .insert(payload)
    .select(
      "id, code, percent_off, applies_to, created_reason, created_for_transaction_id, created_for_email, max_redemptions, redeemed_count, expires_at",
    )
    .single();

  if (error) throw new Error(error.message);
  return { codeRow: data as any, code };
}

export async function validateDiscountForContext(params: {
  codeRaw?: string | null;
  customerEmail?: string | null;
  transactionId?: string | null;
  appliesTo: DiscountAppliesTo;
}): Promise<{ ok: true; codeRow: DiscountCodeRow } | { ok: false; error: string }> {
  const code = normalizeDiscountCode(params.codeRaw);
  if (!code) return { ok: false, error: "Invalid discount code" };

  const codeRow = await getDiscountByCode(code);
  if (!codeRow) return { ok: false, error: "Discount code not found" };
  if (isExpired(codeRow.expires_at)) return { ok: false, error: "Discount code expired" };
  if ((codeRow.redeemed_count || 0) >= (codeRow.max_redemptions || 1)) {
    return { ok: false, error: "Discount code already used" };
  }

  const appliesTo = (codeRow.applies_to as DiscountAppliesTo) || "any";
  if (appliesTo !== "any" && appliesTo !== params.appliesTo) {
    return { ok: false, error: "Discount code not valid for this purchase" };
  }

  const email = params.customerEmail ? String(params.customerEmail).toLowerCase().trim() : null;
  if (codeRow.created_for_email && email && codeRow.created_for_email !== email) {
    return { ok: false, error: "Discount code is locked to a different email" };
  }

  if (codeRow.created_for_transaction_id && params.transactionId && codeRow.created_for_transaction_id !== params.transactionId) {
    return { ok: false, error: "Discount code is locked to a different order" };
  }

  return { ok: true, codeRow };
}

export async function reserveDiscountForPaymentIntent(params: {
  codeRaw?: string | null;
  paymentIntentId: string;
  customerEmail?: string | null;
  transactionId?: string | null;
  appliesTo: DiscountAppliesTo;
  reservationTtlMinutes?: number;
}): Promise<
  | { ok: true; codeRow: DiscountCodeRow }
  | { ok: false; error: string }
> {
  if (!isSupabaseAdminReady()) return { ok: false, error: "Database not configured" };

  const validation = await validateDiscountForContext({
    codeRaw: params.codeRaw,
    customerEmail: params.customerEmail,
    transactionId: params.transactionId,
    appliesTo: params.appliesTo,
  });
  if (!validation.ok) return validation;

  const codeRow = validation.codeRow;
  const now = Date.now();
  const ttl = Math.max(5, Math.min(180, params.reservationTtlMinutes || 30));
  const expiresAt = new Date(now + ttl * 60 * 1000).toISOString();

  // Check if there is an active reservation for this code
  const { data: existing } = await supabase
    .from("discount_reservations")
    .select("discount_code_id, payment_intent_id, expires_at")
    .eq("discount_code_id", codeRow.id)
    .maybeSingle();

  const existingExpires = existing?.expires_at ? Date.parse(existing.expires_at) : null;
  const existingActive = existing && existingExpires && Number.isFinite(existingExpires) && existingExpires > Date.now();

  if (existingActive && existing.payment_intent_id !== params.paymentIntentId) {
    return { ok: false, error: "Discount code is currently in use. Please try again shortly." };
  }

  const { error } = await supabase
    .from("discount_reservations")
    .upsert(
      {
        discount_code_id: codeRow.id,
        payment_intent_id: params.paymentIntentId,
        customer_email: params.customerEmail ? String(params.customerEmail).toLowerCase().trim() : null,
        expires_at: expiresAt,
        context: {
          appliesTo: params.appliesTo,
          transactionId: params.transactionId || null,
        },
      },
      { onConflict: "discount_code_id" },
    );

  if (error) return { ok: false, error: error.message };
  return { ok: true, codeRow };
}

export async function redeemDiscountFromPaymentIntent(params: {
  codeRaw?: string | null;
  paymentIntentId: string;
  customerEmail?: string | null;
  transactionId?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isSupabaseAdminReady()) return { ok: false, error: "Database not configured" };
  const code = normalizeDiscountCode(params.codeRaw);
  if (!code) return { ok: false, error: "Invalid discount code" };

  const codeRow = await getDiscountByCode(code);
  if (!codeRow) return { ok: false, error: "Discount code not found" };

  // If already redeemed, treat as ok (idempotency)
  const { data: already } = await supabase
    .from("discount_redemptions")
    .select("id")
    .eq("payment_intent_id", params.paymentIntentId)
    .maybeSingle();
  if (already?.id) return { ok: true };

  // Enforce remaining redemptions
  if ((codeRow.redeemed_count || 0) >= (codeRow.max_redemptions || 1)) {
    return { ok: false, error: "Discount code already used" };
  }

  const { error: insertError } = await supabase.from("discount_redemptions").insert({
    discount_code_id: codeRow.id,
    payment_intent_id: params.paymentIntentId,
    customer_email: params.customerEmail ? String(params.customerEmail).toLowerCase().trim() : null,
    transaction_id: params.transactionId || null,
  });

  if (insertError) return { ok: false, error: insertError.message };

  // Best-effort update; keep idempotent
  await supabase
    .from("discount_codes")
    .update({ redeemed_count: (codeRow.redeemed_count || 0) + 1, updated_at: new Date().toISOString() })
    .eq("id", codeRow.id);

  // Clear reservation
  await supabase.from("discount_reservations").delete().eq("discount_code_id", codeRow.id);

  return { ok: true };
}

export async function releaseDiscountReservationForPaymentIntent(paymentIntentId: string) {
  if (!isSupabaseAdminReady()) return;
  await supabase.from("discount_reservations").delete().eq("payment_intent_id", paymentIntentId);
}

