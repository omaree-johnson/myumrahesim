#!/bin/bash

# Check which ngrok account you're logged into
# This script helps verify your ngrok authentication

echo "🔍 Checking ngrok Account Status"
echo "================================="
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed"
    exit 1
fi

echo "✅ ngrok version: $(ngrok version)"
echo ""

# Check config file
CONFIG_FILE=""
if [ -f ~/Library/Application\ Support/ngrok/ngrok.yml ]; then
    CONFIG_FILE=~/Library/Application\ Support/ngrok/ngrok.yml
elif [ -f ~/.config/ngrok/ngrok.yml ]; then
    CONFIG_FILE=~/.config/ngrok/ngrok.yml
fi

if [ -z "$CONFIG_FILE" ]; then
    echo "❌ No ngrok config file found"
    echo "   You need to authenticate first"
    exit 1
fi

echo "📁 Config file: $CONFIG_FILE"
echo ""

# Check if authtoken exists
if grep -q "authtoken:" "$CONFIG_FILE"; then
    TOKEN=$(grep "authtoken:" "$CONFIG_FILE" | awk '{print $2}' | head -c 20)
    echo "✅ Authtoken is configured (first 20 chars: ${TOKEN}...)"
else
    echo "❌ No authtoken found in config"
    exit 1
fi

echo ""
echo "🔍 Testing authentication..."
echo ""

# Test config validity
if ngrok config check > /dev/null 2>&1; then
    echo "✅ Config file is valid"
else
    echo "❌ Config file is invalid"
    echo "   Your authtoken may be expired or incorrect"
    exit 1
fi

echo ""
echo "📋 How to verify which account this token belongs to:"
echo ""
echo "1. Go to ngrok dashboard:"
echo "   https://dashboard.ngrok.com/get-started/your-authtoken"
echo ""
echo "2. Sign in to your account"
echo ""
echo "3. Check the authtoken shown there:"
echo "   - If it matches your current token → You're on the right account ✅"
echo "   - If it's different → You need to update your token"
echo ""
echo "4. To get a fresh token from the correct account:"
echo "   a. Make sure you're logged into the RIGHT account in the dashboard"
echo "   b. Copy the authtoken from the dashboard"
echo "   c. Run: ngrok config add-authtoken YOUR_NEW_TOKEN"
echo ""
echo "💡 Tip: If you have multiple ngrok accounts, make sure you're"
echo "   logged into the one you want to use before copying the token."
echo ""
echo "🧪 Test your connection:"
echo "   Run: ./start-ngrok.sh"
echo "   If you see 'reconnecting' errors, your token is likely wrong/expired"
echo ""

