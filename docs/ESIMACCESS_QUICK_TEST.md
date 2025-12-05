# Quick eSIM Access API Testing

## Fastest Way to Verify Endpoints

### Step 1: Test Your Credentials (Balance Check)

```bash
curl -X POST 'https://api.esimaccess.com/api/v1/open/balance/query' \
  -H 'RT-AccessCode: YOUR_ACCESS_CODE' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

**Expected:** `{"success": true, "errorCode": "0", ...}`

✅ **If this works, your credentials are valid.**

---

### Step 2: Test Package List

```bash
curl -X POST 'https://api.esimaccess.com/api/v1/open/package/list' \
  -H 'RT-AccessCode: YOUR_ACCESS_CODE' \
  -H 'Content-Type: application/json' \
  -d '{"country": "SA"}'
```

**Check for:**
- ✅ `success: true`
- ✅ Packages array in response
- ✅ Packages have `packageCode`, `price`, `dataGB`

**If it fails:**
- Try without country: `{}`
- Try alternative: `/package/query` instead of `/package/list`

---

### Step 3: Test Order (⚠️ Creates Real Order)

**Get a packageCode from Step 2 first!**

```bash
curl -X POST 'https://api.esimaccess.com/api/v1/open/esim/order/profiles' \
  -H 'RT-AccessCode: YOUR_ACCESS_CODE' \
  -H 'Content-Type: application/json' \
  -d '{
    "packageCode": "PACKAGE_CODE_FROM_STEP_2",
    "transactionId": "test_'$(date +%s)'"
  }'
```

**Check for:**
- ✅ `orderNo` or `order_no` in response
- ✅ `esimTranNo` or `esim_tran_no` in response

**If it fails:**
- Try: `/esim/order` instead of `/esim/order/profiles`

---

### Step 4: Test Query (Use orderNo from Step 3)

```bash
curl -X POST 'https://api.esimaccess.com/api/v1/open/esim/query' \
  -H 'RT-AccessCode: YOUR_ACCESS_CODE' \
  -H 'Content-Type: application/json' \
  -d '{"orderNo": "ORDER_NO_FROM_STEP_3"}'
```

**Check for:**
- ✅ `activationCode` or `activation_code`
- ✅ `iccid`
- ✅ `smdpAddress` or `smdp_address`

---

## Using the Test Script

```bash
# Set your access code
export ESIMACCESS_ACCESS_CODE=your_code_here

# Run the test script
node scripts/test-esimaccess-api.js
```

The script will:
1. ✅ Test balance query (verify credentials)
2. ✅ Test package list
3. ⏭️ Skip order test (requires real charge)
4. ⏭️ Skip query test (requires real order)

---

## What to Do If Endpoints Don't Match

If the endpoints in the code don't match the actual API:

1. **Note the correct endpoint path** from your test
2. **Update `src/lib/esimaccess.ts`** with the correct path
3. **Update response mapping** if structure differs
4. **Re-test** to verify

---

## Common Endpoint Alternatives

If `/package/list` doesn't work, try:
- `/package/query`
- `/packages`
- `/data/package/list`

If `/esim/order/profiles` doesn't work, try:
- `/esim/order`
- `/esim/order/profile`
- `/profile/order`

If `/esim/query` doesn't work, try:
- `/esim/profile/query`
- `/profile/query`
- `/esim/status`

---

## Next Steps After Verification

1. ✅ Update code with correct endpoints (if needed)
2. ✅ Test end-to-end order flow in app
3. ✅ Configure webhook URL in eSIM Access dashboard
4. ✅ Deploy to production

For detailed testing guide, see `ESIMACCESS_API_TESTING_GUIDE.md`.

