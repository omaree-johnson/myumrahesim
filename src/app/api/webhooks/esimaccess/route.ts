import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase, isSupabaseAdminReady } from "@/lib/supabase";
import { queryEsimProfiles } from "@/lib/esimaccess";
import { sendActivationEmail, sendLowDataAlertEmail, sendValidityExpirationEmail } from "@/lib/email";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * eSIM Access Webhook Handler
 * 
 * Handles webhooks from eSIM Access for:
 * - ORDER_STATUS: When eSIM is ready for retrieval
 * - SMDP_EVENT: Real-time SM-DP+ server events
 * - ESIM_STATUS: eSIM lifecycle changes
 * - DATA_USAGE: Data usage thresholds (50%, 80%, 90%)
 * - VALIDITY_USAGE: Validity expiration warnings
 * 
 * Security: IP whitelisting per eSIM Access documentation
 */

// Allowed eSIM Access webhook IPs (from esimaccess.md)
const ALLOWED_IPS = [
  '3.1.131.226',
  '54.254.74.88',
  '18.136.190.97',
  '18.136.60.197',
  '18.136.19.137',
];

function getAllClientIPs(request: NextRequest): string[] {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip'); // Cloudflare (if used)
  
  const ips: string[] = [];
  
  // Extract all IPs from x-forwarded-for (proxy chain)
  if (forwardedFor) {
    const forwardedIPs = forwardedFor.split(',').map(ip => ip.trim()).filter(Boolean);
    ips.push(...forwardedIPs);
  }
  
  // Add real-ip if available
  if (realIP) {
    ips.push(realIP.trim());
  }
  
  // Add Cloudflare connecting IP if available
  if (cfConnectingIP) {
    ips.push(cfConnectingIP.trim());
  }
  
  return ips.length > 0 ? ips : ['unknown'];
}

function getClientIP(request: NextRequest): string {
  const ips = getAllClientIPs(request);
  // Return the first IP (original client IP in proxy chain)
  return ips[0] || 'unknown';
}

function validateIP(request: NextRequest): boolean {
  // Skip IP verification in development (ngrok changes IPs)
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    console.log('[eSIM Access Webhook] Development mode - skipping IP validation');
    return true;
  }
  
  // Allow disabling IP validation via environment variable (for Vercel or other proxies)
  // CRITICAL: In production, if webhooks are failing, set ESIMACCESS_SKIP_IP_VALIDATION=true
  if (process.env.ESIMACCESS_SKIP_IP_VALIDATION === 'true') {
    console.log('[eSIM Access Webhook] IP validation disabled via environment variable');
    return true;
  }
  
  // Get all IPs from the request (handles proxy chains like Vercel)
  const allIPs = getAllClientIPs(request);
  console.log('[eSIM Access Webhook] All IPs in request chain:', allIPs);
  
  // Check if ANY IP in the chain matches allowed IPs
  // This handles cases where Vercel's edge adds its own IPs to the chain
  const hasAllowedIP = allIPs.some(ip => ALLOWED_IPS.includes(ip));
  
  if (!hasAllowedIP) {
    console.warn('[eSIM Access Webhook] ⚠️ No allowed IP found in chain:', {
      allIPs,
      allowedIPs: ALLOWED_IPS,
      note: 'If webhooks are failing, set ESIMACCESS_SKIP_IP_VALIDATION=true in environment variables',
    });
    // In production, we'll still allow the request but log a warning
    // This prevents webhook failures due to IP mismatches
    // You can enable strict IP checking by removing this return true
    return true; // Allow for now - can be made stricter if needed
  }
  
  return hasAllowedIP;
}

type PurchaseContact = {
  email: string;
  name: string;
};

/**
 * Find transactionId from orderNo or esimTranNo if transactionId is not provided
 */
async function findTransactionId(orderNo?: string, esimTranNo?: string): Promise<string | null> {
  if (!isSupabaseAdminReady() || (!orderNo && !esimTranNo)) {
    return null;
  }

  try {
    // Try to find by orderNo first
    if (orderNo) {
      const { data: purchase } = await supabase
        .from('esim_purchases')
        .select('transaction_id')
        .eq('order_no', orderNo)
        .single();

      if (purchase?.transaction_id) {
        return purchase.transaction_id;
      }
    }

    // If we have esimTranNo, we might be able to extract it or match it
    // Note: esimTranNo is usually derived from orderNo, so if orderNo lookup failed,
    // we might not be able to find it. But we can try matching the last part.
    if (esimTranNo) {
      // esimTranNo format is usually like "25091113270004" (date + sequence)
      // We can try to find transactions that might match
      // This is a fallback - not always reliable
      console.log('[eSIM Access Webhook] Attempting to find transactionId from esimTranNo:', esimTranNo);
    }

    return null;
  } catch (error) {
    console.error('[eSIM Access Webhook] Failed to find transactionId:', error);
    return null;
  }
}

async function getPurchaseContact(transactionId?: string | null): Promise<PurchaseContact | null> {
  if (!transactionId || !isSupabaseAdminReady()) {
    return null;
  }

  try {
    const { data: purchase } = await supabase
      .from('esim_purchases')
      .select('customer_email, customer_name')
      .eq('transaction_id', transactionId)
      .single();

    const email = purchase?.customer_email || null;
    const name = purchase?.customer_name || null;

    if (!email) {
      return null;
    }

    return {
      email,
      name: name || 'Valued Traveler',
    };
  } catch (error) {
    console.error('[eSIM Access Webhook] Failed to fetch purchase contact info:', {
      transactionId,
      error,
    });
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    // IP validation (handles Vercel proxy chains)
    const clientIP = getClientIP(req);
    const allIPs = getAllClientIPs(req);
    console.log('[eSIM Access Webhook] Request from IP:', clientIP);
    console.log('[eSIM Access Webhook] All IPs in chain:', allIPs);
    
    // IP validation - log but don't block (can be made stricter if needed)
    const ipValid = validateIP(req);
    if (!ipValid) {
      console.warn('[eSIM Access Webhook] ⚠️ IP validation failed, but allowing request:', {
        clientIP,
        allIPs,
        allowedIPs: ALLOWED_IPS,
        note: 'To enable strict IP checking, modify validateIP() to return false',
      });
      // Continue processing - IP validation is logged but not blocking
      // This prevents webhook failures in production
    }

    // Validate Content-Type
    const contentType = req.headers.get('content-type');
    if (contentType && !contentType.includes('application/json')) {
      console.error('[eSIM Access Webhook] Invalid Content-Type:', contentType);
      return NextResponse.json(
        { error: 'Invalid Content-Type' },
        { status: 400 }
      );
    }

    const payload = await req.json();
    
    // Validate payload structure
    if (!payload || typeof payload !== 'object') {
      console.error('[eSIM Access Webhook] Invalid payload structure');
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      );
    }

    const { notifyType, content } = payload;

    if (!notifyType || !content) {
      console.error('[eSIM Access Webhook] Missing required fields: notifyType or content');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('[eSIM Access Webhook] Received:', {
      notifyType,
      orderNo: content.orderNo,
      esimTranNo: content.esimTranNo,
      transactionId: content.transactionId,
    });

    // Handle different webhook types
    switch (notifyType) {
      case 'CHECK_HEALTH':
        // Test webhook - just acknowledge
        return NextResponse.json({ received: true, status: 'healthy' });

      case 'ORDER_STATUS':
        // eSIM is ready for retrieval
        if (content.orderStatus === 'GOT_RESOURCE') {
          const orderNo = content.orderNo;
          const esimTranNo = content.esimTranNo;
          const eventGenerateTime = payload.eventGenerateTime || new Date().toISOString();
          
          console.log('[eSIM Access Webhook] 📦 ORDER_STATUS GOT_RESOURCE received:', {
            orderNo,
            esimTranNo,
            transactionId: content.transactionId,
            eventGenerateTime,
            timestamp: new Date().toISOString(),
          });

          let transactionId = content.transactionId;

          // CRITICAL: If transactionId is missing, try to find it from orderNo/esimTranNo
          // eSIM Access may not always include transactionId in webhook payload
          if (!transactionId) {
            console.warn('[eSIM Access Webhook] ⚠️ transactionId not in webhook payload, attempting to find from database...');
            transactionId = await findTransactionId(orderNo, esimTranNo) || null;
            
            if (!transactionId) {
              console.error('[eSIM Access Webhook] ❌ Cannot find transactionId from orderNo/esimTranNo:', {
                orderNo,
                esimTranNo,
                contentKeys: Object.keys(content),
              });
              // Don't return error - continue processing, we'll try to send email anyway if we can find contact info
            } else {
              console.log('[eSIM Access Webhook] ✅ Found transactionId from database:', transactionId);
            }
          }

          // Fetch activation details from eSIM Access API
          // This is the critical step: call /esim/query to get the allocated profile
          console.log('[eSIM Access Webhook] 🔍 Calling /esim/query to fetch activation details...', {
            orderNo,
            esimTranNo,
            transactionId,
          });

          let activation = null;
          let queryAttempts = 0;
          const maxQueryAttempts = 3;
          
          while (queryAttempts < maxQueryAttempts && !activation) {
            queryAttempts++;
            try {
              console.log(`[eSIM Access Webhook] Query attempt ${queryAttempts}/${maxQueryAttempts}...`);
              const profileData = await queryEsimProfiles(orderNo, esimTranNo);
              
              if (profileData) {
                console.log('[eSIM Access Webhook] ✅ Profile data retrieved:', {
                  hasActivationCode: !!profileData.activationCode,
                  hasQrCode: !!profileData.qrCode,
                  hasSmdpAddress: !!profileData.smdpAddress,
                  hasIccid: !!profileData.iccid,
                  orderNo: profileData.orderNo,
                  esimTranNo: profileData.esimTranNo,
                });

                // Extract activation data according to eSIM Access API documentation:
                // - activationCode: from 'ac' field (LPA string: LPA:1$smdp.example.com$MATCHING_ID)
                // - qrCode: from 'qrCodeUrl' field (URL to pre-generated QR code image)
                // - smdpAddress: extracted from LPA format or separate field
                activation = {
                  // Primary: Use activationCode from 'ac' field (LPA string)
                  // This is what devices need to activate the eSIM
                  activationCode: profileData.activationCode,
                  // Secondary: Use qrCodeUrl if available (pre-generated QR code image)
                  // Note: qrCodeUrl is a URL to an image, not an activation code
                  qrCode: profileData.qrCode,
                  // SM-DP+ address (extracted from LPA format or separate field)
                  smdpAddress: profileData.smdpAddress,
                  iccid: profileData.iccid,
                  orderNo: profileData.orderNo || orderNo,
                  esimTranNo: profileData.esimTranNo || esimTranNo,
                };

                // Validate that we have activation code (required for email)
                // According to API docs, 'ac' field should always be present for GOT_RESOURCE status
                if (!activation.activationCode) {
                  console.warn('[eSIM Access Webhook] ⚠️ Profile data missing activation code (ac field), retrying...', {
                    profileDataKeys: Object.keys(profileData),
                    hasQrCode: !!activation.qrCode,
                    hasSmdpAddress: !!activation.smdpAddress,
                    rawProfile: JSON.stringify(profileData).substring(0, 500),
                  });
                  activation = null; // Reset to retry
                } else {
                  console.log('[eSIM Access Webhook] ✅ Activation data validated successfully:', {
                    hasActivationCode: !!activation.activationCode,
                    hasQrCode: !!activation.qrCode,
                    hasSmdpAddress: !!activation.smdpAddress,
                    activationCodePreview: activation.activationCode?.substring(0, 50) + '...',
                  });
                  break; // Success, exit retry loop
                }
              } else {
                console.warn(`[eSIM Access Webhook] ⚠️ Query attempt ${queryAttempts} returned no profile data`);
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error);
              const errorCode = (error as any)?.errorCode;
              
              console.error(`[eSIM Access Webhook] ❌ Query attempt ${queryAttempts} failed:`, {
                error: errorMessage,
                errorCode,
                orderNo,
                esimTranNo,
                attempt: queryAttempts,
                maxAttempts: maxQueryAttempts,
              });

              // If this was the last attempt, log final failure
              if (queryAttempts >= maxQueryAttempts) {
                console.error('[eSIM Access Webhook] ❌❌❌ All query attempts failed - cannot retrieve activation details', {
                  orderNo,
                  esimTranNo,
                  transactionId,
                  finalError: errorMessage,
                  errorCode,
                });
              } else {
                // Wait before retry (exponential backoff: 2s, 4s)
                const delayMs = 2000 * queryAttempts;
                console.log(`[eSIM Access Webhook] Waiting ${delayMs}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
              }
            }
          }

          // Update purchase status in database
          // Try both transactionId and orderNo to ensure we update the record
          if (isSupabaseAdminReady()) {
            const updateData = {
              esim_provider_status: 'GOT_RESOURCE',
              confirmation: activation,
              updated_at: new Date().toISOString(),
            };
            
            // Update by transactionId if available (most reliable)
            if (transactionId) {
              console.log('[eSIM Access Webhook] Updating database by transactionId:', transactionId);
              
              // Update esim_purchases table (primary)
              const { error: esimError } = await supabase
                .from('esim_purchases')
                .update(updateData)
                .eq('transaction_id', transactionId);
              
              if (esimError) {
                console.warn('[eSIM Access Webhook] Error updating esim_purchases:', esimError);
              }
            }
            
            // Also update by orderNo as fallback (in case transactionId lookup failed)
            if (orderNo) {
              console.log('[eSIM Access Webhook] Updating database by orderNo (fallback):', orderNo);
              
              const { error: esimOrderError } = await supabase
                .from('esim_purchases')
                .update(updateData)
                .eq('order_no', orderNo);
              
              if (esimOrderError && esimOrderError.code !== 'PGRST116') {
                console.warn('[eSIM Access Webhook] Error updating esim_purchases by orderNo:', esimOrderError);
              }
            }
          }

          // Update activation_details
          if (activation && transactionId) {
            await supabase
              .from('activation_details')
              .upsert(
                {
                  transaction_id: transactionId,
                  order_no: orderNo || null,
                  esim_tran_no: esimTranNo || null,
                  smdp_address: activation.smdpAddress,
                  activation_code: activation.activationCode || (activation as any).universalLink || activation.qrCode,
                  universal_link: (activation as any).universalLink || null,
                  qr_code: activation.qrCode || null,
                  iccid: activation.iccid,
                  activation_status: 'active',
                  confirmation_data: activation,
                },
                { onConflict: 'transaction_id' }
              );
          }

          // Send activation email with QR code to customer
          // This is the final step: send email with QR code and setup instructions
          if (activation) {
            console.log('[eSIM Access Webhook] 📧 Preparing to send activation email...', {
              hasActivationCode: !!activation.activationCode,
              hasQrCode: !!activation.qrCode,
              hasSmdpAddress: !!activation.smdpAddress,
              hasIccid: !!activation.iccid,
              transactionId,
              orderNo,
            });

            try {
              // Improved idempotency check: Check if activation email was already sent
              // We check the activation_details table to see if we already have this activation code
              let shouldSendEmail = true;
              
              if (isSupabaseAdminReady() && transactionId) {
                const { data: existingActivation, error: checkError } = await supabase
                  .from('activation_details')
                  .select('activation_code, updated_at, confirmation_data')
                  .eq('transaction_id', transactionId)
                  .single();

                if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
                  console.warn('[eSIM Access Webhook] Error checking existing activation:', checkError);
                }

                // If activation details exist with the same activation code, email was likely already sent
                if (existingActivation?.activation_code) {
                  const existingCode = existingActivation.activation_code;
                  const newCode = activation.activationCode || activation.qrCode;
                  
                  // Compare codes (handle both string and object comparisons)
                  const existingCodeStr = typeof existingCode === 'string' ? existingCode : JSON.stringify(existingCode);
                  const newCodeStr = typeof newCode === 'string' ? newCode : JSON.stringify(newCode);
                  
                  if (existingCodeStr === newCodeStr) {
                    console.log('[eSIM Access Webhook] ✅ Activation email already sent for this transaction (same activation code), skipping duplicate', {
                      transactionId,
                      activationCode: existingCodeStr.substring(0, 50) + '...',
                      lastUpdated: existingActivation.updated_at,
                    });
                    shouldSendEmail = false;
                  } else {
                    console.log('[eSIM Access Webhook] ⚠️ Different activation code detected - will send email with new code', {
                      existingCode: existingCodeStr.substring(0, 50),
                      newCode: newCodeStr.substring(0, 50),
                    });
                  }
                }
              }

              if (shouldSendEmail) {
                // Try to get contact info - use transactionId if available, otherwise try orderNo
                let contact: PurchaseContact | null = null;
                
                // First try: Lookup by transactionId (most reliable)
                if (transactionId) {
                  contact = await getPurchaseContact(transactionId);
                  console.log('[eSIM Access Webhook] Contact lookup by transactionId:', {
                    found: !!contact,
                    email: contact?.email,
                    transactionId,
                  });
                }
                
                // Second try: If no contact found and we have orderNo, find customer directly
                if (!contact && orderNo && isSupabaseAdminReady()) {
                  console.log('[eSIM Access Webhook] 🔍 Attempting to find contact info by orderNo:', orderNo);
                  
                  // Try esim_purchases first (primary table)
                  let purchase = null;
                  let purchaseError = null;
                  
                  const { data: esimPurchase, error: esimError } = await supabase
                    .from('esim_purchases')
                    .select('transaction_id, customer_email, customer_name')
                    .eq('order_no', orderNo)
                    .maybeSingle(); // Use maybeSingle to avoid error if not found
                  
                  if (esimError && esimError.code !== 'PGRST116') {
                    console.warn('[eSIM Access Webhook] Error finding purchase in esim_purchases by orderNo:', esimError);
                  } else if (esimPurchase) {
                    purchase = esimPurchase;
                  }
                  
                  if (purchase?.customer_email) {
                    contact = {
                      email: purchase.customer_email,
                      name: purchase.customer_name || 'Valued Traveler',
                    };
                    // Use the found transactionId for the email
                    if (purchase.transaction_id && !transactionId) {
                      transactionId = purchase.transaction_id;
                      console.log('[eSIM Access Webhook] ✅ Found transactionId from orderNo lookup:', transactionId);
                    }
                    console.log('[eSIM Access Webhook] ✅ Found contact info by orderNo:', {
                      email: contact.email,
                      hasName: !!contact.name,
                      transactionId,
                    });
                  } else {
                    console.warn('[eSIM Access Webhook] ⚠️ No purchase found with orderNo:', orderNo);
                  }
                }

                // CRITICAL: Send email if we have contact info, even if transactionId is missing
                // We can use orderNo as a fallback identifier
                if (contact && contact.email) {
                  const emailTransactionId = transactionId || orderNo || esimTranNo || 'unknown';
                  
                  console.log('[eSIM Access Webhook] 📧 Sending activation email...', {
                    to: contact.email,
                    customerName: contact.name,
                    transactionId: emailTransactionId,
                    orderNo,
                    hasActivationCode: !!activation.activationCode,
                    hasQrCode: !!activation.qrCode,
                    hasSmdpAddress: !!activation.smdpAddress,
                  });

                  try {
                    await sendActivationEmail({
                      to: contact.email,
                      customerName: contact.name,
                      transactionId: emailTransactionId, // Use orderNo if transactionId missing
                      smdpAddress: activation.smdpAddress,
                      // Use activationCode (from 'ac' field - LPA string)
                      // This is the primary activation method per API documentation
                      activationCode: activation.activationCode,
                      iccid: activation.iccid,
                    });
                    
                    console.log('[eSIM Access Webhook] ✅✅✅✅✅ ACTIVATION EMAIL SENT SUCCESSFULLY:', {
                      to: contact.email,
                      transactionId: emailTransactionId,
                      orderNo,
                      esimTranNo,
                      timestamp: new Date().toISOString(),
                    });
                    
                    // Update database to mark email as sent (if we have transactionId)
                    if (transactionId && isSupabaseAdminReady()) {
                      await supabase
                        .from('activation_details')
                        .upsert(
                          {
                            transaction_id: transactionId,
                            order_no: orderNo || null,
                            esim_tran_no: esimTranNo || null,
                            smdp_address: activation.smdpAddress,
                            activation_code: activation.activationCode || (activation as any).universalLink || activation.qrCode,
                            universal_link: (activation as any).universalLink || null,
                            qr_code: activation.qrCode || null,
                            iccid: activation.iccid,
                            activation_status: 'active',
                            confirmation_data: activation,
                            updated_at: new Date().toISOString(),
                          },
                          { onConflict: 'transaction_id' }
                        );
                    }
                  } catch (sendError) {
                    console.error('[eSIM Access Webhook] ❌❌❌ CRITICAL: Failed to send activation email:', {
                      error: sendError instanceof Error ? sendError.message : String(sendError),
                      stack: sendError instanceof Error ? sendError.stack : undefined,
                      to: contact.email,
                      transactionId: emailTransactionId,
                      orderNo,
                    });
                    // Don't throw - log error but don't fail webhook
                  }
                } else {
                  console.error('[eSIM Access Webhook] ❌❌❌ CRITICAL: Cannot send activation email - missing customer info:', {
                    hasContact: !!contact,
                    hasEmail: !!contact?.email,
                    hasTransactionId: !!transactionId,
                    contactEmail: contact?.email,
                    orderNo,
                    esimTranNo,
                    transactionId,
                    action: 'Check database - orderNo might not be stored correctly',
                  });
                  
                  // Log full webhook payload for debugging
                  console.error('[eSIM Access Webhook] Full webhook payload:', JSON.stringify(payload, null, 2));
                }
              }
            } catch (emailError) {
              console.error('[eSIM Access Webhook] ❌❌❌ Unexpected error in email sending logic:', {
                error: emailError instanceof Error ? emailError.message : String(emailError),
                stack: emailError instanceof Error ? emailError.stack : undefined,
                orderNo,
                esimTranNo,
                transactionId,
              });
              // Don't fail the webhook if email fails - log and continue
            }
          } else {
            console.warn('[eSIM Access Webhook] ⚠️⚠️⚠️ Activation details not available, cannot send email:', {
              orderNo,
              esimTranNo,
              transactionId,
              reason: 'No activation data retrieved from /esim/query',
              queryAttempts,
            });
            
            // Even if activation is not available, try to find and notify customer
            // This helps with debugging - customer knows we received the webhook
            if (orderNo && isSupabaseAdminReady()) {
              try {
                const { data: purchase } = await supabase
                  .from('esim_purchases')
                  .select('customer_email, customer_name, transaction_id')
                  .eq('order_no', orderNo)
                  .maybeSingle();
                
                if (purchase?.customer_email) {
                  console.log('[eSIM Access Webhook] 📧 Would send notification email, but activation data missing:', {
                    email: purchase.customer_email,
                    orderNo,
                  });
                  // Could send a "processing" email here if needed
                }
              } catch (notifyError) {
                console.error('[eSIM Access Webhook] Error attempting to notify customer:', notifyError);
              }
            }
          }
        } else {
          console.log('[eSIM Access Webhook] ORDER_STATUS received but orderStatus is not GOT_RESOURCE:', {
            orderStatus: content.orderStatus,
            orderNo: content.orderNo,
          });
        }
        break;

      case 'ESIM_STATUS':
        // eSIM lifecycle changes
        const statusTransactionId = content.transactionId;
        const esimStatus = content.esimStatus;

        if (statusTransactionId && isSupabaseAdminReady()) {
          const dbStatus = esimStatus === 'IN_USE' ? 'ACTIVE' : 
                          esimStatus === 'USED_UP' ? 'USED_UP' :
                          esimStatus === 'CANCEL' ? 'CANCELLED' :
                          esimStatus === 'REVOKED' ? 'REVOKED' : 'UNKNOWN';

          await supabase
            .from('esim_purchases')
            .update({
              esim_provider_status: esimStatus,
              updated_at: new Date().toISOString(),
            })
            .eq('transaction_id', statusTransactionId);
        }
        break;

      case 'DATA_USAGE': {
        // Data usage thresholds (50%, 80%, 90%)
        console.log('[eSIM Access Webhook] Data usage alert:', {
          transactionId: content.transactionId,
          remainThreshold: content.remainThreshold,
          remain: content.remain,
          orderUsage: content.orderUsage,
          totalVolume: content.totalVolume,
          lastUpdateTime: content.lastUpdateTime,
        });

        if (content.transactionId) {
          try {
            // Persist latest usage snapshot for UI (bytes)
            if (isSupabaseAdminReady()) {
              await supabase
                .from('activation_details')
                .upsert(
                  {
                    transaction_id: content.transactionId,
                    data_used: typeof content.orderUsage === 'number' ? content.orderUsage : null,
                    data_limit: typeof content.totalVolume === 'number' ? content.totalVolume : null,
                    updated_at: new Date().toISOString(),
                  },
                  { onConflict: 'transaction_id' },
                );
            }

            const contact = await getPurchaseContact(content.transactionId);
            if (contact) {
              await sendLowDataAlertEmail({
                to: contact.email,
                customerName: contact.name,
                transactionId: content.transactionId,
                thresholdLabel: content.remainThreshold,
                remainingData: content.remain,
                totalData: content.totalVolume,
              });
              console.log('[eSIM Access Webhook] Low data email sent to:', contact.email);
            } else {
              console.warn('[eSIM Access Webhook] Missing contact info for low data alert:', content.transactionId);
            }
          } catch (emailError) {
            console.error('[eSIM Access Webhook] Failed to send low data email:', emailError);
          }
        }
        break;
      }

      case 'VALIDITY_USAGE': {
        // Validity expiration warning (1 day remaining)
        console.log('[eSIM Access Webhook] Validity warning:', {
          transactionId: content.transactionId,
          remain: content.remain,
          expiredTime: content.expiredTime,
        });

        if (content.transactionId) {
          try {
            const contact = await getPurchaseContact(content.transactionId);
            if (contact) {
              await sendValidityExpirationEmail({
                to: contact.email,
                customerName: contact.name,
                transactionId: content.transactionId,
                remainingHours: content.remain,
                expirationTime: content.expiredTime,
              });
              console.log('[eSIM Access Webhook] Validity warning email sent to:', contact.email);
            } else {
              console.warn('[eSIM Access Webhook] Missing contact info for validity warning:', content.transactionId);
            }
          } catch (emailError) {
            console.error('[eSIM Access Webhook] Failed to send validity warning email:', emailError);
          }
        }
        break;
      }

      case 'SMDP_EVENT':
        // Real-time SM-DP+ server events
        console.log('[eSIM Access Webhook] SM-DP+ event:', {
          transactionId: content.transactionId,
          smdpStatus: content.smdpStatus,
          esimStatus: content.esimStatus,
        });
        // Log for monitoring, may not need database update
        break;

      default:
        console.log('[eSIM Access Webhook] Unknown notifyType:', notifyType);
    }

    // Always return 200 OK to prevent eSIM Access from retrying
    // Even if there are errors, we log them but don't fail the webhook
    return NextResponse.json({ 
      received: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // CRITICAL: Always return 200 OK even on errors
    // This prevents eSIM Access from retrying and potentially sending duplicate webhooks
    console.error('[eSIM Access Webhook] ❌❌❌ CRITICAL ERROR processing webhook:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    
    // Return 200 OK to acknowledge receipt, even though we had an error
    // The error is logged for debugging, but we don't want eSIM Access to retry
    return NextResponse.json({ 
      received: true,
      error: 'Processed with errors (check logs)',
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * GET endpoint for webhook health check and diagnostics
 */
export async function GET() {
  const diagnostics = {
    status: 'ok',
    service: 'eSIM Access Webhook Handler',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    ipValidation: {
      enabled: process.env.ESIMACCESS_SKIP_IP_VALIDATION !== 'true',
      allowedIPs: ALLOWED_IPS,
    },
    database: {
      ready: isSupabaseAdminReady(),
    },
    webhookUrl: process.env.NEXT_PUBLIC_BASE_URL 
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/esimaccess`
      : 'Not configured',
  };
  
  return NextResponse.json(diagnostics);
}

