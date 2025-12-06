import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase, isSupabaseReady } from "@/lib/supabase";
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
    console.warn('[eSIM Access Webhook] No allowed IP found in chain:', {
      allIPs,
      allowedIPs: ALLOWED_IPS,
    });
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
  if (!isSupabaseReady() || (!orderNo && !esimTranNo)) {
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

      // Try legacy purchases table
      const { data: purchaseFallback } = await supabase
        .from('purchases')
        .select('transaction_id')
        .eq('order_no', orderNo)
        .single();

      if (purchaseFallback?.transaction_id) {
        return purchaseFallback.transaction_id;
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
  if (!transactionId || !isSupabaseReady()) {
    return null;
  }

  try {
    const { data: purchase } = await supabase
      .from('esim_purchases')
      .select('customer_email, customer_name')
      .eq('transaction_id', transactionId)
      .single();

    let email = purchase?.customer_email || null;
    let name = purchase?.customer_name || null;

    if (!email || !name) {
      const { data: purchaseFallback } = await supabase
        .from('purchases')
        .select('customer_email, customer_name')
        .eq('transaction_id', transactionId)
        .single();

      email = email || purchaseFallback?.customer_email || null;
      name = name || purchaseFallback?.customer_name || null;
    }

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
    
    if (!validateIP(req)) {
      console.error('[eSIM Access Webhook] Unauthorized IP:', {
        clientIP,
        allIPs,
        allowedIPs: ALLOWED_IPS,
      });
      return NextResponse.json(
        { error: 'Unauthorized IP' },
        { status: 403 }
      );
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

                // Extract activation data - check multiple possible field names
                activation = {
                  activationCode: profileData.activationCode || profileData.qrCode || (profileData as any).universalLink,
                  qrCode: profileData.qrCode || profileData.activationCode,
                  smdpAddress: profileData.smdpAddress,
                  iccid: profileData.iccid,
                  orderNo: profileData.orderNo || orderNo,
                  esimTranNo: profileData.esimTranNo || esimTranNo,
                };

                // Validate that we have at least one activation method
                if (!activation.activationCode && !activation.qrCode && !activation.smdpAddress) {
                  console.warn('[eSIM Access Webhook] ⚠️ Profile data missing activation fields, retrying...', {
                    profileDataKeys: Object.keys(profileData),
                    rawProfile: JSON.stringify(profileData).substring(0, 500),
                  });
                  activation = null; // Reset to retry
                } else {
                  console.log('[eSIM Access Webhook] ✅ Activation data validated successfully');
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
          if (isSupabaseReady() && transactionId) {
            await supabase
              .from('purchases')
              .update({
                status: 'GOT_RESOURCE',
                esim_provider_status: 'GOT_RESOURCE',
                confirmation: activation,
                updated_at: new Date().toISOString(),
              })
              .eq('transaction_id', transactionId);

            // Also update esim_purchases table if exists
            await supabase
              .from('esim_purchases')
              .update({
                esim_provider_status: 'GOT_RESOURCE',
                confirmation: activation,
                updated_at: new Date().toISOString(),
              })
              .eq('transaction_id', transactionId);
          } else if (isSupabaseReady() && orderNo) {
            // Fallback: Update by orderNo if transactionId is not available
            console.log('[eSIM Access Webhook] Updating database by orderNo (transactionId not available)');
            await supabase
              .from('esim_purchases')
              .update({
                esim_provider_status: 'GOT_RESOURCE',
                confirmation: activation,
                updated_at: new Date().toISOString(),
              })
              .eq('order_no', orderNo);
            
            await supabase
              .from('purchases')
              .update({
                status: 'GOT_RESOURCE',
                esim_provider_status: 'GOT_RESOURCE',
                confirmation: activation,
                updated_at: new Date().toISOString(),
              })
              .eq('order_no', orderNo);
          }

          // Update activation_details
          if (activation && transactionId) {
            await supabase
              .from('activation_details')
              .upsert(
                {
                  transaction_id: transactionId,
                  smdp_address: activation.smdpAddress,
                  activation_code: activation.activationCode || activation.qrCode,
                  iccid: activation.iccid,
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
              
              if (isSupabaseReady() && transactionId) {
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
                
                if (transactionId) {
                  contact = await getPurchaseContact(transactionId);
                  console.log('[eSIM Access Webhook] Contact lookup by transactionId:', {
                    found: !!contact,
                    email: contact?.email,
                    transactionId,
                  });
                }
                
                // If we don't have contact info and have orderNo, try to find it
                if (!contact && orderNo && isSupabaseReady()) {
                  console.log('[eSIM Access Webhook] 🔍 Attempting to find contact info by orderNo:', orderNo);
                  const { data: purchase, error: purchaseError } = await supabase
                    .from('esim_purchases')
                    .select('transaction_id, customer_email, customer_name')
                    .eq('order_no', orderNo)
                    .single();
                  
                  if (purchaseError) {
                    console.warn('[eSIM Access Webhook] Error finding purchase by orderNo:', purchaseError);
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
                  }
                }

                if (contact && transactionId) {
                  console.log('[eSIM Access Webhook] 📧 Sending activation email...', {
                    to: contact.email,
                    customerName: contact.name,
                    transactionId,
                    hasActivationCode: !!activation.activationCode,
                    hasQrCode: !!activation.qrCode,
                    hasSmdpAddress: !!activation.smdpAddress,
                  });

                  try {
                    await sendActivationEmail({
                      to: contact.email,
                      customerName: contact.name,
                      transactionId,
                      smdpAddress: activation.smdpAddress,
                      activationCode: activation.activationCode || activation.qrCode,
                      iccid: activation.iccid,
                    });
                    
                    console.log('[eSIM Access Webhook] ✅✅✅✅✅ ACTIVATION EMAIL SENT SUCCESSFULLY:', {
                      to: contact.email,
                      transactionId,
                      orderNo,
                      esimTranNo,
                      timestamp: new Date().toISOString(),
                    });
                  } catch (sendError) {
                    console.error('[eSIM Access Webhook] ❌❌❌ CRITICAL: Failed to send activation email:', {
                      error: sendError instanceof Error ? sendError.message : String(sendError),
                      stack: sendError instanceof Error ? sendError.stack : undefined,
                      to: contact.email,
                      transactionId,
                      orderNo,
                    });
                    // Don't throw - log error but don't fail webhook
                  }
                } else {
                  console.warn('[eSIM Access Webhook] ⚠️⚠️⚠️ Cannot send activation email - missing customer info:', {
                    hasContact: !!contact,
                    hasTransactionId: !!transactionId,
                    contactEmail: contact?.email,
                    orderNo,
                    esimTranNo,
                    transactionId,
                  });
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
            });
          }
        }
        break;

      case 'ESIM_STATUS':
        // eSIM lifecycle changes
        const statusTransactionId = content.transactionId;
        const esimStatus = content.esimStatus;

        if (statusTransactionId && isSupabaseReady()) {
          const dbStatus = esimStatus === 'IN_USE' ? 'ACTIVE' : 
                          esimStatus === 'USED_UP' ? 'USED_UP' :
                          esimStatus === 'CANCEL' ? 'CANCELLED' :
                          esimStatus === 'REVOKED' ? 'REVOKED' : 'UNKNOWN';

          await supabase
            .from('purchases')
            .update({
              status: dbStatus,
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
          totalVolume: content.totalVolume,
        });

        if (content.transactionId) {
          try {
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

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[eSIM Access Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for webhook health check
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'eSIM Access Webhook Handler',
    timestamp: new Date().toISOString(),
  });
}

