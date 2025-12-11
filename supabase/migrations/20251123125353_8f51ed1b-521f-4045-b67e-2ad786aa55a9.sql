
-- Revert RSS news processor JWT verification
-- This was causing the system to fail because cron jobs can't authenticate

-- Note: This is being reverted because the RSS sync button and cron jobs
-- need public access. We'll implement a different security approach later
-- (like API key authentication or webhook secrets)

-- The fix is in supabase/config.toml - changing verify_jwt back to false
