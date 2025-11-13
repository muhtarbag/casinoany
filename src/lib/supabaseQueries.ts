// Type-safe Supabase query helpers
import { supabase } from '@/integrations/supabase/client';
import type {
  SystemHealthMetric,
  SystemLog,
  ApiCallLog,
  PageView,
  UserEvent,
  Conversion,
  AnalyticsSession,
  BlogPost,
  BlogComment,
  BlogCommentWithProfile,
  SiteReview,
  BettingSite,
  SiteStats,
  Profile,
} from '@/types/database';

// System Health Metrics
export const getSystemHealthMetrics = async (limit = 50): Promise<SystemHealthMetric[]> => {
  const { data, error } = await supabase
    .from('system_health_metrics')
    .select('*')
    .order('recorded_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return (data || []) as SystemHealthMetric[];
};

// System Logs
export const getSystemLogs = async (
  filters?: { logType?: string; severity?: string; limit?: number }
): Promise<SystemLog[]> => {
  let query = supabase
    .from('system_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(filters?.limit || 100);

  if (filters?.logType && filters.logType !== 'all') {
    query = query.eq('log_type', filters.logType);
  }

  if (filters?.severity && filters.severity !== 'all') {
    query = query.eq('severity', filters.severity);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as SystemLog[];
};

export const getRecentErrors = async (limit = 10): Promise<SystemLog[]> => {
  const { data, error } = await supabase
    .from('system_logs')
    .select('*')
    .in('severity', ['error', 'critical'])
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return (data || []) as SystemLog[];
};

// API Call Logs
export const getApiCallLogs = async (limit = 50): Promise<ApiCallLog[]> => {
  const { data, error } = await supabase
    .from('api_call_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return (data || []) as ApiCallLog[];
};

// Analytics
export const getPageViews = async (limit = 100): Promise<PageView[]> => {
  const { data, error } = await supabase
    .from('page_views')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return (data || []) as PageView[];
};

export const getUserEvents = async (limit = 100): Promise<UserEvent[]> => {
  const { data, error } = await supabase
    .from('user_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return (data || []) as UserEvent[];
};

export const getConversions = async (limit = 100): Promise<Conversion[]> => {
  const { data, error } = await supabase
    .from('conversions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return (data || []) as Conversion[];
};

export const getAnalyticsSessions = async (limit = 100): Promise<AnalyticsSession[]> => {
  const { data, error } = await supabase
    .from('analytics_sessions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return (data || []) as AnalyticsSession[];
};

// Blog
export const getBlogPosts = async (publishedOnly = true): Promise<BlogPost[]> => {
  let query = supabase
    .from('blog_posts')
    .select('*')
    .order('display_order', { ascending: true });

  if (publishedOnly) {
    query = query.eq('is_published', true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as BlogPost[];
};

export const getBlogComments = async (filters?: {
  postId?: string;
  approvedOnly?: boolean;
}): Promise<BlogComment[]> => {
  let query = supabase
    .from('blog_comments')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.postId) {
    query = query.eq('post_id', filters.postId);
  }

  if (filters?.approvedOnly) {
    query = query.eq('is_approved', true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as BlogComment[];
};

export const getBlogCommentsWithProfiles = async (filters?: {
  postId?: string;
  approvedOnly?: boolean;
}): Promise<BlogCommentWithProfile[]> => {
  let query = supabase
    .from('blog_comments')
    .select(`
      *,
      profiles (*)
    `)
    .order('created_at', { ascending: false });

  if (filters?.postId) {
    query = query.eq('post_id', filters.postId);
  }

  if (filters?.approvedOnly) {
    query = query.eq('is_approved', true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as BlogCommentWithProfile[];
};

// Reviews
export const getSiteReviews = async (filters?: {
  siteId?: string;
  approvedOnly?: boolean;
}): Promise<SiteReview[]> => {
  let query = supabase
    .from('site_reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.siteId) {
    query = query.eq('site_id', filters.siteId);
  }

  if (filters?.approvedOnly) {
    query = query.eq('is_approved', true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as SiteReview[];
};

// Betting Sites
export const getBettingSites = async (activeOnly = true): Promise<BettingSite[]> => {
  let query = supabase
    .from('betting_sites')
    .select('*')
    .order('display_order', { ascending: true });

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as BettingSite[];
};

// Site Stats
export const getSiteStats = async (siteId: string): Promise<SiteStats | null> => {
  const { data, error } = await supabase
    .from('site_stats')
    .select('*')
    .eq('site_id', siteId)
    .maybeSingle();

  if (error) throw error;
  return data as SiteStats | null;
};

export const updateSiteStats = async (
  siteId: string,
  updates: Partial<Pick<SiteStats, 'views' | 'clicks'>>
): Promise<SiteStats> => {
  const existing = await getSiteStats(siteId);

  if (existing) {
    const { data, error } = await supabase
      .from('site_stats')
      .update(updates)
      .eq('site_id', siteId)
      .select()
      .single();
    
    if (error) throw error;
    return data as SiteStats;
  } else {
    const { data, error } = await supabase
      .from('site_stats')
      .insert({ site_id: siteId, ...updates })
      .select()
      .single();
    
    if (error) throw error;
    return data as SiteStats;
  }
};
