-- Add helpful_count and response_count columns to site_complaints
ALTER TABLE site_complaints 
ADD COLUMN IF NOT EXISTS helpful_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS response_count integer DEFAULT 0;

-- Create function to update helpful_count when likes are added/removed
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
$$ LANGUAGE plpgsql;

-- Create trigger for helpful_count
DROP TRIGGER IF EXISTS trigger_update_complaint_helpful_count ON complaint_likes;
CREATE TRIGGER trigger_update_complaint_helpful_count
AFTER INSERT OR DELETE ON complaint_likes
FOR EACH ROW
EXECUTE FUNCTION update_complaint_helpful_count();

-- Create function to update response_count when responses are added/removed
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
$$ LANGUAGE plpgsql;

-- Create trigger for response_count
DROP TRIGGER IF EXISTS trigger_update_complaint_response_count ON complaint_responses;
CREATE TRIGGER trigger_update_complaint_response_count
AFTER INSERT OR DELETE ON complaint_responses
FOR EACH ROW
EXECUTE FUNCTION update_complaint_response_count();

-- Update existing counts
UPDATE site_complaints sc
SET helpful_count = (
  SELECT COUNT(*) FROM complaint_likes cl WHERE cl.complaint_id = sc.id
),
response_count = (
  SELECT COUNT(*) FROM complaint_responses cr WHERE cr.complaint_id = sc.id
);