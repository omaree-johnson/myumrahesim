-- Migration: Add eSIM Access fields to purchases and esim_purchases tables
-- This migration adds support for eSIM Access API integration

-- Add eSIM Access fields to purchases table
ALTER TABLE purchases 
ADD COLUMN IF NOT EXISTS order_no text,
ADD COLUMN IF NOT EXISTS esimaccess_response jsonb,
ADD COLUMN IF NOT EXISTS esimaccess_status text,
ADD COLUMN IF NOT EXISTS esimaccess_cost integer;

-- Add eSIM Access fields to esim_purchases table
ALTER TABLE esim_purchases 
ADD COLUMN IF NOT EXISTS order_no text,
ADD COLUMN IF NOT EXISTS esimaccess_response jsonb,
ADD COLUMN IF NOT EXISTS esimaccess_status text,
ADD COLUMN IF NOT EXISTS esimaccess_cost integer;

-- Create index on order_no for faster lookups
CREATE INDEX IF NOT EXISTS idx_purchases_order_no ON purchases(order_no);
CREATE INDEX IF NOT EXISTS idx_esim_purchases_order_no ON esim_purchases(order_no);
CREATE INDEX IF NOT EXISTS idx_purchases_esimaccess_status ON purchases(esimaccess_status);
CREATE INDEX IF NOT EXISTS idx_esim_purchases_esimaccess_status ON esim_purchases(esimaccess_status);

