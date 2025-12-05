# eSIM Access API Testing & Verification Guide

This guide will help you verify that all eSIM Access API endpoints work correctly and run end-to-end tests before production deployment.

---

## Prerequisites

1. **eSIM Access Account Setup**
   - Create account at eSIM Access
   - Get your `AccessCode` from the dashboard
   - Deposit test funds (request refunds for testing)
   - Note: There's no sandbox - use live environment with test funds

2. **Environment Variables**
   ```env
   ESIMACCESS_ACCESS_CODE=your_access_code_here
   ESIMACCESS_BASE_URL=https://api.esimaccess.com/api/v1/open
   ESIMACCESS_COUNTRY_CODE=SA
   ```

---

## Step 1: Manual API Endpoint Testing

Test each endpoint manually to verify the paths and response structures.

### 1.1 Test Balance Query (Known Working Endpoint)

This endpoint is confirmed in the documentation, use it to verify your credentials:

```bash
curl --location --request POST 'https://api.esimaccess.com/api/v1/open/balance/query' \
--header 'RT-AccessCode: YOUR_ACCESS_CODE' \
--header 'Content-Type: application/json' \
--data '{}'
```

**Expected Response:**
```json
{
  "success": true,
  "errorCode": "0",
  "errorMsg": null,
  "obj": {
    "balance": 1000.00,
    "currency": "USD"
  }
}
```

✅ **If this works, your credentials are valid.**

---

### 1.2 Test Package List Endpoint

**Current Implementation:** `POST /package/list`

**Test Command:**
```bash
curl --location --request POST 'https://api.esimaccess.com/api/v1/open/package/list' \
--header 'RT-AccessCode: YOUR_ACCESS_CODE' \
--header 'Content-Type: application/json' \
--data '{
  "country": "SA"
}'
```

**What to Check:**
- ✅ Response has `success: true` and `errorCode: "0"`
- ✅ Response contains package list (check `obj.packageList` or `obj`)
- ✅ Packages have `packageCode`, `price`, `dataGB`, `durationDays`
- ✅ Price format: Should be `price * 10000` (e.g., 199900 for $19.99)

**If this fails:**
- Check error message
- Try without country filter: `{}`
- Try different endpoint paths (see alternatives below)

**Alternative Endpoint Paths to Try:**
- `/api/v1/open/package/query`
- `/api/v1/open/packages`
- `/api/v1/open/data/package/list`

---

### 1.3 Test Order eSIM Endpoint

**Current Implementation:** `POST /esim/order/profiles`

**Test Command:**
```bash
curl --location --request POST 'https://api.esimaccess.com/api/v1/open/esim/order/profiles' \
--header 'RT-AccessCode: YOUR_ACCESS_CODE' \
--header 'Content-Type: application/json' \
--data '{
  "packageCode": "TEST_PACKAGE_CODE",
  "transactionId": "test_txn_12345",
  "travelerName": "Test User",
  "travelerEmail": "test@example.com"
}'
```

**What to Check:**
- ✅ Response contains `orderNo` or `order_no`
- ✅ Response contains `esimTranNo` or `esim_tran_no`
- ✅ Response contains `iccid`
- ✅ Order is created successfully

**If this fails:**
- Verify packageCode exists (from step 1.2)
- Check account balance is sufficient
- Try alternative endpoint paths:
  - `/api/v1/open/esim/order`
  - `/api/v1/open/esim/order/profile`
  - `/api/v1/open/profile/order`

**Note:** Replace `TEST_PACKAGE_CODE` with an actual package code from step 1.2.

---

### 1.4 Test Query Profiles Endpoint

**Current Implementation:** `POST /esim/query`

**Test Command:**
```bash
curl --location --request POST 'https://api.esimaccess.com/api/v1/open/esim/query' \
--header 'RT-AccessCode: YOUR_ACCESS_CODE' \
--header 'Content-Type: application/json' \
--data '{
  "orderNo": "B25091113270004"
}'
```

**Or with esimTranNo:**
```bash
curl --location --request POST 'https://api.esimaccess.com/api/v1/open/esim/query' \
--header 'RT-AccessCode: YOUR_ACCESS_CODE' \
--header 'Content-Type: application/json' \
--data '{
  "esimTranNo": "25091113270004"
}'
```

**What to Check:**
- ✅ Response contains activation details
- ✅ Response has `activationCode` or `activation_code`
- ✅ Response has `qrCode` or `qr_code`
- ✅ Response has `smdpAddress` or `smdp_address`
- ✅ Response has `iccid`

**If this fails:**
- Try alternative endpoint paths:
  - `/api/v1/open/esim/profile/query`
  - `/api/v1/open/profile/query`
  - `/api/v1/open/esim/status`

**Note:** Use a real `orderNo` or `esimTranNo` from a test order created in step 1.3.

---

### 1.5 Test Usage Query Endpoint

**Current Implementation:** `POST /esim/usage/query` ✅ **Confirmed in docs**

**Test Command:**
```bash
curl --location --request POST 'https://api.esimaccess.com/api/v1/open/esim/usage/query' \
--header 'RT-AccessCode: YOUR_ACCESS_CODE' \
--header 'Content-Type: application/json' \
--data '{
  "esimTranNoList": ["25031120490003"]
}'
```

**What to Check:**
- ✅ Response has `esimUsageList` array
- ✅ Each item has `dataUsage`, `totalData`, `lastUpdateTime`

---

## Step 2: Update Code Based on Test Results

After testing, update `src/lib/esimaccess.ts` if endpoints differ:

### Example Fix for Package List:

If `/package/list` doesn't work, but `/package/query` does:

```typescript
// Change from:
const response = await fetchEsimAccess("/package/list", {
  method: "POST",
  body: JSON.stringify({ country: locationCode.toUpperCase() }),
});

// To:
const response = await fetchEsimAccess("/package/query", {
  method: "POST",
  body: JSON.stringify({ country: locationCode.toUpperCase() }),
});
```

### Example Fix for Response Structure:

If response structure differs, update the mapping:

```typescript
// If packages are in different location:
const packages = response?.data?.packages || 
                 response?.packages || 
                 response?.packageList || 
                 Array.isArray(response) ? response : [];
```

---

## Step 3: Create Test Script

Create a Node.js test script to automate verification:

```bash
# Test script is located at scripts/test-esimaccess-api.js
```

```javascript
// scripts/test-esimaccess-api.js
const ACCESS_CODE = process.env.ESIMACCESS_ACCESS_CODE;
const BASE_URL = 'https://api.esimaccess.com/api/v1/open';

async function testEndpoint(name, path, body = {}) {
  console.log(`\n🧪 Testing ${name}...`);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'RT-AccessCode': ACCESS_CODE,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await res.json();
    console.log(`✅ Status: ${res.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));
    
    if (data.success === false || data.errorCode !== "0") {
      console.error(`❌ Error: ${data.errorMsg || data.errorCode}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Failed:`, error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting eSIM Access API Tests\n');
  
  // Test 1: Balance (known working)
  const balanceOk = await testEndpoint('Balance Query', '/balance/query', {});
  
  // Test 2: Package List
  const packagesOk = await testEndpoint('Package List', '/package/list', { country: 'SA' });
  
  if (packagesOk) {
    // If packages work, we can test ordering (but need real package code)
    console.log('\n⚠️  Order test requires a real packageCode from package list');
  }
  
  console.log('\n✅ Tests completed');
}

runTests();
```

**Run the test:**
```bash
node scripts/test-esimaccess-api.js
```

---

## Step 4: End-to-End Testing

### 4.1 Test Complete Order Flow

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Test Product Listing:**
   - Visit `http://localhost:3000/plans`
   - Verify Saudi Arabia eSIMs are displayed
   - Check prices are correct
   - Verify product titles are user-friendly

3. **Test Checkout Flow:**
   - Select a product
   - Go through checkout
   - Use Stripe test card: `4242 4242 4242 4242`
   - Complete payment

4. **Verify Webhook Processing:**
   - Check server logs for Stripe webhook
   - Verify eSIM order was created
   - Check database for purchase record
   - Verify activation details were fetched

5. **Test Activation Email:**
   - Check email inbox for activation email
   - Verify QR code/activation code is included
   - Verify email looks correct

6. **Test Orders Page:**
   - Sign in to your account
   - Visit `/orders`
   - Verify purchase appears
   - Verify activation details are visible

### 4.2 Test Webhook Handler

1. **Set up webhook testing:**
   - Use https://webhook.site to get a test URL
   - Or use ngrok to expose local server:
     ```bash
     ngrok http 3000
     ```

2. **Configure webhook in eSIM Access dashboard:**
   - URL: `https://your-ngrok-url.ngrok.io/api/webhooks/esimaccess`
   - Or production URL: `https://yourdomain.com/api/webhooks/esimaccess`

3. **Trigger test webhook:**
   - eSIM Access should send a `CHECK_HEALTH` webhook
   - Check your server logs
   - Verify webhook handler responds correctly

4. **Test ORDER_STATUS webhook:**
   - Create a test order
   - Wait for eSIM to be ready
   - Verify webhook is received
   - Check database is updated

---

## Step 5: Verify Response Structures

After testing, verify the response structures match your code expectations:

### Package List Response Should Have:
```typescript
{
  success: true,
  errorCode: "0",
  obj: {
    packageList: [
      {
        packageCode: string,
        slug: string,
        name: string,
        price: number, // price * 10000
        dataGB: number,
        durationDays: number,
        enabled: boolean,
        // ... other fields
      }
    ]
  }
}
```

### Order Response Should Have:
```typescript
{
  success: true,
  errorCode: "0",
  obj: {
    orderNo: string, // e.g., "B25091113270004"
    esimTranNo: string, // e.g., "25091113270004"
    iccid: string,
    // ... other fields
  }
}
```

### Query Response Should Have:
```typescript
{
  success: true,
  errorCode: "0",
  obj: {
    orderNo: string,
    esimTranNo: string,
    iccid: string,
    activationCode: string, // or activation_code
    qrCode: string, // or qr_code
    smdpAddress: string, // or smdp_address
    status: string,
    // ... other fields
  }
}
```

---

## Step 6: Common Issues & Fixes

### Issue: "310241 - The packageCode does not exist"
**Fix:** Verify packageCode from package list. Use exact value from API response.

### Issue: "200007 - Insufficient account balance"
**Fix:** Top up your eSIM Access account via dashboard.

### Issue: "000101 - Request header (mandatory) is null"
**Fix:** Ensure `RT-AccessCode` header is set correctly.

### Issue: "000104 - Request in invalid JSON format"
**Fix:** Check JSON body is valid. Ensure Content-Type header is set.

### Issue: Endpoint returns 404
**Fix:** Endpoint path may be wrong. Try alternative paths listed above.

### Issue: Response structure doesn't match
**Fix:** Update mapping in `src/lib/esimaccess.ts` to match actual response structure.

---

## Step 7: Production Checklist

Before going live:

- [ ] All endpoints tested and working
- [ ] Response structures verified
- [ ] End-to-end order flow tested
- [ ] Webhook handler tested and receiving events
- [ ] Email notifications working
- [ ] Database updates working correctly
- [ ] Error handling tested (insufficient balance, invalid package, etc.)
- [ ] Webhook URL configured in eSIM Access dashboard
- [ ] Production environment variables set
- [ ] Monitoring/alerting configured (recommended)

---

## Quick Test Commands Summary

```bash
# 1. Test balance (verify credentials)
curl -X POST 'https://api.esimaccess.com/api/v1/open/balance/query' \
  -H 'RT-AccessCode: YOUR_CODE' \
  -H 'Content-Type: application/json' \
  -d '{}'

# 2. Test package list
curl -X POST 'https://api.esimaccess.com/api/v1/open/package/list' \
  -H 'RT-AccessCode: YOUR_CODE' \
  -H 'Content-Type: application/json' \
  -d '{"country": "SA"}'

# 3. Test order (replace PACKAGE_CODE with real value)
curl -X POST 'https://api.esimaccess.com/api/v1/open/esim/order/profiles' \
  -H 'RT-AccessCode: YOUR_CODE' \
  -H 'Content-Type: application/json' \
  -d '{"packageCode": "PACKAGE_CODE", "transactionId": "test123"}'

# 4. Test query (replace ORDER_NO with real value)
curl -X POST 'https://api.esimaccess.com/api/v1/open/esim/query' \
  -H 'RT-AccessCode: YOUR_CODE' \
  -H 'Content-Type: application/json' \
  -d '{"orderNo": "ORDER_NO"}'
```

---

## Next Steps

1. Run manual tests for each endpoint
2. Update code if endpoints/paths differ
3. Run end-to-end test flow
4. Configure webhook URL
5. Deploy to production

For questions or issues, refer to `esimaccess.md` documentation or contact eSIM Access support.

