# ngrok Setup Guide

ngrok is now installed and ready to use for webhook testing!

## Quick Start

### 1. Authenticate ngrok (One-time setup)

You need to get your authtoken from ngrok:

1. **Go to**: https://dashboard.ngrok.com/get-started/your-authtoken
2. **Sign up or log in** (free account)
3. **Copy your authtoken** (it looks like: `2abc123def456...`)
4. **Run this command**:
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

### 2. Start ngrok tunnel

**Option A: Use the helper script** (Recommended)
```bash
./start-ngrok.sh
```

**Option B: Manual start**
```bash
ngrok http 3000
```

### 3. Get your public URL

Once ngrok starts, you'll see output like:
```
Forwarding   https://abc123.ngrok-free.app -> http://localhost:3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

### 4. Update webhook URLs

#### For Zendit:
1. Go to your Zendit dashboard
2. Navigate to Webhooks settings
3. Update webhook URL to: `https://your-ngrok-url.ngrok-free.app/api/webhooks/zendit`

#### For Stripe:
1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://your-ngrok-url.ngrok-free.app/api/webhooks/stripe`
3. Select events: `payment_intent.succeeded`, `checkout.session.completed`
4. Copy the webhook signing secret to `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

## Web Interface

While ngrok is running, you can view requests and responses at:
- **Local web interface**: http://127.0.0.1:4040

This is great for debugging webhook calls!

## Troubleshooting

### "Session Status: reconnecting" or "failed to send authentication request"

**This is the most common issue - your authtoken is invalid or expired.**

**Quick Fix (Recommended):**
```bash
npm run reset-ngrok
```
This will guide you through getting a fresh token and re-authenticating.

**Manual Fix:**
1. **Get a fresh authtoken**:
   - Go to: https://dashboard.ngrok.com/get-started/your-authtoken
   - **Make sure you're logged into the correct account**
   - Copy the new token

2. **Re-authenticate**:
   ```bash
   ngrok config add-authtoken YOUR_NEW_TOKEN
   ```

3. **Test the connection**:
   ```bash
   npm run test-ngrok
   ```

4. **If still failing**:
   - Disable VPN if you're using one
   - Try a different network (mobile hotspot)
   - Check firewall settings
   - Make sure you're logged into the correct ngrok account
   - Try the complete reset: `npm run reset-ngrok`

### "Failed to fetch CRL"
- Usually a network/firewall issue
- Try disabling VPN
- Check if corporate firewall is blocking ngrok
- Try a different network

### Port already in use
- Make sure your dev server is running: `pnpm dev`
- Check if another ngrok instance is running

## Quick Commands

```bash
# Start ngrok (default port 3000)
npm run ngrok
# or
./start-ngrok.sh

# Check which account you're logged into
npm run check-ngrok
# or
./check-ngrok-account.sh

# Diagnose connection issues
npm run fix-ngrok
# or
./fix-ngrok.sh

# Start with specific port
ngrok http 3001

# Check ngrok status
ngrok config check

# View ngrok config
cat ~/Library/Application\ Support/ngrok/ngrok.yml
# or
cat ~/.config/ngrok/ngrok.yml
```

## Verify Your Account

To check if you're logged into the correct ngrok account:

1. **Run the check script**:
   ```bash
   npm run check-ngrok
   ```

2. **Compare tokens**:
   - Go to: https://dashboard.ngrok.com/get-started/your-authtoken
   - Sign in to the account you want to use
   - Compare the token shown there with your current token
   - If they match → You're on the right account ✅
   - If different → Update your token

3. **Update if needed**:
   ```bash
   ngrok config add-authtoken YOUR_NEW_TOKEN
   ```

## Notes

- **Free ngrok URLs change** each time you restart. For a stable URL, consider ngrok's paid plan.
- **Keep ngrok running** in a separate terminal while testing webhooks.
- **The web interface** at http://127.0.0.1:4040 is very useful for debugging!

