-- Add missing social media columns to betting_sites table
ALTER TABLE public.betting_sites
ADD COLUMN IF NOT EXISTS linkedin TEXT,
ADD COLUMN IF NOT EXISTS telegram_channel TEXT,
ADD COLUMN IF NOT EXISTS kick TEXT,
ADD COLUMN IF NOT EXISTS discord TEXT,
ADD COLUMN IF NOT EXISTS pinterest TEXT;