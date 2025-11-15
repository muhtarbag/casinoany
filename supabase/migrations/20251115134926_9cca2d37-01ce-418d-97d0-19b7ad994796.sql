-- Create global recommended sites pool table
CREATE TABLE IF NOT EXISTS public.recommended_sites_pool (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.betting_sites(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(site_id)
);

-- Enable RLS
ALTER TABLE public.recommended_sites_pool ENABLE ROW LEVEL SECURITY;

-- Admins can manage recommended sites pool
CREATE POLICY "Admins can manage recommended sites pool"
  ON public.recommended_sites_pool
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can view recommended sites
CREATE POLICY "Anyone can view recommended sites pool"
  ON public.recommended_sites_pool
  FOR SELECT
  USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_recommended_sites_pool_order 
  ON public.recommended_sites_pool(display_order);

-- Add comment
COMMENT ON TABLE public.recommended_sites_pool IS 'Global pool of recommended sites shown on all site detail pages';