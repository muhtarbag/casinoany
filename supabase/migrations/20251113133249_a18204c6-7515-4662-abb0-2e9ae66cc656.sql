-- Create blog comments table
CREATE TABLE public.blog_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  comment TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for better performance
CREATE INDEX idx_blog_comments_post_id ON public.blog_comments(post_id);
CREATE INDEX idx_blog_comments_approved ON public.blog_comments(is_approved) WHERE is_approved = true;

-- Enable RLS
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can insert comments (both authenticated and anonymous)
CREATE POLICY "Anyone can insert comments"
ON public.blog_comments
FOR INSERT
WITH CHECK (true);

-- Anyone can view approved comments
CREATE POLICY "Anyone can view approved comments"
ON public.blog_comments
FOR SELECT
USING (is_approved = true);

-- Admins can view all comments
CREATE POLICY "Admins can view all comments"
ON public.blog_comments
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update all comments
CREATE POLICY "Admins can update all comments"
ON public.blog_comments
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete all comments
CREATE POLICY "Admins can delete all comments"
ON public.blog_comments
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
ON public.blog_comments
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
ON public.blog_comments
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_blog_comments_updated_at
BEFORE UPDATE ON public.blog_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.blog_comments IS 'Comments for blog posts with approval system';