import {
  sendActivationEmail as sendActivationEmailBase,
  sendAdminManualIssuanceNotification as sendAdminManualIssuanceNotificationBase,
  sendOrderConfirmation as sendOrderConfirmationBase,
} from "@/lib/email";

export async function sendOrderConfirmationEmail(params: {
  to: string;
  customerName: string;
  transactionId: string;
  productName: string;
  price: string;
}): Promise<void> {
  await sendOrderConfirmationBase(params);
}

export async function sendActivationReadyEmail(params: {
  to: string;
  customerName: string;
  transactionId: string;
  smdpAddress?: string;
  activationCode?: string;
  iccid?: string;
}): Promise<void> {
  await sendActivationEmailBase(params);
}

export async function sendManualIssuanceAlertEmail(params: {
  transactionId: string;
  customerEmail: string;
  customerName: string;
  productName: string;
  price: string;
  reason: "insufficient_balance" | "purchase_failed";
  orderNo?: string | null;
  esimTranNo?: string | null;
  errorCode?: string | null;
  errorDetails?: string | null;
  esimType?: string;
  purchaseTime?: string;
}): Promise<void> {
  await sendAdminManualIssuanceNotificationBase(params);
}
