-- Blog post likes table
CREATE TABLE IF NOT EXISTS public.blog_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Add like_count to blog_posts
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0 NOT NULL;

-- Enable RLS
ALTER TABLE public.blog_post_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view likes"
  ON public.blog_post_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like posts"
  ON public.blog_post_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
  ON public.blog_post_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update like count
CREATE OR REPLACE FUNCTION public.update_blog_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.blog_posts
    SET like_count = like_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.blog_posts
    SET like_count = GREATEST(like_count - 1, 0)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Trigger for like count
CREATE TRIGGER trigger_update_blog_post_like_count
AFTER INSERT OR DELETE ON public.blog_post_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_blog_post_like_count();

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_blog_post_likes_post_id ON public.blog_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_likes_user_id ON public.blog_post_likes(user_id);