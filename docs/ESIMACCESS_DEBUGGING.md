# eSIM Access API Debugging Guide

## Error: "eSIM Access API error: Unknown error"

This error occurs when the API response doesn't match the expected structure. Follow these steps to diagnose:

---

## Step 1: Check Environment Variables

Verify your `.env.local` file has:

```env
ESIMACCESS_ACCESS_CODE=your_access_code_here
ESIMACCESS_BASE_URL=https://api.esimaccess.com/api/v1/open
```

**Check if it's set:**
```bash
# In your terminal
echo $ESIMACCESS_ACCESS_CODE

# Or check .env.local
cat .env.local | grep ESIMACCESS
```

**If missing:**
1. Get your AccessCode from eSIM Access dashboard
2. Add it to `.env.local`
3. Restart your dev server (`npm run dev`)

---

## Step 2: Test API Directly

Test the API endpoint manually to see the actual response:

```bash
curl -X POST 'https://api.esimaccess.com/api/v1/open/package/list' \
  -H 'RT-AccessCode: YOUR_ACCESS_CODE' \
  -H 'Content-Type: application/json' \
  -d '{"country": "SA"}'
```

**What to check:**
- ✅ Does it return `{"success": true, "errorCode": "0", ...}`?
- ❌ Does it return an error? (check errorCode and errorMsg)
- ❌ Does it return a different structure?

---

## Step 3: Check Server Logs

With the improved error handling, check your server console for:

```
[eSIM Access] Fetching: https://api.esimaccess.com/api/v1/open/package/list
[eSIM Access] Response structure: { ... }
```

**Look for:**
- `hasSuccess: true/false` - Does response have `success` field?
- `hasErrorCode: true/false` - Does response have `errorCode` field?
- `keys: [...]` - What fields does the response actually have?
- `responsePreview: ...` - First 500 chars of the response

---

## Step 4: Common Issues & Fixes

### Issue 1: Missing Access Code
**Error:** `ESIMACCESS_ACCESS_CODE must be set in environment variables`

**Fix:**
1. Add `ESIMACCESS_ACCESS_CODE=your_code` to `.env.local`
2. Restart dev server

---

### Issue 2: Wrong Endpoint Path
**Symptom:** Response structure doesn't match expected format

**Test alternative endpoints:**
```bash
# Try these instead of /package/list:
curl -X POST 'https://api.esimaccess.com/api/v1/open/package/query' ...
curl -X POST 'https://api.esimaccess.com/api/v1/open/packages' ...
```

**If different endpoint works:**
- Update `src/lib/esimaccess.ts` line 75:
  ```typescript
  const response = await fetchEsimAccess("/package/query", { // Changed from /package/list
  ```

---

### Issue 3: Different Response Structure
**Symptom:** Response has different fields than expected

**Check the actual response:**
- Look at server logs for `responsePreview`
- The response might be directly an array instead of `{obj: {packageList: [...]}}`

**Fix:**
- Update `src/lib/esimaccess.ts` to handle the actual structure
- See Step 5 below

---

### Issue 4: Authentication Error
**Symptom:** HTTP 401 or errorCode like "000101"

**Common causes:**
- Access code is incorrect
- Access code expired
- Wrong header name (should be `RT-AccessCode`)

**Fix:**
1. Verify AccessCode in eSIM Access dashboard
2. Regenerate if needed
3. Update `.env.local` and restart

---

### Issue 5: Country Code Issue
**Symptom:** No packages returned for "SA"

**Test without country filter:**
```bash
curl -X POST 'https://api.esimaccess.com/api/v1/open/package/list' \
  -H 'RT-AccessCode: YOUR_CODE' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

**If this works:**
- The country filter might need different format
- Try updating the request body in `src/lib/esimaccess.ts`

---

## Step 5: Update Code for Actual Response Structure

If the API returns a different structure, update the code:

### Example: If response is directly an array
```typescript
// In src/lib/esimaccess.ts, getEsimProducts function
const response = await fetchEsimAccess("/package/list", {...});

// If response is directly an array:
const packages = Array.isArray(response) 
  ? response 
  : response?.packageList || response?.data || [];
```

### Example: If response has different error structure
```typescript
// In fetchEsimAccess function
if (data.error || data.status === 'error') {
  throw new Error(`eSIM Access API error: ${data.message || data.error}`);
}
```

---

## Step 6: Use the Test Script

Run the automated test script:

```bash
export ESIMACCESS_ACCESS_CODE=your_code
node scripts/test-esimaccess-api.js
```

This will:
- ✅ Test your credentials (balance query)
- ✅ Test package list endpoint
- ✅ Show actual response structure
- ✅ Identify which endpoint works

---

## Quick Fix Checklist

- [ ] `ESIMACCESS_ACCESS_CODE` is set in `.env.local`
- [ ] Dev server restarted after adding env var
- [ ] AccessCode is correct (test with balance query)
- [ ] Endpoint path is correct (test manually with curl)
- [ ] Response structure matches code expectations
- [ ] Check server logs for detailed error info

---

## Still Not Working?

1. **Check eSIM Access dashboard:**
   - Is your account active?
   - Do you have API access enabled?
   - Is your AccessCode valid?

2. **Contact eSIM Access support:**
   - Provide the exact error message
   - Share the response structure from logs
   - Ask for correct endpoint paths

3. **Check documentation:**
   - Review `docs/esimaccess.md` for latest API docs
   - Verify endpoint paths match documentation

---

## Next Steps After Fixing

Once the API works:
1. ✅ Test complete order flow
2. ✅ Configure webhook URL
3. ✅ Deploy to production

