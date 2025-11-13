// Supabase query helper types
import { supabase } from '@/integrations/supabase/client';

// Helper type to extract the return type of a Supabase query
export type SupabaseQuery<T> = Awaited<ReturnType<typeof supabase.from<T> extends (...args: any) => any ? typeof supabase.from<T> : never>>;

// Common query result type
export interface QueryResult<T> {
  data: T | null;
  error: any | null;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  orderBy?: string;
  ascending?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}
