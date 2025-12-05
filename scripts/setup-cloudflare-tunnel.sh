#!/bin/bash

# Setup Cloudflare Tunnel as an alternative to ngrok
# This is a free, reliable alternative that often works when ngrok doesn't

echo "☁️  Cloudflare Tunnel Setup"
echo "============================"
echo ""

# Check if installed
if ! command -v cloudflared &> /dev/null; then
    echo "📦 Installing cloudflared..."
    if command -v brew &> /dev/null; then
        brew install cloudflared
    else
        echo "❌ Homebrew not found. Please install cloudflared manually:"
        echo "   https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/"
        exit 1
    fi
fi

echo "✅ cloudflared is installed: $(cloudflared --version 2>&1 | head -1)"
echo ""

echo "🚀 Starting Cloudflare Tunnel..."
echo ""
echo "This will create a public URL for your local server on port 3000"
echo "Press Ctrl+C to stop"
echo ""

# Start the tunnel
cloudflared tunnel --url http://localhost:3000

