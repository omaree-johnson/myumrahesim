# Supabase Schema Setup Guide

This guide will help you set up the complete Supabase database schema for the My Umrah eSIM application.

## Quick Start

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor**

2. **Run the Schema Script**
   - Open the file `supabase/COMPLETE_SCHEMA_SETUP.sql`
   - Copy the **entire contents** (Ctrl+A, Ctrl+C)
   - Paste into the Supabase SQL Editor
   - Click **Run** to execute

3. **Verify Setup**
   - Go to **Table Editor** in Supabase Dashboard
   - You should see all tables listed below

## Database Tables

### Core Tables

#### `customers`
- Stores user account information
- Links Clerk authentication with customer records
- **Key Fields**: `id` (UUID), `email`, `clerk_user_id`

#### `esim_purchases`
- **Primary purchase table** - stores all eSIM purchase data
- Links to customers via `user_id` or `customer_email`
- **Key Fields**: `transaction_id`, `customer_email`, `price`, `esim_provider_status`
- **Status Values**: `PENDING`, `PROCESSING`, `GOT_RESOURCE`, `IN_USE`, `FAILED`, etc.

#### `purchases`
- Legacy table (kept for backward compatibility)
- Not actively used in new code

#### `activation_details`
- Stores QR codes, SM-DP+ addresses, ICCID, activation codes
- Links to purchases via `transaction_id`
- **Key Fields**: `transaction_id`, `iccid`, `smdp_address`, `activation_code`, `qr_code`

### Tracking & Audit Tables

#### `webhook_events`
- Logs all incoming webhooks (Stripe, eSIM Access)
- Tracks processing status and errors

#### `payment_actions`
- Tracks payment lifecycle events
- Records payment intent status changes

#### `esim_actions`
- Tracks eSIM provider API calls
- Records order creation, activation, etc.

#### `email_events`
- Logs all email sends
- Tracks delivery status, opens, clicks

### Top-Up Tables

#### `esim_topups`
- Stores top-up orders for existing eSIMs
- Links to original purchase via `iccid`

### Marketing & Engagement Tables

#### `discount_codes`
- Stores discount code definitions
- Single-use codes with expiration

#### `discount_reservations`
- Prevents double-spend during checkout
- Temporary reservations for discount codes

#### `discount_redemptions`
- Tracks actual discount code usage
- Historical record of redemptions

#### `usage_alerts`
- Tracks low data/expiration alerts sent to customers
- Prevents duplicate alerts

#### `cart_sessions`
- Tracks abandoned carts
- Enables cart restoration and reminder emails

#### `reviews`
- Customer reviews with moderation support
- One review per transaction per user

### Optional Tables

#### `issuing_cards`
- Stripe Issuing cards (currently not used)
- Reserved for future features

## Database Views

The schema includes helpful views for common queries:

- **`purchase_details`** - Combines `esim_purchases` with `activation_details`
- **`payment_actions_summary`** - Payment lifecycle summary
- **`esim_actions_timeline`** - eSIM provider action timeline
- **`email_delivery_status`** - Email delivery tracking

## Features

### Automatic Timestamps
- All tables with `updated_at` automatically update on row changes
- Uses PostgreSQL triggers

### Indexes
- Comprehensive indexing for fast queries
- Indexes on foreign keys, status fields, and frequently queried columns

### Row Level Security (RLS)
- RLS is enabled on all tables
- No policies are created (application uses service role key)
- Server-side operations bypass RLS via service role

### Idempotent Script
- Safe to run multiple times
- Uses `IF NOT EXISTS` checks
- Won't create duplicates or cause errors

## Environment Variables Required

After setting up the schema, ensure these environment variables are set in your `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Verification Checklist

After running the schema script, verify:

- [ ] All tables appear in Supabase Table Editor
- [ ] Indexes are created (check in Database > Indexes)
- [ ] Triggers are active (check in Database > Triggers)
- [ ] Views are accessible (check in Database > Views)
- [ ] RLS is enabled (check table settings)

## Common Issues

### Issue: "relation already exists"
- **Solution**: The script is idempotent - this is normal. The script will skip existing objects.

### Issue: "permission denied"
- **Solution**: Ensure you're using the SQL Editor with proper permissions, or run as database owner.

### Issue: Tables not appearing
- **Solution**: Refresh the Supabase dashboard. Tables should appear within a few seconds.

## Schema Updates

If you need to update the schema later:

1. The script uses `IF NOT EXISTS` checks
2. New columns are added with `ADD COLUMN IF NOT EXISTS`
3. Safe to re-run the entire script
4. Existing data will not be affected

## Support

If you encounter issues:

1. Check Supabase logs in Dashboard > Logs
2. Verify environment variables are set correctly
3. Ensure Supabase project is active
4. Check that you have proper database permissions

---

**Last Updated**: January 25, 2026
**Schema Version**: Complete (all migrations consolidated)
