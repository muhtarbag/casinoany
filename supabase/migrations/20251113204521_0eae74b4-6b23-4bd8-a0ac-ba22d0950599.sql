-- Create search history table for tracking popular searches
CREATE TABLE IF NOT EXISTS public.search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  search_term text NOT NULL UNIQUE,
  search_count integer NOT NULL DEFAULT 1,
  last_searched_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can read search history"
  ON public.search_history
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert search history"
  ON public.search_history
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update search history"
  ON public.search_history
  FOR UPDATE
  USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_search_history_count 
  ON public.search_history(search_count DESC);

CREATE INDEX IF NOT EXISTS idx_search_history_term 
  ON public.search_history(search_term);

-- Function to increment search count
CREATE OR REPLACE FUNCTION public.track_search(p_search_term text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Normalize search term (trim and lowercase)
  p_search_term := LOWER(TRIM(p_search_term));
  
  -- Skip empty searches
  IF p_search_term = '' THEN
    RETURN;
  END IF;
  
  -- Insert or update search count
  INSERT INTO public.search_history (search_term, search_count, last_searched_at)
  VALUES (p_search_term, 1, now())
  ON CONFLICT (search_term) 
  DO UPDATE SET
    search_count = search_history.search_count + 1,
    last_searched_at = now();
END;
$$;