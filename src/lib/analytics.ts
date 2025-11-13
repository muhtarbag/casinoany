import { supabase } from '@/integrations/supabase/client';

// Generate or get session ID
export const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Get user agent info
const getUserAgent = (): string => {
  return navigator.userAgent;
};

// Get referrer
const getReferrer = (): string => {
  return document.referrer || 'direct';
};

// Track page view
export const trackPageView = async (pagePath?: string, pageTitle?: string, duration: number = 0) => {
  try {
    const path = pagePath || window.location.pathname;
    const title = pageTitle || document.title;
    const sessionId = getSessionId();
    
    await (supabase as any).rpc('track_page_view', {
      p_page_path: path,
      p_page_title: title,
      p_referrer: getReferrer(),
      p_user_agent: getUserAgent(),
      p_session_id: sessionId,
      p_duration: duration,
    });
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
