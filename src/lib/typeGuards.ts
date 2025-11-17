/**
 * Type Guards and Type Safety Utilities
 * Eliminates need for 'as any' throughout the application
 */

import { Database } from '@/integrations/supabase/types';

// ===== DATABASE TYPE ALIASES =====
export type Tables = Database['public']['Tables'];
export type BettingSite = Tables['betting_sites']['Row'];
export type BlogPost = Tables['blog_posts']['Row'];
export type NewsArticle = Tables['news_articles']['Row'];
export type SiteReview = Tables['site_reviews']['Row'];
export type UserRole = Tables['user_roles']['Row'];
export type Profile = Tables['profiles']['Row'];
export type Category = Tables['categories']['Row'];
export type BonusOffer = Tables['bonus_offers']['Row'];
export type SiteNotification = Tables['site_notifications']['Row'];

// ===== TYPE GUARDS =====

export function isBettingSite(data: unknown): data is BettingSite {
  if (!data || typeof data !== 'object') return false;
  const site = data as Partial<BettingSite>;
  return (
    typeof site.id === 'string' &&
    typeof site.name === 'string' &&
    typeof site.slug === 'string' &&
    typeof site.affiliate_link === 'string'
  );
}

export function isBlogPost(data: unknown): data is BlogPost {
  if (!data || typeof data !== 'object') return false;
  const post = data as Partial<BlogPost>;
  return (
    typeof post.id === 'string' &&
    typeof post.title === 'string' &&
    typeof post.slug === 'string' &&
    typeof post.content === 'string'
  );
}

export function isProfile(data: unknown): data is Profile {
  if (!data || typeof data !== 'object') return false;
  const profile = data as Partial<Profile>;
  return typeof profile.id === 'string';
}

export function isUserRole(data: unknown): data is UserRole {
  if (!data || typeof data !== 'object') return false;
  const role = data as Partial<UserRole>;
  return (
    typeof role.id === 'string' &&
    typeof role.user_id === 'string' &&
    typeof role.role === 'string'
  );
}

// ===== UTILITY TYPES =====

/**
 * Extract row type from any table
 */
export type TableRow<T extends keyof Tables> = Tables[T]['Row'];

/**
 * Extract insert type from any table
 */
export type TableInsert<T extends keyof Tables> = Tables[T]['Insert'];

/**
 * Extract update type from any table
 */
export type TableUpdate<T extends keyof Tables> = Tables[T]['Update'];

/**
 * Safe type assertion with runtime validation
 */
export function assertType<T>(
  data: unknown,
  validator: (data: unknown) => data is T,
  errorMessage?: string
): T {
  if (!validator(data)) {
    throw new Error(errorMessage || 'Type assertion failed');
  }
  return data;
}

/**
 * Safe type cast without 'as any'
 */
export function safeTypeCast<T>(data: unknown): T | null {
  try {
    return data as T;
  } catch {
    return null;
  }
}

/**
 * Check if value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Array type guard
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * String type guard
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Number type guard
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Object type guard
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Safely parse JSON with type guard
 */
export function parseJSON<T>(
  json: string,
  validator?: (data: unknown) => data is T
): T | null {
  try {
    const parsed = JSON.parse(json);
    if (validator && !validator(parsed)) {
      return null;
    }
    return parsed as T;
  } catch {
    return null;
  }
}

/**
 * Extract non-nullable properties from type
 */
export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

/**
 * Make specific fields required
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Make specific fields optional
 */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
