#!/bin/bash

# Start ngrok tunnel for local development
# This script helps you easily start ngrok for webhook testing

echo "🚀 Starting ngrok tunnel..."
echo ""

# Check if dev server is running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "⚠️  Warning: Dev server doesn't seem to be running on port 3000"
    echo "   Start it with: pnpm dev"
    echo ""
fi

# Check if ngrok is authenticated
if ! ngrok config check > /dev/null 2>&1; then
    echo "❌ ngrok is not authenticated!"
    echo ""
    echo "📋 To get your authtoken:"
    echo "   1. Go to: https://dashboard.ngrok.com/get-started/your-authtoken"
    echo "   2. Sign up or log in if needed"
    echo "   3. Copy your authtoken"
    echo "   4. Run: ngrok config add-authtoken YOUR_TOKEN"
    echo ""
    exit 1
fi

# Note about connection issues
echo "💡 If you see 'reconnecting' errors, your authtoken may be expired"
echo "   Run: ./fix-ngrok.sh for help"
echo ""

echo "✅ ngrok is configured"
echo ""
echo "🌐 Starting tunnel on port 3000..."
echo "📊 Web interface: http://127.0.0.1:4040"
echo ""
echo "💡 Your public URL will appear below:"
echo "   (Use this URL for webhook endpoints)"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start ngrok (region is auto-selected for best performance)
ngrok http 3000

