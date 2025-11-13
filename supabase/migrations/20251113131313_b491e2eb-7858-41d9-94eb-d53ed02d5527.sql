-- Blog yazıları tablosu
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  read_time INTEGER, -- dakika cinsinden okuma süresi
  category TEXT,
  tags TEXT[],
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Blog kategorileri tablosu
CREATE TABLE public.blog_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index'ler
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON public.blog_posts(is_published, published_at DESC);
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category);
CREATE INDEX idx_blog_posts_tags ON public.blog_posts USING GIN(tags);

-- RLS politikaları
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

-- Herkes yayınlanmış blog yazılarını görebilir
CREATE POLICY "Anyone can view published posts"
ON public.blog_posts
FOR SELECT
USING (is_published = true);

-- Adminler tüm blog yazılarını görebilir
CREATE POLICY "Admins can view all posts"
ON public.blog_posts
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Adminler blog yazısı ekleyebilir
CREATE POLICY "Admins can insert posts"
ON public.blog_posts
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Adminler blog yazısı güncelleyebilir
CREATE POLICY "Admins can update posts"
ON public.blog_posts
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Adminler blog yazısı silebilir
CREATE POLICY "Admins can delete posts"
ON public.blog_posts
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Herkes kategorileri görebilir
CREATE POLICY "Anyone can view categories"
ON public.blog_categories
FOR SELECT
USING (true);

-- Adminler kategori yönetimi yapabilir
CREATE POLICY "Admins can manage categories"
ON public.blog_categories
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger ile updated_at otomatik güncellemesi
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- View count artırma fonksiyonu
CREATE OR REPLACE FUNCTION public.increment_blog_view_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.blog_posts
  SET view_count = view_count + 1
  WHERE id = post_id;
END;
$$;