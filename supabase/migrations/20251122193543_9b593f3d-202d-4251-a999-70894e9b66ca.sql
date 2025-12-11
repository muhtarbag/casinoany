-- Function to auto-approve individual users after email verification
CREATE OR REPLACE FUNCTION public.auto_approve_verified_individual()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Auto-approve individual users whose email is verified
  UPDATE public.user_roles
  SET status = 'approved',
      updated_at = now()
  WHERE user_id = auth.uid()
    AND role = 'individual'
    AND status = 'pending'
    AND EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND email_confirmed_at IS NOT NULL
    );
END;
$$;