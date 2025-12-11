-- Fix search_path for the new function
CREATE OR REPLACE FUNCTION public.update_super_lig_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;