# Supabase Setup Instructions

## 1. Create Supabase Project

1. Go to https://supabase.com
2. Create a new project
3. Note your project URL and anon key

## 2. Add Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Run Database Migration

Option A - Using Supabase CLI:
```bash
# Install Supabase CLI
npm install -g supabase

# Link your project
supabase link --project-ref your-project-ref

# Run migration
supabase db push
```

Option B - Manual via Dashboard:
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and run in SQL Editor

## 4. Set Up Row Level Security (RLS)

After running migration, add these policies in SQL Editor:

```sql
-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE activation_details ENABLE ROW LEVEL SECURITY;

-- Customers policies
CREATE POLICY "Users can read own customer record"
  ON customers FOR SELECT
  USING (clerk_user_id = auth.jwt() ->> 'sub');

-- Purchases policies
CREATE POLICY "Users can read own purchases"
  ON purchases FOR SELECT
  USING (user_id IN (SELECT id FROM customers WHERE clerk_user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Service role can manage purchases"
  ON purchases FOR ALL
  USING (true);

-- Activation details policies
CREATE POLICY "Users can read own activation details"
  ON activation_details FOR SELECT
  USING (transaction_id IN (
    SELECT transaction_id FROM purchases 
    WHERE user_id IN (SELECT id FROM customers WHERE clerk_user_id = auth.jwt() ->> 'sub')
  ));

CREATE POLICY "Service role can manage activation details"
  ON activation_details FOR ALL
  USING (true);
```

## Database Schema

### Customers
- `id`: UUID (primary key)
- `email`: TEXT (unique, not null)
- `clerk_user_id`: TEXT (unique, for Clerk integration)
- `created_at`, `updated_at`: TIMESTAMPTZ

### Purchases
- `id`: UUID (primary key)
- `transaction_id`: TEXT (unique, not null)
- `offer_id`: TEXT (not null)
- `customer_email`: TEXT (not null)
- `customer_name`: TEXT (not null)
- `status`: TEXT (PENDING|PROCESSING|DONE|FAILED)
- `price_amount`: NUMERIC (not null)
- `price_currency`: TEXT (not null)
- `zendit_response`: JSONB
- `user_id`: UUID (foreign key to customers)
- `created_at`, `updated_at`: TIMESTAMPTZ

### Activation Details
- `id`: UUID (primary key)
- `transaction_id`: TEXT (unique, foreign key to purchases)
- `qr_code_url`: TEXT
- `smdp_address`: TEXT
- `activation_code`: TEXT
- `iccid`: TEXT
- `confirmation_data`: JSONB
- `created_at`, `updated_at`: TIMESTAMPTZ

## Usage in Code

```typescript
import { supabase } from '@/lib/supabase';

// Insert purchase
const { data, error } = await supabase
  .from('purchases')
  .insert({
    transaction_id: 'txn_123',
    offer_id: 'offer_456',
    customer_email: 'user@example.com',
    customer_name: 'John Doe',
    status: 'PENDING',
    price_amount: 29.99,
    price_currency: 'USD',
    zendit_response: {}
  })
  .select()
  .single();

// Query purchases
const { data: purchases } = await supabase
  .from('purchases')
  .select('*, activation_details(*)')
  .eq('customer_email', 'user@example.com');
```
