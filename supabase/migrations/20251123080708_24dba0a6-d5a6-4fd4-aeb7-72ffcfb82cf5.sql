-- Add bonus category and description fields
ALTER TABLE bonus_offers
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'all' CHECK (category IN ('casino', 'spor', 'all')),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS min_deposit TEXT,
ADD COLUMN IF NOT EXISTS max_bonus TEXT,
ADD COLUMN IF NOT EXISTS bonus_code TEXT,
ADD COLUMN IF NOT EXISTS claim_url TEXT;

-- Add comment
COMMENT ON COLUMN bonus_offers.category IS 'Bonus kategorisi: casino, spor veya all';
COMMENT ON COLUMN bonus_offers.description IS 'Bonus detaylı açıklaması';
COMMENT ON COLUMN bonus_offers.min_deposit IS 'Minimum yatırım tutarı';
COMMENT ON COLUMN bonus_offers.max_bonus IS 'Maksimum bonus tutarı';
COMMENT ON COLUMN bonus_offers.bonus_code IS 'Bonus kodu (varsa)';
COMMENT ON COLUMN bonus_offers.claim_url IS 'Bonus talep etme URL (external link)';
