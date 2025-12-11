-- =====================================================
-- CLEAN ALL USER DATA EXCEPT ADMINS
-- Keep: muhtar@visiontech.co, hello@visiontech.co
-- Delete: All other users, site_owners, user_roles
-- Reset: betting_sites.owner_id to NULL
-- =====================================================

-- Step 1: Find admin user IDs
DO $$
DECLARE
  admin_ids UUID[];
BEGIN
  -- Get admin user IDs from profiles table
  SELECT ARRAY_AGG(id) INTO admin_ids
  FROM profiles
  WHERE email IN ('muhtar@visiontech.co', 'hello@visiontech.co');
  
  RAISE NOTICE 'Admin IDs found: %', admin_ids;
  
  -- Step 2: Delete all site_owners records (all site ownership applications)
  DELETE FROM site_owners;
  RAISE NOTICE 'Deleted all site_owners records';
  
  -- Step 3: Reset all betting_sites owner_id to NULL
  UPDATE betting_sites SET owner_id = NULL, ownership_verified = false;
  RAISE NOTICE 'Reset all betting_sites owner_id to NULL';
  
  -- Step 4: Delete user_roles for non-admin users
  DELETE FROM user_roles
  WHERE user_id NOT IN (SELECT unnest(admin_ids));
  RAISE NOTICE 'Deleted non-admin user_roles';
  
  -- Step 5: Delete profiles for non-admin users
  DELETE FROM profiles
  WHERE id NOT IN (SELECT unnest(admin_ids));
  RAISE NOTICE 'Deleted non-admin profiles';
  
  -- Step 6: Delete auth.users for non-admin users
  DELETE FROM auth.users
  WHERE id NOT IN (SELECT unnest(admin_ids));
  RAISE NOTICE 'Deleted non-admin auth.users';
  
  -- Step 7: Clean up related tables (only if they exist and have user_id)
  DELETE FROM site_reviews WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT unnest(admin_ids));
  DELETE FROM site_complaints WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT unnest(admin_ids));
  DELETE FROM complaint_responses WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT unnest(admin_ids));
  DELETE FROM blog_comments WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT unnest(admin_ids));
  RAISE NOTICE 'Cleaned up related tables';
  
END $$;