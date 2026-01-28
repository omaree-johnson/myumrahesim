import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Email service export for direct access if needed
export { resend };

/**
 * Get the email "from" address - uses no-reply format
 * Priority:
 * 1. EMAIL_FROM environment variable (if set)
 * 2. Derived from NEXT_PUBLIC_BASE_URL (noreply@domain.com)
 * 3. Default: noreply@myumrahesim.com
 */
function getEmailFromAddress(): string {
  // If EMAIL_FROM is explicitly set, use it
  if (process.env.EMAIL_FROM) {
    return process.env.EMAIL_FROM;
  }
  
  // Try to derive from base URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (baseUrl) {
    try {
      const domain = new URL(baseUrl).hostname;
      // Remove 'www.' if present
      const cleanDomain = domain.replace(/^www\./, '');
      return `noreply@${cleanDomain}`;
    } catch (error) {
      console.warn('[Email] Failed to parse NEXT_PUBLIC_BASE_URL, using default:', error);
    }
  }
  
  // Default fallback
  return 'noreply@myumrahesim.com';
}

function sanitizeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function ensureEmailPrerequisites(to: string) {
  if (!to || !to.includes('@')) {
    throw new Error(`Invalid email address: ${to}`);
  }

  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }
}

function formatProviderMetric(value?: number | string | null): string {
  if (value === undefined || value === null) {
    return 'Unknown';
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return 'Unknown';
    if (value >= 1024) {
      const gb = value / 1024;
      return gb >= 1 ? `${gb.toFixed(gb >= 10 ? 0 : 2)} GB` : `${value.toFixed(0)} MB`;
    }
    return `${value.toFixed(0)} MB`;
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return String(value);
  }

  if (numeric >= 1024) {
    const gb = numeric / 1024;
    return gb >= 1 ? `${gb.toFixed(gb >= 10 ? 0 : 2)} GB` : `${numeric.toFixed(0)} MB`;
  }

  return `${numeric.toFixed(0)} MB`;
}

/**
 * Send activation email to customer with eSIM details
 */
export async function sendActivationEmail({
  to,
  customerName,
  transactionId,
  smdpAddress,
  activationCode,
  iccid
}: {
  to: string;
  customerName: string;
  transactionId: string;
  smdpAddress?: string;
  activationCode?: string;
  iccid?: string;
}) {
  const activationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/activation?transactionId=${transactionId}`;
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || 'eSIM Store';

  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@myumrahesim.com';
  const emailFrom = getEmailFromAddress();
  
  // Generate QR code image URL from activation code
  // Use the activation code directly if it's a URL, otherwise generate QR code
  let qrCodeUrl: string | undefined;
  if (activationCode) {
    // If activationCode is already a URL (universal link), use it directly
    if (activationCode.startsWith('http://') || activationCode.startsWith('https://')) {
      // Use a public QR code API to generate QR code image from the URL
      qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(activationCode)}`;
    } else {
      // For activation codes (LPA strings), generate QR code
      qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(activationCode)}`;
    }
  } else {
    // Fallback: Link to activation page where QR code can be viewed
    qrCodeUrl = `${activationUrl}`;
  }
  
  console.log('[Email] Activation email from address:', {
    emailFrom,
    replyTo: supportEmail,
    source: process.env.EMAIL_FROM ? 'EMAIL_FROM env var' : 'derived from domain',
  });
  
  try {
    const { data, error } = await resend.emails.send({
      from: emailFrom,
      replyTo: supportEmail,
      to,
      subject: `Your eSIM is Ready to Activate! - ${brandName}`,
      html: generateActivationEmailHTML({
        customerName,
        transactionId,
        smdpAddress,
        activationCode,
        iccid,
        activationUrl,
        qrCodeUrl,
        brandName
      }),
      // Optional: Add tags for tracking
      tags: [
        { name: 'category', value: 'activation' },
        { name: 'transaction_id', value: transactionId }
      ]
    });

    if (error) {
      console.error('[Email] Resend error:', error);
      
      // Log email failure to Supabase
      const { logEmailEvent } = await import('@/lib/supabase-logging');
      await logEmailEvent({
        transactionId,
        emailType: 'activation',
        recipientEmail: to,
        recipientName: customerName,
        subject: `Your eSIM is Ready to Activate! - ${brandName}`,
        emailProvider: 'resend',
        status: 'failed',
        errorMessage: error.message,
      });
      
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('[Email] Sent successfully:', data);
    
    // Log email success to Supabase
    const { logEmailEvent } = await import('@/lib/supabase-logging');
    await logEmailEvent({
      transactionId,
      emailType: 'activation',
      recipientEmail: to,
      recipientName: customerName,
      subject: `Your eSIM is Ready to Activate! - ${brandName}`,
      emailProvider: 'resend',
      emailProviderId: data?.id,
      status: 'sent',
      sentAt: new Date(),
    });
    
    return data;
  } catch (error) {
    console.error('[Email] Error:', error);
    
    // Log email failure to Supabase (if not already logged above)
    try {
      const { logEmailEvent } = await import('@/lib/supabase-logging');
      await logEmailEvent({
        transactionId,
        emailType: 'activation',
        recipientEmail: to,
        recipientName: customerName,
        subject: `Your eSIM is Ready to Activate! - ${brandName}`,
        emailProvider: 'resend',
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    } catch (logError) {
      // Don't throw - logging failures shouldn't break email sending
      console.error('[Email] Failed to log email event:', logError);
    }
    
    throw error;
  }
}

/**
 * Send batch activation emails (multiple customers)
 */
export async function sendBatchActivationEmails(
  customers: Array<{
    to: string;
    customerName: string;
    transactionId: string;
    smdpAddress?: string;
    activationCode?: string;
    iccid?: string;
  }>
) {
  const activationUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || 'eSIM Store';
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@myumrahesim.com';

  try {
    const emails = customers.map(customer => {
      // Generate QR code image URL from activation code
      let qrCodeUrl: string | undefined;
      if (customer.activationCode) {
        if (customer.activationCode.startsWith('http://') || customer.activationCode.startsWith('https://')) {
          qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(customer.activationCode)}`;
        } else {
          qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(customer.activationCode)}`;
        }
      } else {
        qrCodeUrl = `${activationUrl}/activation?transactionId=${customer.transactionId}`;
      }
      
      return {
        from: getEmailFromAddress(),
        replyTo: supportEmail,
        to: customer.to,
        subject: `Your eSIM is Ready to Activate! - ${brandName}`,
        html: generateActivationEmailHTML({
          customerName: customer.customerName,
          transactionId: customer.transactionId,
          smdpAddress: customer.smdpAddress,
          activationCode: customer.activationCode,
          iccid: customer.iccid,
          activationUrl: `${activationUrl}/activation?transactionId=${customer.transactionId}`,
          qrCodeUrl,
          brandName
        }),
        tags: [
          { name: 'category', value: 'activation' },
          { name: 'transaction_id', value: customer.transactionId }
        ]
      };
    });

    const { data, error } = await resend.batch.send(emails);

    if (error) {
      console.error('[Email] Batch send error:', error);
      throw new Error(`Failed to send batch emails: ${error.message}`);
    }

    console.log('[Email] Batch sent successfully:', data);
    return data;
  } catch (error) {
    console.error('[Email] Batch error:', error);
    throw error;
  }
}

/**
 * Retrieve email details by ID
 */
export async function getEmail(emailId: string) {
  try {
    const { data, error } = await resend.emails.get(emailId);

    if (error) {
      console.error('[Email] Get email error:', error);
      throw new Error(`Failed to get email: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('[Email] Get error:', error);
    throw error;
  }
}

/**
 * Update scheduled email (e.g., reschedule)
 */
export async function updateEmail(emailId: string, scheduledAt: string) {
  try {
    const { data, error } = await resend.emails.update({
      id: emailId,
      scheduledAt
    });

    if (error) {
      console.error('[Email] Update email error:', error);
      throw new Error(`Failed to update email: ${error.message}`);
    }

    console.log('[Email] Updated successfully:', data);
    return data;
  } catch (error) {
    console.error('[Email] Update error:', error);
    throw error;
  }
}

/**
 * Cancel scheduled email
 */
export async function cancelEmail(emailId: string) {
  try {
    const { data, error } = await resend.emails.cancel(emailId);

    if (error) {
      console.error('[Email] Cancel email error:', error);
      throw new Error(`Failed to cancel email: ${error.message}`);
    }

    console.log('[Email] Cancelled successfully:', data);
    return data;
  } catch (error) {
    console.error('[Email] Cancel error:', error);
    throw error;
  }
}

/**
 * List sent emails with optional filters
 */
export async function listEmails(options?: { limit?: number; from?: string; to?: string }) {
  try {
    const { data, error } = await resend.emails.list(options);

    if (error) {
      console.error('[Email] List emails error:', error);
      throw new Error(`Failed to list emails: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('[Email] List error:', error);
    throw error;
  }
}

/**
 * List attachments for an email
 */
export async function listEmailAttachments(emailId: string) {
  try {
    const { data, error } = await resend.emails.attachments.list({ emailId });

    if (error) {
      console.error('[Email] List attachments error:', error);
      throw new Error(`Failed to list attachments: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('[Email] List attachments error:', error);
    throw error;
  }
}

/**
 * Get specific attachment from an email
 */
export async function getEmailAttachment(emailId: string, attachmentId: string) {
  try {
    const { data, error } = await resend.emails.attachments.get({
      id: attachmentId,
      emailId
    });

    if (error) {
      console.error('[Email] Get attachment error:', error);
      throw new Error(`Failed to get attachment: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('[Email] Get attachment error:', error);
    throw error;
  }
}

/**
 * Send welcome email to new customer
 */
export async function sendWelcomeEmail(to: string, customerName: string) {
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || 'eSIM Store';
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@myumrahesim.com';

  // Sanitize inputs to prevent XSS
  const sanitize = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  };

  try {
    const { data, error } = await resend.emails.send({
      from: getEmailFromAddress(),
      replyTo: supportEmail,
      to,
      subject: `Welcome to ${brandName}!`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <style>
              /* Reset styles for email clients */
              body, table, td, p, a, li, blockquote {
                -webkit-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
              }
              table, td {
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
              }
              img {
                -ms-interpolation-mode: bicubic;
                border: 0;
                outline: none;
                text-decoration: none;
              }
              
              /* Main styles */
              body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #1f2937;
                background-color: #f3f4f6;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
              }
              
              .email-wrapper {
                width: 100%;
                background-color: #f3f4f6;
                padding: 40px 20px;
              }
              
              .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              }
              
              .header {
                background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
                color: #ffffff;
                padding: 40px 30px;
                text-align: center;
              }
              
              .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
                line-height: 1.2;
                letter-spacing: -0.5px;
              }
              
              .header-icon {
                font-size: 48px;
                margin-bottom: 12px;
                display: block;
              }
              
              .content {
                padding: 40px 30px;
                background-color: #ffffff;
              }
              
              .greeting {
                font-size: 18px;
                font-weight: 600;
                color: #111827;
                margin: 0 0 16px 0;
              }
              
              .intro-text {
                font-size: 16px;
                color: #4b5563;
                margin: 0 0 24px 0;
                line-height: 1.7;
              }
              
              .features-list {
                list-style: none;
                padding: 0;
                margin: 24px 0;
              }
              
              .features-list li {
                padding: 12px 0;
                font-size: 16px;
                color: #374151;
                border-bottom: 1px solid #e5e7eb;
              }
              
              .features-list li:last-child {
                border-bottom: none;
              }
              
              .features-list li::before {
                content: "✓";
                display: inline-block;
                width: 24px;
                height: 24px;
                line-height: 24px;
                text-align: center;
                background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
                color: #ffffff;
                border-radius: 50%;
                margin-right: 12px;
                font-weight: 700;
                font-size: 14px;
              }
              
              .button-container {
                text-align: center;
                margin: 40px 0 32px 0;
              }
              
              .button {
                display: inline-block;
                background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
                color: #ffffff !important;
                padding: 16px 32px;
                text-decoration: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                letter-spacing: 0.3px;
                box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.3);
                transition: all 0.2s ease;
              }
              
              .footer {
                padding: 32px 30px;
                background-color: #f9fafb;
                border-top: 1px solid #e5e7eb;
                text-align: center;
              }
              
              .footer-text {
                font-size: 14px;
                color: #6b7280;
                margin: 0;
                line-height: 1.6;
              }
              
              /* Mobile responsive */
              @media only screen and (max-width: 600px) {
                .email-wrapper {
                  padding: 20px 10px;
                }
                
                .header, .content, .footer {
                  padding: 30px 20px !important;
                }
                
                .header h1 {
                  font-size: 24px !important;
                }
                
                .button {
                  padding: 14px 28px !important;
                  font-size: 15px !important;
                }
              }
            </style>
          </head>
          <body>
            <div class="email-wrapper">
              <div class="email-container">
                <div class="header">
                  <span class="header-icon">🎉</span>
                  <h1>Welcome to ${sanitize(brandName)}!</h1>
                </div>
                
                <div class="content">
                  <p class="greeting">Hi ${sanitize(customerName)},</p>
                  <p class="intro-text">Thank you for joining ${sanitize(brandName)}! We're excited to help you stay connected wherever you go.</p>
                  
                  <p style="font-size: 16px; font-weight: 600; color: #111827; margin: 32px 0 16px 0;">With our eSIM service, you can:</p>
                  <ul class="features-list">
                    <li>Activate instantly - no physical SIM needed</li>
                    <li>Stay connected worldwide</li>
                    <li>Save on roaming charges</li>
                    <li>Keep your existing number</li>
                  </ul>

                  <div class="button-container">
                    <a href="${process.env.NEXT_PUBLIC_BASE_URL}" class="button">Browse eSIM Plans</a>
                  </div>
                </div>
                
                <div class="footer">
                  <p class="footer-text">
                    Questions? Contact us at <a href="mailto:${supportEmail}" style="color: #0ea5e9; text-decoration: none; font-weight: 500;">${supportEmail}</a>
                  </p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
      tags: [{ name: 'category', value: 'welcome' }]
    });

    if (error) {
      console.error('[Email] Welcome email error:', error);
      throw new Error(`Failed to send welcome email: ${error.message}`);
    }

    console.log('[Email] Welcome email sent:', data);
    return data;
  } catch (error) {
    console.error('[Email] Welcome error:', error);
    throw error;
  }
}

/**
 * Send admin notification email for manual eSIM issuance
 */
export async function sendAdminManualIssuanceNotification({
  transactionId,
  customerEmail,
  customerName,
  productName,
  price,
  reason,
  orderNo,
  esimTranNo,
  errorCode,
  errorDetails,
  esimType,
  purchaseTime,
}: {
  transactionId: string;
  customerEmail: string;
  customerName: string;
  productName: string;
  price: string;
  reason: 'insufficient_balance' | 'purchase_failed';
  orderNo?: string | null;
  esimTranNo?: string | null;
  errorCode?: string | null;
  errorDetails?: string | null;
  esimType?: string | null;
  purchaseTime?: string | null;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || 'johnsonomaree@outlook.com';
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || 'eSIM Store';
  const emailFrom = getEmailFromAddress();
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@myumrahesim.com';

  // Check if email was already sent for this transaction (prevent duplicates)
  const { supabaseAdmin, isSupabaseAdminReady } = await import('@/lib/supabase');
  if (isSupabaseAdminReady()) {
    try {
      const { data: existingEmail } = await supabaseAdmin
        .from('email_events')
        .select('id, sent_at')
        .eq('transaction_id', transactionId)
        .eq('email_type', 'admin_notification')
        .eq('recipient_email', adminEmail)
        .maybeSingle();

      if (existingEmail?.id) {
        console.log('[Email] ⚠️ Admin notification already sent for transaction:', {
          transactionId,
          previouslySentAt: existingEmail.sent_at,
        });
        return { id: existingEmail.id, alreadySent: true };
      }
    } catch (checkError) {
      console.error('[Email] Failed to check for existing email:', checkError);
      // Continue with sending - don't block on check failure
    }
  }

  // Sanitize inputs to prevent XSS
  const sanitize = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  };

  const reasonText = reason === 'insufficient_balance' 
    ? 'Insufficient eSIM Access account balance' 
    : 'eSIM purchase failed from provider';

  try {
    const { data, error } = await resend.emails.send({
      from: emailFrom,
      replyTo: supportEmail,
      to: adminEmail,
      subject: `⚠️ Manual eSIM Issuance Required - ${transactionId}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <style>
              /* Reset styles for email clients */
              body, table, td, p, a, li, blockquote {
                -webkit-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
              }
              table, td {
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
              }
              img {
                -ms-interpolation-mode: bicubic;
                border: 0;
                outline: none;
                text-decoration: none;
              }
              
              /* Main styles */
              body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #1f2937;
                background-color: #f3f4f6;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
              }
              
              .email-wrapper {
                width: 100%;
                background-color: #f3f4f6;
                padding: 40px 20px;
              }
              
              .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              }
              
              .header {
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                color: #ffffff;
                padding: 40px 30px;
                text-align: center;
              }
              
              .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
                line-height: 1.2;
                letter-spacing: -0.5px;
              }
              
              .header-icon {
                font-size: 48px;
                margin-bottom: 12px;
                display: block;
              }
              
              .content {
                padding: 40px 30px;
                background-color: #ffffff;
              }
              
              .alert-box {
                background: linear-gradient(to bottom, #fef3c7 0%, #fde68a 100%);
                border: 2px solid #f59e0b;
                border-radius: 12px;
                padding: 24px;
                margin: 24px 0;
                box-shadow: 0 2px 4px rgba(245, 158, 11, 0.2);
              }
              
              .alert-box h3 {
                margin: 0 0 12px 0;
                color: #92400e;
                font-size: 18px;
                font-weight: 700;
              }
              
              .alert-box p {
                margin: 8px 0;
                color: #78350f;
                font-size: 15px;
              }
              
              .order-box {
                background: linear-gradient(to bottom, #f9fafb 0%, #ffffff 100%);
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                padding: 28px;
                margin: 32px 0;
                box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
              }
              
              .order-box-title {
                margin: 0 0 24px 0;
                font-size: 20px;
                font-weight: 700;
                color: #111827;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 12px;
              }
              
              .order-detail {
                display: table;
                width: 100%;
                margin: 0 0 16px 0;
                padding: 0;
              }
              
              .order-detail:last-child {
                margin-bottom: 0;
              }
              
              .order-detail-label {
                display: table-cell;
                width: 160px;
                font-size: 14px;
                font-weight: 600;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                vertical-align: top;
                padding-right: 16px;
              }
              
              .order-detail-value {
                display: table-cell;
                font-size: 15px;
                font-weight: 500;
                color: #111827;
                vertical-align: top;
              }
              
              .order-detail-value code {
                background: #f3f4f6;
                padding: 4px 8px;
                border-radius: 6px;
                font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
                font-size: 13px;
                color: #dc2626;
                font-weight: 600;
              }
              
              .steps-list {
                background: #f0f9ff;
                border-left: 4px solid #0ea5e9;
                border-radius: 8px;
                padding: 20px 24px;
                margin: 24px 0;
              }
              
              .steps-list ol {
                margin: 0;
                padding-left: 24px;
              }
              
              .steps-list li {
                margin: 8px 0;
                color: #1e40af;
                font-size: 15px;
                line-height: 1.6;
              }
              
              .button-container {
                text-align: center;
                margin: 40px 0 32px 0;
              }
              
              .button {
                display: inline-block;
                background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
                color: #ffffff !important;
                padding: 16px 32px;
                text-decoration: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                letter-spacing: 0.3px;
                box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.3);
              }
              
              .footer {
                padding: 32px 30px;
                background-color: #f9fafb;
                border-top: 1px solid #e5e7eb;
                text-align: center;
              }
              
              .footer-text {
                font-size: 14px;
                color: #6b7280;
                margin: 0;
                line-height: 1.6;
              }
              
              /* Mobile responsive */
              @media only screen and (max-width: 600px) {
                .email-wrapper {
                  padding: 20px 10px;
                }
                
                .header, .content, .footer {
                  padding: 30px 20px !important;
                }
                
                .header h1 {
                  font-size: 24px !important;
                }
                
                .order-box {
                  padding: 20px !important;
                }
                
                .order-detail {
                  display: block !important;
                  margin-bottom: 20px !important;
                }
                
                .order-detail-label {
                  display: block !important;
                  width: 100% !important;
                  margin-bottom: 6px !important;
                  padding-right: 0 !important;
                }
                
                .order-detail-value {
                  display: block !important;
                }
                
                .button {
                  padding: 14px 28px !important;
                  font-size: 15px !important;
                }
              }
            </style>
          </head>
          <body>
            <div class="email-wrapper">
              <div class="email-container">
                <div class="header">
                  <span class="header-icon">⚠️</span>
                  <h1>Manual eSIM Issuance Required</h1>
                </div>
                
                <div class="content">
                  <div class="alert-box">
                    <h3>Action Required</h3>
                    <p><strong>Reason:</strong> ${sanitize(reasonText)}</p>
                    <p>Please manually issue the eSIM for this customer.</p>
                  </div>

                  <div class="order-box">
                    <h3 class="order-box-title">Order Details</h3>
                    <div class="order-detail">
                      <span class="order-detail-label">Transaction ID</span>
                      <span class="order-detail-value">${sanitize(transactionId)}</span>
                    </div>
                    <div class="order-detail">
                      <span class="order-detail-label">Customer Name</span>
                      <span class="order-detail-value">${sanitize(customerName)}</span>
                    </div>
                    <div class="order-detail">
                      <span class="order-detail-label">Customer Email</span>
                      <span class="order-detail-value">${sanitize(customerEmail)}</span>
                    </div>
                    <div class="order-detail">
                      <span class="order-detail-label">Product</span>
                      <span class="order-detail-value">${sanitize(productName)}</span>
                    </div>
                    ${esimType ? `
                    <div class="order-detail">
                      <span class="order-detail-label">eSIM Type</span>
                      <span class="order-detail-value">${sanitize(esimType)}</span>
                    </div>
                    ` : ''}
                    <div class="order-detail">
                      <span class="order-detail-label">Price</span>
                      <span class="order-detail-value">${sanitize(price)}</span>
                    </div>
                    ${purchaseTime ? `
                    <div class="order-detail">
                      <span class="order-detail-label">Purchase Time</span>
                      <span class="order-detail-value">${sanitize(purchaseTime)}</span>
                    </div>
                    ` : ''}
                    ${orderNo ? `
                    <div class="order-detail">
                      <span class="order-detail-label">Order No</span>
                      <span class="order-detail-value">${sanitize(orderNo)}</span>
                    </div>
                    ` : ''}
                    ${esimTranNo ? `
                    <div class="order-detail">
                      <span class="order-detail-label">eSIM Tran No</span>
                      <span class="order-detail-value">${sanitize(esimTranNo)}</span>
                    </div>
                    ` : ''}
                    ${errorCode ? `
                    <div class="order-detail">
                      <span class="order-detail-label">Error Code</span>
                      <span class="order-detail-value"><code>${sanitize(errorCode)}</code></span>
                    </div>
                    ` : ''}
                    ${errorDetails ? `
                    <div class="order-detail">
                      <span class="order-detail-label">Error Details</span>
                      <span class="order-detail-value">${sanitize(errorDetails)}</span>
                    </div>
                    ` : ''}
                  </div>

                  <div class="steps-list">
                    <p style="margin: 0 0 12px 0; font-weight: 700; color: #0f172a; font-size: 16px;">Next Steps:</p>
                    <ol>
                      <li>Log into your eSIM Access dashboard</li>
                      <li>Manually create the eSIM order for this customer</li>
                      <li>Send the activation details to: ${sanitize(customerEmail)}</li>
                    </ol>
                  </div>

                  <div class="button-container">
                    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/activation?transactionId=${transactionId}" class="button">View Transaction</a>
                  </div>
                </div>
                
                <div class="footer">
                  <p class="footer-text">
                    ${sanitize(brandName)} Admin Notification
                  </p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
      tags: [
        { name: 'category', value: 'admin_notification' },
        { name: 'transaction_id', value: transactionId },
        { name: 'reason', value: reason }
      ]
    });

    if (error) {
      console.error('[Email] ❌ Admin notification error:', error);
      throw new Error(`Failed to send admin notification: ${error.message || JSON.stringify(error)}`);
    }

    console.log('[Email] ✅ Admin notification sent successfully:', {
      emailId: data?.id,
      to: adminEmail,
      transactionId,
      reason,
    });

    // Record email event in database to prevent duplicates
    if (isSupabaseAdminReady() && data?.id) {
      try {
        await supabaseAdmin.from('email_events').insert({
          transaction_id: transactionId,
          email_type: 'admin_notification',
          recipient_email: adminEmail,
          recipient_name: 'Admin',
          subject: `⚠️ Manual eSIM Issuance Required - ${transactionId}`,
          email_provider: 'resend',
          email_provider_id: data.id,
          status: 'sent',
          sent_at: new Date().toISOString(),
        });
      } catch (dbError) {
        console.error('[Email] Failed to record email event:', dbError);
        // Don't throw - email was sent successfully
      }
    }

    return data;
  } catch (error) {
    console.error('[Email] ❌ Admin notification error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      to: adminEmail,
      transactionId,
    });
    throw error;
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmation({
  to,
  customerName,
  transactionId,
  productName,
  price
}: {
  to: string;
  customerName: string;
  transactionId: string;
  productName: string;
  price: string;
}) {
  // Validate inputs
  if (!to || !to.includes('@')) {
    throw new Error(`Invalid email address: ${to}`);
  }

  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || 'eSIM Store';
  const emailFrom = getEmailFromAddress();
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@myumrahesim.com';

  console.log('[Email] Sending order confirmation:', {
    to,
    from: emailFrom,
    replyTo: supportEmail,
    transactionId,
    hasApiKey: !!process.env.RESEND_API_KEY,
    resendKeyPreview: process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 10)}...` : 'MISSING - CHECK ENV VARS!',
    emailFromSource: process.env.EMAIL_FROM ? 'EMAIL_FROM env var' : 'derived from domain',
  });
  
  // CRITICAL: Throw error if API key is missing
  if (!process.env.RESEND_API_KEY) {
    const error = new Error('RESEND_API_KEY is not configured in environment variables');
    console.error('[Email] ❌ CRITICAL ERROR:', error.message);
    throw error;
  }

  // Sanitize inputs to prevent XSS
  const sanitize = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  };

  const emailSubject = `Order Confirmation - ${brandName}`;
  
  try {
    console.log('[Email] Calling Resend API with:', {
      from: emailFrom,
      replyTo: supportEmail,
      to,
      subject: emailSubject,
      hasApiKey: !!process.env.RESEND_API_KEY,
    });
    
    const { data, error } = await resend.emails.send({
      from: emailFrom,
      replyTo: supportEmail,
      to,
      subject: emailSubject,
      html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <style>
              /* Reset styles for email clients */
              body, table, td, p, a, li, blockquote {
                -webkit-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
              }
              table, td {
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
              }
              img {
                -ms-interpolation-mode: bicubic;
                border: 0;
                outline: none;
                text-decoration: none;
              }
              
              /* Main styles */
              body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #1f2937;
                background-color: #f3f4f6;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
              }
              
              .email-wrapper {
                width: 100%;
                background-color: #f3f4f6;
                padding: 40px 20px;
              }
              
              .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              }
              
              .header {
                background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
                color: #ffffff;
                padding: 40px 30px;
                text-align: center;
              }
              
              .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
                line-height: 1.2;
                letter-spacing: -0.5px;
              }
              
              .header-icon {
                font-size: 48px;
                margin-bottom: 12px;
                display: block;
              }
              
              .content {
                padding: 40px 30px;
                background-color: #ffffff;
              }
              
              .greeting {
                font-size: 18px;
                font-weight: 600;
                color: #111827;
                margin: 0 0 16px 0;
              }
              
              .intro-text {
                font-size: 16px;
                color: #4b5563;
                margin: 0 0 32px 0;
                line-height: 1.7;
              }
              
              .order-box {
                background: linear-gradient(to bottom, #f9fafb 0%, #ffffff 100%);
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                padding: 28px;
                margin: 32px 0;
                box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
              }
              
              .order-box-title {
                margin: 0 0 24px 0;
                font-size: 20px;
                font-weight: 700;
                color: #111827;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 12px;
              }
              
              .order-detail {
                display: table;
                width: 100%;
                margin: 0 0 16px 0;
                padding: 0;
              }
              
              .order-detail:last-child {
                margin-bottom: 0;
              }
              
              .order-detail-label {
                display: table-cell;
                width: 140px;
                font-size: 14px;
                font-weight: 600;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                vertical-align: top;
                padding-right: 16px;
              }
              
              .order-detail-value {
                display: table-cell;
                font-size: 15px;
                font-weight: 500;
                color: #111827;
                vertical-align: top;
              }
              
              .status-text {
                font-size: 16px;
                color: #4b5563;
                margin: 32px 0;
                line-height: 1.7;
                padding: 20px;
                background-color: #f0f9ff;
                border-left: 4px solid #0ea5e9;
                border-radius: 6px;
              }
              
              .button-container {
                text-align: center;
                margin: 40px 0 32px 0;
              }
              
              .button {
                display: inline-block;
                background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
                color: #ffffff !important;
                padding: 16px 32px;
                text-decoration: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                letter-spacing: 0.3px;
                box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.3);
                transition: all 0.2s ease;
              }
              
              .button:hover {
                box-shadow: 0 6px 12px -1px rgba(14, 165, 233, 0.4);
                transform: translateY(-1px);
              }
              
              .footer {
                padding: 32px 30px;
                background-color: #f9fafb;
                border-top: 1px solid #e5e7eb;
                text-align: center;
              }
              
              .footer-text {
                font-size: 14px;
                color: #6b7280;
                margin: 0 0 8px 0;
                line-height: 1.6;
              }
              
              .footer-link {
                color: #0ea5e9;
                text-decoration: none;
                font-weight: 500;
              }
              
              .footer-link:hover {
                text-decoration: underline;
              }
              
              /* Mobile responsive */
              @media only screen and (max-width: 600px) {
                .email-wrapper {
                  padding: 20px 10px;
                }
                
                .header, .content, .footer {
                  padding: 30px 20px !important;
                }
                
                .header h1 {
                  font-size: 24px !important;
                }
                
                .order-box {
                  padding: 20px !important;
                }
                
                .order-detail {
                  display: block !important;
                  margin-bottom: 20px !important;
                }
                
                .order-detail-label {
                  display: block !important;
                  width: 100% !important;
                  margin-bottom: 6px !important;
                  padding-right: 0 !important;
                }
                
                .order-detail-value {
                  display: block !important;
                }
                
                .button {
                  padding: 14px 28px !important;
                  font-size: 15px !important;
                }
              }
            </style>
          </head>
          <body>
            <div class="email-wrapper">
              <div class="email-container">
                <div class="header">
                  <span class="header-icon">✅</span>
                  <h1>Order Confirmed!</h1>
                </div>
                
                <div class="content">
                  <p class="greeting">Hi ${sanitize(customerName)},</p>
                  <p class="intro-text">Thank you for your order! We've received your payment and are processing your eSIM.</p>
                  
                  <div class="order-box">
                    <h3 class="order-box-title">Order Details</h3>
                    <div class="order-detail">
                      <span class="order-detail-label">Transaction ID</span>
                      <span class="order-detail-value">${sanitize(transactionId)}</span>
                    </div>
                    <div class="order-detail">
                      <span class="order-detail-label">Product</span>
                      <span class="order-detail-value">${sanitize(productName)}</span>
                    </div>
                    <div class="order-detail">
                      <span class="order-detail-label">Total</span>
                      <span class="order-detail-value">${sanitize(price)}</span>
                    </div>
                  </div>

                  <p class="status-text">
                    Your eSIM is being provisioned and you'll receive activation details via email shortly (typically within a few minutes).
                  </p>

                  <div class="button-container">
                    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/activation?transactionId=${transactionId}" class="button">Check Status</a>
                  </div>
                </div>
                
                <div class="footer">
                  <p class="footer-text">
                    Questions? Contact us at <a href="mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@myumrahesim.com'}" class="footer-link">${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@myumrahesim.com'}</a>
                  </p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
      tags: [
        { name: 'category', value: 'order_confirmation' },
        { name: 'transaction_id', value: transactionId }
      ]
    });

    if (error) {
      console.error('[Email] ❌ Resend API error:', {
        error: error,
        message: error.message,
        name: error.name,
        to,
        from: emailFrom,
      });
      
      // Log email failure to Supabase
      const { logEmailEvent } = await import('@/lib/supabase-logging');
      await logEmailEvent({
        transactionId,
        emailType: 'order_confirmation',
        recipientEmail: to,
        recipientName: customerName,
        subject: emailSubject,
        emailProvider: 'resend',
        status: 'failed',
        errorMessage: error.message || JSON.stringify(error),
      });
      
      throw new Error(`Failed to send order confirmation: ${error.message || JSON.stringify(error)}`);
    }

    console.log('[Email] ✅ Order confirmation sent successfully:', {
      emailId: data?.id,
      to,
      from: emailFrom,
    });
    
    // Log email success to Supabase
    const { logEmailEvent } = await import('@/lib/supabase-logging');
    await logEmailEvent({
      transactionId,
      emailType: 'order_confirmation',
      recipientEmail: to,
      recipientName: customerName,
      subject: emailSubject,
      emailProvider: 'resend',
      emailProviderId: data?.id,
      status: 'sent',
      sentAt: new Date(),
    });
    
    return data;
  } catch (error) {
    console.error('[Email] ❌ Order confirmation error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      to,
      from: emailFrom,
    });
    
    // Log email failure to Supabase (if not already logged above)
    try {
      const { logEmailEvent } = await import('@/lib/supabase-logging');
      await logEmailEvent({
        transactionId,
        emailType: 'order_confirmation',
        recipientEmail: to,
        recipientName: customerName,
        subject: emailSubject,
        emailProvider: 'resend',
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    } catch (logError) {
      console.error('[Email] Failed to log email event:', logError);
    }
    
    throw error;
  }
}

function formatBytes(value?: number | string | null): string {
  if (value === undefined || value === null) return 'Unknown';
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return String(value);

  const kb = 1024;
  const mb = kb * 1024;
  const gb = mb * 1024;

  if (num >= gb) return `${(num / gb).toFixed(num / gb >= 10 ? 0 : 2)} GB`;
  if (num >= mb) return `${(num / mb).toFixed(num / mb >= 10 ? 0 : 2)} MB`;
  if (num >= kb) return `${(num / kb).toFixed(num / kb >= 10 ? 0 : 2)} KB`;
  return `${Math.round(num)} B`;
}

function formatThresholdLabel(threshold?: string | number): string | null {
  if (threshold === undefined || threshold === null) return null;
  const raw = typeof threshold === 'number' ? threshold : Number(threshold);
  if (!Number.isFinite(raw)) return String(threshold);
  // eSIM Access uses 0.5/0.8/0.9 and also 0.1 for 10% (and 0.25 for 25%)
  const pct = raw <= 1 ? raw * 100 : raw;
  return `${pct.toFixed(pct >= 10 ? 0 : 1)}%`;
}

type LowDataEmailArgs = {
  to: string;
  customerName: string;
  transactionId: string;
  thresholdLabel?: string | number;
  remainingData?: number | string | null;
  totalData?: number | string | null;
  discountCode?: string | null;
  discountPercentOff?: number | string | null;
};

export async function sendLowDataAlertEmail({
  to,
  customerName,
  transactionId,
  thresholdLabel,
  remainingData,
  totalData,
  discountCode,
  discountPercentOff,
}: LowDataEmailArgs) {
  ensureEmailPrerequisites(to);

  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || 'eSIM Store';
  const emailFrom = getEmailFromAddress();
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@myumrahesim.com';
  const activationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/activation?transactionId=${transactionId}`;
  const topUpUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/topup/${transactionId}${discountCode ? `?discount=${encodeURIComponent(String(discountCode))}` : ""}`;
  const thresholdPretty = formatThresholdLabel(thresholdLabel);
  const thresholdText = thresholdPretty
    ? `Your remaining data just dropped below ${thresholdPretty}`
    : `Your data balance is getting low`;
  const discountPretty =
    discountPercentOff !== undefined && discountPercentOff !== null && String(discountPercentOff).trim() !== ""
      ? `${sanitizeHtml(String(discountPercentOff))}%`
      : null;

  try {
    const { data, error } = await resend.emails.send({
      from: emailFrom,
      replyTo: supportEmail,
      to,
      subject: `⚠️ Low Data Alert - ${brandName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #111827; background: #f3f4f6; }
              .container { max-width: 600px; margin: 0 auto; padding: 24px; }
              .card { background: white; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12); }
              .badge { display: inline-block; padding: 6px 12px; border-radius: 999px; background: #fef3c7; color: #92400e; font-weight: 600; }
              .button { display: inline-block; background: #0ea5e9; color: white; padding: 14px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 24px; }
              .button-secondary { display: inline-block; background: #111827; color: white; padding: 14px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 12px; }
              .metrics { display: flex; gap: 16px; flex-wrap: wrap; margin: 24px 0; }
              .metric { flex: 1; min-width: 120px; padding: 16px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; }
              .metric-label { text-transform: uppercase; font-size: 12px; letter-spacing: 0.1em; color: #64748b; margin-bottom: 4px; }
              .metric-value { font-size: 20px; font-weight: 700; color: #0f172a; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="card">
                <span class="badge">Data Usage Alert</span>
                <h1 style="margin-top: 16px;">Hi ${sanitizeHtml(customerName)},</h1>
                <p>${sanitizeHtml(thresholdText)}. Please keep an eye on your usage so you stay connected during your trip.</p>

                <div class="metrics">
                  <div class="metric">
                    <div class="metric-label">Remaining Data</div>
                    <div class="metric-value">${sanitizeHtml(formatBytes(remainingData))}</div>
                  </div>
                  <div class="metric">
                    <div class="metric-label">Plan Total</div>
                    <div class="metric-value">${sanitizeHtml(formatBytes(totalData))}</div>
                  </div>
                </div>

                <p>Need more data? You can top up your existing eSIM in seconds:</p>
                <a href="${topUpUrl}" class="button">Top Up My eSIM</a>
                ${
                  discountCode
                    ? `
                      <div style="margin-top: 18px; padding: 14px; border-radius: 12px; background: #ecfeff; border: 1px solid #a5f3fc;">
                        <div style="font-weight: 700; color: #0f172a;">Discount${discountPretty ? ` (${discountPretty} off)` : ""}</div>
                        <div style="margin-top: 6px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 16px; font-weight: 800; letter-spacing: 0.06em;">
                          ${sanitizeHtml(String(discountCode))}
                        </div>
                        <div style="margin-top: 6px; font-size: 13px; color: #0f172a;">
                          Use this code during checkout. It’s single-use.
                        </div>
                      </div>
                    `
                    : ""
                }
                <br />
                <a href="${activationUrl}" class="button-secondary">View My Plan</a>

                <p style="margin-top: 32px; font-size: 14px; color: #6b7280;">
                  Transaction ID: ${sanitizeHtml(transactionId)} · ${sanitizeHtml(brandName)}
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
      tags: [
        { name: 'category', value: 'usage_alert' },
        { name: 'transaction_id', value: transactionId },
        { name: 'type', value: 'data_usage' },
      ],
    });

    if (error) {
      console.error('[Email] Low data alert error:', error);
      throw new Error(`Failed to send low data alert: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('[Email] Low data alert error:', error);
    throw error;
  }
}

type ValidityEmailArgs = {
  to: string;
  customerName: string;
  transactionId: string;
  remainingHours?: number | string | null;
  expirationTime?: string | null;
};

export async function sendValidityExpirationEmail({
  to,
  customerName,
  transactionId,
  remainingHours,
  expirationTime,
}: ValidityEmailArgs) {
  ensureEmailPrerequisites(to);

  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || 'eSIM Store';
  const emailFrom = getEmailFromAddress();
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@myumrahesim.com';
  const activationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/activation?transactionId=${transactionId}`;
  const remainingLabel = remainingHours ? `${remainingHours} hours` : 'less than 24 hours';
  const expiresAt = expirationTime
    ? new Date(expirationTime).toLocaleString()
    : 'soon';

  try {
    const { data, error } = await resend.emails.send({
      from: emailFrom,
      replyTo: supportEmail,
      to,
      subject: `⏰ Plan Expiring Soon - ${brandName}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <style>
              /* Reset styles for email clients */
              body, table, td, p, a, li, blockquote {
                -webkit-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
              }
              table, td {
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
              }
              
              /* Main styles */
              body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #1f2937;
                background-color: #f3f4f6;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
              }
              
              .email-wrapper {
                width: 100%;
                background-color: #f3f4f6;
                padding: 40px 20px;
              }
              
              .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              }
              
              .header {
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                color: #ffffff;
                padding: 40px 30px;
                text-align: center;
              }
              
              .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
                line-height: 1.2;
                letter-spacing: -0.5px;
              }
              
              .header-icon {
                font-size: 48px;
                margin-bottom: 12px;
                display: block;
              }
              
              .badge {
                display: inline-block;
                padding: 8px 16px;
                border-radius: 999px;
                background: #dbeafe;
                color: #1d4ed8;
                font-weight: 600;
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 16px;
              }
              
              .content {
                padding: 40px 30px;
                background-color: #ffffff;
              }
              
              .greeting {
                font-size: 18px;
                font-weight: 600;
                color: #111827;
                margin: 0 0 16px 0;
              }
              
              .intro-text {
                font-size: 16px;
                color: #4b5563;
                margin: 0 0 32px 0;
                line-height: 1.7;
              }
              
              .info-box {
                margin: 32px 0;
                padding: 24px;
                border-radius: 12px;
                background: linear-gradient(to bottom, #eff6ff 0%, #dbeafe 100%);
                border: 2px solid #3b82f6;
              }
              
              .info-box p {
                margin: 8px 0;
                color: #1e40af;
                font-size: 15px;
              }
              
              .info-box strong {
                color: #1e3a8a;
              }
              
              .action-text {
                font-size: 16px;
                color: #374151;
                margin: 32px 0 24px 0;
                line-height: 1.7;
              }
              
              .button-container {
                text-align: center;
                margin: 32px 0;
              }
              
              .button {
                display: inline-block;
                background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
                color: #ffffff !important;
                padding: 16px 32px;
                text-decoration: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                letter-spacing: 0.3px;
                box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.3);
              }
              
              .footer {
                padding: 32px 30px;
                background-color: #f9fafb;
                border-top: 1px solid #e5e7eb;
                text-align: center;
              }
              
              .footer-text {
                font-size: 14px;
                color: #6b7280;
                margin: 0;
                line-height: 1.6;
              }
              
              /* Mobile responsive */
              @media only screen and (max-width: 600px) {
                .email-wrapper {
                  padding: 20px 10px;
                }
                
                .header, .content, .footer {
                  padding: 30px 20px !important;
                }
                
                .header h1 {
                  font-size: 24px !important;
                }
                
                .button {
                  padding: 14px 28px !important;
                  font-size: 15px !important;
                }
              }
            </style>
          </head>
          <body>
            <div class="email-wrapper">
              <div class="email-container">
                <div class="header">
                  <span class="header-icon">⏰</span>
                  <h1>Plan Expiring Soon</h1>
                </div>
                
                <div class="content">
                  <div style="text-align: center; margin-bottom: 24px;">
                    <span class="badge">Validity Reminder</span>
                  </div>
                  
                  <p class="greeting">Hi ${sanitizeHtml(customerName)},</p>
                  <p class="intro-text">Your current eSIM plan is almost out of validity. You have about <strong>${sanitizeHtml(remainingLabel)}</strong> remaining.</p>

                  <div class="info-box">
                    <p style="margin: 0;"><strong>Estimated Expiration:</strong> ${sanitizeHtml(expiresAt)}</p>
                    <p style="margin: 8px 0 0 0;"><strong>Transaction ID:</strong> ${sanitizeHtml(transactionId)}</p>
                  </div>

                  <p class="action-text">Need more time online? You can activate another plan in advance so you stay connected without interruption.</p>
                  
                  <div class="button-container">
                    <a href="${activationUrl}" class="button">Review My Options</a>
                  </div>
                </div>
                
                <div class="footer">
                  <p class="footer-text">
                    ${sanitizeHtml(brandName)} · We're here if you need help.
                  </p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
      tags: [
        { name: 'category', value: 'usage_alert' },
        { name: 'transaction_id', value: transactionId },
        { name: 'type', value: 'validity_usage' },
      ],
    });

    if (error) {
      console.error('[Email] Validity alert error:', error);
      throw new Error(`Failed to send validity alert: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('[Email] Validity alert error:', error);
    throw error;
  }
}

type ReviewDiscountEmailArgs = {
  to: string;
  customerName: string;
  discountCode: string;
  discountPercentOff?: number | string | null;
};

export async function sendReviewDiscountEmail({
  to,
  customerName,
  discountCode,
  discountPercentOff,
}: ReviewDiscountEmailArgs) {
  ensureEmailPrerequisites(to);

  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "eSIM Store";
  const emailFrom = getEmailFromAddress();
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@myumrahesim.com";
  const shopUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/plans?discount=${encodeURIComponent(discountCode)}`;
  const pct =
    discountPercentOff !== undefined && discountPercentOff !== null && String(discountPercentOff).trim() !== ""
      ? `${sanitizeHtml(String(discountPercentOff))}%`
      : "5%";

  const { data, error } = await resend.emails.send({
    from: emailFrom,
    replyTo: supportEmail,
    to,
    subject: `Your ${pct} discount code – ${brandName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #111827; background: #f3f4f6; }
            .container { max-width: 600px; margin: 0 auto; padding: 24px; }
            .card { background: white; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12); }
            .code { margin: 16px 0; padding: 14px 16px; border-radius: 12px; background: #0f172a; color: white; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 18px; font-weight: 800; letter-spacing: 0.08em; }
            .button { display: inline-block; background: #0ea5e9; color: white; padding: 14px 24px; border-radius: 10px; text-decoration: none; font-weight: 700; margin-top: 16px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <h1 style="margin-top: 0;">Hi ${sanitizeHtml(customerName)},</h1>
              <p>Thanks for leaving a review. Here’s your <strong>${pct} off</strong> discount code:</p>
              <div class="code">${sanitizeHtml(discountCode)}</div>
              <p>Paste this code in checkout (Discount Code field). It’s single-use.</p>
              <a href="${shopUrl}" class="button">Browse plans</a>
              <p style="margin-top: 28px; font-size: 14px; color: #6b7280;">
                Need help? Reply to this email or contact ${sanitizeHtml(supportEmail)}.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    tags: [
      { name: "category", value: "discount" },
      { name: "type", value: "review" },
    ],
  });

  if (error) {
    console.error("[Email] Review discount error:", error);
    throw new Error(`Failed to send review discount email: ${error.message}`);
  }

  return data;
}

function generateActivationEmailHTML({
  customerName,
  transactionId,
  smdpAddress,
  activationCode,
  iccid,
  activationUrl,
  qrCodeUrl,
  brandName
}: {
  customerName: string;
  transactionId: string;
  smdpAddress?: string;
  activationCode?: string;
  iccid?: string;
  activationUrl: string;
  qrCodeUrl?: string;
  brandName: string;
}) {
  // Sanitize inputs to prevent XSS in email templates
  const sanitize = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  };

  const safeCustomerName = sanitize(customerName);
  const safeTransactionId = sanitize(transactionId);
  const safeSmdpAddress = smdpAddress ? sanitize(smdpAddress) : '';
  const safeActivationCode = activationCode ? sanitize(activationCode) : '';
  const safeIccid = iccid ? sanitize(iccid) : '';
  const safeBrandName = sanitize(brandName);
  const primaryColor = process.env.NEXT_PUBLIC_BRAND_COLOR || "#0ea5e9";

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      :root {
        color-scheme: light;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
        line-height: 1.6;
        color: #1f2937;
        margin: 0;
        padding: 0;
        background-color: #f3f4f6;
      }
      .wrapper {
        padding: 24px;
      }
      .container {
        max-width: 640px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 18px;
        overflow: hidden;
        box-shadow: 0 12px 30px rgba(15, 23, 42, 0.15);
      }
      .header {
        background: linear-gradient(135deg, ${primaryColor} 0%, #0E7490 100%);
        color: white;
        padding: 46px 36px 32px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 30px;
        letter-spacing: -0.5px;
      }
      .header p {
        margin: 12px 0 0;
        color: rgba(255,255,255,0.85);
      }
      .content {
        padding: 36px;
      }
      .card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 24px;
        margin: 24px 0;
      }
      .card h3 {
        margin: 0 0 16px 0;
        color: #0f172a;
        font-size: 18px;
      }
      .details-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
      }
      @media (min-width: 520px) {
        .details-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      .detail {
        padding: 14px 16px;
        border-radius: 12px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
      }
      .detail-label {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #64748b;
        margin-bottom: 6px;
      }
      .code {
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
        font-size: 13px;
        color: #0f172a;
        word-break: break-all;
      }
      .qr-wrapper {
        text-align: center;
        border: 1px dashed #cbd5f5;
        border-radius: 16px;
        padding: 24px;
        background: #f8fafc;
        margin: 24px 0;
      }
      .qr-wrapper img {
        max-width: 280px;
        width: 100%;
        height: auto;
        border-radius: 12px;
        border: 4px solid white;
        box-shadow: 0 10px 25px rgba(15, 23, 42, 0.15);
      }
      .button {
        display: inline-block;
        background: ${primaryColor};
        color: #ffffff !important;
        padding: 16px 32px;
        border-radius: 999px;
        font-weight: 600;
        text-decoration: none;
        margin: 24px 0;
      }
      .steps {
        list-style: none;
        padding: 0;
        margin: 24px 0 0 0;
      }
      .steps li {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 14px 0;
        border-top: 1px solid #e2e8f0;
      }
      .steps li:first-child {
        border-top: none;
        padding-top: 0;
      }
      .step-number {
        width: 32px;
        height: 32px;
        border-radius: 10px;
        background: rgba(14, 165, 233, 0.15);
        color: ${primaryColor};
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
      }
      .footer {
        text-align: center;
        padding: 20px 36px 32px;
        background: #0f172a;
        color: rgba(255,255,255,0.75);
        font-size: 13px;
      }
      .footer p {
        margin: 4px 0;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
    <div class="container">
      <div class="header">
          <h1>Your eSIM Is Ready 🎉</h1>
          <p>Scan, install, and stay connected in minutes.</p>
      </div>
      
      <div class="content">
          <p style="font-size: 16px; margin-bottom: 16px;">Hi <strong>${safeCustomerName}</strong>,</p>
          <p>Thank you for choosing ${safeBrandName}! Your eSIM has been provisioned and is ready to activate on your device.</p>
        
        ${qrCodeUrl ? `
          <div class="qr-wrapper">
            <p style="font-weight: 600; color: #0f172a; margin-bottom: 16px;">Scan to install</p>
            <img src="${qrCodeUrl}" alt="Activation QR Code" />
            <p style="color: #64748b; font-size: 13px; margin-top: 12px;">Open your camera or eSIM scanner, then point it at this QR code.</p>
        </div>
        ` : ''}
        
          <div class="card">
            <h3>Activation Details</h3>
            <div class="details-grid">
          ${safeSmdpAddress ? `
              <div class="detail">
                <div class="detail-label">SM-DP+ Address</div>
            <div class="code">${safeSmdpAddress}</div>
              </div>
          ` : ''}
          
          ${safeActivationCode ? `
              <div class="detail">
                <div class="detail-label">Activation Code</div>
            <div class="code">${safeActivationCode}</div>
              </div>
          ` : ''}
          
          ${safeIccid ? `
              <div class="detail">
                <div class="detail-label">ICCID</div>
            <div class="code">${safeIccid}</div>
              </div>
          ` : ''}
          
              <div class="detail">
                <div class="detail-label">Transaction ID</div>
          <div class="code">${safeTransactionId}</div>
              </div>
            </div>
        </div>

          <div class="card">
            <h3>How to Activate</h3>
            <ul class="steps">
              <li>
                <span class="step-number">1</span>
                <div>Open <strong>Settings</strong> on your phone, then go to <strong>Cellular</strong> or <strong>Mobile Data</strong>.</div>
              </li>
              <li>
                <span class="step-number">2</span>
                <div>Tap <strong>Add eSIM</strong> / <strong>Add Cellular Plan</strong> and choose the option to scan a QR code.</div>
              </li>
              <li>
                <span class="step-number">3</span>
                <div>Scan the QR code above, or enter the activation details manually if prompted.</div>
              </li>
              <li>
                <span class="step-number">4</span>
                <div>Follow the on-screen instructions, then set the eSIM as your data line when you arrive.</div>
              </li>
            </ul>

            <div style="text-align: center;">
              <a href="${activationUrl}" class="button">View status & help</a>
            </div>
          </div>

          <p style="margin-top: 32px; color: #475569;">
            Need support? Email us at <a href="mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@myumrahesim.com'}" style="color: ${primaryColor}; text-decoration: underline;">${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@myumrahesim.com'}</a> or visit the activation page for live instructions.
          </p>
        </div>

        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${safeBrandName}. All rights reserved.</p>
          <p>This message contains confidential eSIM activation details. Do not share it publicly.</p>
        </div>
      </div>
    </div>
  </body>
</html>
  `;
}
