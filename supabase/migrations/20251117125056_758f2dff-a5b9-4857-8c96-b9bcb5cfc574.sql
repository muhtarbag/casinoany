-- Drop and recreate updated_at triggers for critical tables
-- This ensures consistency across all tables

DROP TRIGGER IF EXISTS update_betting_sites_updated_at ON betting_sites;
CREATE TRIGGER update_betting_sites_updated_at
  BEFORE UPDATE ON betting_sites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_reviews_updated_at ON site_reviews;
CREATE TRIGGER update_site_reviews_updated_at
  BEFORE UPDATE ON site_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_complaints_updated_at ON site_complaints;
CREATE TRIGGER update_site_complaints_updated_at
  BEFORE UPDATE ON site_complaints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_news_articles_updated_at ON news_articles;
CREATE TRIGGER update_news_articles_updated_at
  BEFORE UPDATE ON news_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bonus_offers_updated_at ON bonus_offers;
CREATE TRIGGER update_bonus_offers_updated_at
  BEFORE UPDATE ON bonus_offers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_affiliate_metrics_updated_at ON affiliate_metrics;
CREATE TRIGGER update_affiliate_metrics_updated_at
  BEFORE UPDATE ON affiliate_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_banners_updated_at ON site_banners;
CREATE TRIGGER update_site_banners_updated_at
  BEFORE UPDATE ON site_banners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_betting_sites_content_updated_at ON betting_sites_content;
CREATE TRIGGER update_betting_sites_content_updated_at
  BEFORE UPDATE ON betting_sites_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_betting_sites_social_updated_at ON betting_sites_social;
CREATE TRIGGER update_betting_sites_social_updated_at
  BEFORE UPDATE ON betting_sites_social
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_comments_updated_at ON blog_comments;
CREATE TRIGGER update_blog_comments_updated_at
  BEFORE UPDATE ON blog_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_complaint_responses_updated_at ON complaint_responses;
CREATE TRIGGER update_complaint_responses_updated_at
  BEFORE UPDATE ON complaint_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();