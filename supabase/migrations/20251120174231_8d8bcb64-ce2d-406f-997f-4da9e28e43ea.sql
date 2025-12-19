
-- Fix award_welcome_points to use correct column names
CREATE OR REPLACE FUNCTION public.award_welcome_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Insert initial loyalty points record with correct column names
  INSERT INTO public.user_loyalty_points (user_id, total_points, lifetime_points, tier)
  VALUES (NEW.id, 0, 0, 'bronze')
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Award welcome points (50 points for signing up)
  PERFORM public.award_loyalty_points(NEW.id, 50, 'signup', 'Hoş geldin bonusu');
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in award_welcome_points for user %: % - %', NEW.id, SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$function$;

-- Also check and fix award_loyalty_points function if needed
CREATE OR REPLACE FUNCTION public.award_loyalty_points(
  p_user_id uuid,
  p_points integer,
  p_source text,
  p_description text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Insert transaction
  INSERT INTO public.loyalty_transactions (user_id, points, transaction_type, source, description, metadata)
  VALUES (p_user_id, p_points, 'earn', p_source, p_description, p_metadata);
  
  -- Update user points with correct column names
  INSERT INTO public.user_loyalty_points (user_id, total_points, lifetime_points, tier)
  VALUES (p_user_id, p_points, p_points, 'bronze')
  ON CONFLICT (user_id) 
  DO UPDATE SET
    total_points = user_loyalty_points.total_points + p_points,
    lifetime_points = user_loyalty_points.lifetime_points + p_points,
    updated_at = now();
END;
$function$;
