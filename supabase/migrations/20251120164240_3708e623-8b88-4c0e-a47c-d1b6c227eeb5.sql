-- Add sample loyalty rewards
INSERT INTO loyalty_rewards (title, description, points_cost, reward_type, reward_value, min_tier, terms, is_active, display_order) VALUES
('5 TL Bonus Kuponu', '5 TL değerinde bonus kuponu kazanın', 100, 'bonus', '5 TL', 'bronze', 'Kazanılan bonus 30 gün içinde kullanılmalıdır', true, 1),
('10 TL Bonus Kuponu', '10 TL değerinde bonus kuponu kazanın', 200, 'bonus', '10 TL', 'bronze', 'Kazanılan bonus 30 gün içinde kullanılmalıdır', true, 2),
('25 TL Bonus Kuponu', '25 TL değerinde bonus kuponu kazanın', 500, 'bonus', '25 TL', 'silver', 'Kazanılan bonus 30 gün içinde kullanılmalıdır', true, 3),
('50 TL Bonus Kuponu', '50 TL değerinde bonus kuponu kazanın', 1000, 'bonus', '50 TL', 'gold', 'Kazanılan bonus 30 gün içinde kullanılmalıdır', true, 4),
('100 TL Bonus Kuponu', '100 TL değerinde bonus kuponu kazanın', 2000, 'bonus', '100 TL', 'platinum', 'Kazanılan bonus 30 gün içinde kullanılmalıdır', true, 5),
('Premium Site İncelemesi', 'Özel premium site incelemesi', 300, 'custom', 'Premium İnceleme', 'silver', 'İstediğiniz site için özel detaylı inceleme', true, 6),
('Öncelikli Destek', '7/24 öncelikli destek hizmeti', 750, 'vip_access', 'VIP Destek', 'gold', '30 gün süreyle geçerli', true, 7),
('Özel Bonus Fırsatları', 'Sadece size özel bonus fırsatları', 1500, 'vip_access', 'Özel Fırsatlar', 'platinum', 'Aylık özel bonus teklifleri', true, 8),
('50 Free Spin', '50 adet ücretsiz çevirme hakkı', 400, 'free_spin', '50 Free Spin', 'silver', 'Belirlenen oyunlarda geçerli', true, 9),
('%10 Cashback', '%10 oranında geri ödeme', 800, 'cashback', '%10', 'gold', 'Aylık kayıplarınızın %10u', true, 10);

-- Fix new user trigger to award welcome points
CREATE OR REPLACE FUNCTION award_welcome_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert initial loyalty points record
  INSERT INTO user_loyalty_points (user_id, current_points, lifetime_points, tier)
  VALUES (NEW.id, 0, 0, 'bronze')
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Award welcome points
  PERFORM award_loyalty_points(NEW.id, 50, 'Hoş geldin bonusu', 'signup');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created_award_points ON auth.users;
CREATE TRIGGER on_auth_user_created_award_points
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION award_welcome_points();

-- Fix RLS policies for referral_history table
DROP POLICY IF EXISTS "Users can view their own referral history" ON referral_history;
CREATE POLICY "Users can view their own referral history"
  ON referral_history FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

DROP POLICY IF EXISTS "Admins can view all referral history" ON referral_history;
CREATE POLICY "Admins can view all referral history"
  ON referral_history FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Fix RLS policies for user_referrals table
DROP POLICY IF EXISTS "Users can view own referral data" ON user_referrals;
CREATE POLICY "Users can view own referral data"
  ON user_referrals FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage referrals" ON user_referrals;
CREATE POLICY "Admins can manage referrals"
  ON user_referrals FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Fix RLS policies for user_loyalty_points
DROP POLICY IF EXISTS "Users can view own loyalty points" ON user_loyalty_points;
CREATE POLICY "Users can view own loyalty points"
  ON user_loyalty_points FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all loyalty points" ON user_loyalty_points;
CREATE POLICY "Admins can manage all loyalty points"
  ON user_loyalty_points FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Fix RLS policies for user_reward_redemptions
DROP POLICY IF EXISTS "Users can view own redemptions" ON user_reward_redemptions;
CREATE POLICY "Users can view own redemptions"
  ON user_reward_redemptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own redemptions" ON user_reward_redemptions;
CREATE POLICY "Users can create own redemptions"
  ON user_reward_redemptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all redemptions" ON user_reward_redemptions;
CREATE POLICY "Admins can manage all redemptions"
  ON user_reward_redemptions FOR ALL
  USING (has_role(auth.uid(), 'admin'));