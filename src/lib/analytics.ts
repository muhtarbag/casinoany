import { supabase } from '@/integrations/supabase/client';

// Page start time for duration tracking
let pageStartTime = Date.now();
let visibilityChangeTime = Date.now();
let totalInactiveTime = 0;

// Generate or get session ID
export const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Calculate accurate page duration (excluding inactive time)
const getPageDuration = (): number => {
  const now = Date.now();
  const totalTime = now - pageStartTime;
  const activeTime = totalTime - totalInactiveTime;
  return Math.floor(activeTime / 1000); // Convert to seconds
};

// Track visibility changes to exclude inactive time
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      visibilityChangeTime = Date.now();
    } else {
      totalInactiveTime += Date.now() - visibilityChangeTime;
    }
  });

  // Track page view on beforeunload with accurate duration
  window.addEventListener('beforeunload', () => {
    const duration = getPageDuration();
    if (duration > 0) {
      // Use sendBeacon for reliable delivery
      const data = JSON.stringify({
        page_path: window.location.pathname,
        page_title: document.title,
        duration,
        session_id: getSessionId(),
      });
      navigator.sendBeacon(
        `${(supabase as any).supabaseUrl}/rest/v1/rpc/track_page_view`,
        data
      );
    }
  });
}

// Get user agent info
const getUserAgent = (): string => {
  return navigator.userAgent;
};

// Get referrer
const getReferrer = (): string => {
  return document.referrer || 'direct';
};

// Track page view
export const trackPageView = async (pagePath?: string, pageTitle?: string, duration?: number) => {
  try {
    const path = pagePath || window.location.pathname;
    const title = pageTitle || document.title;
    const sessionId = getSessionId();
    // ✅ FIX: Use calculated duration if not provided
    const actualDuration = duration !== undefined ? duration : getPageDuration();
    
    await (supabase as any).rpc('track_page_view', {
      p_page_path: path,
      p_page_title: title,
      p_referrer: getReferrer(),
      p_user_agent: getUserAgent(),
      p_session_id: sessionId,
      p_duration: actualDuration,
    });
    
    // Reset page start time after tracking
    pageStartTime = Date.now();
    totalInactiveTime = 0;
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};

// Track user event
export const trackEvent = async (
  eventType: string,
  eventName: string,
  elementId?: string,
  metadata?: Record<string, any>
) => {
  try {
    const sessionId = getSessionId();
    
    await (supabase as any).rpc('track_user_event', {
      p_event_type: eventType,
      p_event_name: eventName,
      p_page_path: window.location.pathname,
      p_element_id: elementId,
      p_session_id: sessionId,
      p_metadata: metadata || {},
    });
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};

// Track conversion
export const trackConversion = async (
  conversionType: string,
  siteId?: string,
  conversionValue: number = 0,
  metadata?: Record<string, any>
) => {
  try {
    const sessionId = getSessionId();
    
    await (supabase as any).rpc('track_conversion', {
      p_conversion_type: conversionType,
      p_page_path: window.location.pathname,
      p_site_id: siteId,
      p_conversion_value: conversionValue,
      p_session_id: sessionId,
      p_metadata: metadata || {},
    });
  } catch (error) {
    console.error('Error tracking conversion:', error);
  }
};

// Track specific events
export const analytics = {
  // Click tracking
  trackClick: (elementId: string, elementText?: string) => {
    trackEvent('click', 'element_click', elementId, { text: elementText });
  },

  // Search tracking
  trackSearch: (searchTerm: string, resultsCount: number) => {
    trackEvent('search', 'search_performed', undefined, {
      search_term: searchTerm,
      results_count: resultsCount,
    });
  },

  // Form tracking
  trackFormSubmit: (formName: string, success: boolean) => {
    trackEvent('form_submit', formName, undefined, { success });
  },

  // Affiliate click tracking
  trackAffiliateClick: (siteId: string, siteName: string) => {
    trackEvent('affiliate_click', 'site_affiliate_click', siteId, { site_name: siteName });
    trackConversion('affiliate_click', siteId, 1);
  },

  // Review submit tracking
  trackReviewSubmit: (siteId: string, rating: number) => {
    trackEvent('review_submit', 'review_submitted', siteId, { rating });
    trackConversion('review_submit', siteId, 0);
  },

  // Signup tracking
  trackSignup: () => {
    trackEvent('signup', 'user_signup');
    trackConversion('signup', undefined, 0);
  },

  // Scroll tracking (debounced)
  trackScroll: (() => {
    let timeout: NodeJS.Timeout;
    return (depth: number) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        trackEvent('scroll', 'scroll_depth', undefined, { depth_percentage: depth });
      }, 1000);
    };
  })(),
};
