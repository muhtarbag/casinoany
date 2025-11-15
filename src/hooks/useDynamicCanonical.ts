import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to dynamically set canonical URL based on active domain
 * Protects SEO during domain changes/blocks
 */
export const useDynamicCanonical = (path: string = '') => {
  useEffect(() => {
    const setCanonicalUrl = async () => {
      try {
        // Get active domain from edge function
        const { data } = await supabase.functions.invoke('get-active-domain');
        
        const activeDomain = data?.domain || 'www.casinoany.com';
        const canonicalUrl = `https://${activeDomain}${path}`;

        // Update or create canonical link
        let canonicalLink = document.querySelector('link[rel="canonical"]');
        
        if (!canonicalLink) {
          canonicalLink = document.createElement('link');
          canonicalLink.setAttribute('rel', 'canonical');
          document.head.appendChild(canonicalLink);
        }
        
        canonicalLink.setAttribute('href', canonicalUrl);
        
        // Also update og:url if exists
        const ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogUrl) {
          ogUrl.setAttribute('content', canonicalUrl);
        }
        
      } catch (error) {
        console.error('Failed to set canonical URL:', error);
        // Fallback to default domain
        const fallbackUrl = `https://www.casinoany.com${path}`;
        const canonicalLink = document.querySelector('link[rel="canonical"]');
        if (canonicalLink) {
          canonicalLink.setAttribute('href', fallbackUrl);
        }
      }
    };

    setCanonicalUrl();
  }, [path]);
};
