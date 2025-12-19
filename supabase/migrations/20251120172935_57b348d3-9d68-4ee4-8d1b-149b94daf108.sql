-- Create user_loyalty_points table
CREATE TABLE IF NOT EXISTS public.user_loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_points INTEGER NOT NULL DEFAULT 0,
  lifetime_points INTEGER NOT NULL DEFAULT 0,
  tier TEXT NOT NULL DEFAULT 'bronze',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_loyalty_points ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_loyalty_points
CREATE POLICY "Users can view their own loyalty points"
  ON public.user_loyalty_points
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own loyalty points"
  ON public.user_loyalty_points
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow system to insert loyalty points for new users
CREATE POLICY "System can insert loyalty points"
  ON public.user_loyalty_points
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_loyalty_points_user_id 
  ON public.user_loyalty_points(user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_loyalty_points_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_loyalty_points_updated_at
  BEFORE UPDATE ON public.user_loyalty_points
  FOR EACH ROW
  EXECUTE FUNCTION update_loyalty_points_updated_at();