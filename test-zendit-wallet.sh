#!/bin/bash

# Test script to verify Zendit wallet endpoints
# Usage: ./test-zendit-wallet.sh

# Load API key from .env.local if it exists
if [ -f .env.local ]; then
    export $(grep -v '^#' .env.local | grep ZENDIT_API_KEY | xargs)
fi

ZENDIT_KEY="${ZENDIT_API_KEY:-}"

if [ -z "$ZENDIT_KEY" ]; then
    echo "❌ ZENDIT_API_KEY not found"
    echo "Set it in .env.local or export it:"
    echo "  export ZENDIT_API_KEY=your-key-here"
    exit 1
fi

echo "🔍 Testing Zendit Wallet Endpoints"
echo "Using API key: ${ZENDIT_KEY:0:10}..."
echo ""

# Test 1: Wallet Balance
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 1: GET /wallet/balance"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESPONSE=$(curl -X GET "https://api.zendit.io/v1/wallet/balance" \
  -H "Authorization: Bearer $ZENDIT_KEY" \
  -H "Accept: application/json" \
  -w "\n%{http_code}" \
  -s)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo "Response:"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Wallet balance endpoint EXISTS and works!"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "❌ Wallet balance endpoint NOT FOUND (404)"
elif [ "$HTTP_CODE" = "401" ]; then
    echo "⚠️  Authentication failed (401) - check API key"
elif [ "$HTTP_CODE" = "403" ]; then
    echo "⚠️  Forbidden (403) - may need different permissions"
else
    echo "⚠️  Unexpected status: $HTTP_CODE"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 2: POST /wallet/topup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test 2: Wallet Top-up
RESPONSE=$(curl -X POST "https://api.zendit.io/v1/wallet/topup" \
  -H "Authorization: Bearer $ZENDIT_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "currency": "USD",
    "card": {
      "number": "4242424242424242",
      "exp_month": 12,
      "exp_year": 2026,
      "cvc": "123"
    },
    "reference": "test-topup-'$(date +%s)'"
  }' \
  -w "\n%{http_code}" \
  -s)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo "Response:"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Wallet top-up endpoint EXISTS and works!"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "❌ Wallet top-up endpoint NOT FOUND (404)"
elif [ "$HTTP_CODE" = "400" ]; then
    echo "⚠️  Bad Request (400) - endpoint exists but payload may be wrong"
elif [ "$HTTP_CODE" = "401" ]; then
    echo "⚠️  Authentication failed (401) - check API key"
elif [ "$HTTP_CODE" = "403" ]; then
    echo "⚠️  Forbidden (403) - may need different permissions"
else
    echo "⚠️  Unexpected status: $HTTP_CODE"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "If both endpoints return 404:"
echo "  → Wallet API may not be available"
echo "  → Contact Zendit support for wallet API documentation"
echo "  → Consider alternative flow (pre-fund wallet manually)"
echo ""
echo "If endpoints return 200:"
echo "  → Endpoints exist! Update implementation if needed"
echo "  → Proceed with Stripe Issuing flow"
echo ""

