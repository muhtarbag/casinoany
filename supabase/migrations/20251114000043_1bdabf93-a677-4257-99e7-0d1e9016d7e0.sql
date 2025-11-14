-- Enable RLS on the view (views inherit RLS from base tables but we can add explicit policy)
-- Grant permissions to all users for the view
GRANT SELECT ON public.site_stats_with_details TO anon;
GRANT SELECT ON public.site_stats_with_details TO authenticated;

-- Create a function to bypass RLS for this view (since it's read-only stats)
-- This ensures admins and regular users can see stats
CREATE OR REPLACE FUNCTION public.can_view_site_stats()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT true;
$$;