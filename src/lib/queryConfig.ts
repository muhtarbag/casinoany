/**
 * Centralized Query Configuration
 * Defines staleTime, gcTime, and refetch policies for all queries
 */

export const QUERY_CONFIG = {
  // Static data - changes rarely
  static: {
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  },

  // Dynamic data - changes frequently
  dynamic: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  },

  // Real-time data - always fresh
  realtime: {
    staleTime: 0,
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  },

  // Admin data - moderate freshness
  admin: {
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  },
} as const;

// Query key prefixes for better organization
export const QUERY_KEYS = {
  bettingSites: 'betting-sites',
  featuredSites: 'featured-sites',
  siteStats: 'site-stats',
  banners: 'site-banners',
  searchHistory: 'search-history',
  notifications: 'notifications',
  complaints: 'complaints',
} as const;
