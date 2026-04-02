-- =====================================================
-- Temiz Kurulum: ytrm_transactions tablosu
-- =====================================================
-- Supabase SQL Editor'de çalıştırın.
-- =====================================================

CREATE TABLE IF NOT EXISTS ytrm_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('gram-altin', '22-ayar-bilezik', 'gumus', 'fiziksel-altin')),
  transaction_type text NOT NULL CHECK (transaction_type IN ('buy', 'sell')),
  amount numeric NOT NULL CHECK (amount > 0),
  unit_price numeric NOT NULL CHECK (unit_price > 0),
  date timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS (Row Level Security) - herkese açık erişim
ALTER TABLE ytrm_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" ON ytrm_transactions
  FOR ALL
  USING (true)
  WITH CHECK (true);
