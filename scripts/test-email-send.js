/**
 * Quick test script to verify email sending works
 * Run: node scripts/test-email-send.js <your-email@example.com>
 */

require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  const testEmail = process.argv[2] || 'test@example.com';
  
  console.log('📧 Testing email send...');
  console.log('From:', process.env.EMAIL_FROM || 'onboarding@resend.dev');
  console.log('To:', testEmail);
  console.log('Has API Key:', !!process.env.RESEND_API_KEY);
  console.log('API Key Preview:', process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 10)}...` : 'MISSING');
  
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not set in .env.local');
    process.exit(1);
  }
  
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: testEmail,
      subject: 'Test Email - eSIM Store',
      html: '<h1>Test Email</h1><p>If you receive this, email sending is working!</p>',
    });
    
    if (error) {
      console.error('❌ Email send failed:', error);
      process.exit(1);
    }
    
    console.log('✅ Email sent successfully!');
    console.log('Email ID:', data?.id);
    console.log('Check your inbox at:', testEmail);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testEmail();

