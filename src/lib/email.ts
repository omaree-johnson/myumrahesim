import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Email service export for direct access if needed
export { resend };

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
  const qrCodeUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/purchases/${transactionId}/qrcode`;
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || 'eSIM Store';

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
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
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('[Email] Sent successfully:', data);
    return data;
  } catch (error) {
    console.error('[Email] Error:', error);
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

  try {
    const emails = customers.map(customer => ({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: customer.to,
      subject: `Your eSIM is Ready to Activate! - ${brandName}`,
      html: generateActivationEmailHTML({
        customerName: customer.customerName,
        transactionId: customer.transactionId,
        smdpAddress: customer.smdpAddress,
        activationCode: customer.activationCode,
        iccid: customer.iccid,
        activationUrl: `${activationUrl}/activation?transactionId=${customer.transactionId}`,
        qrCodeUrl: `${activationUrl}/api/purchases/${customer.transactionId}/qrcode`,
        brandName
      }),
      tags: [
        { name: 'category', value: 'activation' },
        { name: 'transaction_id', value: customer.transactionId }
      ]
    }));

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
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to,
      subject: `Welcome to ${brandName}!`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; padding: 30px; text-align: center; }
              .content { padding: 30px; background: #f9fafb; }
              .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to ${brandName}! 🎉</h1>
              </div>
              <div class="content">
                <p>Hi ${sanitize(customerName)},</p>
                <p>Thank you for joining ${sanitize(brandName)}! We're excited to help you stay connected wherever you go.</p>
                <p>With our eSIM service, you can:</p>
                <ul>
                  <li>✅ Activate instantly - no physical SIM needed</li>
                  <li>🌍 Stay connected worldwide</li>
                  <li>💰 Save on roaming charges</li>
                  <li>📱 Keep your existing number</li>
                </ul>
                <p style="text-align: center; margin-top: 30px;">
                  <a href="${process.env.NEXT_PUBLIC_BASE_URL}" class="button">Browse eSIM Plans</a>
                </p>
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
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || 'eSIM Store';

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
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to,
      subject: `Order Confirmation - ${brandName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #0ea5e9; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px; background: white; }
              .order-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
              .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Order Confirmed! ✅</h1>
              </div>
              <div class="content">
                <p>Hi ${sanitize(customerName)},</p>
                <p>Thank you for your order! We've received your payment and are processing your eSIM.</p>
                
                <div class="order-box">
                  <h3 style="margin-top: 0;">Order Details</h3>
                  <p><strong>Transaction ID:</strong> ${sanitize(transactionId)}</p>
                  <p><strong>Product:</strong> ${sanitize(productName)}</p>
                  <p><strong>Total:</strong> ${sanitize(price)}</p>
                </div>

                <p>Your eSIM is being provisioned and you'll receive activation details via email shortly (typically within a few minutes).</p>

                <p style="text-align: center; margin-top: 30px;">
                  <a href="${process.env.NEXT_PUBLIC_BASE_URL}/activation?transactionId=${transactionId}" class="button">Check Status</a>
                </p>
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
      console.error('[Email] Order confirmation error:', error);
      throw new Error(`Failed to send order confirmation: ${error.message}`);
    }

    console.log('[Email] Order confirmation sent:', data);
    return data;
  } catch (error) {
    console.error('[Email] Order confirmation error:', error);
    throw error;
  }
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
            Need support? Reply to this email or visit the activation page for live instructions.
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
