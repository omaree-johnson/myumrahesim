# Migration from eSIMCard to eSIM Access

This document summarizes the migration from eSIMCard Reseller API to eSIM Access API.

---

## Overview

The application has been migrated from eSIMCard to eSIM Access to use a different eSIM provider with different authentication, pricing, and API structure.

---

## Key Changes

### 1. API Client Library

**Before:** `src/lib/esimcard.ts`  
**After:** `src/lib/esimaccess.ts`

**Authentication:**
- **eSIMCard:** JWT bearer token (email/password login)
- **eSIM Access:** Simple API key header (`RT-AccessCode`)

**Price Format:**
- **eSIMCard:** Price as float (e.g., 19.99)
- **eSIM Access:** Price * 10,000 (e.g., 199,900 for $19.99)

### 2. Function Name Changes

| eSIMCard | eSIM Access |
|----------|-------------|
| `createEsimPurchase()` | `createEsimOrder()` |
| `queryEsimProfiles(simId)` | `queryEsimProfiles(orderNo, esimTranNo)` |
| `getEsimUsage(simId)` | `getEsimUsage(esimTranNo)` |

### 3. Response Structure

**Order Response:**
- **eSIMCard:** `{ orderId, simId, activation, ... }`
- **eSIM Access:** `{ orderNo, esimTranNo, iccid, ... }`

**Activation Details:**
- **eSIMCard:** Retrieved via `simId` from `/my-esims/{id}`
- **eSIM Access:** Retrieved via `orderNo` or `esimTranNo` from `/esim/query`

### 4. Database Fields

No schema changes required. The existing provider-agnostic fields are used:
- `order_no` - Stores `orderNo` from eSIM Access
- `esim_provider_response` - Full API response
- `esim_provider_status` - Order status
- `esim_provider_cost` - Provider cost

### 5. Updated Files

**API Routes:**
- `src/app/api/orders/route.ts`
- `src/app/api/webhooks/stripe/route.ts`
- `src/app/api/products/route.ts`
- `src/app/api/create-checkout-session/route.ts`
- `src/app/api/create-payment-intent/route.ts`
- `src/app/api/purchases/[transactionId]/route.ts`

**Frontend:**
- `src/app/plans/page.tsx`
- `src/app/layout.tsx` (DNS prefetch)

**Tests:**
- `__tests__/api.test.ts`

---

## Environment Variables

**Remove:**
```env
ESIMCARD_API_EMAIL
ESIMCARD_API_PASSWORD
ESIMCARD_BASE_URL
ESIMCARD_COUNTRY_NAME
ESIMCARD_COUNTRY_CODE
ESIMCARD_DEFAULT_CURRENCY
```

**Add:**
```env
ESIMACCESS_ACCESS_CODE=your_access_code
ESIMACCESS_BASE_URL=https://api.esimaccess.com/api/v1/open
ESIMACCESS_COUNTRY_CODE=SA
ESIMACCESS_DEFAULT_CURRENCY=USD
```

---

## Migration Steps

1. **Update environment variables** - Add eSIM Access credentials
2. **Deploy code changes** - All code has been updated
3. **Test order flow** - Verify end-to-end purchase works
4. **Monitor webhooks** - Ensure webhook delivery works
5. **Remove old credentials** - Clean up eSIMCard env vars

---

## Breaking Changes

### For Developers

- Function signatures changed (see table above)
- Response structures differ
- Price calculation uses different format

### For Operations

- Different account management (eSIM Access dashboard vs eSIMCard portal)
- Different webhook structure
- Different balance checking mechanism

---

## Rollback Plan

If rollback is needed:

1. Revert code to previous commit (before migration)
2. Restore eSIMCard environment variables
3. Redeploy application

**Note:** Existing orders in database will retain their provider-specific data in `esim_provider_response` field.

---

## Testing Checklist

- [ ] Environment variables configured
- [ ] Package listing works
- [ ] Order creation succeeds
- [ ] Activation details retrieved
- [ ] Usage data fetched correctly
- [ ] Balance check works
- [ ] Webhooks received and processed
- [ ] Email notifications sent
- [ ] Frontend displays products correctly

---

For setup instructions, see `ESIMACCESS_SETUP.md`.

