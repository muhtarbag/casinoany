-- Drop the redundant user_complaints table
-- All complaints will now be in site_complaints table
DROP TABLE IF EXISTS public.user_complaints CASCADE;