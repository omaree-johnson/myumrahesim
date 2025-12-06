# Email Flow Documentation

## Current Email Flow

### Email #1: Order Confirmation (Always Sent)

**When:** Immediately after payment succeeds  
**Trigger:** Stripe webhook `payment_intent.succeeded`  
**Location:** `src/app/api/webhooks/stripe/route.ts` (line ~198)

```typescript
// STEP 1: SEND CONFIRMATION EMAIL IMMEDIATELY
await sendOrderConfirmation({
  to: recipientEmail,
  customerName: fullName,
  transactionId,
  productName,
  price: `${currencyCode} ${priceAmount.toFixed(2)}`,
});
```

**What it contains:**
- Order confirmation message
- Transaction ID
- Product name and price
- Note: "Your eSIM is being provisioned and you'll receive activation details via email shortly"

**Status:** ✅ Working correctly

---

### Email #2: Activation Email with QR Code

**When:** After eSIM profile is allocated and ready  
**Trigger:** eSIM Access `ORDER_STATUS` webhook with `orderStatus: "GOT_RESOURCE"`  
**Location:** `src/app/api/webhooks/esimaccess/route.ts` (line ~435)

**Flow:**
1. eSIM Access sends webhook: `ORDER_STATUS` with `orderStatus: "GOT_RESOURCE"`
2. Webhook handler calls `/api/v1/open/esim/query` to get activation details
3. Extracts: `activationCode`, `qrCode`, `smdpAddress`, `iccid`
4. Sends activation email with QR code

```typescript
// In ORDER_STATUS handler
const profileData = await queryEsimProfiles(orderNo, esimTranNo);
// ... extract activation data ...
await sendActivationEmail({
  to: contact.email,
  customerName: contact.name,
  transactionId,
  smdpAddress: activation.smdpAddress,
  activationCode: activation.activationCode || activation.qrCode,
  iccid: activation.iccid,
});
```

**What it contains:**
- QR code image (generated from activation code)
- SM-DP+ Address
- Activation Code (LPA string)
- ICCID
- Step-by-step setup instructions for iOS/Android

**Status:** ✅ Implemented and ready (requires webhook to be configured in eSIM Access dashboard)

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Customer Pays via Stripe                                     │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Stripe Webhook: payment_intent.succeeded                     │
│    → processPaymentAndFulfill()                                 │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ├──────────────────────────────────────┐
                       │                                      │
                       ▼                                      ▼
        ┌─────────────────────────────┐      ┌──────────────────────────────┐
        │ Email #1: Order Confirmation│      │ 3. Create eSIM Order         │
        │ ✅ SENT IMMEDIATELY          │      │    POST /esim/order          │
        │                              │      │    → Store orderNo + email  │
        │ - Transaction ID             │      │    → Save to esim_purchases │
        │ - Product & Price            │      │                              │
        │ - "Provisioning..." message  │      │    Returns: orderNo          │
        └─────────────────────────────┘      └──────────────┬───────────────┘
                                                             │
                                                             ▼
                                            ┌──────────────────────────────┐
                                            │ 4. Try Immediate Activation  │
                                            │    queryEsimProfiles()       │
                                            │    (with retry logic)        │
                                            └──────────────┬───────────────┘
                                                           │
                                    ┌──────────────────────┴──────────────────────┐
                                    │                                             │
                                    ▼                                             ▼
                    ┌───────────────────────────┐              ┌──────────────────────────────┐
                    │ Activation Available?     │              │ Activation NOT Available     │
                    │ ✅ YES                     │              │ ⏳ Wait for webhook         │
                    └───────────┬───────────────┘              └──────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────────┐
                    │ Email #2: Activation      │
                    │ ✅ SENT IMMEDIATELY       │
                    │ (if available)             │
                    └───────────────────────────┘
                                                             │
                                                             │ (async, later...)
                                                             ▼
                                            ┌──────────────────────────────┐
                                            │ 5. eSIM Access Webhook        │
                                            │    ORDER_STATUS               │
                                            │    orderStatus: "GOT_RESOURCE"│
                                            └──────────────┬───────────────┘
                                                           │
                                                           ▼
                                            ┌──────────────────────────────┐
                                            │ 6. Query Activation Details  │
                                            │    POST /esim/query           │
                                            │    → Get QR code, activation  │
                                            └──────────────┬───────────────┘
                                                           │
                                                           ▼
                                            ┌──────────────────────────────┐
                                            │ 7. Email #2: Activation      │
                                            │    ✅ SENT VIA WEBHOOK        │
                                            │    (if not sent earlier)      │
                                            └──────────────────────────────┘
```

---

## Database Storage

### What We Store When Ordering

**Table: `esim_purchases`**
```typescript
{
  transaction_id: string,        // Our unique ID
  order_no: string,              // eSIM Access orderNo (from /esim/order response)
  customer_email: string,        // ✅ Stored for webhook to find customer
  customer_name: string,         // ✅ Stored for email personalization
  esim_provider_status: string,  // 'PROCESSING' → 'GOT_RESOURCE'
  // ... other fields
}
```

**Status:** ✅ We store `order_no`, `customer_email`, and `customer_name` when creating the order (line ~266-281 in stripe webhook)

---

## Webhook Configuration

### Required: eSIM Access Dashboard

**Webhook URL:** `https://myumrahesim.com/api/webhooks/esimaccess`

**Events to receive:**
- `ORDER_STATUS` (when `orderStatus: "GOT_RESOURCE"`)

**IP Whitelist (optional but recommended):**
- `3.1.131.226`
- `54.254.74.88`
- `18.136.190.97`
- `18.136.60.197`
- `18.136.19.137`

**Status:** ⚠️ **Must be configured in eSIM Access dashboard**

---

## Current Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Order Confirmation Email | ✅ Working | Sent immediately after payment |
| Store orderNo + customerEmail | ✅ Working | Saved to `esim_purchases` table |
| Webhook Endpoint | ✅ Implemented | `/api/webhooks/esimaccess` |
| ORDER_STATUS Handler | ✅ Implemented | Handles `GOT_RESOURCE` |
| Query Profiles | ✅ Implemented | Calls `/esim/query` with retry |
| Activation Email | ✅ Implemented | Sends QR code email |
| Idempotency Check | ✅ Implemented | Prevents duplicate emails |
| Webhook Configuration | ⚠️ **Action Required** | Must be set in eSIM Access dashboard |

---

## Testing the Flow

### 1. Test Order Confirmation Email
```bash
# Make a test purchase
# ✅ Should receive order confirmation email immediately
```

### 2. Test Activation Email (Immediate)
```bash
# If activation is available immediately after order
# ✅ Should receive activation email within seconds
```

### 3. Test Activation Email (Via Webhook)
```bash
# If activation is NOT available immediately:
# 1. Wait for eSIM Access to allocate profile
# 2. They send ORDER_STATUS webhook
# 3. ✅ Should receive activation email after webhook
```

### 4. Verify Webhook is Configured
```bash
# Check eSIM Access dashboard:
# - Webhook URL is set
# - Test webhook was received (CHECK_HEALTH event)
# - IP whitelist is configured (if using)
```

---

## Troubleshooting

### "I never receive the activation email"

**Check:**
1. ✅ Is webhook URL configured in eSIM Access dashboard?
2. ✅ Check webhook logs: `vercel logs` or check Vercel dashboard
3. ✅ Verify `order_no` is stored in database
4. ✅ Verify `customer_email` is stored in database
5. ✅ Check if webhook is receiving `ORDER_STATUS` events
6. ✅ Check if `/esim/query` is returning activation data
7. ✅ Check email sending logs for errors

### "Webhook not receiving events"

**Check:**
1. ✅ Webhook URL is publicly accessible
2. ✅ IP whitelist allows your server IPs (or disable IP check in dev)
3. ✅ Webhook endpoint returns 200 OK quickly
4. ✅ Check eSIM Access dashboard for webhook delivery status

### "Activation email sent but no QR code"

**Check:**
1. ✅ Verify `/esim/query` response contains `activationCode` or `qrCode`
2. ✅ Check email template is generating QR code from activation code
3. ✅ Verify QR code generation service is working

---

## Summary

**Current State:**
- ✅ Order confirmation email: Working
- ✅ Database storage: Working (orderNo + customerEmail stored)
- ✅ Webhook handler: Implemented and ready
- ✅ Activation email: Implemented and ready
- ⚠️ **Action Required:** Configure webhook URL in eSIM Access dashboard

**What Happens Now:**
1. Customer pays → Order confirmation email sent ✅
2. eSIM order created → orderNo + email stored in DB ✅
3. If activation ready immediately → Activation email sent ✅
4. If not ready → Wait for ORDER_STATUS webhook → Query → Send email ✅

**The flow is complete!** Just need to ensure the webhook URL is configured in the eSIM Access dashboard.

