-- Create complaint_likes table to track who liked which complaint
CREATE TABLE IF NOT EXISTS public.complaint_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.site_complaints(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(complaint_id, user_id)
);

-- Enable RLS
ALTER TABLE public.complaint_likes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all likes
CREATE POLICY "Anyone can view complaint likes"
  ON public.complaint_likes
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can add likes
CREATE POLICY "Authenticated users can add likes"
  ON public.complaint_likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can remove their own likes
CREATE POLICY "Users can remove their own likes"
  ON public.complaint_likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_complaint_likes_complaint_id ON public.complaint_likes(complaint_id);
CREATE INDEX idx_complaint_likes_user_id ON public.complaint_likes(user_id);

-- Update the helpful_count trigger
CREATE OR REPLACE FUNCTION update_complaint_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.site_complaints
    SET helpful_count = helpful_count + 1
    WHERE id = NEW.complaint_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.site_complaints
    SET helpful_count = GREATEST(helpful_count - 1, 0)
    WHERE id = OLD.complaint_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
CREATE TRIGGER trigger_update_complaint_helpful_count
  AFTER INSERT OR DELETE ON public.complaint_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_complaint_helpful_count();