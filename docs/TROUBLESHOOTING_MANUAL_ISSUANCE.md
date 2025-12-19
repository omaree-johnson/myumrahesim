# Troubleshooting Manual Issuance Required

## Why You're Getting "Manual Issuance Required" Emails

The system sends "Manual Issuance Required" emails when the eSIM order creation fails. This document explains common causes and how to fix them.

---

## Common Error Codes & Solutions

### Error 200007: Insufficient Account Balance

**What it means:** Your eSIM Access account doesn't have enough funds to cover the order.

**How to fix:**
1. Check your eSIM Access account balance
2. Deposit funds into your eSIM Access account
3. The system will automatically retry on the next purchase

**Prevention:**
- Set up balance alerts in eSIM Access dashboard
- Monitor balance regularly
- Maintain a buffer balance

---

### Error 310241 or 310243: Package Not Found

**What it means:** The `packageCode` being sent doesn't exist in eSIM Access.

**Common causes:**
1. **Wrong packageCode format** - The code from your frontend might not match eSIM Access format
2. **Package discontinued** - The package might have been removed from eSIM Access
3. **Using offerId instead of packageCode** - The frontend might be sending an internal ID instead of the actual packageCode

**How to debug:**
1. Check the admin notification email - it will show the `packageCode` that was attempted
2. Verify the package exists in eSIM Access:
   ```bash
   curl -X POST 'https://api.esimaccess.com/api/v1/open/package/list' \
     -H 'RT-AccessCode: YOUR_ACCESS_CODE' \
     -H 'Content-Type: application/json' \
     -d '{"packageCode": "YOUR_PACKAGE_CODE"}'
   ```
3. Check logs for the actual `packageCode` being sent

**How to fix:**
- Update the `packageCode` in your product database
- Ensure frontend sends the correct `packageCode` (not `offerId` or `slug`)
- Verify packages are synced correctly from eSIM Access API

---

### Error 200005: Package Price Error

**What it means:** The price being sent doesn't match the package price in eSIM Access.

**How to fix:**
- Verify package prices are up to date
- Check if eSIM Access prices have changed
- Update your product pricing

---

### Error 200011: Insufficient Available Profiles

**What it means:** eSIM Access doesn't have enough available eSIM profiles for this package.

**How to fix:**
- Contact eSIM Access support to increase profile inventory
- Try a different package
- Wait for inventory to be replenished

---

### Error 200006: Total Order Price Amount Wrong

**What it means:** The total price calculation is incorrect.

**How to fix:**
- Check price calculation logic
- Verify currency conversion is correct
- Ensure profit margin calculations are accurate

---

### Error 200008: Order Parameters Error

**What it means:** Required parameters are missing or invalid.

**How to fix:**
- Check that `packageCode` and `transactionId` are provided
- Verify `transactionId` is unique
- Check parameter formats match eSIM Access requirements

---

## Debugging Steps

### 1. Check Server Logs

Look for these log entries in your production logs:

```
[Stripe Webhook] Order parameters: {
  packageCode: "...",
  transactionId: "...",
  ...
}

[eSIM Access] Creating order with parameters: {
  packageCode: "...",
  ...
}

[eSIM Access] API error: {
  errorCode: "200007",
  errorMsg: "..."
}
```

### 2. Check Admin Notification Email

The admin notification email now includes:
- **Error Code** - The specific eSIM Access error code
- **Error Details** - Detailed error message
- **PackageCode** - The package code that was attempted

### 3. Verify Package Code

The system uses this logic to determine `packageCode`:
```typescript
const packageCode = packageData.packageCode || packageData.slug || offerId;
```

**Issue:** If `packageData.packageCode` is missing, it falls back to `slug` or `offerId`, which might not be valid.

**Solution:** Ensure `getEsimPackage()` returns a valid `packageCode` field.

### 4. Test Order Creation Manually

Test the exact order creation with the same parameters:

```bash
curl -X POST 'https://api.esimaccess.com/api/v1/open/esim/order/profiles' \
  -H 'RT-AccessCode: YOUR_ACCESS_CODE' \
  -H 'Content-Type: application/json' \
  -d '{
    "packageCode": "EXACT_PACKAGE_CODE_FROM_LOGS",
    "transactionId": "test_transaction_123",
    "travelerName": "Test User",
    "travelerEmail": "test@example.com"
  }'
```

Compare the response with what your system is receiving.

---

## Database Fields for Debugging

The system now stores error information in the database:

- `esim_provider_status` - Status: `insufficient_balance` or `purchase_failed`
- `esim_provider_error_code` - The eSIM Access error code (e.g., "200007")
- `esim_provider_error_message` - Detailed error message

Query the database to see error patterns:

```sql
SELECT 
  transaction_id,
  esim_provider_status,
  esim_provider_error_code,
  esim_provider_error_message,
  offer_id,
  created_at
FROM esim_purchases
WHERE esim_provider_status IN ('insufficient_balance', 'purchase_failed')
ORDER BY created_at DESC
LIMIT 10;
```

---

## Prevention Checklist

- [ ] Verify eSIM Access account has sufficient balance
- [ ] Ensure all package codes are valid and up to date
- [ ] Test order creation with actual package codes
- [ ] Monitor error logs regularly
- [ ] Set up alerts for specific error codes
- [ ] Keep package inventory synced with eSIM Access

---

## Next Steps

1. **Check production logs** for the specific error code
2. **Review admin notification emails** for error details
3. **Query database** to see error patterns
4. **Test manually** with the same parameters
5. **Fix the root cause** based on error code

The improved error handling will now show you exactly what's failing, making it much easier to diagnose and fix issues.








