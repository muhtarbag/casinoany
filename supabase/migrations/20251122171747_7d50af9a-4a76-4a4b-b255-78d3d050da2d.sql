-- Add whitelist columns to domain_tracking
ALTER TABLE public.domain_tracking
ADD COLUMN is_whitelisted BOOLEAN DEFAULT false,
ADD COLUMN whitelisted_by UUID REFERENCES auth.users(id),
ADD COLUMN whitelisted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN whitelist_reason TEXT;

-- Create index for better query performance
CREATE INDEX idx_domain_tracking_whitelisted ON public.domain_tracking(is_whitelisted) WHERE is_whitelisted = true;

-- Update the categorization: whitelisted domains should be safe
COMMENT ON COLUMN public.domain_tracking.is_whitelisted IS 'If true, this domain is whitelisted and considered safe';
COMMENT ON COLUMN public.domain_tracking.whitelisted_by IS 'Admin user who whitelisted this domain';
COMMENT ON COLUMN public.domain_tracking.whitelisted_at IS 'When the domain was whitelisted';
COMMENT ON COLUMN public.domain_tracking.whitelist_reason IS 'Reason for whitelisting this domain';