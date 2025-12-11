/**
 * Type-safe Supabase query helpers
 * 
 * These utilities provide type safety for tables/views that aren't
 * in the auto-generated Supabase types, while avoiding 'as any' usage.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

// Common extended types
export interface SiteReview {
  id: string;
  site_id: string;
  user_id: string | null;
  rating: number;
  comment: string | null;
  title: string | null;
  name: string | null;
  email: string | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserEvent {
  id: string;
  created_at: string;
  event_type: string;
  event_data: Record<string, unknown> | null;
  user_id: string | null;
  session_id: string | null;
  page_path: string | null;
}

export interface SystemLog {
  id: string;
  created_at: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  metadata: Record<string, unknown> | null;
  source: string | null;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'editor' | 'viewer';
  created_at: string;
}

export interface CarouselSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  category: string | null;
  tags: string[] | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author_id: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  read_time: string | null;
  view_count: number;
}

// Type aliases for clarity
export type SupabaseTyped = SupabaseClient<Database>;

/**
 * Type-safe query builder for extended tables
 * Returns a properly typed query builder
 */
export function fromExtended<T = unknown>(
  client: SupabaseTyped,
  tableName: string
) {
  // @ts-expect-error - Intentional type assertion for extended tables
  return client.from(tableName) as ReturnType<typeof client.from<T>>;
}

/**
 * Common query patterns with proper typing
 */
export const TypedQueries = {
  // Site reviews
  siteReviews: (client: SupabaseTyped) => fromExtended<SiteReview>(client, 'site_reviews'),

  // User events
  userEvents: (client: SupabaseTyped) => fromExtended<UserEvent>(client, 'user_events'),

  // System logs
  systemLogs: (client: SupabaseTyped) => fromExtended<SystemLog>(client, 'system_logs'),

  // User roles
  userRoles: (client: SupabaseTyped) => fromExtended<UserRole>(client, 'user_roles'),

  // Carousel settings
  carouselSettings: (client: SupabaseTyped) => fromExtended<CarouselSetting>(client, 'carousel_settings'),

  // Blog posts
  blogPosts: (client: SupabaseTyped) => fromExtended<BlogPost>(client, 'blog_posts'),
};
