-- Create footer_links table for dynamic footer navigation management
CREATE TABLE IF NOT EXISTS public.footer_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  section TEXT DEFAULT 'categories',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.footer_links ENABLE ROW LEVEL SECURITY;

-- Everyone can read active footer links
CREATE POLICY "Anyone can view active footer links"
  ON public.footer_links
  FOR SELECT
  USING (is_active = true);

-- Only admins can manage footer links
CREATE POLICY "Admins can manage footer links"
  ON public.footer_links
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
        AND status = 'approved'
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_footer_links_updated_at
  BEFORE UPDATE ON public.footer_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_categories_updated_at();

-- Insert default footer links
INSERT INTO public.footer_links (title, url, icon, display_order, section) VALUES
  ('🎰 Casino Siteleri', '/casino-siteleri', '🎰', 1, 'categories'),
  ('⚽ Spor Bahisleri', '/spor-bahisleri', '⚽', 2, 'categories'),
  ('🎁 Bonus Kampanyaları', '/bonus-kampanyalari', '🎁', 3, 'categories'),
  ('📱 Mobil Bahis', '/mobil-bahis', '📱', 4, 'categories'),
  ('🎮 Canlı Casino', '/canli-casino', '🎮', 5, 'categories'),
  ('🎲 Oyun Sağlayıcıları', '/oyun-saglayicilari', '🎲', 6, 'categories');

-- Add index for performance
CREATE INDEX idx_footer_links_section_order ON public.footer_links(section, display_order) WHERE is_active = true;

COMMENT ON TABLE public.footer_links IS 'Dynamic footer navigation links managed from admin panel';
COMMENT ON COLUMN public.footer_links.section IS 'Section of footer: categories, quick_links, etc';
COMMENT ON COLUMN public.footer_links.icon IS 'Icon/emoji for the link';