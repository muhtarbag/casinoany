import { QueryClient } from '@tanstack/react-query';

// Query cache süreleri (milliseconds)
export const CACHE_TIMES = {
  SHORT: 1 * 60 * 1000,      // 1 dakika - sık değişen data
  MEDIUM: 5 * 60 * 1000,     // 5 dakika - orta sıklıkta değişen
  LONG: 15 * 60 * 1000,      // 15 dakika - nadiren değişen
  VERY_LONG: 60 * 60 * 1000, // 1 saat - çok nadiren değişen
} as const;

// Refetch interval süreleri
export const REFETCH_INTERVALS = {
  FAST: 30 * 1000,        // 30 saniye
  NORMAL: 2 * 60 * 1000,  // 2 dakika
  SLOW: 5 * 60 * 1000,    // 5 dakika
  NEVER: false,           // Otomatik refetch yok
} as const;

// ============================================================
// QUERY DEFAULTS: Centralized Query Configuration
// Use case bazlı standart query ayarları
// ============================================================

export const QUERY_DEFAULTS = {
  // STATIC DATA: Nadiren değişen veriler (site list, featured items)
  static: {
    staleTime: CACHE_TIMES.LONG,      // 15 dakika
    gcTime: CACHE_TIMES.VERY_LONG,    // 1 saat
    refetchOnWindowFocus: false,       // Window focus'ta refetch etme
    refetchOnMount: false,             // Mount'ta refetch etme
    refetchOnReconnect: false,         // Reconnect'te refetch etme
  },
  
  // DYNAMIC DATA: Sık değişebilen veriler (user stats, notifications)
  dynamic: {
    staleTime: CACHE_TIMES.SHORT,     // 1 dakika
    gcTime: CACHE_TIMES.MEDIUM,       // 5 dakika
    refetchOnWindowFocus: true,        // Window focus'ta refetch et
    refetchOnMount: 'always' as const, // Her mount'ta refetch et
    refetchOnReconnect: true,          // Reconnect'te refetch et
  },
  
  // ANALYTICS: Analytics ve metrics data
  analytics: {
    staleTime: CACHE_TIMES.MEDIUM,    // 5 dakika
    gcTime: CACHE_TIMES.LONG,         // 15 dakika
    refetchOnWindowFocus: false,       // Window focus'ta refetch etme
    refetchOnMount: false,             // Mount'ta refetch etme
    refetchInterval: REFETCH_INTERVALS.NORMAL, // 2 dakikada bir otomatik refetch
  },
  
  // REALTIME: Real-time subscriptions için (manual refetch, realtime updates)
  realtime: {
    staleTime: 0,                      // Her zaman stale (realtime updates'e güven)
    gcTime: CACHE_TIMES.SHORT,         // 1 dakika
    refetchOnWindowFocus: false,       // Realtime'da manual refetch gereksiz
    refetchOnMount: false,             // Realtime'da manual refetch gereksiz
    refetchInterval: false,            // Otomatik refetch yok (realtime var)
  },
  
  // ADMIN: Admin panel data (change history, logs, etc.)
  admin: {
    staleTime: CACHE_TIMES.SHORT,     // 1 dakika
    gcTime: CACHE_TIMES.MEDIUM,       // 5 dakika
    refetchOnWindowFocus: true,        // Window focus'ta refetch et
    refetchInterval: REFETCH_INTERVALS.NORMAL, // 2 dakikada bir refetch
  },
  
  // CONTENT: Blog, news, static content
  content: {
    staleTime: CACHE_TIMES.LONG,      // 15 dakika
    gcTime: CACHE_TIMES.VERY_LONG,    // 1 saat
    refetchOnWindowFocus: false,       // Window focus'ta refetch etme
    refetchOnMount: false,             // Mount'ta refetch etme
  },
} as const;

// Query key factory - Merkezi query key yönetimi
export const queryKeys = {
  // News
  news: {
    all: ['news'] as const,
    lists: () => [...queryKeys.news.all, 'list'] as const,
    list: (filters?: Record<string, any>) => 
      [...queryKeys.news.lists(), filters] as const,
    details: () => [...queryKeys.news.all, 'detail'] as const,
    detail: (slug: string) => [...queryKeys.news.details(), slug] as const,
  },
  
  // Blog
  blog: {
    all: ['blog'] as const,
    lists: () => [...queryKeys.blog.all, 'list'] as const,
    list: (filters?: Record<string, any>) => 
      [...queryKeys.blog.lists(), filters] as const,
    details: () => [...queryKeys.blog.all, 'detail'] as const,
    detail: (slug: string) => [...queryKeys.blog.details(), slug] as const,
    comments: (postId: string) => [...queryKeys.blog.all, 'comments', postId] as const,
    stats: () => [...queryKeys.blog.all, 'stats'] as const,
  },
  
  // Sites
  sites: {
    all: ['sites'] as const,
    lists: () => [...queryKeys.sites.all, 'list'] as const,
    list: (filters?: Record<string, any>) => 
      [...queryKeys.sites.lists(), filters] as const,
    details: () => [...queryKeys.sites.all, 'detail'] as const,
    detail: (slug: string) => [...queryKeys.sites.details(), slug] as const,
    stats: () => [...queryKeys.sites.all, 'stats'] as const,
    statsByIds: (siteIds: string[]) => 
      [...queryKeys.sites.all, 'stats', 'byIds', ...siteIds.sort()] as const,
    featured: () => [...queryKeys.sites.all, 'featured'] as const,
  },
  
  // Analytics (OPTIMIZED: Event-sourcing pattern)
  analytics: {
    all: ['analytics'] as const,
    // New unified events pattern
    events: (filters?: { 
      eventType?: string; 
      dateRange?: { start: Date; end: Date };
      siteId?: string;
    }) => [...queryKeys.analytics.all, 'events', filters] as const,
    
    // Hourly aggregations (materialized view)
    hourly: (filters?: {
      dateRange?: { start: Date; end: Date };
      eventType?: string;
    }) => [...queryKeys.analytics.all, 'hourly', filters] as const,
    
    // Legacy compatibility (keep for backward compatibility during migration)
    pageViews: (dateRange?: { start: Date; end: Date }) => 
      [...queryKeys.analytics.all, 'pageViews', dateRange] as const,
    userEvents: (dateRange?: { start: Date; end: Date }) => 
      [...queryKeys.analytics.all, 'userEvents', dateRange] as const,
    sessions: (dateRange?: { start: Date; end: Date }) => 
      [...queryKeys.analytics.all, 'sessions', dateRange] as const,
    conversions: (dateRange?: { start: Date; end: Date }) => 
      [...queryKeys.analytics.all, 'conversions', dateRange] as const,
    
    dashboard: () => [...queryKeys.analytics.all, 'dashboard'] as const,
    realtime: () => [...queryKeys.analytics.all, 'realtime'] as const,
  },
  
  // Casino
  casino: {
    all: ['casino'] as const,
    analytics: (siteId?: string) => 
      [...queryKeys.casino.all, 'analytics', siteId] as const,
    topSites: () => [...queryKeys.casino.all, 'topSites'] as const,
    blockStats: () => [...queryKeys.casino.all, 'blockStats'] as const,
  },
  
  // Search
  search: {
    all: ['search'] as const,
    history: () => [...queryKeys.search.all, 'history'] as const,
    trending: () => [...queryKeys.search.all, 'trending'] as const,
  },
  
  // Admin
  admin: {
    all: ['admin'] as const,
    users: () => [...queryKeys.admin.all, 'users'] as const,
    logs: (filters?: Record<string, any>) => 
      [...queryKeys.admin.all, 'logs', filters] as const,
  },
} as const;

// Merkezi Query Client konfigürasyonu
export const createAppQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Varsayılan cache süresi: 5 dakika
        staleTime: CACHE_TIMES.MEDIUM,
        
        // Cache'de kalma süresi: 10 dakika
        gcTime: 10 * 60 * 1000,
        
        // Otomatik refetch: Window focus'ta
        refetchOnWindowFocus: true,
        
        // Network reconnect'te refetch
        refetchOnReconnect: true,
        
        // Mount olduğunda refetch (false = sadece cache kullan)
        refetchOnMount: false,
        
        // Retry stratejisi
        retry: (failureCount, error: any) => {
          // 404 hatalarında retry yapma
          if (error?.status === 404) return false;
          // 401, 403 gibi auth hatalarında retry yapma
          if (error?.status === 401 || error?.status === 403) return false;
          // Diğer hatalar için max 2 retry
          return failureCount < 2;
        },
        
        // Retry delay (exponential backoff)
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      
      mutations: {
        // Mutation retry yok
        retry: false,
        
        // Network mode
        networkMode: 'online',
      },
    },
  });
};

// Cache invalidation helpers
export const invalidateQueries = {
  news: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.news.all });
  },
  
  blog: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.blog.all });
  },
  
  sites: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.sites.all });
  },
  
  analytics: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
  },
  
  all: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries();
  },
};

// Prefetch helpers
export const prefetchHelpers = {
  news: async (queryClient: QueryClient, fetchFn: () => Promise<any>) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.news.lists(),
      queryFn: fetchFn,
      staleTime: CACHE_TIMES.MEDIUM,
    });
  },
  
  sites: async (queryClient: QueryClient, fetchFn: () => Promise<any>) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.sites.lists(),
      queryFn: fetchFn,
      staleTime: CACHE_TIMES.LONG,
    });
  },
};
