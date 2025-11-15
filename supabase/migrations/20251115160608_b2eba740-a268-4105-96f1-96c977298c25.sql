-- Alternative domains management for TIB/BTK protection
CREATE TABLE IF NOT EXISTS public.alternative_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL UNIQUE,
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ready', -- ready, active, blocked, offline
  last_checked_at TIMESTAMP WITH TIME ZONE,
  blocked_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for faster queries
CREATE INDEX idx_alternative_domains_status ON public.alternative_domains(status, is_active);
CREATE INDEX idx_alternative_domains_priority ON public.alternative_domains(priority DESC);

-- RLS Policies
ALTER TABLE public.alternative_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage alternative domains"
  ON public.alternative_domains
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view active domains"
  ON public.alternative_domains
  FOR SELECT
  USING (is_active = true);

-- Function to get primary domain
CREATE OR REPLACE FUNCTION public.get_primary_domain()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT domain 
  FROM public.alternative_domains 
  WHERE is_primary = true 
    AND is_active = true 
    AND status = 'active'
  LIMIT 1;
$$;

-- Function to get next available domain
CREATE OR REPLACE FUNCTION public.get_next_available_domain()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT domain 
  FROM public.alternative_domains 
  WHERE is_active = true 
    AND status IN ('active', 'ready')
    AND is_primary = false
  ORDER BY priority DESC, created_at ASC
  LIMIT 1;
$$;

-- Trigger for updated_at
CREATE TRIGGER update_alternative_domains_updated_at
  BEFORE UPDATE ON public.alternative_domains
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default primary domain
INSERT INTO public.alternative_domains (domain, is_primary, status, priority, notes)
VALUES ('www.casinoany.com', true, 'active', 100, 'Primary domain')
ON CONFLICT (domain) DO NOTHING;