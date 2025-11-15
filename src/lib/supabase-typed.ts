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

export interface SystemHealthMetric {
  id: string;
  metric_type: string;
  metric_name: string;
  metric_value: number;
  status: 'healthy' | 'warning' | 'critical';
  recorded_at: string;
  metadata: Record<string, unknown> | null;
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
  
  // System health
  systemHealth: (client: SupabaseTyped) => fromExtended<SystemHealthMetric>(client, 'system_health_metrics'),
  
  // System logs
  systemLogs: (client: SupabaseTyped) => fromExtended<SystemLog>(client, 'system_logs'),
  
  // User roles
  userRoles: (client: SupabaseTyped) => fromExtended<UserRole>(client, 'user_roles'),
  
  // Carousel settings
  carouselSettings: (client: SupabaseTyped) => fromExtended<CarouselSetting>(client, 'carousel_settings'),
};
