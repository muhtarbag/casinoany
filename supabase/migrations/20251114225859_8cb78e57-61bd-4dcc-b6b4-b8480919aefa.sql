-- Create banners table for dynamic banner management
CREATE TABLE public.site_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  target_url TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  display_pages TEXT[] DEFAULT ARRAY['home'],
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  alt_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_banners ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active banners"
  ON public.site_banners
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage banners"
  ON public.site_banners
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for performance
CREATE INDEX idx_site_banners_position ON public.site_banners(position, display_order);
CREATE INDEX idx_site_banners_active ON public.site_banners(is_active);

-- Add trigger for updated_at
CREATE TRIGGER update_site_banners_updated_at
  BEFORE UPDATE ON public.site_banners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();