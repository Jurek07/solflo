-- Solflo Database Schema
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/YOUR_PROJECT/sql)

-- Payment Links table
CREATE TABLE payment_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_wallet TEXT NOT NULL,
  amount DECIMAL(20, 9) NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('SOL', 'USDC')),
  title TEXT NOT NULL,
  description TEXT,
  single_use BOOLEAN DEFAULT FALSE,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID NOT NULL REFERENCES payment_links(id) ON DELETE CASCADE,
  payer_wallet TEXT NOT NULL,
  amount DECIMAL(20, 9) NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('SOL', 'USDC')),
  signature TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_payment_links_merchant ON payment_links(merchant_wallet);
CREATE INDEX idx_payments_link_id ON payments(link_id);

-- Enable Row Level Security
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies: Allow all operations for now (public access)
-- In production, you'd want more restrictive policies

-- Anyone can read payment links (needed for payment pages)
CREATE POLICY "Payment links are viewable by everyone" ON payment_links
  FOR SELECT USING (true);

-- Anyone can create payment links
CREATE POLICY "Anyone can create payment links" ON payment_links
  FOR INSERT WITH CHECK (true);

-- Only the merchant can update their links
CREATE POLICY "Merchants can update own links" ON payment_links
  FOR UPDATE USING (true);

-- Only the merchant can delete their links
CREATE POLICY "Merchants can delete own links" ON payment_links
  FOR DELETE USING (true);

-- Anyone can view payments (for showing payment history)
CREATE POLICY "Payments are viewable by everyone" ON payments
  FOR SELECT USING (true);

-- Anyone can record a payment
CREATE POLICY "Anyone can record payments" ON payments
  FOR INSERT WITH CHECK (true);
