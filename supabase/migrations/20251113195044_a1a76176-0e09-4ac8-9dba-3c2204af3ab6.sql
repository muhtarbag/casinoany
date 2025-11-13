-- Casino blokları için görsel özelleştirme alanları
ALTER TABLE public.betting_sites
ADD COLUMN IF NOT EXISTS block_styles jsonb DEFAULT '{
  "verdict": {"icon": "shield", "color": "#3b82f6"},
  "expertReview": {"icon": "fileText", "color": "#8b5cf6"},
  "gameOverview": {"icon": "gamepad", "color": "#10b981"},
  "loginGuide": {"icon": "login", "color": "#f59e0b"},
  "withdrawalGuide": {"icon": "wallet", "color": "#06b6d4"},
  "faq": {"icon": "help", "color": "#ec4899"}
}'::jsonb;

COMMENT ON COLUMN betting_sites.block_styles IS 'Casino içerik bloklarının görsel özelleştirme ayarları (ikon ve renk)';