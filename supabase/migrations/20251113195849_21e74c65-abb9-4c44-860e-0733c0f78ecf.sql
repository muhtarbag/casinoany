-- Create casino content versions table
CREATE TABLE IF NOT EXISTS public.casino_content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.betting_sites(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  generation_source TEXT NOT NULL DEFAULT 'manual',
  pros TEXT[],
  cons TEXT[],
  verdict TEXT,
  expert_review TEXT,
  game_categories JSONB,
  login_guide TEXT,
  withdrawal_guide TEXT,
  faq JSONB,
  block_styles JSONB,
  metadata JSONB
);

-- Enable RLS
ALTER TABLE public.casino_content_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage content versions"
  ON public.casino_content_versions
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Index for faster queries
CREATE INDEX idx_casino_versions_site_created 
  ON public.casino_content_versions(site_id, created_at DESC);