#!/bin/bash

# Quick Start Script for eSIM PWA
# This script helps you get started quickly

echo "🚀 eSIM PWA - Quick Setup"
echo "========================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from template..."
    cp .env.example .env.local
    echo "✅ .env.local created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env.local and add your ZENDIT_API_KEY"
    echo ""
else
    echo "✅ .env.local already exists"
    echo ""
fi

# Check for Zendit API key
if grep -q "sk_test_your_zendit_api_key_here" .env.local 2>/dev/null; then
    echo "⚠️  WARNING: You need to add your actual Zendit API key to .env.local"
    echo ""
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
else
    echo "✅ Dependencies already installed"
    echo ""
fi

echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local and add your ZENDIT_API_KEY"
echo "2. Add your brand icons to public/icons/ (192x192 and 512x512 PNG)"
echo "3. Verify Zendit API endpoints in src/lib/zendit.ts"
echo "4. Run: npm run dev"
echo "5. Open: http://localhost:3000"
echo ""
echo "📚 For more info, see README.md and IMPLEMENTATION.md"
echo ""
