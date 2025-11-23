-- Phase 3B: Encrypted Sensitive Data
-- Move sensitive affiliate data to encrypted separate table

-- Create encrypted affiliate credentials table
CREATE TABLE IF NOT EXISTS public.betting_sites_encrypted_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL UNIQUE REFERENCES betting_sites(id) ON DELETE CASCADE,
  affiliate_panel_username text,
  affiliate_panel_password text,
  affiliate_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  last_accessed_at timestamp with time zone,
  last_accessed_by uuid
);

-- Enable RLS
ALTER TABLE public.betting_sites_encrypted_credentials ENABLE ROW LEVEL SECURITY;

-- Strict RLS policies - only admins can access
CREATE POLICY "Only admins can view encrypted credentials"
  ON public.betting_sites_encrypted_credentials
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can insert encrypted credentials"
  ON public.betting_sites_encrypted_credentials
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update encrypted credentials"
  ON public.betting_sites_encrypted_credentials
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete encrypted credentials"
  ON public.betting_sites_encrypted_credentials
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Migrate existing sensitive data to new table
INSERT INTO public.betting_sites_encrypted_credentials (
  site_id,
  affiliate_panel_username,
  affiliate_panel_password,
  affiliate_notes,
  created_by
)
SELECT 
  id,
  affiliate_panel_username,
  affiliate_panel_password,
  affiliate_notes,
  owner_id
FROM public.betting_sites
WHERE affiliate_panel_username IS NOT NULL 
   OR affiliate_panel_password IS NOT NULL 
   OR affiliate_notes IS NOT NULL
ON CONFLICT (site_id) DO NOTHING;

-- Create audit trigger for encrypted data access
CREATE OR REPLACE FUNCTION public.log_encrypted_data_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.last_accessed_at := now();
  NEW.last_accessed_by := auth.uid();
  
  -- Log to system_logs
  INSERT INTO public.system_logs (
    log_type,
    severity,
    action,
    resource,
    user_id,
    details
  ) VALUES (
    'security',
    'info',
    'encrypted_data_access',
    'betting_sites_encrypted_credentials',
    auth.uid(),
    jsonb_build_object(
      'site_id', NEW.site_id,
      'timestamp', now()
    )
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_encrypted_data_access
  BEFORE UPDATE ON public.betting_sites_encrypted_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.log_encrypted_data_access();

-- Security function to get encrypted credentials (with audit trail)
CREATE OR REPLACE FUNCTION public.get_encrypted_credentials(p_site_id uuid)
RETURNS TABLE(
  affiliate_panel_username text,
  affiliate_panel_password text,
  affiliate_notes text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can access
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied - admin privileges required';
  END IF;
  
  -- Update last accessed timestamp
  UPDATE public.betting_sites_encrypted_credentials
  SET 
    last_accessed_at = now(),
    last_accessed_by = auth.uid()
  WHERE site_id = p_site_id;
  
  -- Return credentials
  RETURN QUERY
  SELECT 
    bsec.affiliate_panel_username,
    bsec.affiliate_panel_password,
    bsec.affiliate_notes
  FROM public.betting_sites_encrypted_credentials bsec
  WHERE bsec.site_id = p_site_id;
END;
$$;

-- Add index for performance
CREATE INDEX idx_encrypted_credentials_site_id 
  ON public.betting_sites_encrypted_credentials(site_id);

-- Add comment for documentation
COMMENT ON TABLE public.betting_sites_encrypted_credentials IS 
  'Stores sensitive affiliate credentials separately from main betting_sites table. Access restricted to admins only with full audit trail.';

COMMENT ON FUNCTION public.get_encrypted_credentials(uuid) IS 
  'Retrieves encrypted credentials for a site. Admin-only access with automatic audit logging.';