-- Create loyalty points table to track user points
CREATE TABLE user_loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0,
  lifetime_points INTEGER NOT NULL DEFAULT 0,
  tier TEXT NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create loyalty transactions table to track point history
CREATE TABLE loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'spend', 'bonus', 'expire', 'admin_adjustment')),
  source TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create loyalty rewards catalog
CREATE TABLE loyalty_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  points_cost INTEGER NOT NULL,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('bonus', 'cashback', 'free_spin', 'vip_access', 'custom')),
  reward_value TEXT,
  image_url TEXT,
  terms TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  stock_quantity INTEGER,
  min_tier TEXT DEFAULT 'bronze' CHECK (min_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create reward redemptions table
CREATE TABLE user_reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES loyalty_rewards(id) ON DELETE CASCADE,
  points_spent INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'delivered', 'rejected', 'expired')),
  redemption_code TEXT,
  notes TEXT,
  admin_notes TEXT,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE user_loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reward_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_loyalty_points
CREATE POLICY "Users can view own points"
  ON user_loyalty_points FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all points"
  ON user_loyalty_points FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage points"
  ON user_loyalty_points FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for loyalty_transactions
CREATE POLICY "Users can view own transactions"
  ON loyalty_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
  ON loyalty_transactions FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert transactions"
  ON loyalty_transactions FOR INSERT
  WITH CHECK (true);

-- RLS Policies for loyalty_rewards
CREATE POLICY "Anyone can view active rewards"
  ON loyalty_rewards FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage rewards"
  ON loyalty_rewards FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for user_reward_redemptions
CREATE POLICY "Users can view own redemptions"
  ON user_reward_redemptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can redeem rewards"
  ON user_reward_redemptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all redemptions"
  ON user_reward_redemptions FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX idx_user_loyalty_points_user_id ON user_loyalty_points(user_id);
CREATE INDEX idx_loyalty_transactions_user_id ON loyalty_transactions(user_id);
CREATE INDEX idx_loyalty_transactions_created_at ON loyalty_transactions(created_at DESC);
CREATE INDEX idx_loyalty_rewards_active ON loyalty_rewards(is_active, display_order);
CREATE INDEX idx_user_reward_redemptions_user_id ON user_reward_redemptions(user_id);
CREATE INDEX idx_user_reward_redemptions_status ON user_reward_redemptions(status);

-- Function to update user tier based on lifetime points
CREATE OR REPLACE FUNCTION update_user_loyalty_tier()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_loyalty_points
  SET tier = CASE
    WHEN NEW.lifetime_points >= 10000 THEN 'platinum'
    WHEN NEW.lifetime_points >= 5000 THEN 'gold'
    WHEN NEW.lifetime_points >= 1000 THEN 'silver'
    ELSE 'bronze'
  END,
  updated_at = now()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update tier
CREATE TRIGGER trigger_update_loyalty_tier
  AFTER UPDATE OF lifetime_points ON user_loyalty_points
  FOR EACH ROW
  WHEN (OLD.lifetime_points IS DISTINCT FROM NEW.lifetime_points)
  EXECUTE FUNCTION update_user_loyalty_tier();

-- Function to award points
CREATE OR REPLACE FUNCTION award_loyalty_points(
  p_user_id UUID,
  p_points INTEGER,
  p_source TEXT,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS void AS $$
BEGIN
  -- Insert transaction
  INSERT INTO loyalty_transactions (user_id, points, transaction_type, source, description, metadata)
  VALUES (p_user_id, p_points, 'earn', p_source, p_description, p_metadata);
  
  -- Update user points
  INSERT INTO user_loyalty_points (user_id, total_points, lifetime_points)
  VALUES (p_user_id, p_points, p_points)
  ON CONFLICT (user_id) 
  DO UPDATE SET
    total_points = user_loyalty_points.total_points + p_points,
    lifetime_points = user_loyalty_points.lifetime_points + p_points,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;