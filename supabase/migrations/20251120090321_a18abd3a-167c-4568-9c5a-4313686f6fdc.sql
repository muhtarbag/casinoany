-- Create user_referrals table to store referral codes and stats
CREATE TABLE IF NOT EXISTS public.user_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL UNIQUE,
  total_referrals INTEGER NOT NULL DEFAULT 0,
  successful_referrals INTEGER NOT NULL DEFAULT 0,
  total_points_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referral_history table to track referral events
CREATE TABLE IF NOT EXISTS public.referral_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  points_awarded INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_referrals_user_id ON public.user_referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_referrals_code ON public.user_referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_history_referrer ON public.referral_history(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_history_referred ON public.referral_history(referred_id);
CREATE INDEX IF NOT EXISTS idx_referral_history_status ON public.referral_history(status);

-- Enable RLS
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_referrals
CREATE POLICY "Users can view own referral data"
  ON public.user_referrals
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own referral data"
  ON public.user_referrals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update referral stats"
  ON public.user_referrals
  FOR UPDATE
  USING (true);

CREATE POLICY "Admins can view all referrals"
  ON public.user_referrals
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for referral_history
CREATE POLICY "Users can view own referral history"
  ON public.referral_history
  FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "System can insert referral history"
  ON public.referral_history
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update referral history"
  ON public.referral_history
  FOR UPDATE
  USING (true);

CREATE POLICY "Admins can view all referral history"
  ON public.referral_history
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8 character alphanumeric code
    v_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.user_referrals WHERE referral_code = v_code) INTO v_exists;
    
    EXIT WHEN NOT v_exists;
  END LOOP;
  
  RETURN v_code;
END;
$$;

-- Function to create referral code on user signup
CREATE OR REPLACE FUNCTION public.create_user_referral()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_referrals (user_id, referral_code)
  VALUES (NEW.id, public.generate_referral_code())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-create referral code
DROP TRIGGER IF EXISTS on_auth_user_created_referral ON auth.users;
CREATE TRIGGER on_auth_user_created_referral
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_referral();

-- Function to process referral signup
CREATE OR REPLACE FUNCTION public.process_referral_signup(
  p_referred_user_id UUID,
  p_referral_code TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referrer_id UUID;
  v_referrer_points INTEGER := 50;
  v_referred_points INTEGER := 25;
BEGIN
  -- Find referrer by code
  SELECT user_id INTO v_referrer_id
  FROM public.user_referrals
  WHERE referral_code = p_referral_code;
  
  IF v_referrer_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Prevent self-referral
  IF v_referrer_id = p_referred_user_id THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user was already referred
  IF EXISTS (
    SELECT 1 FROM public.referral_history 
    WHERE referred_id = p_referred_user_id
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Create referral history
  INSERT INTO public.referral_history (
    referrer_id,
    referred_id,
    referral_code,
    status,
    points_awarded
  ) VALUES (
    v_referrer_id,
    p_referred_user_id,
    p_referral_code,
    'completed',
    v_referrer_points
  );
  
  -- Update referrer stats
  UPDATE public.user_referrals
  SET 
    total_referrals = total_referrals + 1,
    successful_referrals = successful_referrals + 1,
    total_points_earned = total_points_earned + v_referrer_points,
    updated_at = now()
  WHERE user_id = v_referrer_id;
  
  -- Award points to referrer
  PERFORM public.award_loyalty_points(
    v_referrer_id,
    v_referrer_points,
    'referral',
    'Arkadaş davet bonusu',
    jsonb_build_object('referred_user_id', p_referred_user_id)
  );
  
  -- Award welcome bonus to referred user
  PERFORM public.award_loyalty_points(
    p_referred_user_id,
    v_referred_points,
    'referral_welcome',
    'Davet kabul bonusu',
    jsonb_build_object('referrer_id', v_referrer_id)
  );
  
  RETURN TRUE;
END;
$$;