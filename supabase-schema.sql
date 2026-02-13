-- Solflo Database Schema
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/YOUR_PROJECT/sql)

-- Payment Links table
CREATE TABLE IF NOT EXISTS payment_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_wallet TEXT NOT NULL,
  amount DECIMAL(20, 9) NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('SOL', 'USDC')),
  title TEXT NOT NULL,
  description TEXT,
  single_use BOOLEAN DEFAULT FALSE,
  private_payment BOOLEAN DEFAULT FALSE,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID NOT NULL REFERENCES payment_links(id) ON DELETE CASCADE,
  payer_wallet TEXT NOT NULL,
  amount DECIMAL(20, 9) NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('SOL', 'USDC')),
  signature TEXT NOT NULL,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_payment_links_merchant ON payment_links(merchant_wallet);
CREATE INDEX IF NOT EXISTS idx_payments_link_id ON payments(link_id);

-- Enable Row Level Security
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for updates)
DROP POLICY IF EXISTS "Payment links are viewable by everyone" ON payment_links;
DROP POLICY IF EXISTS "Anyone can create payment links" ON payment_links;
DROP POLICY IF EXISTS "Merchants can update own links" ON payment_links;
DROP POLICY IF EXISTS "Merchants can delete own links" ON payment_links;
DROP POLICY IF EXISTS "Payments are viewable by everyone" ON payments;
DROP POLICY IF EXISTS "Anyone can record payments" ON payments;

-- Policies
CREATE POLICY "Payment links are viewable by everyone" ON payment_links FOR SELECT USING (true);
CREATE POLICY "Anyone can create payment links" ON payment_links FOR INSERT WITH CHECK (true);
CREATE POLICY "Merchants can update own links" ON payment_links FOR UPDATE USING (true);
CREATE POLICY "Merchants can delete own links" ON payment_links FOR DELETE USING (true);
CREATE POLICY "Payments are viewable by everyone" ON payments FOR SELECT USING (true);
CREATE POLICY "Anyone can record payments" ON payments FOR INSERT WITH CHECK (true);

-- Migration: Add new columns if table already exists
ALTER TABLE payment_links ADD COLUMN IF NOT EXISTS private_payment BOOLEAN DEFAULT FALSE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE;
-- Remove unique constraint on signature for private payments (can have multiple with same placeholder)
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_signature_key;
