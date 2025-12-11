-- Create achievement definitions table
CREATE TABLE IF NOT EXISTS public.achievement_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  category TEXT NOT NULL CHECK (category IN ('social', 'loyalty', 'activity', 'special')),
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('count', 'milestone', 'special')),
  requirement_value INTEGER,
  points_reward INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_code TEXT NOT NULL REFERENCES public.achievement_definitions(code) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, achievement_code)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_achievement_definitions_category ON public.achievement_definitions(category);
CREATE INDEX IF NOT EXISTS idx_achievement_definitions_active ON public.achievement_definitions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_code ON public.user_achievements(achievement_code);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned ON public.user_achievements(earned_at DESC);

-- Enable RLS
ALTER TABLE public.achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievement_definitions
CREATE POLICY "Anyone can view active achievements"
  ON public.achievement_definitions
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage achievements"
  ON public.achievement_definitions
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_achievements
CREATE POLICY "Users can view own achievements"
  ON public.user_achievements
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public achievements"
  ON public.user_achievements
  FOR SELECT
  USING (true);

CREATE POLICY "System can insert achievements"
  ON public.user_achievements
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage user achievements"
  ON public.user_achievements
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to award achievement
CREATE OR REPLACE FUNCTION public.award_achievement(
  p_user_id UUID,
  p_achievement_code TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_points INTEGER;
  v_already_earned BOOLEAN;
BEGIN
  -- Check if already earned
  SELECT EXISTS(
    SELECT 1 FROM public.user_achievements 
    WHERE user_id = p_user_id AND achievement_code = p_achievement_code
  ) INTO v_already_earned;
  
  IF v_already_earned THEN
    RETURN FALSE;
  END IF;
  
  -- Get achievement points
  SELECT points_reward INTO v_points
  FROM public.achievement_definitions
  WHERE code = p_achievement_code AND is_active = true;
  
  IF v_points IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Award achievement
  INSERT INTO public.user_achievements (user_id, achievement_code)
  VALUES (p_user_id, p_achievement_code);
  
  -- Award points if any
  IF v_points > 0 THEN
    PERFORM public.award_loyalty_points(
      p_user_id,
      v_points,
      'achievement',
      'Başarı rozeti kazanıldı: ' || p_achievement_code,
      jsonb_build_object('achievement_code', p_achievement_code)
    );
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Function to check and award achievements automatically
CREATE OR REPLACE FUNCTION public.check_and_award_achievements(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count INTEGER := 0;
  v_review_count INTEGER;
  v_complaint_count INTEGER;
  v_referral_count INTEGER;
  v_points INTEGER;
BEGIN
  -- Get user stats
  SELECT COUNT(*) INTO v_review_count
  FROM site_reviews WHERE user_id = p_user_id AND is_approved = true;
  
  SELECT COUNT(*) INTO v_complaint_count
  FROM site_complaints WHERE user_id = p_user_id;
  
  SELECT successful_referrals INTO v_referral_count
  FROM user_referrals WHERE user_id = p_user_id;
  
  SELECT total_points INTO v_points
  FROM user_loyalty_points WHERE user_id = p_user_id;
  
  -- Check review achievements
  IF v_review_count >= 1 AND public.award_achievement(p_user_id, 'first_review') THEN
    v_count := v_count + 1;
  END IF;
  
  IF v_review_count >= 10 AND public.award_achievement(p_user_id, 'reviewer_10') THEN
    v_count := v_count + 1;
  END IF;
  
  IF v_review_count >= 50 AND public.award_achievement(p_user_id, 'reviewer_50') THEN
    v_count := v_count + 1;
  END IF;
  
  -- Check complaint achievements
  IF v_complaint_count >= 1 AND public.award_achievement(p_user_id, 'first_complaint') THEN
    v_count := v_count + 1;
  END IF;
  
  -- Check referral achievements
  IF v_referral_count >= 1 AND public.award_achievement(p_user_id, 'first_referral') THEN
    v_count := v_count + 1;
  END IF;
  
  IF v_referral_count >= 5 AND public.award_achievement(p_user_id, 'social_butterfly') THEN
    v_count := v_count + 1;
  END IF;
  
  IF v_referral_count >= 10 AND public.award_achievement(p_user_id, 'influencer') THEN
    v_count := v_count + 1;
  END IF;
  
  -- Check points achievements
  IF v_points >= 100 AND public.award_achievement(p_user_id, 'points_100') THEN
    v_count := v_count + 1;
  END IF;
  
  IF v_points >= 500 AND public.award_achievement(p_user_id, 'points_500') THEN
    v_count := v_count + 1;
  END IF;
  
  IF v_points >= 1000 AND public.award_achievement(p_user_id, 'points_1000') THEN
    v_count := v_count + 1;
  END IF;
  
  RETURN v_count;
END;
$$;

-- Insert default achievements
INSERT INTO public.achievement_definitions (code, name, description, icon, color, category, requirement_type, requirement_value, points_reward, display_order) VALUES
  -- Social achievements
  ('first_review', 'İlk Yorumcu', 'İlk yorumunu yaptın!', 'MessageSquare', '#10b981', 'social', 'count', 1, 10, 1),
  ('reviewer_10', 'Aktif Yorumcu', '10 yorum yaptın!', 'MessageCircle', '#10b981', 'social', 'count', 10, 50, 2),
  ('reviewer_50', 'Uzman Yorumcu', '50 yorum yaptın!', 'Award', '#10b981', 'social', 'count', 50, 200, 3),
  ('first_complaint', 'İlk Şikayet', 'İlk şikayetini paylaştın', 'AlertTriangle', '#f59e0b', 'social', 'count', 1, 5, 4),
  
  -- Loyalty achievements
  ('points_100', 'Puan Avcısı', '100 puan topladın!', 'Target', '#8b5cf6', 'loyalty', 'milestone', 100, 20, 10),
  ('points_500', 'Puan Koleksiyoncusu', '500 puan topladın!', 'Trophy', '#8b5cf6', 'loyalty', 'milestone', 500, 50, 11),
  ('points_1000', 'Puan Ustası', '1000 puan topladın!', 'Crown', '#8b5cf6', 'loyalty', 'milestone', 1000, 100, 12),
  
  -- Referral achievements
  ('first_referral', 'İlk Davet', 'İlk arkadaşını davet ettin!', 'Users', '#3b82f6', 'activity', 'count', 1, 25, 20),
  ('social_butterfly', 'Sosyal Kelebek', '5 arkadaşını davet ettin!', 'UserPlus', '#3b82f6', 'activity', 'count', 5, 100, 21),
  ('influencer', 'Etkileyici', '10 arkadaşını davet ettin!', 'Sparkles', '#3b82f6', 'activity', 'count', 10, 250, 22),
  
  -- Special achievements
  ('early_adopter', 'İlk Kullanıcılar', 'Topluluğun ilk üyelerinden birisin!', 'Star', '#eab308', 'special', 'special', NULL, 50, 30),
  ('profile_complete', 'Profil Tamamlandı', 'Profilini tamamladın!', 'CheckCircle', '#10b981', 'special', 'special', NULL, 15, 31)
ON CONFLICT (code) DO NOTHING;