# ngrok Alternative: Cloudflare Tunnel

## The Problem

ngrok keeps showing "reconnecting" errors even with fresh tokens. This could be due to:
- Network/firewall blocking ngrok
- Account issues with ngrok
- VPN interference
- Corporate network restrictions

## The Solution: Cloudflare Tunnel

Cloudflare Tunnel is a **free, reliable alternative** that works when ngrok doesn't.

### Quick Start

```bash
# Install (one time)
brew install cloudflared

# Start tunnel
npm run cloudflare-tunnel
```

Or manually:
```bash
cloudflared tunnel --url http://localhost:3000
```

### What You'll Get

- A public URL like: `https://xxxxx.trycloudflare.com`
- Works immediately, no authentication needed
- Free and reliable
- Perfect for webhook testing

### Use It for Webhooks

Once you get the URL, update your webhook endpoints:

- **Zendit**: `https://your-cloudflare-url.trycloudflare.com/api/webhooks/zendit`
- **Stripe**: `https://your-cloudflare-url.trycloudflare.com/api/webhooks/stripe`

### Advantages Over ngrok

✅ No authentication needed  
✅ Works behind firewalls  
✅ More reliable connection  
✅ Free unlimited use  
✅ No account required  

### Disadvantages

⚠️ URLs change each time (like free ngrok)  
⚠️ Less features than paid ngrok  

## Recommendation

Since ngrok isn't working for you, **use Cloudflare Tunnel instead**. It's simpler and more reliable for local development and webhook testing.

