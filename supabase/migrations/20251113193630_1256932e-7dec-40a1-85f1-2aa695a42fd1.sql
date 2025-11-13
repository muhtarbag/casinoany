-- Casino detay sayfası için ek alanlar
ALTER TABLE public.betting_sites
ADD COLUMN IF NOT EXISTS pros text[],
ADD COLUMN IF NOT EXISTS cons text[],
ADD COLUMN IF NOT EXISTS verdict text,
ADD COLUMN IF NOT EXISTS expert_review text,
ADD COLUMN IF NOT EXISTS game_categories jsonb,
ADD COLUMN IF NOT EXISTS login_guide text,
ADD COLUMN IF NOT EXISTS withdrawal_guide text,
ADD COLUMN IF NOT EXISTS faq jsonb;

-- Örnek veri yapısı açıklamaları:
-- pros: ['Hızlı para çekme', 'Geniş oyun seçeneği', '7/24 destek']
-- cons: ['Yüksek bahis şartları', 'Mobil uygulama yok']
-- verdict: Rich text HTML
-- expert_review: Rich text HTML
-- game_categories: {"slot": "500+ slot oyunu", "canlı": "50+ canlı masa oyunu", "spor": "40+ spor dalı"}
-- login_guide: Rich text HTML
-- withdrawal_guide: Rich text HTML
-- faq: [{"question": "Minimum çekim tutarı?", "answer": "100 TL"}]