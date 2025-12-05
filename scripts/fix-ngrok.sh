#!/bin/bash

# Fix ngrok connection issues
# This script helps diagnose and fix ngrok authentication problems

echo "🔧 ngrok Connection Fixer"
echo "========================"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed"
    echo "   Install with: brew install ngrok/ngrok/ngrok"
    exit 1
fi

echo "✅ ngrok is installed: $(ngrok version)"
echo ""

# Check current config
echo "📋 Current Configuration:"
if [ -f ~/Library/Application\ Support/ngrok/ngrok.yml ]; then
    echo "   Config file: ~/Library/Application Support/ngrok/ngrok.yml"
    HAS_TOKEN=$(grep -c "authtoken:" ~/Library/Application\ Support/ngrok/ngrok.yml || echo "0")
    if [ "$HAS_TOKEN" -gt 0 ]; then
        echo "   ✅ Authtoken is configured"
    else
        echo "   ❌ No authtoken found"
    fi
elif [ -f ~/.config/ngrok/ngrok.yml ]; then
    echo "   Config file: ~/.config/ngrok/ngrok.yml"
    HAS_TOKEN=$(grep -c "authtoken:" ~/.config/ngrok/ngrok.yml || echo "0")
    if [ "$HAS_TOKEN" -gt 0 ]; then
        echo "   ✅ Authtoken is configured"
    else
        echo "   ❌ No authtoken found"
    fi
else
    echo "   ❌ No config file found"
fi

echo ""
echo "🔍 Testing ngrok connection..."
ngrok config check 2>&1

echo ""
echo "📋 To fix connection issues:"
echo ""
echo "1. Get a fresh authtoken:"
echo "   → https://dashboard.ngrok.com/get-started/your-authtoken"
echo ""
echo "2. Re-authenticate:"
echo "   ngrok config add-authtoken YOUR_NEW_TOKEN"
echo ""
echo "3. If still having issues, try:"
echo "   - Disable VPN if you're using one"
echo "   - Check firewall settings"
echo "   - Try a different network (mobile hotspot)"
echo ""
echo "4. Test the connection:"
echo "   ./start-ngrok.sh"
echo ""

