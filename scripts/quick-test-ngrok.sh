#!/bin/bash

# Quick test to see if ngrok works with the new token

echo "🧪 Quick ngrok Test"
echo "=================="
echo ""

# Kill any existing ngrok
pkill -9 ngrok 2>/dev/null
sleep 1

echo "Starting ngrok on port 3000..."
echo "Watch for 'Session Status: online' or 'Forwarding' message"
echo ""
echo "If you see 'reconnecting', the token is still invalid"
echo "If you see 'online' or a URL, it's working!"
echo ""
echo "Press Ctrl+C after 10 seconds to stop"
echo ""

# Start ngrok and show output
ngrok http 3000

