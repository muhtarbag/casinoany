-- Add is_featured column to betting_sites table
ALTER TABLE public.betting_sites 
ADD COLUMN is_featured boolean DEFAULT false;

-- Create index for better performance
CREATE INDEX idx_betting_sites_featured ON public.betting_sites(is_featured) WHERE is_featured = true;

COMMENT ON COLUMN public.betting_sites.is_featured IS 'Marks sites as featured for homepage display';