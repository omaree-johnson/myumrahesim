# Diagnostic Guide: Why Automatic eSIM Purchase Isn't Working

This guide helps you diagnose why automatic eSIM purchases are failing and triggering "Manual Issuance Required" emails.

---

## Quick Diagnostic Checklist

### ✅ Step 1: Is the Webhook Being Called?

**Check your production logs for:**

```
[Stripe Webhook] ============================================
[Stripe Webhook] 🔔 WEBHOOK CALLED - Starting processing...
[Stripe Webhook] ✅ Payment intent succeeded:
```

**If you DON'T see these logs:**
- ❌ Webhook is not being called
- **Solution:** Check Stripe webhook configuration (see below)

**If you DO see these logs:**
- ✅ Webhook is working, continue to Step 2

---

### ✅ Step 2: Is the Order Creation Being Attempted?

**Check logs for:**

```
[Stripe Webhook] 📦 STEP 2: Processing eSIM purchase from provider...
[Stripe Webhook] Purchasing eSIM from provider...
[Stripe Webhook] Order parameters: { packageCode, transactionId, ... }
```

**If you DON'T see these logs:**
- ❌ Code is failing before order creation
- **Check for:** Missing `offerId` in metadata, package not found, etc.

**If you DO see these logs:**
- ✅ Order creation is being attempted, continue to Step 3

---

### ✅ Step 3: What Error is Occurring?

**Check logs for error messages:**

```
[Stripe Webhook] ⚠️ eSIM purchase failed: {
  errorCode: "...",
  errorMessage: "...",
  packageCode: "..."
}
```

**Common Error Codes:**

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `200007` | Insufficient account balance | Deposit funds to eSIM Access account |
| `310241` or `310243` | Package not found | Verify packageCode is correct |
| `200005` | Package price error | Check package pricing |
| `200011` | Insufficient available profiles | Contact eSIM Access support |
| `null` or `undefined` | Unknown error | Check full error message |

---

## Detailed Diagnostic Steps

### 1. Verify Stripe Webhook Configuration

**In Production (Stripe Dashboard):**

1. Go to: https://dashboard.stripe.com/webhooks
2. Find your webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Check **Events** - Should include:
   - ✅ `payment_intent.succeeded` (for embedded checkout)
   - ✅ `checkout.session.completed` (for redirect checkout)
4. Check **Recent deliveries** - Look for:
   - ✅ Successful deliveries (200 status)
   - ❌ Failed deliveries (400/500 status)

**If webhook is failing:**
- Check webhook secret in environment variables
- Verify webhook URL is accessible
- Check server logs for signature verification errors

---

### 2. Check Environment Variables

**Required variables:**

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# eSIM Access
ESIMACCESS_ACCESS_CODE=your_access_code
ESIMACCESS_BASE_URL=https://api.esimaccess.com/api/v1/open

# Database (if using Supabase)
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
```

**Verify in production:**
- All variables are set
- No typos in variable names
- Access codes are correct (not test keys in production)

---

### 3. Check Package Code Mapping

**The system uses this logic:**

```typescript
const packageCode = packageData.packageCode || packageData.slug || offerId;
```

**Potential issues:**
- `packageData.packageCode` might be missing
- Falls back to `slug` which might not be valid
- Falls back to `offerId` which is definitely wrong

**How to verify:**
1. Check logs for: `[Stripe Webhook] Order parameters: { packageCode: "..." }`
2. Verify this packageCode exists in eSIM Access:
   ```bash
   curl -X POST 'https://api.esimaccess.com/api/v1/open/package/list' \
     -H 'RT-AccessCode: YOUR_ACCESS_CODE' \
     -H 'Content-Type: application/json' \
     -d '{"packageCode": "YOUR_PACKAGE_CODE"}'
   ```

---

### 4. Check Account Balance

**The system checks balance before creating order:**

```typescript
const balance = await getBalance();
if (balance.balance < requiredAmount) {
  // Sends admin notification
  // Payment still succeeds
}
```

**How to check:**
1. Log into eSIM Access dashboard
2. Check account balance
3. Verify balance is sufficient for orders
4. Check logs for: `[Stripe Webhook] Account balance: { currentBalance, required, sufficient }`

---

### 5. Verify API Credentials

**Test eSIM Access API directly:**

```bash
# Test balance query (verifies credentials)
curl -X POST 'https://api.esimaccess.com/api/v1/open/balance/query' \
  -H 'RT-AccessCode: YOUR_ACCESS_CODE' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

**Expected response:**
```json
{
  "success": true,
  "errorCode": "0",
  "obj": {
    "balance": 1000.00,
    "currency": "USD"
  }
}
```

**If this fails:**
- ❌ Access code is incorrect
- ❌ API endpoint is wrong
- ❌ Account is suspended

---

### 6. Check Database Records

**Query recent purchases:**

```sql
SELECT 
  transaction_id,
  offer_id,
  esim_provider_status,
  esim_provider_error_code,
  esim_provider_error_message,
  order_no,
  created_at
FROM esim_purchases
ORDER BY created_at DESC
LIMIT 10;
```

**What to look for:**
- `esim_provider_status` = `'purchase_failed'` or `'insufficient_balance'`
- `esim_provider_error_code` = The specific error code
- `esim_provider_error_message` = Detailed error message
- `order_no` = `null` means order wasn't created

---

### 7. Check Server Logs

**Look for these log patterns:**

#### Successful Order Creation:
```
[Stripe Webhook] ✅ eSIM order created successfully: {
  orderNo: "B25091113270004",
  esimTranNo: "25091113270004",
  iccid: "8943108170001029631"
}
```

#### Failed Order Creation:
```
[Stripe Webhook] ⚠️ eSIM purchase failed: {
  errorCode: "200007",
  errorMessage: "Insufficient account balance",
  packageCode: "SA-10GB-30D"
}
```

#### Missing Package:
```
[Stripe Webhook] Fetching package details from provider...
[Stripe Webhook] ❌ Package not found: ESIM-AD-15D-2GB-NOROAM
```

---

## Common Issues & Solutions

### Issue 1: Webhook Not Being Called

**Symptoms:**
- No logs showing webhook received
- Payment succeeds but no eSIM created
- No admin notification emails

**Solutions:**
1. Verify webhook URL in Stripe dashboard
2. Check webhook secret matches environment variable
3. Verify webhook endpoint is publicly accessible
4. Check firewall/security settings

---

### Issue 2: Package Code Not Found

**Symptoms:**
- Error code: `310241` or `310243`
- Logs show: `Package not found (Error 310241)`

**Solutions:**
1. Verify `packageCode` in logs matches eSIM Access
2. Check if package exists: `POST /package/list` with packageCode
3. Update product database with correct packageCode
4. Ensure `getEsimPackage()` returns valid `packageCode` field

---

### Issue 3: Insufficient Balance

**Symptoms:**
- Error code: `200007`
- Admin notification email received
- Payment still succeeds

**Solutions:**
1. Deposit funds to eSIM Access account
2. Check balance: `POST /balance/query`
3. Verify currency matches (USD vs other currencies)
4. Set up balance alerts

---

### Issue 4: Order Creation Fails Silently

**Symptoms:**
- No error logs
- No order created
- Payment succeeds

**Solutions:**
1. Check if `createEsimOrder()` is being called
2. Verify API credentials are correct
3. Check network connectivity to eSIM Access API
4. Look for timeout errors in logs

---

### Issue 5: Wrong Package Code Format

**Symptoms:**
- Order creation attempted but fails
- Error about invalid package

**Solutions:**
1. Check logs for exact `packageCode` being sent
2. Compare with eSIM Access package list
3. Verify packageCode format (case-sensitive, no spaces)
4. Test order creation manually with same packageCode

---

## Testing the Fix

### 1. Test Order Creation Manually

```bash
curl -X POST 'https://api.esimaccess.com/api/v1/open/esim/order/profiles' \
  -H 'RT-AccessCode: YOUR_ACCESS_CODE' \
  -H 'Content-Type: application/json' \
  -d '{
    "packageCode": "EXACT_PACKAGE_CODE_FROM_LOGS",
    "transactionId": "test_'$(date +%s)'",
    "travelerName": "Test User",
    "travelerEmail": "test@example.com"
  }'
```

**If this works:**
- ✅ API credentials are correct
- ✅ Package code is valid
- ✅ Issue is in webhook/application code

**If this fails:**
- ❌ Check error message
- ❌ Verify package code
- ❌ Check account balance

---

### 2. Monitor Production Logs

**Watch for these in real-time:**

```bash
# If using Vercel
vercel logs --follow

# If using other hosting
# Check your hosting platform's log viewer
```

**Look for:**
- Webhook received ✅
- Order parameters logged ✅
- Order creation success/failure ✅
- Error codes and messages ✅

---

## Next Steps

1. **Check production logs** - Look for error codes and messages
2. **Verify webhook configuration** - Ensure events are subscribed
3. **Test API credentials** - Use curl commands above
4. **Check database** - Query recent purchases for error codes
5. **Review admin emails** - They now include error codes and details

---

## Getting Help

If you're still stuck, provide:

1. **Error code** from logs or admin email
2. **Package code** being used
3. **Log snippet** showing the failure
4. **Database record** showing error details
5. **Webhook delivery status** from Stripe dashboard

This information will help identify the exact issue.

