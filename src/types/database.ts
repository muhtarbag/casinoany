// Database table types - Proper TypeScript interfaces for all tables

export interface BettingSite {
  id: string;
  name: string;
  slug: string;
  rating: number | null;
  bonus: string | null;
  features: string[] | null;
  affiliate_link: string;
  logo_url: string | null;
  email: string | null;
  whatsapp: string | null;
  telegram: string | null;
  twitter: string | null;
  instagram: string | null;
  facebook: string | null;
  youtube: string | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  display_order: number | null;
  created_at: string | null;
  updated_at: string | null;
  pros: string[] | null;
  cons: string[] | null;
  verdict: string | null;
  expert_review: string | null;
  login_guide: string | null;
  withdrawal_guide: string | null;
  faq: any | null;
  game_categories: any | null;
  block_styles: any | null;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  category: string | null;
  tags: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  is_published: boolean | null;
  published_at: string | null;
  author_id: string | null;
  view_count: number | null;
  read_time: number | null;
  display_order: number | null;
  primary_site_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogComment {
  id: string;
  post_id: string;
  user_id: string | null;
  name: string | null;
  email: string | null;
  comment: string;
  is_approved: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface SiteReview {
  id: string;
  site_id: string;
  user_id: string | null;
  title: string;
  rating: number;
  comment: string;
  name: string | null;
  email: string | null;
  is_approved: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface SystemLog {
  id: string;
  log_type: string;
  severity: string;
  action: string;
  resource: string | null;
  details: any | null;
  user_id: string | null;
  session_id: string | null;
  duration_ms: number | null;
  status_code: number | null;
  error_message: string | null;
  stack_trace: string | null;
  user_agent: string | null;
  ip_address: string | null;
  metadata: any | null;
  created_at: string | null;
}

export interface SystemHealthMetric {
  id: string;
  metric_type: string;
  metric_name: string;
  metric_value: number;
  status: string;
  metadata: any | null;
  recorded_at: string | null;
}

export interface ApiCallLog {
  id: string;
  function_name: string;
  method: string;
  endpoint: string;
  status_code: number;
  duration_ms: number;
  request_body: any | null;
  response_body: any | null;
  error_message: string | null;
  user_id: string | null;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string | null;
}

export interface PageView {
  id: string;
  page_path: string;
  page_title: string | null;
  referrer: string | null;
  user_agent: string | null;
  device_type: string | null;
  browser: string | null;
  session_id: string | null;
  user_id: string | null;
  duration: number | null;
  country: string | null;
  city: string | null;
  metadata: any | null;
  created_at: string;
}

export interface UserEvent {
  id: string;
  event_type: string;
  event_name: string;
  page_path: string;
  element_id: string | null;
  element_class: string | null;
  element_text: string | null;
  session_id: string | null;
  user_id: string | null;
  metadata: any | null;
  created_at: string;
}

export interface Conversion {
  id: string;
  conversion_type: string;
  conversion_value: number | null;
  page_path: string;
  session_id: string | null;
  user_id: string | null;
  site_id: string | null;
  metadata: any | null;
  created_at: string;
}

export interface AnalyticsSession {
  id: string;
  session_id: string;
  user_id: string | null;
  device_type: string | null;
  browser: string | null;
  landing_page: string | null;
  exit_page: string | null;
  page_count: number | null;
  total_duration: number | null;
  is_bounce: boolean | null;
  country: string | null;
  created_at: string;
  last_activity: string;
}

export interface SiteStats {
  id: string;
  site_id: string;
  views: number | null;
  clicks: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface SiteNotification {
  id: string;
  title: string;
  content: string | null;
  notification_type: string;
  trigger_type: string | null;
  trigger_conditions: any | null;
  display_pages: string[] | null;
  display_frequency: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean | null;
  priority: number | null;
  background_color: string | null;
  text_color: string | null;
  button_text: string | null;
  button_url: string | null;
  target_url: string | null;
  image_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CasinoContentAnalytics {
  id: string;
  site_id: string;
  view_date: string;
  total_views: number | null;
  affiliate_clicks: number | null;
  block_interactions: any | null;
  avg_time_on_page: number | null;
  bounce_rate: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface AIAnalysisHistory {
  id: string;
  analysis_type: string;
  summary: string;
  score: number;
  content_data: any | null;
  technical_data: any | null;
  serp_data: any | null;
  seo_data: any | null;
  ux_data: any | null;
  actions: any | null;
  provider: string;
  metadata: any | null;
  created_at: string;
}

export interface SEOKeyword {
  id: string;
  keyword: string;
  current_rank: number | null;
  target_rank: number | null;
  search_volume: number | null;
  difficulty: number | null;
  status: string;
  related_post_id: string | null;
  metadata: any | null;
  created_at: string;
}

export interface BlogPostRelatedSite {
  id: string;
  post_id: string;
  site_id: string;
  display_order: number | null;
  created_at: string;
}

// Query result types with joins
export interface BlogCommentWithProfile extends BlogComment {
  profiles?: Profile;
}

export interface BlogPostWithRelatedSites extends BlogPost {
  relatedSites?: BettingSite[];
}

export interface SiteReviewWithSite extends SiteReview {
  betting_sites?: BettingSite;
}
