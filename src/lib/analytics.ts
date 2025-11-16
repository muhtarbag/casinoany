import { TypedRPC } from '@/lib/supabase-extended';

/**
 * LIGHTWEIGHT ANALYTICS - Performance Optimized
 * Only tracks CRITICAL conversions: affiliate clicks, reviews, signups
 * NO page views, scroll tracking, or unnecessary events
 */

// Session ID for critical tracking only
export const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Track conversion (CRITICAL ONLY: affiliate clicks, signups, reviews)
export const trackConversion = async (
  conversionType: string,
  siteId?: string,
  conversionValue: number = 0
) => {
  try {
    const sessionId = getSessionId();
    
    await TypedRPC.trackConversion({
      p_conversion_type: conversionType,
      p_page_path: window.location.pathname,
      p_site_id: siteId,
      p_conversion_value: conversionValue,
      p_session_id: sessionId,
      p_metadata: {},
    });
  } catch (error) {
    // Silent fail - don't break user experience
  }
};

// CRITICAL ANALYTICS ONLY
export const analytics = {
  // Affiliate click tracking (REVENUE CRITICAL)
  trackAffiliateClick: (siteId: string, siteName: string) => {
    trackConversion('affiliate_click', siteId, 1);
  },

  // Review submit tracking (ENGAGEMENT CRITICAL)
  trackReviewSubmit: (siteId: string, rating: number) => {
    trackConversion('review_submit', siteId, 0);
  },

  // Signup tracking (CONVERSION CRITICAL)
  trackSignup: () => {
    trackConversion('signup', undefined, 0);
  },
};

// REMOVED FOR PERFORMANCE:
// - trackPageView (creates massive database load)
// - trackEvent (too many unnecessary events)
// - trackScroll (fires every 500ms!)
// - trackClick, trackSearch, trackFormSubmit (not actionable)
