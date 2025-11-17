-- Drop the existing ALL policy and create separate policies for clarity
DROP POLICY IF EXISTS "Admins can manage all complaints" ON site_complaints;

-- Admins can view all complaints
CREATE POLICY "Admins can view all complaints"
ON site_complaints
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
    AND user_roles.status = 'approved'
  )
);

-- Admins can update all complaints
CREATE POLICY "Admins can update all complaints"
ON site_complaints
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
    AND user_roles.status = 'approved'
  )
);

-- Admins can delete all complaints
CREATE POLICY "Admins can delete all complaints"
ON site_complaints
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
    AND user_roles.status = 'approved'
  )
);