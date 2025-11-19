# Cloudflare Tunnel - Quick Start Guide

## What is Cloudflare Tunnel?

Cloudflare Tunnel is a **free, reliable alternative to ngrok** for exposing your local development server to the internet. It's perfect for testing webhooks and sharing your local app.

## Quick Start

### Option 1: Using npm script (Recommended)

```bash
pnpm cloudflare-tunnel
```

This will:
- Check if `cloudflared` is installed
- Install it automatically if missing (via Homebrew)
- Start the tunnel on port 3000

### Option 2: Using the script directly

```bash
./setup-cloudflare-tunnel.sh
```

### Option 3: Manual command

```bash
cloudflared tunnel --url http://localhost:3000
```

## Prerequisites

### 1. Make sure your dev server is running

```bash
# In a separate terminal
pnpm dev
```

Your app should be running on `http://localhost:3000`

### 2. Install cloudflared (if not already installed)

**On macOS (using Homebrew):**
```bash
brew install cloudflared
```

**On other platforms:**
Visit: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/

## Starting the Tunnel

1. **Start your dev server** (if not already running):
   ```bash
   pnpm dev
   ```

2. **Start Cloudflare Tunnel**:
   ```bash
   pnpm cloudflare-tunnel
   ```

3. **You'll see output like this:**
   ```
   ☁️  Cloudflare Tunnel Setup
   ============================
   
   ✅ cloudflared is installed: cloudflared version 2024.x.x
   
   🚀 Starting Cloudflare Tunnel...
   
   This will create a public URL for your local server on port 3000
   Press Ctrl+C to stop
   
   +--------------------------------------------------------------------------------------------+
   |  Your quick Tunnel has been created! Visit it at (it may take a minute to be reachable): |
   |  https://xxxxx-xxxxx-xxxxx.trycloudflare.com                                               |
   +--------------------------------------------------------------------------------------------+
   ```

4. **Copy the URL** (e.g., `https://xxxxx.trycloudflare.com`)

## Using the Tunnel URL

### For Webhooks

Update your webhook endpoints with the Cloudflare URL:

#### Zendit Webhook:
```
https://your-url.trycloudflare.com/api/webhooks/zendit
```

#### Stripe Webhook:
```
https://your-url.trycloudflare.com/api/webhooks/stripe
```

### For Testing

- Visit your app: `https://your-url.trycloudflare.com`
- Share with team members
- Test webhooks from external services

## Important Notes

### ⚠️ URL Changes Each Time
- The URL changes every time you restart the tunnel
- You'll need to update webhook URLs each time
- For a permanent URL, you need a Cloudflare account (free tier available)

### ✅ Advantages
- **Free** - No account needed for quick tunnels
- **Reliable** - Works behind firewalls and VPNs
- **Fast** - Powered by Cloudflare's global network
- **Simple** - No authentication required for quick tunnels

### ⚠️ Limitations
- URLs expire when you stop the tunnel
- Quick tunnels are temporary (for development only)
- For production, use a named tunnel with Cloudflare account

## Stopping the Tunnel

Press `Ctrl+C` in the terminal where the tunnel is running.

## Troubleshooting

### "cloudflared: command not found"
**Solution**: Install cloudflared:
```bash
brew install cloudflared
```

### "Connection refused" or "Tunnel not working"
**Solution**: Make sure your dev server is running:
```bash
# Check if server is running
curl http://localhost:3000

# If not, start it
pnpm dev
```

### "Port 3000 is already in use"
**Solution**: Either:
1. Stop the other service using port 3000
2. Change your dev server port and update the tunnel command:
   ```bash
   cloudflared tunnel --url http://localhost:3001
   ```

## Comparison: Cloudflare Tunnel vs ngrok

| Feature | Cloudflare Tunnel | ngrok |
|---------|------------------|-------|
| Free tier | ✅ Yes (quick tunnels) | ✅ Yes (limited) |
| Account required | ❌ No (for quick tunnels) | ✅ Yes |
| Reliability | ✅ High | ⚠️ Variable |
| Firewall friendly | ✅ Yes | ⚠️ Sometimes blocked |
| URL persistence | ❌ No (quick tunnels) | ✅ Yes (with account) |
| Setup complexity | ✅ Simple | ⚠️ Moderate |

## Next Steps

1. **Start the tunnel**: `pnpm cloudflare-tunnel`
2. **Copy the URL** from the output
3. **Update webhook URLs** in Zendit and Stripe dashboards
4. **Test your webhooks** to ensure they work

---

**Need help?** Check the terminal output for error messages or visit: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/

