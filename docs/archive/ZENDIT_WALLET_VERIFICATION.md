# Zendit Wallet API Verification

## ⚠️ Critical Finding

After reviewing the Zendit API documentation (`zendit.md`), **wallet-related endpoints are NOT documented**. 

The documentation only includes:
- ✅ `/esim/offers` - Get eSIM offers
- ✅ `/esim/offers/{offerId}` - Get offer by ID
- ✅ `/esim/purchases` - Create/list purchases
- ✅ `/esim/purchases/{transactionId}` - Get purchase details
- ✅ `/esim/purchases/{transactionId}/qrcode` - Get QR code
- ✅ `/esim/purchases/{transactionId}/refund` - Refund endpoints
- ❌ **NO `/wallet/balance` endpoint documented**
- ❌ **NO `/wallet/topup` endpoint documented**

## Current Implementation

The code currently uses:
- `GET /wallet/balance` - To check wallet balance
- `POST /wallet/topup` - To top up wallet with card

**These endpoints may not exist or may be documented elsewhere.**

## Verification Steps

### Step 1: Test Wallet Balance Endpoint

```bash
curl -X GET "https://api.zendit.io/v1/wallet/balance" \
  -H "Authorization: Bearer YOUR_ZENDIT_API_KEY" \
  -H "Accept: application/json"
```

**Expected Results:**
- ✅ **200 OK** with balance data → Endpoint exists, proceed!
- ❌ **404 Not Found** → Endpoint doesn't exist
- ❌ **401 Unauthorized** → Check API key
- ❌ **403 Forbidden** → May need different permissions

### Step 2: Test Wallet Top-up Endpoint

```bash
curl -X POST "https://api.zendit.io/v1/wallet/topup" \
  -H "Authorization: Bearer YOUR_ZENDIT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "currency": "USD",
    "card": {
      "number": "4242424242424242",
      "exp_month": 12,
      "exp_year": 2026,
      "cvc": "123"
    },
    "reference": "test-topup-123"
  }'
```

**Expected Results:**
- ✅ **200 OK** with success response → Endpoint exists, proceed!
- ❌ **404 Not Found** → Endpoint doesn't exist
- ❌ **400 Bad Request** → Endpoint exists but payload format wrong
- ❌ **401/403** → Authentication/permission issue

### Step 3: Check Alternative Endpoints

If the above don't work, try these variations:

```bash
# Try different endpoint patterns
GET /wallets/balance
GET /account/wallet
GET /wallet
POST /wallets/topup
POST /wallet/top-up
POST /account/wallet/topup
```

## Alternative Approaches

### Option A: Wallet Endpoints Exist (Best Case)

If wallet endpoints exist but aren't documented:
1. ✅ Use the endpoints as implemented
2. ✅ Update documentation with actual endpoint paths
3. ✅ Test thoroughly before production

### Option B: No Wallet API (Alternative Flow)

If Zendit doesn't have wallet endpoints, you have two options:

#### Option B1: Pre-fund Wallet Manually
- Manually add funds to Zendit wallet via their dashboard
- Remove wallet balance check from code
- Proceed directly to eSIM purchase

#### Option B2: Use Direct Payment
- Skip wallet top-up entirely
- Zendit may support direct card payment for purchases
- Check if `/esim/purchases` accepts payment method directly

### Option C: Contact Zendit Support

If endpoints don't exist:
1. Contact Zendit support to confirm wallet functionality
2. Ask for:
   - Wallet API documentation
   - How to check wallet balance programmatically
   - How to top up wallet via API
   - Alternative methods for automated top-ups

## Updated Implementation Strategy

### If Wallet Endpoints Don't Exist

We need to modify the flow:

```typescript
// Instead of checking wallet balance, we can:
// 1. Skip wallet check entirely
// 2. Proceed directly to purchase
// 3. Handle payment errors if wallet insufficient

// Modified flow:
// Payment → Purchase eSIM → Handle errors
```

### Code Changes Needed

If wallet endpoints don't exist, update `src/app/api/webhooks/stripe/route.ts`:

```typescript
// Remove or comment out wallet balance check
// if (isStripeIssuingAvailable()) {
//   // Wallet check code...
// }

// Proceed directly to purchase
const purchase = await createEsimPurchase({
  offerId,
  transactionId,
});
```

## Testing Script

Create a test script to verify endpoints:

```bash
#!/bin/bash
# test-zendit-wallet.sh

ZENDIT_KEY="your-api-key-here"

echo "Testing Zendit Wallet Endpoints..."
echo ""

echo "1. Testing GET /wallet/balance"
curl -X GET "https://api.zendit.io/v1/wallet/balance" \
  -H "Authorization: Bearer $ZENDIT_KEY" \
  -H "Accept: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo "2. Testing POST /wallet/topup"
curl -X POST "https://api.zendit.io/v1/wallet/topup" \
  -H "Authorization: Bearer $ZENDIT_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "currency": "USD",
    "card": {
      "number": "4242424242424242",
      "exp_month": 12,
      "exp_year": 2026,
      "cvc": "123"
    }
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo "Done!"
```

## Recommended Action Plan

1. **Immediate**: Test wallet endpoints with curl (see above)
2. **If endpoints exist**: Update documentation, proceed with implementation
3. **If endpoints don't exist**: 
   - Contact Zendit support
   - Consider alternative flow (pre-fund or direct payment)
   - Update code to skip wallet operations
4. **Document findings**: Update this file with test results

## Next Steps

1. Run the curl tests above
2. Document the results
3. Update implementation based on findings
4. Test the modified flow

---

**Status**: ⚠️ **PENDING VERIFICATION** - Wallet endpoints need to be tested

