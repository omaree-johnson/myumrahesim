# Automatic eSIM Purchase Implementation Guide

This guide explains how the system automatically purchases eSIMs through the eSIM Access API after a successful payment.

---

## Overview

The automatic purchase flow is triggered when a customer completes payment via Stripe. The system:

1. **Receives payment webhook** from Stripe
2. **Automatically creates eSIM order** via eSIM Access API
3. **Retrieves activation details** (QR code, activation code, etc.)
4. **Sends activation email** to customer

**No manual intervention required** - everything happens automatically!

---

## Implementation Flow

### Step 1: Payment Webhook Trigger

**Location:** `src/app/api/webhooks/stripe/route.ts`

When Stripe confirms payment, it sends a webhook to:
```
POST /api/webhooks/stripe
```

The webhook handler automatically:
- Extracts customer details (email, name)
- Gets the product/package information
- Proceeds to create eSIM order

---

### Step 2: Get Package Details

**Function:** `getEsimPackage(packageCode)`

**API Endpoint:** `POST /api/v1/open/package/list`

**Purpose:** Retrieve package information including:
- Package code
- Cost price
- Data allowance
- Duration
- Currency

**Code Example:**
```typescript
import { getEsimPackage } from '@/lib/esimaccess';

const packageData = await getEsimPackage(offerId);
const packageCode = packageData.packageCode || packageData.slug || offerId;
const providerCost = packageData.costPrice || packageData.price;
```

---

### Step 3: Check Account Balance

**Function:** `getBalance()`

**API Endpoint:** `POST /api/v1/open/balance/query`

**Purpose:** Verify sufficient funds before creating order

**Code Example:**
```typescript
import { getBalance } from '@/lib/esimaccess';

const balance = await getBalance();
const currentBalance = balance.balance || 0;

if (currentBalance < requiredAmount) {
  // Send admin notification
  // Payment still succeeds, but admin needs to top up
}
```

---

### Step 4: Create eSIM Order (Automatic Purchase)

**Function:** `createEsimOrder()`

**API Endpoint:** `POST /api/v1/open/esim/order/profiles`

**This is the key function that automatically purchases the eSIM!**

#### Function Signature

```typescript
import { createEsimOrder } from '@/lib/esimaccess';

const result = await createEsimOrder({
  packageCode: string,        // Required: Package code from eSIM Access
  transactionId: string,      // Required: Unique transaction ID
  travelerName?: string,      // Optional: Customer name
  travelerEmail?: string,    // Optional: Customer email
});
```

#### Complete Implementation Example

```typescript
// In src/app/api/webhooks/stripe/route.ts

import { createEsimOrder } from '@/lib/esimaccess';

// After payment is confirmed
async function processPaymentAndFulfill(paymentIntent: Stripe.PaymentIntent) {
  // 1. Extract customer details
  const recipientEmail = paymentIntent.receipt_email || customerEmail;
  const fullName = customerName;
  const transactionId = paymentIntent.id;
  
  // 2. Get package details
  const packageData = await getEsimPackage(offerId);
  const packageCode = packageData.packageCode || packageData.slug || offerId;
  
  // 3. Check balance (optional but recommended)
  const balance = await getBalance();
  if (balance.balance < packageData.costPrice.fixed) {
    console.warn('Insufficient balance - admin will be notified');
    // Payment still succeeds, admin handles manually
  }
  
  // 4. AUTOMATICALLY CREATE eSIM ORDER
  try {
    const purchaseResult = await createEsimOrder({
      packageCode,
      transactionId,
      travelerName: fullName,
      travelerEmail: recipientEmail,
    });
    
    console.log('✅ eSIM order created:', {
      orderNo: purchaseResult.orderNo,
      esimTranNo: purchaseResult.esimTranNo,
      iccid: purchaseResult.iccid,
    });
    
    // 5. Store in database
    await supabase
      .from('esim_purchases')
      .update({
        order_no: purchaseResult.orderNo,
        esim_provider_status: 'PROCESSING',
      })
      .eq('transaction_id', transactionId);
    
  } catch (error) {
    // Handle errors gracefully
    console.error('Failed to create eSIM order:', error);
    // Payment still succeeds, admin will be notified
  }
}
```

---

### Step 5: Query Activation Details

**Function:** `queryEsimProfiles(orderNo, esimTranNo)`

**API Endpoint:** `POST /api/v1/open/esim/query`

**Purpose:** Retrieve activation details (QR code, activation code, SM-DP+ address)

**Code Example:**
```typescript
import { queryEsimProfiles } from '@/lib/esimaccess';

// After order is created
const activation = await queryEsimProfiles(
  purchaseResult.orderNo,
  purchaseResult.esimTranNo
);

if (activation) {
  // Activation details available immediately
  const qrCode = activation.qrCode || activation.activationCode;
  const smdpAddress = activation.smdpAddress;
  const iccid = activation.iccid;
  
  // Send activation email
  await sendActivationEmail({
    to: recipientEmail,
    activationCode: qrCode,
    smdpAddress,
    iccid,
  });
} else {
  // Activation not ready yet - will come via webhook
  console.log('Activation pending - waiting for webhook');
}
```

---

## Complete Automatic Purchase Flow

Here's the complete flow with all steps:

```typescript
// 1. Payment webhook received
POST /api/webhooks/stripe
  ↓
// 2. Extract customer & product info
const { email, name, offerId, transactionId } = extractFromWebhook();
  ↓
// 3. Get package details
const packageData = await getEsimPackage(offerId);
  ↓
// 4. Check balance (optional)
const balance = await getBalance();
  ↓
// 5. AUTOMATICALLY CREATE ORDER ⚡
const order = await createEsimOrder({
  packageCode: packageData.packageCode,
  transactionId,
  travelerName: name,
  travelerEmail: email,
});
  ↓
// 6. Query activation details
const activation = await queryEsimProfiles(order.orderNo, order.esimTranNo);
  ↓
// 7. Store & send email
await storeActivationDetails(activation);
await sendActivationEmail(activation);
```

---

## API Request/Response Examples

### Create Order Request

```bash
curl -X POST 'https://api.esimaccess.com/api/v1/open/esim/order/profiles' \
  -H 'RT-AccessCode: YOUR_ACCESS_CODE' \
  -H 'Content-Type: application/json' \
  -d '{
    "packageCode": "SA-10GB-30D",
    "transactionId": "pi_1234567890",
    "travelerName": "John Doe",
    "travelerEmail": "john@example.com"
  }'
```

### Create Order Response

```json
{
  "success": true,
  "errorCode": "0",
  "errorMsg": null,
  "obj": {
    "orderNo": "B25091113270004",
    "esimTranNo": "25091113270004",
    "iccid": "8943108170001029631",
    "transactionId": "pi_1234567890"
  }
}
```

### Query Activation Request

```bash
curl -X POST 'https://api.esimaccess.com/api/v1/open/esim/query' \
  -H 'RT-AccessCode: YOUR_ACCESS_CODE' \
  -H 'Content-Type: application/json' \
  -d '{
    "orderNo": "B25091113270004"
  }'
```

### Query Activation Response

```json
{
  "success": true,
  "errorCode": "0",
  "errorMsg": null,
  "obj": {
    "orderNo": "B25091113270004",
    "esimTranNo": "25091113270004",
    "iccid": "8943108170001029631",
    "activationCode": "LPA:1$smdp.example.com$...",
    "qrCode": "LPA:1$smdp.example.com$...",
    "smdpAddress": "smdp.example.com",
    "status": "GOT_RESOURCE"
  }
}
```

---

## Error Handling

The system handles errors gracefully:

### Insufficient Balance (Error 200007)

```typescript
try {
  await createEsimOrder({ ... });
} catch (error) {
  if (error.errorCode === '200007') {
    // Send admin notification
    // Payment still succeeds
    await sendAdminNotification({
      reason: 'insufficient_balance',
      transactionId,
    });
  }
}
```

### Package Not Found (Error 310241)

```typescript
if (error.errorCode === '310241' || error.errorCode === '310243') {
  // Package code doesn't exist
  // Check packageCode is correct
  // Verify package exists in eSIM Access
}
```

### Retry Logic

The system includes automatic retry with backoff:

```typescript
const purchaseResult = await retryWithBackoff(
  () => createEsimOrder({ ... }),
  3,      // Max 3 attempts
  1000    // 1 second delay
);
```

---

## Database Storage

After automatic purchase, the system stores:

```typescript
// In esim_purchases table
{
  transaction_id: "pi_1234567890",
  order_no: "B25091113270004",
  esim_provider_status: "GOT_RESOURCE",
  esim_provider_response: { ... },
  customer_email: "john@example.com",
  customer_name: "John Doe",
}

// In activation_details table
{
  transaction_id: "pi_1234567890",
  activation_code: "LPA:1$...",
  smdp_address: "smdp.example.com",
  iccid: "8943108170001029631",
}
```

---

## Webhook Support

If activation details aren't available immediately, the system waits for eSIM Access webhook:

**Webhook Endpoint:** `POST /api/webhooks/esimaccess`

**Webhook Event:** `ORDER_STATUS` with `orderStatus: "GOT_RESOURCE"`

When webhook is received:
1. System queries activation details
2. Stores in database
3. Sends activation email automatically

---

## Testing Automatic Purchase

### 1. Test with Stripe Test Mode

```bash
# Use Stripe test card: 4242 4242 4242 4242
# Complete payment in checkout
# Check logs for automatic order creation
```

### 2. Test Order Creation Directly

```typescript
import { createEsimOrder } from '@/lib/esimaccess';

const result = await createEsimOrder({
  packageCode: 'SA-10GB-30D',  // Use actual package code
  transactionId: `test_${Date.now()}`,
  travelerName: 'Test User',
  travelerEmail: 'test@example.com',
});

console.log('Order created:', result);
```

### 3. Monitor Logs

Check production logs for:
```
[Stripe Webhook] Order parameters: { packageCode, transactionId, ... }
[eSIM Access] Creating order with parameters: { ... }
[eSIM Access] Order creation response: { hasOrderNo: true, ... }
[Stripe Webhook] ✅ eSIM order created successfully
```

---

## Key Points

✅ **Fully Automatic** - No manual steps required  
✅ **Error Handling** - Graceful failure, payment still succeeds  
✅ **Retry Logic** - Automatic retries for transient failures  
✅ **Webhook Support** - Handles delayed activation  
✅ **Database Tracking** - All orders stored for reference  
✅ **Email Notifications** - Customer and admin notifications  

---

## Troubleshooting

### Order Not Created

1. Check logs for error code
2. Verify `packageCode` is correct
3. Check account balance
4. Verify API credentials

See `TROUBLESHOOTING_MANUAL_ISSUANCE.md` for detailed error codes.

### Activation Not Available

1. Order may still be processing
2. Wait for `ORDER_STATUS` webhook
3. Query activation details manually:
   ```typescript
   const activation = await queryEsimProfiles(orderNo);
   ```

---

## Related Documentation

- `ESIMACCESS_SETUP.md` - Setup and configuration
- `PURCHASE_FLOW_VERIFICATION.md` - Complete flow verification
- `TROUBLESHOOTING_MANUAL_ISSUANCE.md` - Error troubleshooting
- `ESIMACCESS_API_TESTING_GUIDE.md` - API testing guide

---

## Summary

The automatic eSIM purchase is implemented in:

1. **`src/lib/esimaccess.ts`** - `createEsimOrder()` function
2. **`src/app/api/webhooks/stripe/route.ts`** - Webhook handler that triggers purchase

**No additional code needed** - it's already fully implemented and working! 🎉

