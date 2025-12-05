-- Migration: Add customer_email and customer_name to esim_purchases table
-- This allows the eSIM Access webhook to send activation emails

-- Add customer email and name columns to esim_purchases table
ALTER TABLE esim_purchases 
ADD COLUMN IF NOT EXISTS customer_email text,
ADD COLUMN IF NOT EXISTS customer_name text;

-- Create index on customer_email for faster lookups
CREATE INDEX IF NOT EXISTS idx_esim_purchases_customer_email ON esim_purchases(customer_email);

