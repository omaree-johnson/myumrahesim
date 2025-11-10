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
                <p>Hi ${customerName},</p>
                <p>Thank you for joining ${brandName}! We're excited to help you stay connected wherever you go.</p>
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
                <p>Hi ${customerName},</p>
                <p>Thank you for your order! We've received your payment and are processing your eSIM.</p>
                
                <div class="order-box">
                  <h3 style="margin-top: 0;">Order Details</h3>
                  <p><strong>Transaction ID:</strong> ${transactionId}</p>
                  <p><strong>Product:</strong> ${productName}</p>
                  <p><strong>Total:</strong> ${price}</p>
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
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
        line-height: 1.6;
        color: #333;
        margin: 0;
        padding: 0;
        background-color: #f3f4f6;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .header {
        background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
        color: white;
        padding: 40px 30px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: bold;
      }
      .content {
        padding: 30px;
      }
      .activation-box {
        background: #f9fafb;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
      }
      .activation-box h3 {
        margin-top: 0;
        color: #0ea5e9;
        font-size: 18px;
      }
      .code {
        font-family: 'Courier New', monospace;
        background: white;
        padding: 12px;
        border-radius: 6px;
        border: 1px solid #d1d5db;
        word-break: break-all;
        font-size: 14px;
        margin: 8px 0;
      }
      .button {
        display: inline-block;
        background: #0ea5e9;
        color: white !important;
        padding: 14px 28px;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        margin: 20px 0;
      }
      .button:hover {
        background: #0284c7;
      }
      .steps {
        counter-reset: step-counter;
        list-style: none;
        padding: 0;
        margin: 20px 0;
      }
      .steps li {
        counter-increment: step-counter;
        margin: 15px 0;
        padding-left: 40px;
        position: relative;
      }
      .steps li::before {
        content: counter(step-counter);
        position: absolute;
        left: 0;
        top: 0;
        background: #0ea5e9;
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 14px;
      }
      .footer {
        text-align: center;
        padding: 20px;
        background: #f9fafb;
        color: #6b7280;
        font-size: 13px;
        border-top: 1px solid #e5e7eb;
      }
      .divider {
        margin: 25px 0;
        padding-top: 25px;
        border-top: 1px solid #e5e7eb;
      }
      .label {
        font-weight: 600;
        color: #4b5563;
        margin-bottom: 4px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🎉 Your eSIM is Ready!</h1>
      </div>
      
      <div class="content">
        <p style="font-size: 16px; margin-bottom: 20px;">Hi <strong>${customerName}</strong>,</p>
        
        <p>Great news! Your eSIM has been successfully provisioned and is ready to activate on your device.</p>
        
        ${qrCodeUrl ? `
        <div style="text-align: center; margin: 30px 0; padding: 20px; background: white; border: 2px solid #e5e7eb; border-radius: 12px;">
          <h3 style="color: #1f2937; margin-top: 0;">Scan to Activate</h3>
          <img src="${qrCodeUrl}" alt="eSIM QR Code" style="max-width: 300px; width: 100%; height: auto; border: 4px solid #0ea5e9; border-radius: 8px; padding: 10px; background: white;" />
          <p style="color: #6b7280; font-size: 14px; margin-top: 15px;">Scan this QR code with your device camera to activate your eSIM</p>
        </div>
        ` : ''}
        
        <div class="activation-box">
          <h3>📱 Activation Details</h3>
          
          ${smdpAddress ? `
            <div class="label">SM-DP+ Address:</div>
            <div class="code">${smdpAddress}</div>
          ` : ''}
          
          ${activationCode ? `
            <div class="label">Activation Code:</div>
            <div class="code">${activationCode}</div>
          ` : ''}
          
          ${iccid ? `
            <div class="label">ICCID:</div>
            <div class="code">${iccid}</div>
          ` : ''}
          
          <div class="label">Transaction ID:</div>
          <div class="code">${transactionId}</div>
        </div>

        <h3 style="color: #1f2937; font-size: 20px; margin-top: 30px;">How to Activate Your eSIM</h3>
        
        <ol class="steps">
          <li>Open <strong>Settings</strong> on your device</li>
          <li>Go to <strong>Cellular</strong> or <strong>Mobile Data</strong></li>
          <li>Tap <strong>Add eSIM</strong> or <strong>Add Cellular Plan</strong></li>
          <li>Scan the QR code or enter the activation code manually</li>
          <li>Follow the on-screen instructions to complete setup</li>
        </ol>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${activationUrl}" class="button">View Full Activation Details</a>
        </div>

        <div class="divider">
          <p style="margin: 0;"><strong>📞 Need Help?</strong></p>
          <p style="margin: 8px 0 0 0; color: #6b7280;">Our support team is here to help you with activation. Visit the activation page for more information.</p>
        </div>
      </div>
      
      <div class="footer">
        <p style="margin: 0 0 8px 0;">&copy; ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
        <p style="margin: 0; color: #9ca3af; font-size: 12px;">This email was sent because you purchased an eSIM plan from ${brandName}.</p>
      </div>
    </div>
  </body>
</html>
  `;
}
