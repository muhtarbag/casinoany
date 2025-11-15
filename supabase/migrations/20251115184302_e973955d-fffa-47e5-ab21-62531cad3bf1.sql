-- ============================================
-- SCHEMA REFACTORING: betting_sites decomposition
-- Split bloated table into normalized structure
-- ============================================

-- 1. Create betting_sites_content table (content-specific fields)
CREATE TABLE IF NOT EXISTS betting_sites_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL UNIQUE REFERENCES betting_sites(id) ON DELETE CASCADE,
  
  -- Content fields
  pros text[],
  cons text[],
  features text[],
  expert_review text,
  verdict text,
  login_guide text,
  withdrawal_guide text,
  
  -- Game & FAQ data
  game_categories jsonb,
  faq jsonb,
  block_styles jsonb DEFAULT '{"faq": {"icon": "help", "color": "#ec4899"}, "verdict": {"icon": "shield", "color": "#3b82f6"}, "loginGuide": {"icon": "login", "color": "#f59e0b"}, "expertReview": {"icon": "fileText", "color": "#8b5cf6"}, "gameOverview": {"icon": "gamepad", "color": "#10b981"}, "withdrawalGuide": {"icon": "wallet", "color": "#06b6d4"}}'::jsonb,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Create betting_sites_affiliate table (affiliate-specific fields)
CREATE TABLE IF NOT EXISTS betting_sites_affiliate (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL UNIQUE REFERENCES betting_sites(id) ON DELETE CASCADE,
  
  -- Affiliate details
  affiliate_link text NOT NULL,
  affiliate_commission_percentage numeric,
  affiliate_monthly_payment numeric,
  affiliate_has_monthly_payment boolean DEFAULT false,
  affiliate_contract_date date,
  affiliate_contract_terms text,
  affiliate_notes text,
  
  -- Panel access
  affiliate_panel_url text,
  affiliate_panel_username text,
  affiliate_panel_password text,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. Create betting_sites_social table (social media links)
CREATE TABLE IF NOT EXISTS betting_sites_social (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL UNIQUE REFERENCES betting_sites(id) ON DELETE CASCADE,
  
  -- Social links
  email text,
  whatsapp text,
  telegram text,
  twitter text,
  instagram text,
  facebook text,
  youtube text,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 4. Migrate existing data
INSERT INTO betting_sites_content (
  site_id, pros, cons, features, expert_review, verdict, 
  login_guide, withdrawal_guide, game_categories, faq, block_styles
)
SELECT 
  id, pros, cons, features, expert_review, verdict,
  login_guide, withdrawal_guide, game_categories, faq, 
  COALESCE(block_styles, '{"faq": {"icon": "help", "color": "#ec4899"}, "verdict": {"icon": "shield", "color": "#3b82f6"}, "loginGuide": {"icon": "login", "color": "#f59e0b"}, "expertReview": {"icon": "fileText", "color": "#8b5cf6"}, "gameOverview": {"icon": "gamepad", "color": "#10b981"}, "withdrawalGuide": {"icon": "wallet", "color": "#06b6d4"}}'::jsonb)
FROM betting_sites
ON CONFLICT (site_id) DO NOTHING;

INSERT INTO betting_sites_affiliate (
  site_id, affiliate_link, affiliate_commission_percentage,
  affiliate_monthly_payment, affiliate_has_monthly_payment,
  affiliate_contract_date, affiliate_contract_terms, affiliate_notes,
  affiliate_panel_url, affiliate_panel_username, affiliate_panel_password
)
SELECT 
  id, affiliate_link, affiliate_commission_percentage,
  affiliate_monthly_payment, affiliate_has_monthly_payment,
  affiliate_contract_date, affiliate_contract_terms, affiliate_notes,
  affiliate_panel_url, affiliate_panel_username, affiliate_panel_password
FROM betting_sites
ON CONFLICT (site_id) DO NOTHING;

INSERT INTO betting_sites_social (
  site_id, email, whatsapp, telegram, twitter, 
  instagram, facebook, youtube
)
SELECT 
  id, email, whatsapp, telegram, twitter,
  instagram, facebook, youtube
FROM betting_sites
ON CONFLICT (site_id) DO NOTHING;

-- 5. Create comprehensive view for backward compatibility
CREATE OR REPLACE VIEW betting_sites_full AS
SELECT 
  bs.id,
  bs.name,
  bs.slug,
  bs.logo_url,
  bs.rating,
  bs.bonus,
  bs.is_active,
  bs.is_featured,
  bs.display_order,
  bs.review_count,
  bs.avg_rating,
  bs.created_at,
  bs.updated_at,
  
  -- Content fields
  bsc.pros,
  bsc.cons,
  bsc.features,
  bsc.expert_review,
  bsc.verdict,
  bsc.login_guide,
  bsc.withdrawal_guide,
  bsc.game_categories,
  bsc.faq,
  bsc.block_styles,
  
  -- Affiliate fields
  bsa.affiliate_link,
  bsa.affiliate_commission_percentage,
  bsa.affiliate_monthly_payment,
  bsa.affiliate_has_monthly_payment,
  bsa.affiliate_contract_date,
  bsa.affiliate_contract_terms,
  bsa.affiliate_notes,
  bsa.affiliate_panel_url,
  bsa.affiliate_panel_username,
  bsa.affiliate_panel_password,
  
  -- Social fields
  bss.email,
  bss.whatsapp,
  bss.telegram,
  bss.twitter,
  bss.instagram,
  bss.facebook,
  bss.youtube
  
FROM betting_sites bs
LEFT JOIN betting_sites_content bsc ON bsc.site_id = bs.id
LEFT JOIN betting_sites_affiliate bsa ON bsa.site_id = bs.id
LEFT JOIN betting_sites_social bss ON bss.site_id = bs.id;

-- 6. Create indexes for new tables
CREATE INDEX idx_betting_sites_content_site_id ON betting_sites_content(site_id);
CREATE INDEX idx_betting_sites_affiliate_site_id ON betting_sites_affiliate(site_id);
CREATE INDEX idx_betting_sites_social_site_id ON betting_sites_social(site_id);

-- 7. Create triggers for updated_at
CREATE TRIGGER update_betting_sites_content_updated_at
  BEFORE UPDATE ON betting_sites_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_betting_sites_affiliate_updated_at
  BEFORE UPDATE ON betting_sites_affiliate
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_betting_sites_social_updated_at
  BEFORE UPDATE ON betting_sites_social
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. Grant permissions
GRANT SELECT ON betting_sites_full TO anon, authenticated;
GRANT ALL ON betting_sites_content TO authenticated;
GRANT ALL ON betting_sites_affiliate TO authenticated;
GRANT ALL ON betting_sites_social TO authenticated;

-- 9. Update RLS policies for new tables
ALTER TABLE betting_sites_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE betting_sites_affiliate ENABLE ROW LEVEL SECURITY;
ALTER TABLE betting_sites_social ENABLE ROW LEVEL SECURITY;

-- Content policies
CREATE POLICY "Anyone can view content" ON betting_sites_content
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage content" ON betting_sites_content
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Affiliate policies (restricted)
CREATE POLICY "Admins can view affiliate data" ON betting_sites_affiliate
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage affiliate data" ON betting_sites_affiliate
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Social policies
CREATE POLICY "Anyone can view social links" ON betting_sites_social
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage social links" ON betting_sites_social
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));