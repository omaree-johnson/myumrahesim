import { isSupabaseAdminReady, supabaseAdmin as supabase } from "@/lib/supabase";

export interface ExistingPurchaseSnapshot {
  id: string;
  transaction_id: string | null;
  esim_provider_status: string | null;
  order_no: string | null;
  stripe_payment_status?: string | null;
}

export async function findExistingPurchaseByPaymentIntent(
  paymentIntentId: string
): Promise<ExistingPurchaseSnapshot | null> {
  if (!isSupabaseAdminReady()) {
    return null;
  }

  const { data, error } = await supabase
    .from("esim_purchases")
    .select("id, transaction_id, esim_provider_status, order_no, stripe_payment_status")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    return null;
  }

  return (data as ExistingPurchaseSnapshot | null) ?? null;
}
