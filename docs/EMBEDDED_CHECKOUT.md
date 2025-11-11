# Stripe Embedded Checkout Integration

## Overview
The checkout flow now uses Stripe's embedded Payment Element for a seamless in-app payment experience instead of redirecting to Stripe's hosted checkout page.

## What's New

### 1. **Embedded Payment Form**
- Payment happens directly within your app
- No redirect to external Stripe checkout page
- Better user experience with customizable styling
- Support for multiple payment methods (cards, Apple Pay, Google Pay)

### 2. **New Components**

#### `EmbeddedCheckoutForm` Component
Location: `src/components/embedded-checkout-form.tsx`

Features:
- Uses Stripe's Payment Element for secure payment collection
- Shows product summary during payment
- Handles payment processing and errors
- Customizable with Stripe's appearance API

#### Updated Checkout Page
Location: `src/app/checkout/page.tsx`

Flow:
1. User enters email and full name
2. Creates Payment Intent via API
3. Shows embedded Stripe payment form
4. Processes payment securely
5. Redirects to success page

### 3. **New API Endpoint**

#### `POST /api/create-payment-intent`
Creates a Stripe Payment Intent for embedded checkout.

**Request:**
```json
{
  "offerId": "ESIM-XX-XXX",
  "recipientEmail": "user@example.com",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "productDetails": {
    "name": "eSIM Plan Name",
    "description": "Plan details",
    "price": 14.50,
    "currency": "usd"
  }
}
```

### 4. **Webhook Updates**

The Stripe webhook (`/api/webhooks/stripe/route.ts`) now handles both:
- `checkout.session.completed` - For legacy Stripe Checkout flow
- `payment_intent.succeeded` - For new embedded checkout flow

## Testing the Integration

### Local Development

1. **Start the dev server:**
   ```bash
   pnpm dev
   ```

2. **Start Stripe webhook listener:**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. **Visit a checkout URL:**
   ```
   http://localhost:3000/checkout?product=ESIM-XX-XXX&name=Plan+Name&price=14.50
   ```

4. **Test with Stripe test cards:**
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0025 0000 3155`

### What Happens When You Pay

1. ✅ Payment Intent is created with product metadata
2. ✅ User enters payment details in embedded form
3. ✅ Stripe processes payment securely
4. ✅ Webhook receives `payment_intent.succeeded` event
5. ✅ eSIM is purchased from Zendit API
6. ✅ Purchase is saved to Supabase database
7. ✅ Order confirmation email is sent via Resend
8. ✅ User is redirected to success page with eSIM details

## Configuration

### Required Environment Variables

Already configured in `.env.local`:
```bash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Customization

#### Styling the Payment Element

Edit the appearance options in `src/app/checkout/page.tsx`:

```typescript
appearance: {
  theme: "stripe", // or "night", "flat"
  variables: {
    colorPrimary: "#0284c7", // Your brand color
    colorBackground: "#ffffff",
    colorText: "#1f2937",
    fontFamily: "system-ui, sans-serif",
    borderRadius: "8px",
  },
}
```

#### Payment Methods

The current setup enables all available payment methods automatically:
- Credit/Debit Cards (Visa, Mastercard, Amex, etc.)
- Apple Pay (when available)
- Google Pay (when available)

To customize, modify the Payment Intent creation in `src/app/api/create-payment-intent/route.ts`.

## Benefits Over Stripe Checkout

✅ **Better UX** - No redirect, stays in your app  
✅ **Customizable** - Match your brand perfectly  
✅ **More Control** - Handle the entire flow  
✅ **Same Security** - Powered by Stripe's secure infrastructure  
✅ **Mobile Optimized** - Better mobile experience  

## Migration Notes

The old Stripe Checkout flow is still available at `/api/create-checkout-session` for backward compatibility. Both flows are supported and will work correctly with the webhook handler.

## Troubleshooting

### Payment Element Not Showing
- Check that `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Verify Payment Intent is created successfully
- Check browser console for errors

### Webhook Not Receiving Events
- Ensure Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Verify `STRIPE_WEBHOOK_SECRET` matches the CLI output
- Check webhook endpoint is accessible

### Payment Successful but No eSIM
- Check Zendit API configuration
- Verify webhook handler logs
- Check Supabase database for purchase record

## Next Steps

1. ✅ Test with various payment methods
2. ✅ Customize styling to match your brand
3. ✅ Add loading states and animations
4. ✅ Test error scenarios
5. ✅ Deploy to production and update webhook URL
