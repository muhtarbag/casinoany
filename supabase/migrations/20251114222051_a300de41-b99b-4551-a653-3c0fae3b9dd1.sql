-- ===================================
-- FIX #1: News View Tracking - Grant Permissions
-- ===================================

-- Grant execute permission to increment_news_view_count for anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.increment_news_view_count TO anon, authenticated;

-- ===================================
-- FIX #2: Notification Views - Add UPDATE Policy
-- ===================================

-- This is CRITICAL! Users can't update notification_views (for clicked/dismissed)
-- Add policy to allow users to update their own notification views
CREATE POLICY "Users can update their own notification views"
ON public.notification_views
FOR UPDATE
USING (
  (auth.uid() = user_id) OR (session_id IS NOT NULL)
)
WITH CHECK (
  (auth.uid() = user_id) OR (session_id IS NOT NULL)
);

-- ===================================
-- FIX #3: Backfill Casino Analytics (Bounce & Time)
-- ===================================

-- Update existing casino analytics records with calculated bounce rate and avg time
DO $$
DECLARE
  v_record RECORD;
  v_bounce_rate numeric;
  v_avg_time numeric;
BEGIN
  -- Loop through all existing records with missing data
  FOR v_record IN 
    SELECT site_id, view_date
    FROM casino_content_analytics
    WHERE (bounce_rate IS NULL OR bounce_rate = 0)
      OR (avg_time_on_page IS NULL OR avg_time_on_page = 0)
  LOOP
    -- Calculate bounce rate from analytics_sessions
    SELECT 
      COALESCE(
        ROUND(
          (COUNT(*) FILTER (WHERE is_bounce = true)::numeric / NULLIF(COUNT(*), 0)) * 100,
          2
        ),
        0
      ),
      COALESCE(AVG(total_duration), 0)
    INTO v_bounce_rate, v_avg_time
    FROM analytics_sessions
    WHERE landing_page LIKE '%' || (SELECT slug FROM betting_sites WHERE id = v_record.site_id LIMIT 1) || '%'
      AND DATE(created_at) = v_record.view_date;

    -- Update the record
    UPDATE casino_content_analytics
    SET 
      bounce_rate = v_bounce_rate,
      avg_time_on_page = ROUND(v_avg_time),
      updated_at = now()
    WHERE site_id = v_record.site_id 
      AND view_date = v_record.view_date;
      
  END LOOP;
  
  RAISE NOTICE '✅ Backfill completed for casino analytics';
END;
$$;