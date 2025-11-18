/**
 * Lazy-loaded admin components for code splitting
 * Reduces initial bundle size by loading heavy components on demand
 */

import { lazyWithRetry } from './LazyComponent';

// Heavy admin components - lazy loaded
export const LazyBlogManagement = lazyWithRetry(() => 
  import('@/components/BlogManagement').then(module => ({ 
    default: module.BlogManagement 
  }))
);

export const LazyCasinoContentManagement = lazyWithRetry(() => 
  import('@/components/CasinoContentManagement').then(module => ({ 
    default: module.CasinoContentManagement 
  }))
);

export const LazyEnhancedReviewManagement = lazyWithRetry(() => 
  import('@/components/EnhancedReviewManagement')
);

export const LazyNewsManagement = lazyWithRetry(() => 
  import('@/components/NewsManagement').then(module => ({ 
    default: module.NewsManagement 
  }))
);

export const LazyNotificationManagement = lazyWithRetry(() => 
  import('@/components/NotificationManagement').then(module => ({ 
    default: module.NotificationManagement 
  }))
);

export const LazyAffiliateManagement = lazyWithRetry(() => import('@/components/AffiliateManagement').then(m => ({ default: m.AffiliateManagement })));

export const LazyBonusManagement = lazyWithRetry(() => import('@/components/BonusManagement').then(m => ({ default: m.BonusManagement })));

export const LazyBonusRequestsManagement = lazyWithRetry(() => import('@/components/BonusRequestsManagement').then(m => ({ default: m.BonusRequestsManagement })));

export const LazyBannerManagement = lazyWithRetry(() => import('@/components/BannerManagement').then(m => ({ default: m.BannerManagement })));

export const LazyContentPlanner = lazyWithRetry(() => import('@/components/ContentPlanner').then(m => ({ default: m.ContentPlanner })));

export const LazyBlogCommentManagement = lazyWithRetry(() => import('@/components/BlogCommentManagement').then(m => ({ default: m.BlogCommentManagement })));

export const LazyBlogStats = lazyWithRetry(() => import('@/components/BlogStats'));

export const LazySiteStats = lazyWithRetry(() => import('@/components/SiteStats'));

export const LazyFeaturedSitesManagement = lazyWithRetry(() => import('@/components/FeaturedSitesManagement').then(m => ({ default: m.FeaturedSitesManagement })));

export const LazyRecommendedSitesManagement = lazyWithRetry(() => import('@/components/RecommendedSitesManagement').then(m => ({ default: m.RecommendedSitesManagement })));

export const LazyCategoryManagement = lazyWithRetry(() => import('@/components/admin/CategoryManagement').then(m => ({ default: m.CategoryManagement })));
