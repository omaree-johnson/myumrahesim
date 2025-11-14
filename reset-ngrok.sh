#!/bin/bash

# Complete ngrok reset and re-authentication
# This script will help you completely reset ngrok and get a fresh start

echo "🔄 ngrok Complete Reset"
echo "======================"
echo ""
echo "This will:"
echo "  1. Remove your current ngrok configuration"
echo "  2. Help you get a fresh authtoken"
echo "  3. Re-authenticate ngrok"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 1
fi

echo ""
echo "📋 Step 1: Removing old configuration..."
echo ""

# Find and remove config files
if [ -f ~/Library/Application\ Support/ngrok/ngrok.yml ]; then
    echo "   Removing: ~/Library/Application Support/ngrok/ngrok.yml"
    rm ~/Library/Application\ Support/ngrok/ngrok.yml
fi

if [ -f ~/.config/ngrok/ngrok.yml ]; then
    echo "   Removing: ~/.config/ngrok/ngrok.yml"
    rm ~/.config/ngrok/ngrok.yml
fi

if [ -f ~/.ngrok2/ngrok.yml ]; then
    echo "   Removing: ~/.ngrok2/ngrok.yml"
    rm ~/.ngrok2/ngrok.yml
fi

echo "   ✅ Old configuration removed"
echo ""

echo "📋 Step 2: Get your fresh authtoken"
echo ""
echo "   1. Open this URL in your browser:"
echo "      https://dashboard.ngrok.com/get-started/your-authtoken"
echo ""
echo "   2. Make sure you're logged into the CORRECT ngrok account"
echo ""
echo "   3. Copy the authtoken shown on that page"
echo ""
echo "   4. Paste it below when prompted"
echo ""

read -p "Paste your authtoken here: " AUTH_TOKEN

if [ -z "$AUTH_TOKEN" ]; then
    echo "❌ No token provided. Exiting."
    exit 1
fi

echo ""
echo "📋 Step 3: Authenticating ngrok..."
echo ""

# Add the authtoken
if ngrok config add-authtoken "$AUTH_TOKEN" 2>&1; then
    echo ""
    echo "✅ Authentication successful!"
    echo ""
    
    # Verify
    echo "📋 Step 4: Verifying configuration..."
    if ngrok config check > /dev/null 2>&1; then
        echo "   ✅ Configuration is valid"
    else
        echo "   ⚠️  Configuration check failed, but token was added"
    fi
    
    echo ""
    echo "🎉 ngrok has been reset and re-authenticated!"
    echo ""
    echo "🧪 Test it now:"
    echo "   npm run ngrok"
    echo "   or"
    echo "   ./start-ngrok.sh"
    echo ""
else
    echo ""
    echo "❌ Authentication failed!"
    echo ""
    echo "Possible issues:"
    echo "  - Invalid authtoken (make sure you copied it correctly)"
    echo "  - Network connectivity issues"
    echo "  - Firewall blocking ngrok"
    echo ""
    echo "Try:"
    echo "  1. Get a fresh token from the dashboard"
    echo "  2. Make sure you're on the right account"
    echo "  3. Check your network connection"
    echo "  4. Disable VPN if you're using one"
    echo ""
    exit 1
fi

