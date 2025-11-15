-- ========================================
-- ADIM 1: KATEGORİLER SİSTEMİ - DATABASE MIGRATION
-- ========================================

-- 1. Kategoriler Tablosu
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  meta_title TEXT,
  meta_description TEXT,
  icon TEXT DEFAULT 'folder',
  color TEXT DEFAULT '#3b82f6',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Site-Kategori İlişki Tablosu (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.site_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.betting_sites(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(site_id, category_id)
);

-- 3. Blog Posts'a Category İlişkisi Ekle
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- 4. Updated_at Trigger
CREATE OR REPLACE FUNCTION public.update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_categories_updated_at();

-- 5. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON public.categories(display_order);
CREATE INDEX IF NOT EXISTS idx_site_categories_site_id ON public.site_categories(site_id);
CREATE INDEX IF NOT EXISTS idx_site_categories_category_id ON public.site_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id ON public.blog_posts(category_id);

-- 6. RLS Policies - Categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories"
ON public.categories
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage categories"
ON public.categories
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 7. RLS Policies - Site Categories
ALTER TABLE public.site_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site categories"
ON public.site_categories
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage site categories"
ON public.site_categories
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 8. Başlangıç Verileri (Örnek Kategoriler)
INSERT INTO public.categories (name, slug, description, icon, color, display_order) VALUES
('Deneme Bonusu Veren Siteler', 'deneme-bonusu', 'Ücretsiz deneme bonusu kampanyaları sunan bahis siteleri', 'gift', '#10b981', 1),
('Free Spin & Free Bet', 'free-spin', 'Bedava çevirme ve ücretsiz bahis fırsatları', 'zap', '#8b5cf6', 2),
('Spor Bahisleri', 'spor-bahisleri', 'En iyi spor bahis siteleri ve canlı bahis seçenekleri', 'trophy', '#f59e0b', 3),
('Kripto Siteler', 'kripto-siteler', 'Kripto para ile işlem yapabileceğiniz bahis platformları', 'bitcoin', '#06b6d4', 4),
('En İyi Casino Siteleri', 'en-iyi-casino', 'Güvenilir ve kaliteli casino oyun siteleri', 'sparkles', '#ec4899', 5)
ON CONFLICT (slug) DO NOTHING;