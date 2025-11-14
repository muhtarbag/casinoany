-- Create affiliate payments history table
CREATE TABLE IF NOT EXISTS public.affiliate_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES public.betting_sites(id) ON DELETE CASCADE,
  payment_date date NOT NULL,
  payment_amount numeric(10,2) NOT NULL,
  payment_type text NOT NULL DEFAULT 'monthly', -- monthly, commission, bonus
  payment_status text NOT NULL DEFAULT 'pending', -- pending, completed, cancelled
  commission_percentage numeric(5,2),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_affiliate_payments_site_id ON public.affiliate_payments(site_id);
CREATE INDEX idx_affiliate_payments_payment_date ON public.affiliate_payments(payment_date);
CREATE INDEX idx_affiliate_payments_status ON public.affiliate_payments(payment_status);

-- Enable RLS
ALTER TABLE public.affiliate_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage affiliate payments"
  ON public.affiliate_payments
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add commission percentage to betting_sites
ALTER TABLE public.betting_sites
ADD COLUMN IF NOT EXISTS affiliate_commission_percentage numeric(5,2);

-- Create affiliate metrics tracking table (separate from casino_content_analytics)
CREATE TABLE IF NOT EXISTS public.affiliate_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES public.betting_sites(id) ON DELETE CASCADE,
  metric_date date NOT NULL DEFAULT CURRENT_DATE,
  total_clicks integer NOT NULL DEFAULT 0,
  total_views integer NOT NULL DEFAULT 0,
  total_conversions integer NOT NULL DEFAULT 0,
  estimated_revenue numeric(10,2) DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(site_id, metric_date)
);

-- Add indexes
CREATE INDEX idx_affiliate_metrics_site_id ON public.affiliate_metrics(site_id);
CREATE INDEX idx_affiliate_metrics_date ON public.affiliate_metrics(metric_date);

-- Enable RLS
ALTER TABLE public.affiliate_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage affiliate metrics"
  ON public.affiliate_metrics
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can insert affiliate metrics"
  ON public.affiliate_metrics
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update affiliate metrics"
  ON public.affiliate_metrics
  FOR UPDATE
  USING (true);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_affiliate_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_affiliate_payments_updated_at
  BEFORE UPDATE ON public.affiliate_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_updated_at();

CREATE TRIGGER update_affiliate_metrics_updated_at
  BEFORE UPDATE ON public.affiliate_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_updated_at();

COMMENT ON TABLE public.affiliate_payments IS 'Affiliate ödeme geçmişi ve tahsilatlar';
COMMENT ON TABLE public.affiliate_metrics IS 'Affiliate performans metrikleri (günlük)';
COMMENT ON COLUMN public.betting_sites.affiliate_commission_percentage IS 'Affiliate komisyon yüzdesi (%)';