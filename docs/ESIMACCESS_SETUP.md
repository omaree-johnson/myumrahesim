# eSIM Access Setup Guide

This project uses the **eSIM Access API** for eSIM provisioning. Follow the steps below to configure credentials, database fields, and operational workflows.

---

## 1. Environment Variables

Add these to `.env.local` (and production env):

```env
# Required account credentials
ESIMACCESS_ACCESS_CODE=your_access_code_here

# Optional overrides
ESIMACCESS_BASE_URL=https://api.esimaccess.com/api/v1/open
ESIMACCESS_COUNTRY_CODE=SA
ESIMACCESS_DEFAULT_CURRENCY=USD
```

> The API uses a simple `RT-AccessCode` header for authentication. No HMAC signature is required for basic requests.

---

## 2. Database Migration

The database schema uses provider-agnostic fields:

- `esim_provider_response` - Stores full API response
- `esim_provider_status` - Order status from provider
- `esim_provider_cost` - Cost charged by provider
- `order_no` - Provider order number

These fields are already set up in the existing migrations. No additional migration is needed.

---

## 3. Provider Capabilities

| Feature | Endpoint | Notes |
|---------|----------|-------|
| Package list | `POST /package/list` | Filter by country code |
| Package details | `POST /package/list` | Query by packageCode or slug |
| Order eSIM | `POST /esim/order/profiles` | Batch profile ordering |
| Query profiles | `POST /esim/query` | Get activation details by orderNo or esimTranNo |
| Usage check | `POST /esim/usage/query` | Check data usage by esimTranNo |
| Balance check | `POST /balance/query` | Check account balance |
| Location list | `POST /location/list` | Get supported countries |

---

## 4. Price Format

eSIM Access uses a price format where:
- Price is stored as: `actualPrice * 10,000`
- Example: $19.99 = 199,900
- The client library automatically converts this to/from dollars

---

## 5. Order Flow

1. **Customer pays via Stripe** → Payment webhook received
2. **Check account balance** → Verify sufficient funds
3. **Create eSIM order** → `POST /esim/order/profiles` with packageCode and transactionId
4. **Query for activation** → `POST /esim/query` with orderNo or esimTranNo
5. **Store activation details** → Save to database (ICCID, activation code, QR code, SM-DP+ address)
6. **Send confirmation email** → Email with activation instructions

---

## 6. Response Structure

### Order Response
```json
{
  "orderNo": "B25091113270004",
  "esimTranNo": "25091113270004",
  "iccid": "8943108170001029631",
  "transactionId": "your_transaction_id"
}
```

### Profile Query Response
```json
{
  "orderNo": "B25091113270004",
  "esimTranNo": "25091113270004",
  "iccid": "8943108170001029631",
  "activationCode": "LPA:1$...",
  "qrCode": "LPA:1$...",
  "smdpAddress": "smdp.example.com",
  "status": "GOT_RESOURCE"
}
```

### Usage Response
```json
{
  "esimTranNo": "25031120490003",
  "dataUsage": 1453344832,
  "totalData": 5368709120,
  "lastUpdateTime": "2025-03-19T18:00:00+0000"
}
```

---

## 7. Webhooks

eSIM Access supports webhooks for:
- `ORDER_STATUS` - When eSIM is ready
- `SMDP_EVENT` - Real-time SM-DP+ server events
- `ESIM_STATUS` - eSIM lifecycle changes
- `DATA_USAGE` - Data usage thresholds (50%, 80%, 90%)
- `VALIDITY_USAGE` - Validity expiration warnings

Configure webhook URL in your eSIM Access account dashboard.

---

## 8. Error Handling

Common error codes:
- `200007` - Insufficient account balance
- `200005` - Package price error
- `310241` - Package code does not exist
- `310272` - Order number does not exist

The client library throws descriptive errors for all API failures.

---

## 9. Rate Limits

eSIM Access allows **8 requests per second**. The client library does not implement rate limiting - ensure your application respects this limit.

---

## 10. Testing

1. Set up test account at eSIM Access
2. Request test funds for refunding
3. Use test package codes for development
4. Monitor webhook delivery via webhook.site during development

---

## Troubleshooting

### "Missing RT-AccessCode header"
- Ensure `ESIMACCESS_ACCESS_CODE` is set in environment variables

### "Package not found"
- Verify packageCode/slug exists in provider catalog
- Check country filter matches package location

### "Insufficient balance"
- Top up account via eSIM Access dashboard
- Check balance with `/balance/query` endpoint

### "Activation details not available"
- Order may still be processing
- Query profiles endpoint with orderNo or esimTranNo
- Wait for ORDER_STATUS webhook

---

For full API documentation, see `esimaccess.md`.

