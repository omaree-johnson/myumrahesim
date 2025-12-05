#!/bin/bash

# Test ngrok connection without starting a tunnel
# This helps diagnose connection issues

echo "🧪 Testing ngrok Connection"
echo "========================="
echo ""

# Check network connectivity
echo "1. Testing network connectivity..."
if ping -c 2 api.ngrok.com > /dev/null 2>&1; then
    echo "   ✅ Can reach ngrok servers"
else
    echo "   ❌ Cannot reach ngrok servers"
    echo "      Check your internet connection or firewall"
    exit 1
fi

echo ""

# Check if authenticated
echo "2. Checking authentication..."
if ngrok config check > /dev/null 2>&1; then
    echo "   ✅ Config is valid"
else
    echo "   ❌ Config is invalid"
    echo "      Run: ./reset-ngrok.sh to fix"
    exit 1
fi

echo ""

# Try to get account info (this will test the token)
echo "3. Testing authtoken validity..."
echo "   (This may take a few seconds...)"

# Start ngrok in background and check if it connects
(ngrok http 3000 > /tmp/ngrok-test.log 2>&1 &)
NGROK_PID=$!
sleep 5

# Check the log for connection status
if grep -q "started tunnel" /tmp/ngrok-test.log 2>/dev/null || grep -q "Forwarding" /tmp/ngrok-test.log 2>/dev/null; then
    echo "   ✅ Connection successful!"
    echo ""
    echo "   Your ngrok URL:"
    grep -o "https://[a-z0-9-]*\.ngrok[^ ]*" /tmp/ngrok-test.log 2>/dev/null | head -1 || echo "   (check output above)"
    kill $NGROK_PID 2>/dev/null
    rm -f /tmp/ngrok-test.log
    exit 0
elif grep -q "reconnecting" /tmp/ngrok-test.log 2>/dev/null || grep -q "failed to send authentication" /tmp/ngrok-test.log 2>/dev/null; then
    echo "   ❌ Authentication failed!"
    echo ""
    echo "   Your authtoken is invalid or expired"
    echo "   Solution: Run ./reset-ngrok.sh to get a fresh token"
    kill $NGROK_PID 2>/dev/null
    rm -f /tmp/ngrok-test.log
    exit 1
else
    echo "   ⚠️  Could not determine status"
    echo "   Check the log: cat /tmp/ngrok-test.log"
    kill $NGROK_PID 2>/dev/null
    exit 1
fi

