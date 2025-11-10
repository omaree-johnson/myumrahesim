#!/bin/bash

# Test Embedded Checkout Email Flow
# This script helps debug why emails aren't being sent

echo "🔍 Testing Embedded Checkout Email Flow"
echo "========================================="
echo ""

# Check if environment variables are set
echo "1. Checking Environment Variables..."
if [ -z "$RESEND_API_KEY" ]; then
    echo "❌ RESEND_API_KEY is not set"
else
    echo "✅ RESEND_API_KEY is set"
fi

if [ -z "$EMAIL_FROM" ]; then
    echo "⚠️  EMAIL_FROM is not set (will use default)"
else
    echo "✅ EMAIL_FROM is set to: $EMAIL_FROM"
fi

if [ -z "$STRIPE_WEBHOOK_SECRET" ]; then
    echo "❌ STRIPE_WEBHOOK_SECRET is not set"
else
    echo "✅ STRIPE_WEBHOOK_SECRET is set"
fi

echo ""
echo "2. Checking if Stripe CLI is running..."
if pgrep -f "stripe listen" > /dev/null; then
    echo "✅ Stripe CLI is running"
    echo ""
    echo "⚠️  IMPORTANT: Make sure Stripe CLI is listening for payment_intent.succeeded"
    echo "   Run: stripe listen --forward-to localhost:3000/api/webhooks/stripe --events payment_intent.succeeded,checkout.session.completed"
else
    echo "❌ Stripe CLI is not running"
    echo "   Start it with: stripe listen --forward-to localhost:3000/api/webhooks/stripe --events payment_intent.succeeded,checkout.session.completed"
fi

echo ""
echo "3. Checking if dev server is running..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Dev server is running on http://localhost:3000"
else
    echo "❌ Dev server is not running"
    echo "   Start it with: pnpm dev"
fi

echo ""
echo "4. Testing webhook endpoint..."
WEBHOOK_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/webhooks/stripe)
if [ "$WEBHOOK_TEST" = "405" ]; then
    echo "✅ Webhook endpoint is accessible (405 = Method Not Allowed is expected for GET)"
else
    echo "⚠️  Webhook returned status: $WEBHOOK_TEST"
fi

echo ""
echo "========================================="
echo "📋 Checklist for Email Delivery:"
echo ""
echo "For Order Confirmation Email (sent immediately):"
echo "  □ Stripe CLI running and forwarding to /api/webhooks/stripe"
echo "  □ Stripe CLI listening for 'payment_intent.succeeded' event"
echo "  □ STRIPE_WEBHOOK_SECRET matches CLI output"
echo "  □ RESEND_API_KEY is valid"
echo "  □ EMAIL_FROM is a verified sender in Resend"
echo ""
echo "For Activation Email (sent after eSIM provisioning):"
echo "  □ Zendit webhook calling /api/webhooks/zendit"
echo "  □ Zendit purchase completes successfully"
echo "  □ Status = 'DONE' in webhook payload"
echo ""
echo "========================================="
echo ""
echo "💡 To test the complete flow:"
echo "1. Make sure Stripe CLI is running with:"
echo "   stripe listen --forward-to localhost:3000/api/webhooks/stripe --events payment_intent.succeeded,checkout.session.completed"
echo ""
echo "2. Make a test purchase at:"
echo "   http://localhost:3000/checkout?product=ESIM-AD-15D-2GB-NOROAM&name=Test+Plan&price=14.50"
echo ""
echo "3. Use test card: 4242 4242 4242 4242"
echo ""
echo "4. Watch terminal logs for:"
echo "   - '[Stripe Webhook] Payment intent succeeded'"
echo "   - '[Stripe Webhook] Order confirmation email sent'"
echo "   - '[Zendit Webhook] Activation email sent'"
echo ""
