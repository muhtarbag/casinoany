-- Create bonus_offers table
CREATE TABLE IF NOT EXISTS public.bonus_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES public.betting_sites(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  bonus_amount TEXT NOT NULL,
  bonus_type TEXT NOT NULL DEFAULT 'no_deposit',
  wagering_requirement TEXT,
  terms TEXT,
  eligibility TEXT,
  validity_period TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bonus_offers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active bonus offers"
  ON public.bonus_offers FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage bonus offers"
  ON public.bonus_offers FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index
CREATE INDEX idx_bonus_offers_site_id ON public.bonus_offers(site_id);
CREATE INDEX idx_bonus_offers_display_order ON public.bonus_offers(display_order);

-- Create trigger for updated_at
CREATE TRIGGER update_bonus_offers_updated_at
  BEFORE UPDATE ON public.bonus_offers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();