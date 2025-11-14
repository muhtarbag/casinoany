-- Add affiliate contract management columns to betting_sites table
ALTER TABLE public.betting_sites
ADD COLUMN affiliate_contract_date date,
ADD COLUMN affiliate_contract_terms text,
ADD COLUMN affiliate_has_monthly_payment boolean DEFAULT false,
ADD COLUMN affiliate_monthly_payment numeric(10,2),
ADD COLUMN affiliate_panel_url text,
ADD COLUMN affiliate_panel_username text,
ADD COLUMN affiliate_panel_password text,
ADD COLUMN affiliate_notes text;

COMMENT ON COLUMN public.betting_sites.affiliate_contract_date IS 'Affiliate anlaşma tarihi';
COMMENT ON COLUMN public.betting_sites.affiliate_contract_terms IS 'Anlaşma şartları ve detayları';
COMMENT ON COLUMN public.betting_sites.affiliate_has_monthly_payment IS 'Aylık sabit ödeme var mı?';
COMMENT ON COLUMN public.betting_sites.affiliate_monthly_payment IS 'Aylık ödeme tutarı (TL)';
COMMENT ON COLUMN public.betting_sites.affiliate_panel_url IS 'Affiliate panel linki';
COMMENT ON COLUMN public.betting_sites.affiliate_panel_username IS 'Panel kullanıcı adı';
COMMENT ON COLUMN public.betting_sites.affiliate_panel_password IS 'Panel şifresi';
COMMENT ON COLUMN public.betting_sites.affiliate_notes IS 'Ek notlar ve detaylar';