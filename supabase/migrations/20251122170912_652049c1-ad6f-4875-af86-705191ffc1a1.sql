-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all domains" ON public.domain_tracking;
DROP POLICY IF EXISTS "Admins can flag domains" ON public.domain_tracking;

-- Create simpler, more direct policies
CREATE POLICY "Admins can view all domains"
  ON public.domain_tracking FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
        AND user_roles.status = 'approved'
    )
  );

CREATE POLICY "Admins can update domains"
  ON public.domain_tracking FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
        AND user_roles.status = 'approved'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
        AND user_roles.status = 'approved'
    )
  );