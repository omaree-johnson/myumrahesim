# Promotional Pricing Schema Documentation

## Overview

Comprehensive Supabase Postgres schema for promotional pricing that supports:
- Time-bound promotions (start/end timestamps)
- Optional promo codes (NULL for auto-applied)
- Stacking prevention (priority-based, only one active)
- Umrah eSIM applicability
- Redemption tracking and analytics

## Schema Design

### Core Table: `promotions`

**Purpose**: Stores promotional pricing rules with time-bound validity.

**Key Features**:
- **Time-bound**: `starts_at` and `ends_at` timestamps
- **Optional code**: `promo_code` can be NULL for auto-applied promos
- **Stacking prevention**: `priority` field ensures only highest priority is applied
- **Active status**: `is_active` flag for manual enable/disable
- **Applicability**: `applies_to` field (esim/cart/topup/any)

**Fields**:
```sql
id                          UUID PRIMARY KEY
name                        TEXT NOT NULL              -- "Ramadan 2025 Promo"
description                 TEXT                       -- Optional description
promo_code                  TEXT UNIQUE                -- NULL for auto-applied
discount_percent            INTEGER (1-90)             -- Discount percentage
min_purchase_amount_cents   INTEGER                    -- Minimum purchase required
max_discount_amount_cents    INTEGER                    -- Optional discount cap
starts_at                   TIMESTAMPTZ NOT NULL       -- Promotion start
ends_at                     TIMESTAMPTZ NOT NULL       -- Promotion end
is_active                   BOOLEAN DEFAULT true        -- Manual enable/disable
applies_to                  TEXT DEFAULT 'esim'        -- esim/cart/topup/any
max_redemptions             INTEGER                    -- NULL = unlimited
redeemed_count              INTEGER DEFAULT 0          -- Current redemptions
priority                    INTEGER DEFAULT 0           -- Higher = wins if multiple active
created_by                  TEXT DEFAULT 'system'
notes                       TEXT
created_at                  TIMESTAMPTZ
updated_at                  TIMESTAMPTZ
```

### Redemption Tracking: `promotion_redemptions`

**Purpose**: Tracks which promotions were applied to which transactions.

**Key Features**:
- Links promotions to payment intents
- Records discount amounts for analytics
- Prevents duplicate application (unique constraint on `payment_intent_id`)

**Fields**:
```sql
id                      UUID PRIMARY KEY
promotion_id            UUID REFERENCES promotions(id)
payment_intent_id       TEXT UNIQUE NOT NULL
transaction_id          TEXT
customer_email          TEXT
discount_amount_cents   INTEGER NOT NULL
original_amount_cents   INTEGER NOT NULL
discounted_amount_cents INTEGER NOT NULL
redeemed_at             TIMESTAMPTZ
created_at              TIMESTAMPTZ
```

## Stacking Prevention

### How It Works

1. **Priority-based selection**: `get_active_promotion()` returns only the highest priority promotion
2. **Single active promotion**: Application logic applies only one promotion per transaction
3. **Database constraint**: Unique constraint on `payment_intent_id` in redemptions prevents duplicates

### Example

```sql
-- Multiple promotions active simultaneously:
-- Promotion A: priority 10, 15% off
-- Promotion B: priority 5, 20% off
-- Promotion C: priority 15, 10% off

-- Result: Only Promotion C (priority 15) is applied
-- Promotions A and B are ignored (stacking prevented)
```

## Database Functions

### `get_active_promotion()`

Returns the highest priority active promotion matching criteria.

**Parameters**:
- `p_applies_to`: 'esim', 'cart', 'topup', or 'any' (default: 'esim')
- `p_promo_code`: Optional promo code to match (NULL for auto-applied)
- `p_check_time`: Timestamp to check (default: NOW())

**Returns**: Single promotion row (highest priority) or empty if none active

**Usage**:
```sql
-- Get auto-applied promotion for eSIMs
SELECT * FROM get_active_promotion('esim', NULL);

-- Get promotion by code
SELECT * FROM get_active_promotion('esim', 'RAMADAN10');
```

### `has_active_promotion()`

Quick boolean check if any promotion is active.

**Parameters**:
- `p_applies_to`: Applicability filter (default: 'esim')
- `p_check_time`: Timestamp to check (default: NOW())

**Returns**: `true` if any promotion is active, `false` otherwise

**Usage**:
```sql
SELECT has_active_promotion('esim');
```

### `record_promotion_redemption()`

Records promotion redemption and updates count atomically.

**Parameters**:
- `p_promotion_id`: Promotion UUID
- `p_payment_intent_id`: Stripe payment intent ID
- `p_transaction_id`: Optional transaction ID
- `p_customer_email`: Optional customer email
- `p_discount_amount_cents`: Discount amount in cents
- `p_original_amount_cents`: Original amount in cents
- `p_discounted_amount_cents`: Final amount after discount

**Returns**: Redemption UUID

**Usage**:
```sql
SELECT record_promotion_redemption(
  'promo-uuid',
  'pi_123',
  'txn_456',
  'customer@example.com',
  1000,  -- $10 discount
  10000, -- $100 original
  9000   -- $90 final
);
```

## Indexes

### Performance-Optimized Indexes

1. **`idx_promotions_active_lookup`** - Fast lookup of active promotions
   - Covers: `is_active`, `starts_at`, `ends_at`, `priority`
   - Partial index (only active promotions)

2. **`idx_promotions_promo_code`** - Fast code lookup
   - Partial index (only non-NULL codes)

3. **`idx_promotions_time_range`** - Time-based queries
   - Covers: `starts_at`, `ends_at`

4. **`idx_promotions_active_priority`** - Priority-based selection
   - Composite index for `get_active_promotion()` function

## Usage Examples

### Create Auto-Applied Promotion (Ramadan)

```sql
INSERT INTO promotions (
  name,
  description,
  promo_code,  -- NULL = auto-applied
  discount_percent,
  starts_at,
  ends_at,
  applies_to,
  priority,
  created_by
) VALUES (
  'Ramadan 2025 Promo',
  '10% off all Umrah eSIMs during Ramadan',
  NULL,  -- Auto-applied, no code needed
  10,
  '2025-02-15 00:00:00+00',  -- 15 Sha'ban
  '2025-04-10 23:59:59+00',  -- End of Ramadan
  'esim',
  100,  -- High priority
  'admin'
);
```

### Create Code-Based Promotion

```sql
INSERT INTO promotions (
  name,
  promo_code,
  discount_percent,
  starts_at,
  ends_at,
  applies_to,
  max_redemptions,
  priority
) VALUES (
  'Early Bird Special',
  'EARLYBIRD20',
  20,
  '2025-01-01 00:00:00+00',
  '2025-03-31 23:59:59+00',
  'esim',
  1000,  -- Limited to 1000 redemptions
  50
);
```

### Query Active Promotion

```sql
-- Get current active promotion for eSIMs
SELECT * FROM get_active_promotion('esim', NULL);

-- Check if any promotion is active
SELECT has_active_promotion('esim');
```

### Record Redemption

```sql
SELECT record_promotion_redemption(
  (SELECT id FROM promotions WHERE promo_code = 'RAMADAN10'),
  'pi_stripe_123',
  'txn_456',
  'customer@example.com',
  500,   -- $5 discount
  5000,  -- $50 original
  4500   -- $45 final
);
```

## Integration with Existing Discount System

### Relationship to `discount_codes`

- **`discount_codes`**: Single-use, transaction-specific codes
- **`promotions`**: Time-bound, reusable promotional rules
- **Can coexist**: Both systems can work together
- **Priority**: Promotions take precedence (higher priority)

### Migration Path

1. Keep existing `discount_codes` for single-use codes
2. Use `promotions` for time-bound, reusable promos
3. Application logic checks promotions first, then discount codes

## Constraints & Validations

### Database Constraints

1. **Date range**: `ends_at > starts_at` (CHECK constraint)
2. **Discount range**: `discount_percent` between 1-90 (CHECK constraint)
3. **Unique promo code**: `promo_code` is UNIQUE (if not NULL)
4. **Unique redemption**: One redemption per payment intent
5. **Redemption limits**: `redeemed_count < max_redemptions` (enforced in function)

### Application-Level Validations

1. **Stacking prevention**: Only highest priority promotion is returned
2. **Time validation**: Only promotions within time range are considered
3. **Applicability**: Filtered by `applies_to` field

## Best Practices

### 1. Priority Assignment

- **Auto-applied promos**: High priority (100+)
- **Code-based promos**: Medium priority (50-99)
- **Special offers**: Low priority (1-49)

### 2. Time Ranges

- Always set `ends_at` to end of day (23:59:59)
- Use UTC timestamps for consistency
- Consider timezone for customer-facing displays

### 3. Redemption Limits

- Set `max_redemptions` for limited offers
- Monitor `redeemed_count` for analytics
- Use NULL for unlimited promotions

### 4. Active Status

- Use `is_active = false` to disable without deleting
- Preserves historical data and analytics
- Can be re-enabled easily

## Monitoring & Analytics

### Query Active Promotions

```sql
SELECT 
  name,
  promo_code,
  discount_percent,
  starts_at,
  ends_at,
  redeemed_count,
  max_redemptions,
  CASE 
    WHEN max_redemptions IS NULL THEN 'Unlimited'
    ELSE (max_redemptions - redeemed_count)::TEXT
  END AS remaining_redemptions
FROM promotions
WHERE is_active = true
  AND NOW() BETWEEN starts_at AND ends_at
ORDER BY priority DESC;
```

### Redemption Analytics

```sql
SELECT 
  p.name,
  COUNT(pr.id) as total_redemptions,
  SUM(pr.discount_amount_cents) / 100.0 as total_discount_dollars,
  AVG(pr.discount_amount_cents) / 100.0 as avg_discount_dollars
FROM promotions p
LEFT JOIN promotion_redemptions pr ON p.id = pr.promotion_id
WHERE p.starts_at >= NOW() - INTERVAL '30 days'
GROUP BY p.id, p.name
ORDER BY total_redemptions DESC;
```

## Security Considerations

1. **RLS Policies**: Add Row Level Security if needed (currently service-role bypasses)
2. **Admin Access**: Restrict promotion creation to admin users
3. **Audit Trail**: `created_by` and `updated_at` track changes
4. **Validation**: All constraints enforced at database level

## Migration Notes

- Safe to run on existing database (uses `IF NOT EXISTS`)
- No data loss (new tables only)
- Can coexist with existing `discount_codes` table
- Functions are idempotent (can be re-run safely)
