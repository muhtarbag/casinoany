-- Fix search_path for complaint count functions
CREATE OR REPLACE FUNCTION update_complaint_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE site_complaints 
    SET helpful_count = helpful_count + 1 
    WHERE id = NEW.complaint_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE site_complaints 
    SET helpful_count = helpful_count - 1 
    WHERE id = OLD.complaint_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public;

CREATE OR REPLACE FUNCTION update_complaint_response_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE site_complaints 
    SET response_count = response_count + 1 
    WHERE id = NEW.complaint_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE site_complaints 
    SET response_count = response_count - 1 
    WHERE id = OLD.complaint_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public;