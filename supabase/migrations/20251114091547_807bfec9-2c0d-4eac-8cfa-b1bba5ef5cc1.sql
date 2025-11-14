-- Enable realtime for analytics tables (sadece eksik olanlar)
DO $$
BEGIN
    -- page_views'ı ekle (eğer yoksa)
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'page_views'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE page_views;
    END IF;

    -- user_events'ı ekle (eğer yoksa)
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'user_events'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE user_events;
    END IF;

    -- conversions'ı ekle (eğer yoksa)
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'conversions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE conversions;
    END IF;
END $$;

-- Add replica identity for proper realtime updates
ALTER TABLE page_views REPLICA IDENTITY FULL;
ALTER TABLE user_events REPLICA IDENTITY FULL;
ALTER TABLE site_stats REPLICA IDENTITY FULL;
ALTER TABLE conversions REPLICA IDENTITY FULL;