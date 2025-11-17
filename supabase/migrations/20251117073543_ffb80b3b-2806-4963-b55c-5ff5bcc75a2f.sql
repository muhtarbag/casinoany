-- Drop all existing review policies to recreate them correctly
DROP POLICY IF EXISTS "Users can view their own reviews" ON site_reviews;
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON site_reviews;
DROP POLICY IF EXISTS "Admins can view all reviews" ON site_reviews;

-- Users can see ALL their own reviews (approved or pending)
CREATE POLICY "Users can view own reviews"
  ON site_reviews
  FOR SELECT
  USING (auth.uid() = user_id);

-- Everyone can see approved reviews
CREATE POLICY "Public can view approved reviews" 
  ON site_reviews
  FOR SELECT
  USING (is_approved = true);

-- Admins can see everything
CREATE POLICY "Admins view all reviews" 
  ON site_reviews
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
      AND user_roles.status = 'approved'
    )
  );