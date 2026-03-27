import Stripe from "stripe";
import { getStripe } from "@/lib/stripe-server";
import {
  createEsimOrder,
  createEsimTopUpOrder,
  getEsimPackage,
  getTopUpPackagesByIccid,
  getBalance,
  queryEsimProfiles,
  parseProviderPrice,
} from "@/lib/esimaccess";
import { supabaseAdmin as supabase, isSupabaseAdminReady } from "@/lib/supabase";
import { resend } from "@/lib/email";
import { retryWithBackoff } from "@/lib/retry";
import { redeemDiscountFromPaymentIntent } from "@/lib/discounts";
import {
  sendActivationReadyEmail,
  sendManualIssuanceAlertEmail,
  sendOrderConfirmationEmail,
} from "@/lib/webhooks/stripe/services/emails";

function parseCartItems(cartItemsRaw?: string | null): Array<{ offerId: string; quantity: number }> {
  if (!cartItemsRaw) return [];
  return cartItemsRaw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [offerId, qtyRaw] = part.split(":");
      const quantity = Math.max(1, Math.min(10, parseInt((qtyRaw || "1").trim(), 10) || 1));
      return { offerId: (offerId || "").trim(), quantity };
    })
    .filter((i) => Boolean(i.offerId));
}

async function fetchActivationWithRetry(orderNo?: string, esimTranNo?: string) {
  if (!orderNo && !esimTranNo) return null;

  const maxAttempts = 5;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const result = await queryEsimProfiles(orderNo, esimTranNo);
      if (result && (result.activationCode || result.qrCode || result.smdpAddress)) {
        return {
          activationCode: result.activationCode,
          qrCode: result.qrCode,
          smdpAddress: result.smdpAddress,
          iccid: result.iccid,
          universalLink: (result as any).universalLink || (result as any).raw?.universalLink || undefined,
        };
      }
    } catch (error) {
      console.error(`[Stripe Webhook] Activation fetch attempt ${attempt + 1} failed:`, error);
    }

    if (attempt < maxAttempts - 1) {
      const delayMs = Math.min(2000 * Math.pow(2, attempt), 10000);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return null;
}

export async function processPaymentAndFulfill(
  paymentIntent: Stripe.PaymentIntent,
  overrideMetadata: Record<string, string> = {}
) {
  const mergedMetadata = { ...(paymentIntent.metadata || {}), ...overrideMetadata };
  const cartItems = parseCartItems(mergedMetadata.cartItems);
  const isCartParent = cartItems.length > 0 && mergedMetadata.cartItem !== "1";
  const topupIccid = mergedMetadata.topupIccid;
  const topupPackageCode = mergedMetadata.topupPackageCode;
  const isTopUp = Boolean(topupIccid && topupPackageCode);
  const offerId = mergedMetadata.offerId;

  if (!isCartParent && !isTopUp && !offerId) {
    throw new Error("Missing required metadata: offerId");
  }

  let fullPaymentIntent = paymentIntent;
  try {
    fullPaymentIntent = await getStripe().paymentIntents.retrieve(paymentIntent.id, {
      expand: ["charges.data.billing_details"],
    });
  } catch {}

  const expandedPaymentIntent = fullPaymentIntent as Stripe.PaymentIntent & { charges?: Stripe.ApiList<Stripe.Charge> };
  const chargesData = expandedPaymentIntent.charges?.data?.[0];
  const paymentMethodType =
    (chargesData as any)?.payment_method_details?.type ||
    (fullPaymentIntent as any)?.payment_method_types?.[0] ||
    null;
  const paymentMethodDetails = (chargesData as any)?.payment_method_details || null;

  const recipientEmail =
    fullPaymentIntent.metadata?.recipientEmail ||
    mergedMetadata.recipientEmail ||
    fullPaymentIntent.receipt_email ||
    chargesData?.billing_details?.email ||
    chargesData?.receipt_email;

  if (!recipientEmail) {
    throw new Error("Missing customer email from Stripe payment details. Email must be entered in checkout form before payment.");
  }

  const fullName = mergedMetadata.fullName || chargesData?.billing_details?.name || "Valued Traveler";
  const cartTotalQty = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const productName =
    mergedMetadata.productName || (isCartParent ? `Cart (${cartTotalQty} eSIM${cartTotalQty !== 1 ? "s" : ""})` : "eSIM Plan");
  const transactionId = mergedMetadata.transactionId || `txn_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  const priceInCents = paymentIntent.amount;
  const currencyCode = (paymentIntent.currency || "usd").toUpperCase();
  const userId = mergedMetadata.userId;
  const paymentIntentId = paymentIntent.id;
  const discountCode = fullPaymentIntent.metadata?.discountCode || mergedMetadata.discountCode || null;
  const cartToken = mergedMetadata.cartToken || fullPaymentIntent.metadata?.cartToken || null;

  if (discountCode && mergedMetadata.cartItem !== "1") {
    try {
      await redeemDiscountFromPaymentIntent({
        codeRaw: discountCode,
        paymentIntentId,
        customerEmail: recipientEmail,
        transactionId,
      });
    } catch {}
  }

  async function markCartSessionConvertedAndCancelReminders(token: string) {
    if (!isSupabaseAdminReady()) return;
    const { data: cartSession } = await supabase
      .from("cart_sessions")
      .select("id, token, converted_at, reminder1_email_id, reminder1_cancelled_at, reminder2_email_id, reminder2_cancelled_at")
      .eq("token", token)
      .maybeSingle();
    if (!cartSession?.id) return;

    await supabase
      .from("cart_sessions")
      .update({
        converted_at: cartSession.converted_at || new Date().toISOString(),
        stripe_payment_intent_id: paymentIntentId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cartSession.id);

    async function cancelEmail(emailId?: string | null) {
      if (!emailId) return;
      try {
        await resend.emails.cancel(emailId);
      } catch {}
    }

    if (!cartSession.reminder1_cancelled_at) await cancelEmail(cartSession.reminder1_email_id);
    if (!cartSession.reminder2_cancelled_at) await cancelEmail(cartSession.reminder2_email_id);

    await supabase
      .from("cart_sessions")
      .update({
        reminder1_cancelled_at: cartSession.reminder1_cancelled_at || new Date().toISOString(),
        reminder2_cancelled_at: cartSession.reminder2_cancelled_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", cartSession.id);
  }

  if (cartToken && mergedMetadata.cartItem !== "1") {
    try {
      await markCartSessionConvertedAndCancelReminders(String(cartToken));
    } catch {}
  }

  if (mergedMetadata.skipEmail !== "1" && recipientEmail && recipientEmail.includes("@")) {
    try {
      await sendOrderConfirmationEmail({
        to: recipientEmail,
        customerName: fullName,
        transactionId,
        productName,
        price: `${currencyCode} ${(priceInCents / 100).toFixed(2)}`,
      });
    } catch (emailError) {
      console.error("[Stripe Webhook] confirmation email failed", emailError);
    }
  }

  if (isTopUp) {
    if (!topupIccid || !topupPackageCode) throw new Error("Missing required top up metadata");
    if (isSupabaseAdminReady()) {
      const { data: existing } = await supabase
        .from("esim_topups")
        .select("id, transaction_id, esim_provider_status")
        .eq("stripe_payment_intent_id", paymentIntentId)
        .maybeSingle();
      if (existing) {
        return {
          transactionId: existing.transaction_id || transactionId,
          orderNo: null,
          status: existing.esim_provider_status || "already_processed",
          activation: null,
        };
      }
    }

    const topups = await getTopUpPackagesByIccid(topupIccid);
    const selected = topups.find((p) => p.packageCode === topupPackageCode || p.slug === topupPackageCode);
    if (!selected) throw new Error(`Top up package not found for ICCID: ${topupPackageCode}`);
    const providerCostInCents = selected.costPrice?.fixed ?? selected.price.fixed;

    if (isSupabaseAdminReady()) {
      await supabase.from("esim_topups").insert({
        user_id: userId || "anonymous",
        customer_email: recipientEmail,
        customer_name: fullName,
        iccid: topupIccid,
        package_code: selected.packageCode,
        price: priceInCents,
        currency: currencyCode,
        esim_provider_cost: providerCostInCents,
        transaction_id: transactionId,
        stripe_payment_intent_id: paymentIntentId,
        stripe_payment_status: "succeeded",
        payment_method: paymentMethodType,
        payment_method_details: paymentMethodDetails,
        esim_provider_status: "pending",
      });
    }

    try {
      const topupResult = await createEsimTopUpOrder({
        iccid: topupIccid,
        packageCode: selected.packageCode,
        transactionId,
        amountInCents: providerCostInCents,
      });
      if (isSupabaseAdminReady()) {
        await supabase
          .from("esim_topups")
          .update({
            esim_provider_status: "DONE",
            esim_provider_response: topupResult.raw,
            updated_at: new Date().toISOString(),
          })
          .eq("transaction_id", transactionId);
      }
      return { transactionId, orderNo: null, status: "DONE", activation: null };
    } catch (e) {
      if (isSupabaseAdminReady()) {
        await supabase
          .from("esim_topups")
          .update({
            esim_provider_status: "FAILED",
            esim_provider_response: { error: e instanceof Error ? e.message : String(e) },
            updated_at: new Date().toISOString(),
          })
          .eq("transaction_id", transactionId);
      }
      return { transactionId, orderNo: null, status: "FAILED", activation: null };
    }
  }

  if (isCartParent) {
    const expanded: string[] = [];
    for (const item of cartItems) for (let i = 0; i < item.quantity; i++) expanded.push(item.offerId);
    const results: any[] = [];
    for (let idx = 0; idx < expanded.length; idx++) {
      const itemOfferId = expanded[idx];
      const itemTx = `${transactionId}_i${idx + 1}`;
      try {
        results.push(
          await processPaymentAndFulfill(fullPaymentIntent, {
            ...overrideMetadata,
            offerId: itemOfferId,
            transactionId: itemTx,
            cartItem: "1",
            cartParentTransactionId: transactionId,
            skipEmail: "1",
            productName: `eSIM Plan (${itemOfferId})`,
          })
        );
      } catch {
        results.push({ transactionId: itemTx, offerId: itemOfferId, status: "failed" });
      }
    }
    return { transactionId, orderNo: null, status: "cart_processed", activation: null, cart: results };
  }

  const packageData = await getEsimPackage(offerId);
  if (!packageData) throw new Error(`Package not found: ${offerId}`);
  const costPriceData = packageData.costPrice || packageData.price;
  const divisor = costPriceData.currencyDivisor || 100;
  const providerCostInCents = Math.round((costPriceData.fixed / divisor) * 100);
  const providerCurrency = (costPriceData.currency || currencyCode).toUpperCase();
  const packageCode = packageData.packageCode || packageData.slug || offerId;

  if (isSupabaseAdminReady()) {
    const isCartItem = mergedMetadata.cartItem === "1";
    const baseQuery = supabase.from("esim_purchases").select("id, transaction_id, esim_provider_status, order_no");
    const { data: existing } = isCartItem
      ? await baseQuery.eq("transaction_id", transactionId).maybeSingle()
      : await baseQuery.eq("stripe_payment_intent_id", paymentIntentId).maybeSingle();
    if (existing) {
      return {
        transactionId: existing.transaction_id || transactionId,
        orderNo: existing.order_no || null,
        status: existing.esim_provider_status || "already_processed",
        activation: null,
      };
    }
  }

  if (isSupabaseAdminReady()) {
    const { error: dbError } = await supabase.from("esim_purchases").insert({
      user_id: userId || "anonymous",
      offer_id: offerId,
      price: priceInCents,
      currency: currencyCode,
      esim_provider_cost: providerCostInCents,
      transaction_id: transactionId,
      stripe_payment_intent_id: paymentIntentId,
      stripe_payment_status: "succeeded",
      esim_provider_status: "pending",
      package_code: packageCode,
      product_name: productName,
      payment_method: paymentMethodType,
      payment_method_details: paymentMethodDetails,
      order_no: null,
      customer_email: recipientEmail,
      customer_name: fullName,
    });
    if (dbError?.code === "23505") {
      const { data: existingByTransaction } = await supabase
        .from("esim_purchases")
        .select("id, transaction_id, esim_provider_status, order_no")
        .eq("transaction_id", transactionId)
        .maybeSingle();
      if (existingByTransaction) {
        return {
          transactionId: existingByTransaction.transaction_id,
          orderNo: existingByTransaction.order_no || null,
          status: existingByTransaction.esim_provider_status || "already_processed",
          activation: null,
        };
      }
    }
  }

  try {
    const balance = await getBalance();
    const balanceInCents = Math.round(parseProviderPrice(balance.balance || 0) * 100);
    if (balanceInCents < providerCostInCents && isSupabaseAdminReady()) {
      await supabase
        .from("esim_purchases")
        .update({ esim_provider_status: "insufficient_balance", updated_at: new Date().toISOString() })
        .eq("transaction_id", transactionId);
      try {
        await sendManualIssuanceAlertEmail({
          transactionId,
          customerEmail: recipientEmail,
          customerName: fullName,
          productName,
          price: `${currencyCode} ${(priceInCents / 100).toFixed(2)}`,
          reason: "insufficient_balance",
          orderNo: null,
          esimTranNo: null,
          errorCode: "200007",
          errorDetails: `Account balance too low for ${providerCurrency}`,
        });
      } catch {}
    }
  } catch {}

  let purchaseResult: Awaited<ReturnType<typeof createEsimOrder>> | undefined;
  let purchaseAttempts = 0;
  const maxPurchaseAttempts = 5;
  while (purchaseAttempts < maxPurchaseAttempts) {
    try {
      purchaseAttempts++;
      const { logEsimAction } = await import("@/lib/supabase-logging");
      await logEsimAction({
        transactionId,
        actionType: "order_created",
        actionStatus: "processing",
        provider: "esimaccess",
        providerResponse: null,
      });
      purchaseResult = await retryWithBackoff(
        () =>
          createEsimOrder({
            packageCode,
            transactionId,
            amountInCents: providerCostInCents,
            travelerName: fullName,
            travelerEmail: recipientEmail,
          }),
        3,
        1000
      );
      await logEsimAction({
        transactionId,
        orderNo: purchaseResult.orderNo || null,
        esimTranNo: purchaseResult.esimTranNo || null,
        actionType: "order_created",
        actionStatus: "succeeded",
        provider: "esimaccess",
        providerResponse: purchaseResult.raw || null,
      });
      break;
    } catch (purchaseError) {
      const errorMessage = purchaseError instanceof Error ? purchaseError.message : String(purchaseError);
      const errorCode = (purchaseError as { errorCode?: string } | null)?.errorCode || null;
      if (purchaseAttempts >= maxPurchaseAttempts) {
        const failureReason = errorCode === "200007" ? "insufficient_balance" : "purchase_failed";
        if (isSupabaseAdminReady()) {
          await supabase
            .from("esim_purchases")
            .update({
              esim_provider_status: failureReason,
              esim_provider_error_code: errorCode,
              esim_provider_error_message: errorMessage,
              updated_at: new Date().toISOString(),
            })
            .eq("transaction_id", transactionId);
        }
        try {
          await sendManualIssuanceAlertEmail({
            transactionId,
            customerEmail: recipientEmail,
            customerName: fullName,
            productName,
            price: `${currencyCode} ${(priceInCents / 100).toFixed(2)}`,
            reason: failureReason,
            orderNo: null,
            esimTranNo: null,
            errorCode: errorCode || null,
            errorDetails: errorMessage || null,
          });
        } catch {}
        return { transactionId, orderNo: null, status: failureReason, activation: null };
      }
      const delayMs = Math.min(5000 * Math.pow(2, purchaseAttempts - 1), 30000);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  if (!purchaseResult) return { transactionId, orderNo: null, status: "purchase_failed", activation: null };

  const orderNo = purchaseResult.orderNo || (purchaseResult as any).orderId || null;
  const esimTranNo = purchaseResult.esimTranNo || null;

  if (isSupabaseAdminReady()) {
    await supabase
      .from("esim_purchases")
      .update({
        order_no: orderNo,
        esim_tran_no: esimTranNo,
        package_code: packageCode,
        product_name: productName,
        esim_provider_status: "PROCESSING",
        esim_provider_response: purchaseResult.raw,
        updated_at: new Date().toISOString(),
      })
      .eq("transaction_id", transactionId);
  }

  const activation = await fetchActivationWithRetry(orderNo, esimTranNo);
  const providerStatus = activation ? "GOT_RESOURCE" : "PROCESSING";
  if (isSupabaseAdminReady()) {
    await supabase
      .from("esim_purchases")
      .update({
        order_no: orderNo,
        esim_tran_no: esimTranNo,
        package_code: packageCode,
        product_name: productName,
        esim_provider_status: providerStatus,
        esim_provider_response: purchaseResult.raw,
        confirmation: activation,
        updated_at: new Date().toISOString(),
      })
      .eq("transaction_id", transactionId);
  }

  if (activation && isSupabaseAdminReady()) {
    await supabase.from("activation_details").upsert(
      {
        transaction_id: transactionId,
        order_no: orderNo,
        esim_tran_no: esimTranNo,
        smdp_address: activation.smdpAddress || null,
        activation_code: activation.activationCode || activation.universalLink || null,
        universal_link: activation.universalLink || null,
        qr_code: activation.qrCode || null,
        iccid: activation.iccid || null,
        activation_status: "active",
        confirmation_data: activation,
      },
      { onConflict: "transaction_id" }
    );
  }

  if (activation) {
    try {
      await sendActivationReadyEmail({
        to: recipientEmail,
        customerName: fullName,
        transactionId,
        smdpAddress: activation.smdpAddress,
        activationCode: activation.activationCode || activation.universalLink,
        iccid: activation.iccid,
      });
    } catch {}
  }

  return { transactionId, orderNo, status: providerStatus, activation };
}
