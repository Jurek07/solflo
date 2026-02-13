-- Admin Stats Schema
-- This creates a separate table that persists transaction totals even when links are deleted

-- Transaction log table (never deleted, used for admin stats)
CREATE TABLE IF NOT EXISTS transaction_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID, -- Can be NULL if link was deleted
  merchant_wallet TEXT NOT NULL,
  payer_wallet TEXT NOT NULL,
  amount DECIMAL(20, 9) NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('SOL', 'USDC')),
  signature TEXT NOT NULL,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for admin queries
CREATE INDEX IF NOT EXISTS idx_transaction_log_created ON transaction_log(created_at);
CREATE INDEX IF NOT EXISTS idx_transaction_log_currency ON transaction_log(currency);

-- Enable RLS but allow anyone to insert (payments) and only admin to read
ALTER TABLE transaction_log ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (when payment is made)
CREATE POLICY "Anyone can log transactions" ON transaction_log FOR INSERT WITH CHECK (true);

-- Only service role can read (for admin dashboard) - use Supabase dashboard or API with service key
CREATE POLICY "Service role can read all" ON transaction_log FOR SELECT USING (auth.role() = 'service_role');

-- Admin stats view (run with service role)
CREATE OR REPLACE VIEW admin_stats AS
SELECT 
  currency,
  COUNT(*) as total_transactions,
  SUM(amount) as total_volume,
  COUNT(DISTINCT merchant_wallet) as unique_merchants,
  COUNT(DISTINCT CASE WHEN payer_wallet != 'private' THEN payer_wallet END) as unique_payers,
  MIN(created_at) as first_transaction,
  MAX(created_at) as last_transaction
FROM transaction_log
GROUP BY currency;

-- Daily stats view
CREATE OR REPLACE VIEW daily_stats AS
SELECT 
  DATE(created_at) as date,
  currency,
  COUNT(*) as transactions,
  SUM(amount) as volume
FROM transaction_log
GROUP BY DATE(created_at), currency
ORDER BY date DESC;
