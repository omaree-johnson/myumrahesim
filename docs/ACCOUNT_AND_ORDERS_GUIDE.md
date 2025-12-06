# Account & Orders Guide

## How Email-Based Account Linking Works

### The Flow

1. **Customer makes purchase** (guest checkout)
   - Email is stored in `customer_email` field
   - Purchase is saved with `user_id: 'anonymous'` or `null`

2. **Customer signs up later** with the same email
   - Clerk creates account with their email
   - User visits `/orders` page
   - System automatically:
     - Creates/updates customer record in `customers` table
     - Links email to `clerk_user_id`
     - Finds all purchases with matching email
     - Updates `user_id` field to link purchases to account

3. **Customer views orders**
   - All purchases with their email are shown
   - Includes purchases made before and after sign-up
   - Usage data is automatically fetched and displayed

## Features

### ✅ View Orders
- **Page:** `/orders`
- **Requires:** Authentication (Clerk)
- **Shows:**
  - All purchases made with your email
  - Order date, product, transaction ID
  - Status (PROCESSING, DONE, IN_USE, etc.)
  - Price and currency
  - **Usage data** (for active eSIMs)

### ✅ Check Usage
- **Automatic:** Usage is fetched and displayed in orders table
- **API Endpoint:** `/api/orders/[transactionId]/usage`
- **Shows:**
  - Used data (GB)
  - Total data (GB)
  - Remaining data (GB)
  - Usage percentage
  - Last update time

### ✅ Email-Based Linking
- **Automatic:** When you sign up with the same email you used to purchase
- **Works for:**
  - Purchases made before sign-up
  - Purchases made after sign-up
  - Both `esim_purchases` and `purchases` tables

## Database Schema

### Customers Table
```sql
customers (
  id: UUID (primary key)
  email: TEXT (unique, not null)
  clerk_user_id: TEXT (unique, links to Clerk)
  created_at, updated_at: TIMESTAMPTZ
)
```

### Purchases Tables
```sql
esim_purchases (
  id: UUID
  transaction_id: TEXT (unique)
  customer_email: TEXT (links to customer)
  user_id: UUID (links to customers.id, nullable)
  esim_provider_response: JSONB (contains esimTranNo)
  ...
)

purchases (
  id: UUID
  transaction_id: TEXT (unique)
  customer_email: TEXT (links to customer)
  user_id: UUID (links to customers.id, nullable)
  esim_provider_response: JSONB (contains esimTranNo)
  ...
)
```

## How It Works

### 1. Purchase Flow (Guest)
```
Customer purchases → Email stored → user_id = null
```

### 2. Sign-Up Flow
```
Customer signs up with email → Clerk account created
→ Visit /orders → Customer record created/updated
→ All purchases with email are linked to user_id
```

### 3. Orders Page Logic
```typescript
// 1. Get user email from Clerk
const userEmail = user.emailAddresses[0]?.emailAddress;

// 2. Create/update customer record
await supabase.from('customers').upsert({
  email: userEmail,
  clerk_user_id: userId
});

// 3. Query purchases by email
const purchases = await supabase
  .from('esim_purchases')
  .select('*')
  .eq('customer_email', userEmail);

// 4. Link all purchases to user
await supabase
  .from('esim_purchases')
  .update({ user_id: customer.id })
  .eq('customer_email', userEmail);
```

## Usage Tracking

### How Usage is Fetched

1. **Orders page loads** → Fetches all purchases
2. **For each active eSIM** (IN_USE, GOT_RESOURCE, DONE):
   - Extracts `esimTranNo` from `esim_provider_response`
   - Calls `/api/orders/[transactionId]/usage`
   - API calls eSIM Access `/esim/usage/query`
   - Returns: used, total, remaining (in GB)

### Usage API Endpoint

**GET** `/api/orders/[transactionId]/usage`

**Authentication:** Required (Clerk)

**Response:**
```json
{
  "success": true,
  "usage": {
    "used": 2.5,
    "total": 10.0,
    "remaining": 7.5,
    "unit": "GB",
    "percentage": 25.0,
    "lastUpdateTime": "2025-03-19T18:00:00+0000"
  },
  "esimTranNo": "25030303480009"
}
```

**Note:** Usage data is updated every 2-3 hours by eSIM Access (not real-time)

## User Experience

### Scenario 1: Purchase First, Sign Up Later
1. Customer purchases eSIM with `customer@example.com` (guest)
2. Later, customer signs up with `customer@example.com`
3. Visits `/orders` → All previous purchases are automatically linked
4. Can view all orders and usage

### Scenario 2: Sign Up First, Purchase Later
1. Customer signs up with `customer@example.com`
2. Makes purchase → Purchase is linked immediately (if authenticated)
3. Or makes guest purchase → Linked when visiting `/orders`

### Scenario 3: Multiple Purchases
1. Customer makes 3 purchases (some as guest, some authenticated)
2. All purchases use same email
3. When viewing `/orders`, all 3 are shown
4. Usage data shown for active eSIMs

## Security

### Authentication Required
- `/orders` page requires Clerk authentication
- Usage API requires authentication
- Users can only see their own orders

### Email Verification
- Orders are linked by email match
- System verifies email ownership via Clerk
- No unauthorized access to other users' orders

## Troubleshooting

### "I don't see my orders"
**Check:**
1. ✅ Are you signed in?
2. ✅ Is your Clerk email the same as purchase email?
3. ✅ Check browser console for errors
4. ✅ Check Supabase logs for database queries

### "Usage not showing"
**Check:**
1. ✅ Is eSIM status IN_USE, GOT_RESOURCE, or DONE?
2. ✅ Does `esim_provider_response` contain `esimTranNo`?
3. ✅ Check browser network tab for API calls
4. ✅ Usage updates every 2-3 hours (may not be immediate)

### "Orders not linking to account"
**Check:**
1. ✅ Email in Clerk matches email in purchase
2. ✅ Visit `/orders` page (triggers linking)
3. ✅ Check Supabase `customers` table for your record
4. ✅ Check `esim_purchases` table for `user_id` field

## Testing

### Test Email Linking
1. Make a purchase as guest with `test@example.com`
2. Sign up with Clerk using `test@example.com`
3. Visit `/orders`
4. ✅ Should see your purchase
5. ✅ Purchase should have `user_id` set in database

### Test Usage Display
1. Make a purchase
2. Wait for eSIM to be activated (IN_USE status)
3. Visit `/orders`
4. ✅ Should see usage data after a few seconds
5. ✅ Shows: "X.XX / Y.YY GB (Z% used)"

## Summary

✅ **Email-based account linking** - Works automatically  
✅ **View all orders** - Even purchases made before sign-up  
✅ **Usage tracking** - Shows data usage for active eSIMs  
✅ **Secure** - Only see your own orders  
✅ **Seamless** - No manual linking required  

The system is designed so customers can purchase as guests and later sign up with the same email to view all their orders and usage in one place.

