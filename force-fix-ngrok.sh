#!/bin/bash

# Force fix ngrok - more aggressive approach
# This will completely reset everything and test the connection

set -e

echo "🔧 FORCE FIXING ngrok"
echo "===================="
echo ""

# Step 1: Kill all ngrok processes
echo "1. Killing all ngrok processes..."
pkill -9 ngrok 2>/dev/null || true
sleep 2
echo "   ✅ Done"
echo ""

# Step 2: Backup and remove old config
echo "2. Removing old configuration..."
CONFIG_FILE=""
if [ -f ~/Library/Application\ Support/ngrok/ngrok.yml ]; then
    CONFIG_FILE=~/Library/Application\ Support/ngrok/ngrok.yml
    BACKUP_FILE=~/Library/Application\ Support/ngrok/ngrok.yml.backup.$(date +%s)
    cp "$CONFIG_FILE" "$BACKUP_FILE" 2>/dev/null || true
    echo "   Backed up to: $BACKUP_FILE"
    rm -f "$CONFIG_FILE"
elif [ -f ~/.config/ngrok/ngrok.yml ]; then
    CONFIG_FILE=~/.config/ngrok/ngrok.yml
    BACKUP_FILE=~/.config/ngrok/ngrok.yml.backup.$(date +%s)
    cp "$CONFIG_FILE" "$BACKUP_FILE" 2>/dev/null || true
    echo "   Backed up to: $BACKUP_FILE"
    rm -f "$CONFIG_FILE"
fi

if [ -n "$CONFIG_FILE" ]; then
    echo "   ✅ Removed old config"
else
    echo "   ℹ️  No config file found (that's okay)"
fi
echo ""

# Step 3: Test network
echo "3. Testing network connectivity..."
if ping -c 3 api.ngrok.com > /dev/null 2>&1; then
    echo "   ✅ Network is OK"
else
    echo "   ❌ Network issue - cannot reach ngrok servers"
    echo "      Check your internet connection"
    exit 1
fi
echo ""

# Step 4: Get new token
echo "4. Getting fresh authtoken..."
echo ""
echo "   ⚠️  IMPORTANT: You need to get a NEW authtoken"
echo ""
echo "   Steps:"
echo "   1. Open: https://dashboard.ngrok.com/get-started/your-authtoken"
echo "   2. Make sure you're logged into the CORRECT account"
echo "   3. Copy the authtoken (it's a long string)"
echo ""
read -p "   Paste your NEW authtoken here: " NEW_TOKEN

if [ -z "$NEW_TOKEN" ]; then
    echo "   ❌ No token provided"
    exit 1
fi

# Clean the token (remove any whitespace)
NEW_TOKEN=$(echo "$NEW_TOKEN" | tr -d '[:space:]')

echo ""
echo "5. Authenticating with new token..."

# Try to add the token
if ngrok config add-authtoken "$NEW_TOKEN" 2>&1; then
    echo "   ✅ Token added successfully"
else
    echo "   ❌ Failed to add token"
    echo "   Make sure you copied the entire token correctly"
    exit 1
fi

echo ""
echo "6. Verifying configuration..."
if ngrok config check > /dev/null 2>&1; then
    echo "   ✅ Configuration is valid"
else
    echo "   ⚠️  Config check failed, but continuing..."
fi

echo ""
echo "7. Testing actual connection (this may take 10-15 seconds)..."
echo "   Starting ngrok tunnel test..."

# Start ngrok and capture output
ngrok http 3000 > /tmp/ngrok-force-test.log 2>&1 &
NGROK_PID=$!

# Wait and check status (give it more time)
sleep 12

# Check if ngrok is still running
if ! kill -0 $NGROK_PID 2>/dev/null; then
    echo "   ❌ ngrok process died"
    cat /tmp/ngrok-force-test.log
    exit 1
fi

# Check the log for success indicators
if grep -qi "started tunnel" /tmp/ngrok-force-test.log 2>/dev/null || \
   grep -qi "forwarding" /tmp/ngrok-force-test.log 2>/dev/null || \
   grep -qi "session status.*online" /tmp/ngrok-force-test.log 2>/dev/null || \
   grep -qE "https://[a-z0-9-]+\.ngrok" /tmp/ngrok-force-test.log 2>/dev/null; then
    echo "   ✅ SUCCESS! ngrok is connected!"
    echo ""
    echo "   Your ngrok URL:"
    grep -oE "https://[a-z0-9-]+\.ngrok[^ ]*" /tmp/ngrok-force-test.log 2>/dev/null | head -1 || echo "   (check the output above)"
    echo ""
    echo "   🎉 ngrok is working! Press Ctrl+C in the ngrok window to stop it."
    kill $NGROK_PID 2>/dev/null
    rm -f /tmp/ngrok-force-test.log
    exit 0
elif grep -qi "reconnecting" /tmp/ngrok-force-test.log 2>/dev/null || \
     grep -qi "failed to send authentication" /tmp/ngrok-force-test.log 2>/dev/null || \
     grep -qi "authentication failed" /tmp/ngrok-force-test.log 2>/dev/null || \
     grep -qi "invalid authtoken" /tmp/ngrok-force-test.log 2>/dev/null; then
    echo "   ❌ Still getting authentication errors"
    echo ""
    echo "   The token you provided is still not working."
    echo "   Possible issues:"
    echo "   - Token is from wrong account"
    echo "   - Token was copied incorrectly (missing characters)"
    echo "   - Network/firewall blocking ngrok"
    echo "   - VPN interfering with connection"
    echo ""
    echo "   Try:"
    echo "   1. Get a completely fresh token from dashboard"
    echo "   2. Make absolutely sure you're on the right account"
    echo "   3. Copy the ENTIRE token (it's very long)"
    echo "   4. Disable VPN if you have one"
    echo "   5. Try a different network"
    echo ""
    echo "   Full error log:"
    cat /tmp/ngrok-force-test.log
    kill $NGROK_PID 2>/dev/null
    rm -f /tmp/ngrok-force-test.log
    exit 1
else
    echo "   ⚠️  Could not determine status"
    echo "   Full log:"
    cat /tmp/ngrok-force-test.log
    kill $NGROK_PID 2>/dev/null
    exit 1
fi

