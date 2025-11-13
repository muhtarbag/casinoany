-- Create profiles table for user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Public profiles viewable by anyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

-- Trigger to call handle_new_user on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create site_stats table for tracking views and clicks
CREATE TABLE IF NOT EXISTS public.site_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES public.betting_sites(id) ON DELETE CASCADE NOT NULL,
  clicks INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(site_id)
);

-- Enable RLS on site_stats
ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;

-- RLS policies for site_stats (public read/write for tracking)
CREATE POLICY "Anyone can view stats"
  ON public.site_stats FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert stats"
  ON public.site_stats FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update stats"
  ON public.site_stats FOR UPDATE
  USING (true);

-- Trigger for site_stats updated_at
CREATE TRIGGER update_site_stats_updated_at 
  BEFORE UPDATE ON public.site_stats 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create site_reviews table for user reviews
CREATE TABLE IF NOT EXISTS public.site_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES public.betting_sites(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  comment TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_site_reviews_site_id ON public.site_reviews(site_id);
CREATE INDEX IF NOT EXISTS idx_site_reviews_user_id ON public.site_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_site_reviews_approved ON public.site_reviews(is_approved);

-- Enable RLS on site_reviews
ALTER TABLE public.site_reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for site_reviews
CREATE POLICY "Anyone can view approved reviews"
  ON public.site_reviews FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Authenticated users can insert reviews"
  ON public.site_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON public.site_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON public.site_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all reviews"
  ON public.site_reviews FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all reviews"
  ON public.site_reviews FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete all reviews"
  ON public.site_reviews FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Trigger for site_reviews updated_at
CREATE TRIGGER update_site_reviews_updated_at 
  BEFORE UPDATE ON public.site_reviews 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();