-- Fix security warnings by adding search_path to new referral functions

-- Update generate_referral_code function with search_path
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Update create_user_referral function with search_path
CREATE OR REPLACE FUNCTION public.create_user_referral()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_referrals (user_id, referral_code)
  VALUES (NEW.id, public.generate_referral_code())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Update process_referral_signup function with search_path
CREATE OR REPLACE FUNCTION public.process_referral_signup(
  p_referred_user_id UUID,
  p_referral_code TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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