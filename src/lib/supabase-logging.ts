/**
 * Supabase Event Logging Utilities
 * 
 * Centralized logging for all data operations to ensure everything
 * is tracked in Supabase for audit, analytics, and debugging.
 */

import { supabaseAdmin as supabase, isSupabaseAdminReady } from './supabase';

/**
 * Log a webhook event to Supabase
 */
export async function logWebhookEvent(params: {
  eventId: string;
  eventType: string;
  source: 'stripe' | 'esimaccess' | 'zendit';
  transactionId?: string;
  orderNo?: string;
  esimTranNo?: string;
  payload: any;
  processed?: boolean;
  processingError?: string;
}): Promise<void> {
  if (!isSupabaseAdminReady()) {
    console.warn('[Supabase Logging] Database not configured, skipping webhook event log');
    return;
  }

  try {
    await supabase.from('webhook_events').upsert({
      event_id: params.eventId,
      event_type: params.eventType,
      source: params.source,
      transaction_id: params.transactionId || null,
      order_no: params.orderNo || null,
      esim_tran_no: params.esimTranNo || null,
      payload: params.payload,
      processed: params.processed ?? false,
      processing_error: params.processingError || null,
      processing_attempts: params.processed ? 1 : 0,
      processed_at: params.processed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'event_id',
    });
  } catch (error) {
    console.error('[Supabase Logging] Failed to log webhook event:', error);
    // Don't throw - logging failures shouldn't break the main flow
  }
}

/**
 * Log an email event to Supabase
 */
export async function logEmailEvent(params: {
  transactionId?: string;
  orderNo?: string;
  emailType: string;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  emailProvider: 'resend' | 'other';
  emailProviderId?: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  errorMessage?: string;
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
}): Promise<void> {
  if (!isSupabaseAdminReady()) {
    console.warn('[Supabase Logging] Database not configured, skipping email event log');
    return;
  }

  try {
    await supabase.from('email_events').insert({
      transaction_id: params.transactionId || null,
      order_no: params.orderNo || null,
      email_type: params.emailType,
      recipient_email: params.recipientEmail.toLowerCase().trim(),
      recipient_name: params.recipientName || null,
      subject: params.subject,
      email_provider: params.emailProvider,
      email_provider_id: params.emailProviderId || null,
      status: params.status,
      error_message: params.errorMessage || null,
      sent_at: params.sentAt?.toISOString() || null,
      delivered_at: params.deliveredAt?.toISOString() || null,
      opened_at: params.openedAt?.toISOString() || null,
      clicked_at: params.clickedAt?.toISOString() || null,
    });
  } catch (error) {
    console.error('[Supabase Logging] Failed to log email event:', error);
    // Don't throw - logging failures shouldn't break the main flow
  }
}

/**
 * Log a payment action to Supabase
 */
export async function logPaymentAction(params: {
  transactionId: string;
  paymentIntentId?: string;
  actionType: 'created' | 'confirmed' | 'succeeded' | 'failed' | 'refunded' | 'disputed';
  actionStatus: 'pending' | 'processing' | 'succeeded' | 'failed';
  amount?: number;
  currency?: string;
  metadata?: any;
  errorCode?: string;
  errorMessage?: string;
}): Promise<void> {
  if (!isSupabaseAdminReady()) {
    console.warn('[Supabase Logging] Database not configured, skipping payment action log');
    return;
  }

  try {
    await supabase.from('payment_actions').insert({
      transaction_id: params.transactionId,
      payment_intent_id: params.paymentIntentId || null,
      action_type: params.actionType,
      action_status: params.actionStatus,
      amount: params.amount || null,
      currency: params.currency || null,
      metadata: params.metadata || null,
      error_code: params.errorCode || null,
      error_message: params.errorMessage || null,
    });
  } catch (error) {
    console.error('[Supabase Logging] Failed to log payment action:', error);
    // Don't throw - logging failures shouldn't break the main flow
  }
}

/**
 * Log an eSIM action to Supabase
 */
export async function logEsimAction(params: {
  transactionId?: string;
  orderNo?: string;
  esimTranNo?: string;
  actionType: string;
  actionStatus: 'pending' | 'processing' | 'succeeded' | 'failed';
  provider: 'esimaccess' | 'zendit' | 'other';
  providerResponse?: any;
  errorCode?: string;
  errorMessage?: string;
}): Promise<void> {
  if (!isSupabaseAdminReady()) {
    console.warn('[Supabase Logging] Database not configured, skipping eSIM action log');
    return;
  }

  try {
    await supabase.from('esim_actions').insert({
      transaction_id: params.transactionId || null,
      order_no: params.orderNo || null,
      esim_tran_no: params.esimTranNo || null,
      action_type: params.actionType,
      action_status: params.actionStatus,
      provider: params.provider,
      provider_response: params.providerResponse || null,
      error_code: params.errorCode || null,
      error_message: params.errorMessage || null,
    });
  } catch (error) {
    console.error('[Supabase Logging] Failed to log eSIM action:', error);
    // Don't throw - logging failures shouldn't break the main flow
  }
}

/**
 * Update webhook event as processed
 */
export async function markWebhookEventProcessed(
  eventId: string,
  success: boolean,
  error?: string
): Promise<void> {
  if (!isSupabaseAdminReady()) return;

  try {
    const { data: existing } = await supabase
      .from('webhook_events')
      .select('processing_attempts')
      .eq('event_id', eventId)
      .maybeSingle();

    const attempts = (existing?.processing_attempts || 0) + 1;

    await supabase
      .from('webhook_events')
      .update({
        processed: success,
        processed_at: success ? new Date().toISOString() : null,
        processing_error: error || null,
        processing_attempts: attempts,
        updated_at: new Date().toISOString(),
      })
      .eq('event_id', eventId);
  } catch (error) {
    console.error('[Supabase Logging] Failed to update webhook event:', error);
  }
}
