-- =====================================================
-- Migration: Alış/Satış Bağımsız İşlem Tablosu
-- =====================================================
-- Bu script yeni 'transactions' tablosunu oluşturur
-- ve mevcut 'investments' tablosundaki verileri taşır.
-- Supabase SQL Editor'de çalıştırın.
-- =====================================================

-- 1. Yeni transactions tablosunu oluştur
CREATE TABLE IF NOT EXISTS transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('gram-altin', '22-ayar-bilezik', 'gumus', 'fiziksel-altin')),
  transaction_type text NOT NULL CHECK (transaction_type IN ('buy', 'sell')),
  amount numeric NOT NULL CHECK (amount > 0),
  unit_price numeric NOT NULL CHECK (unit_price > 0),
  date timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Mevcut aktif yatırımları 'buy' olarak taşı
INSERT INTO transactions (type, transaction_type, amount, unit_price, date)
SELECT type, 'buy', amount, purchase_price, purchase_date
FROM investments
WHERE status = 'active' OR status IS NULL;

-- 3. Satılmış yatırımların alış kaydını 'buy' olarak taşı
INSERT INTO transactions (type, transaction_type, amount, unit_price, date)
SELECT type, 'buy', amount, purchase_price, purchase_date
FROM investments
WHERE status = 'sold';

-- 4. Satılmış yatırımların satış kaydını 'sell' olarak taşı
INSERT INTO transactions (type, transaction_type, amount, unit_price, date)
SELECT type, 'sell', amount, selling_price, selling_date
FROM investments
WHERE status = 'sold' AND selling_price IS NOT NULL AND selling_date IS NOT NULL;

-- 5. RLS politikası (isteğe bağlı, mevcut yapınıza göre ayarlayın)
-- ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all" ON transactions FOR ALL USING (true) WITH CHECK (true);
