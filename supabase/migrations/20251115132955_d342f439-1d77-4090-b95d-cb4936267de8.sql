-- Create table for managing recommended sites relationships
CREATE TABLE IF NOT EXISTS public.site_recommended_sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.betting_sites(id) ON DELETE CASCADE,
  recommended_site_id UUID NOT NULL REFERENCES public.betting_sites(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT site_recommended_sites_unique UNIQUE(site_id, recommended_site_id),
  CONSTRAINT site_recommended_sites_no_self_reference CHECK (site_id != recommended_site_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_recommended_sites_site_id ON public.site_recommended_sites(site_id);
CREATE INDEX IF NOT EXISTS idx_site_recommended_sites_recommended_site_id ON public.site_recommended_sites(recommended_site_id);

-- Enable RLS
ALTER TABLE public.site_recommended_sites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view recommended sites"
  ON public.site_recommended_sites
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage recommended sites"
  ON public.site_recommended_sites
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_site_recommended_sites_updated_at
  BEFORE UPDATE ON public.site_recommended_sites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.site_recommended_sites IS 'Admin-managed recommended sites for each betting site';