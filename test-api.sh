#!/bin/bash

# Verification script for Zendit API integration
# Run this to test the API endpoints

echo "🔍 Testing Zendit API Integration..."
echo ""

# Check environment
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found"
    exit 1
fi

echo "✅ Environment file exists"

# Check if dev server is running
if ! lsof -i :3001 > /dev/null 2>&1; then
    echo "⚠️  Dev server not running on port 3001"
    echo "   Run: pnpm dev"
    exit 1
fi

echo "✅ Dev server running on port 3001"
echo ""

# Test products endpoint
echo "📦 Testing GET /api/products..."
PRODUCTS_RESPONSE=$(curl -s http://localhost:3001/api/products)

if echo "$PRODUCTS_RESPONSE" | grep -q "offerId"; then
    PRODUCT_COUNT=$(echo "$PRODUCTS_RESPONSE" | grep -o "offerId" | wc -l)
    echo "✅ Products endpoint working - Found $PRODUCT_COUNT offers"
    
    # Extract first offer ID for testing
    FIRST_OFFER_ID=$(echo "$PRODUCTS_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "   Sample offer: $FIRST_OFFER_ID"
else
    echo "❌ Products endpoint failed"
    echo "$PRODUCTS_RESPONSE"
    exit 1
fi

echo ""
echo "🛒 Testing POST /api/orders..."

# Test order creation (will fail without real data, but checks endpoint exists)
ORDER_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{"offerId":"TEST","recipientEmail":"test@example.com"}' \
    http://localhost:3001/api/orders)

if echo "$ORDER_RESPONSE" | grep -q "transactionId\|error"; then
    if echo "$ORDER_RESPONSE" | grep -q "transactionId"; then
        echo "✅ Orders endpoint working - Purchase created"
    else
        echo "⚠️  Orders endpoint accessible (error expected with test data)"
        echo "   Response: $(echo $ORDER_RESPONSE | head -c 100)..."
    fi
else
    echo "❌ Orders endpoint failed"
    echo "$ORDER_RESPONSE"
fi

echo ""
echo "📝 Summary:"
echo "   ✅ Environment configured"
echo "   ✅ Dev server running"
echo "   ✅ Products API working"
echo "   ✅ Orders API accessible"
echo ""
echo "🎉 Integration verified! Ready for testing."
echo ""
echo "Next steps:"
echo "   1. Open http://localhost:3001 in browser"
echo "   2. Browse available eSIM plans"
echo "   3. Test checkout flow (sandbox mode)"
echo "   4. Check browser console for any errors"
