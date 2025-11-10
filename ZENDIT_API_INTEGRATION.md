# Zendit API Integration Guide

This document describes the complete Zendit API integration for the eSIM PWA application.

## API Configuration

**Base URL**: `https://api.zendit.io/v1`  
**Authentication**: Bearer token via `ZENDIT_API_KEY` environment variable  
**Environment**: Sandbox (use production key for live transactions)

## Endpoints Used

### 1. GET /esim/offers

Retrieves available eSIM offers/plans from Zendit.

**Query Parameters:**
- `_limit`: Number of results to return (default: 100)
- `_offset`: Pagination offset (default: 0)

**Response Structure:**
```typescript
{
  list: [
    {
      offerId: string,           // Unique offer identifier (e.g., "ESIM-GLOBAL-30D-5GB")
      shortNotes: string,        // Short display name
      notes: string,             // Full description
      country: string,           // Country code or "GLOBAL"
      brandName: string,         // Provider brand name
      durationDays: number,      // Plan validity in days
      dataGB: number,            // Data allowance in GB
      dataUnlimited: boolean,    // Whether data is unlimited
      price: {
        fixed: number,           // Price in smallest unit (e.g., cents)
        currency: string,        // Currency code (e.g., "USD")
        currencyDivisor: number  // Divisor to get actual price (e.g., 100)
      },
      enabled: boolean           // Whether offer is available
    }
  ],
  limit: number,                 // Requested limit
  offset: number,                // Current offset
  total: number                  // Total available offers
}
```

**Price Calculation:**
```typescript
const actualPrice = offer.price.fixed / offer.price.currencyDivisor;
// Example: 1999 / 100 = $19.99
```

**Implementation:**
- File: `src/lib/zendit.ts` → `getEsimProducts()`
- Returns: `response.list` array of offers
- Used in: `src/app/page.tsx` (server component)

### 2. POST /esim/purchases

Creates a new eSIM purchase.

**Request Body:**
```typescript
{
  offerId: string,        // Required: The offer ID to purchase
  transactionId: string,  // Required: Your unique transaction identifier
  iccid?: string         // Optional: ICCID to apply plan to existing eSIM
}
```

**Response Structure:**
```typescript
{
  status: string,         // Purchase status (e.g., "pending", "completed")
  transactionId: string   // Echo of your transaction ID
}
```

**Important Notes:**
- `transactionId` must be unique for each purchase
- Use format: `txn_{timestamp}_{random}` for uniqueness
- Email is NOT required by Zendit's purchase endpoint
- Store email separately in your database for customer records

**Implementation:**
- File: `src/lib/zendit.ts` → `createEsimPurchase()`
- API Route: `src/app/api/orders/route.ts` → `POST`
- Used in: `src/app/checkout/page.tsx`

### 3. GET /esim/purchases/{transactionId}

Retrieves purchase details and activation information.

**Response Structure:**
```typescript
{
  transactionId: string,
  status: string,           // "pending", "completed", "failed"
  offerId: string,
  confirmation?: {
    activationCode: string, // QR code data or manual entry code
    iccid: string,          // eSIM ICCID
    smdpAddress: string,    // SM-DP+ server address
    redemptionInstructions: string // Step-by-step activation guide
  }
}
```

**Implementation:**
- File: `src/lib/zendit.ts` → `getPurchaseDetails()`
- Not yet integrated in UI (TODO)

### 4. GET /esim/purchases/{transactionId}/qrcode

Retrieves QR code image for eSIM activation.

**Response:**
- Content-Type: `image/png`
- Returns: PNG image blob

**Implementation:**
- File: `src/lib/zendit.ts` → `getEsimQRCode()`
- Returns: Blob (can be converted to data URL for display)
- Not yet integrated in UI (TODO)

## Application Flow

### 1. Product Catalog (Home Page)

```
User → Home Page → Server Component
                ↓
        getEsimProducts()
                ↓
        GET /esim/offers?_limit=100&_offset=0
                ↓
        Filter enabled offers
                ↓
        Transform to app format
                ↓
        Render product cards
```

**File**: `src/app/page.tsx`

### 2. Checkout Flow

```
User → Select Product → Checkout Page (Client)
                       ↓
              Enter Email + Click Buy
                       ↓
              POST /api/orders
                       ↓
              Generate transactionId
                       ↓
              createEsimPurchase()
                       ↓
              POST /esim/purchases
                       ↓
              Redirect to Success Page
```

**Files**: 
- `src/app/checkout/page.tsx` (frontend)
- `src/app/api/orders/route.ts` (backend)

### 3. Order Confirmation

```
User → Success Page
           ↓
   Display transactionId
           ↓
   (Future: Fetch purchase details)
           ↓
   (Future: Display QR code)
```

**File**: `src/app/success/page.tsx`

## Data Transformations

### Offer → Product

Zendit offers are transformed into a simplified product format:

```typescript
// From Zendit
{
  offerId: "ESIM-US-30D-10GB",
  shortNotes: "USA 30 Days 10GB",
  price: { fixed: 1999, currency: "USD", currencyDivisor: 100 },
  dataGB: 10,
  durationDays: 30
}

// To App Product
{
  id: "ESIM-US-30D-10GB",
  name: "USA 30 Days 10GB",
  price: {
    display: "USD 19.99",
    amount: 19.99,
    currency: "USD"
  },
  data: "10GB",
  validity: "30 days"
}
```

### Purchase Request

```typescript
// Frontend sends to /api/orders
{
  offerId: "ESIM-US-30D-10GB",
  recipientEmail: "user@example.com"
}

// Backend generates and sends to Zendit
{
  offerId: "ESIM-US-30D-10GB",
  transactionId: "txn_1704123456789_abc123"
}

// Email stored separately for your records
```

## Environment Variables

Required in `.env.local`:

```bash
ZENDIT_API_KEY=sand_your_sandbox_key_here  # Use production key in production
```

## Error Handling

All API calls include error handling:

```typescript
try {
  const data = await fetchZendit(path, options);
  return data;
} catch (error) {
  console.error("Zendit API error:", error);
  throw error; // Propagate to caller
}
```

API routes return proper HTTP status codes:
- `200`: Success
- `400`: Bad request (missing required fields)
- `500`: Server/API error

## Testing with Sandbox

The current `.env.local` uses a sandbox API key:

```
ZENDIT_API_KEY=sand_1bd81b52-52ea-409d-b412-c59f273d51e46910aa730e88126fdf8a6397
```

**Sandbox Behavior:**
- Returns real offer data
- Purchases may complete instantly or return test states
- No real eSIM activation occurs
- No charges are made

## Production Checklist

Before going live:

- [ ] Replace sandbox API key with production key
- [ ] Implement webhook endpoint for purchase status updates
- [ ] Add purchase status polling/checking
- [ ] Integrate QR code display on success page
- [ ] Store purchases in database with customer email
- [ ] Add customer account/order history
- [ ] Implement proper error messages for users
- [ ] Add retry logic for failed purchases
- [ ] Set up monitoring and alerting
- [ ] Test complete purchase flow end-to-end

## Future Enhancements

1. **Purchase Status Tracking**
   - Poll `GET /esim/purchases/{transactionId}` for status updates
   - Display activation instructions when ready
   
2. **QR Code Display**
   - Fetch and display QR code on success page
   - Allow users to download QR code
   
3. **Order History**
   - Store purchases in database
   - Allow users to view past orders
   - Resend activation details
   
4. **Webhooks**
   - Implement webhook endpoint for real-time status updates
   - Update order status automatically
   
5. **Advanced Filtering**
   - Filter by country, price range, data amount
   - Search functionality
   - Sort by price/data/duration

## Troubleshooting

### Issue: 404 on /api/products
**Solution**: Ensure dev server is running on correct port (check console output)

### Issue: No products displaying
**Solution**: Check browser console for API errors, verify ZENDIT_API_KEY is set

### Issue: Price showing as $0.00
**Solution**: Verify price calculation uses `fixed / currencyDivisor`

### Issue: Purchase fails with 400
**Solution**: Ensure both `offerId` and `transactionId` are provided

## API Documentation Reference

Full Zendit API documentation is available in `zendit.md` (provided by user).

Key sections:
- eSIM Offers: Lines discussing GET /esim/offers
- eSIM Purchases: Lines discussing POST /esim/purchases
- Price Structure: Currency divisor explanation
- Authentication: Bearer token format

## Support

For Zendit API issues:
- Check official documentation
- Verify API key is valid
- Ensure request format matches specification
- Check response status codes and error messages
