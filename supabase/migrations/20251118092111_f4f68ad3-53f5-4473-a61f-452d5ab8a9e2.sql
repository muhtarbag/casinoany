-- Fix function search_path for update_link_ctr with CASCADE
DROP FUNCTION IF EXISTS public.update_link_ctr() CASCADE;

CREATE OR REPLACE FUNCTION public.update_link_ctr()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.impressions > 0 THEN
    NEW.ctr := ROUND((NEW.clicks::numeric / NEW.impressions::numeric) * 100, 2);
  ELSE
    NEW.ctr := 0;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER calculate_link_ctr
  BEFORE INSERT OR UPDATE ON public.link_performance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_link_ctr();