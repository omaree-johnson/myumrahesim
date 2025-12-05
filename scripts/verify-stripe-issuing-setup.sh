#!/bin/bash

# Quick verification script for Stripe Issuing setup

echo "🔍 Verifying Stripe Issuing Setup..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found"
    exit 1
fi

# Load environment variables
source .env.local 2>/dev/null || true

# Check required variables
echo "📋 Checking Environment Variables:"
echo ""

# Check Stripe Issuing
if [ "$STRIPE_ISSUING_AVAILABLE" = "true" ]; then
    echo "✅ STRIPE_ISSUING_AVAILABLE=true"
else
    echo "❌ STRIPE_ISSUING_AVAILABLE not set to true"
fi

# Check Service Role Key
if [ -n "$SUPABASE_SERVICE_ROLE_KEY" ] && [ "$SUPABASE_SERVICE_ROLE_KEY" != "your-service-role-key" ]; then
    echo "✅ SUPABASE_SERVICE_ROLE_KEY is set"
else
    echo "⚠️  SUPABASE_SERVICE_ROLE_KEY needs to be set (get from Supabase Dashboard → Settings → API)"
fi

# Check Service Owner Email
if [ -n "$SERVICE_OWNER_EMAIL" ] && [ "$SERVICE_OWNER_EMAIL" != "admin@yourdomain.com" ]; then
    echo "✅ SERVICE_OWNER_EMAIL is set: $SERVICE_OWNER_EMAIL"
else
    echo "⚠️  SERVICE_OWNER_EMAIL needs to be set to a real email address"
fi

# Check Cardholder ID (optional)
if [ -n "$STRIPE_ISSUING_CARDHOLDER_ID" ]; then
    echo "✅ STRIPE_ISSUING_CARDHOLDER_ID is set: $STRIPE_ISSUING_CARDHOLDER_ID"
else
    echo "ℹ️  STRIPE_ISSUING_CARDHOLDER_ID not set (will be auto-created)"
fi

# Check other required vars
if [ -n "$STRIPE_SECRET_KEY" ]; then
    echo "✅ STRIPE_SECRET_KEY is set"
else
    echo "❌ STRIPE_SECRET_KEY not set"
fi

if [ -n "$ZENDIT_API_KEY" ]; then
    echo "✅ ZENDIT_API_KEY is set"
else
    echo "❌ ZENDIT_API_KEY not set"
fi

if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "✅ NEXT_PUBLIC_SUPABASE_URL is set"
else
    echo "❌ NEXT_PUBLIC_SUPABASE_URL not set"
fi

echo ""
echo "📦 Next Steps:"
echo ""
echo "1. Replace placeholder values:"
echo "   - SUPABASE_SERVICE_ROLE_KEY: Get from Supabase Dashboard → Settings → API → service_role key"
echo "   - SERVICE_OWNER_EMAIL: Set to your actual admin email"
echo ""
echo "2. Create Supabase Storage bucket:"
echo "   - Go to Supabase Dashboard → Storage → New bucket"
echo "   - Name: esim-qrcodes"
echo "   - Make it Public"
echo ""
echo "3. Verify Zendit wallet endpoint (check Zendit API docs)"
echo ""
echo "4. Test the flow:"
echo "   - Start dev server: npm run dev"
echo "   - Start webhook: stripe listen --forward-to localhost:3000/api/webhooks/stripe"
echo "   - Make a test purchase"
echo ""

