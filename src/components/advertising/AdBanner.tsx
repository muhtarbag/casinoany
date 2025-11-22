import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useRef, useState } from 'react';
import { OptimizedImage } from '@/components/OptimizedImage';
import { ExternalLink } from 'lucide-react';

interface AdBannerProps {
  location: 'hero' | 'sidebar' | 'blog_inline' | 'mobile_sticky' | 'category_top' | 'between_sites';
  className?: string;
}

interface BannerData {
  id: string;
  campaign_id: string;
  banner_name: string;
  image_url: string;
  mobile_image_url: string | null;
  click_url: string;
  alt_text: string | null;
  priority: number;
}

export function AdBanner({ location, className = '' }: AdBannerProps) {
  const [impressionTracked, setImpressionTracked] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  // Fetch active banner for this location
  const { data: banner, isLoading } = useQuery({
    queryKey: ['ad-banner', location],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_active_banner', { 
          p_location: location,
          p_limit: 1 
        });

      if (error) throw error;
      return data?.[0] ?? null;
    },
    staleTime: 5 * 60 * 1000, // Cache 5 minutes
    gcTime: 10 * 60 * 1000,
  });

  // Track impression when banner is visible
  useEffect(() => {
    if (!banner || impressionTracked) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !impressionTracked) {
            handleBannerView();
            setImpressionTracked(true);
          }
        });
      },
      { threshold: 0.5 } // 50% visible
    );

    if (bannerRef.current) {
      observer.observe(bannerRef.current);
    }

    return () => {
      if (bannerRef.current) {
        observer.unobserve(bannerRef.current);
      }
    };
  }, [banner, impressionTracked]);

  const handleBannerView = async () => {
    if (!banner) return;

    try {
      // Track impression
      await supabase.from('ad_impressions').insert({
        banner_id: banner.id,
        campaign_id: banner.campaign_id,
        impression_type: 'view',
        page_path: window.location.pathname,
        session_id: sessionStorage.getItem('session_id') || undefined,
        device_type: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        browser: navigator.userAgent,
        referrer: document.referrer || undefined,
      });

      // Increment banner stats
      await supabase.rpc('increment_banner_stats', {
        p_banner_id: banner.id,
        p_stat_type: 'impression',
      });
    } catch (error) {
      console.error('Failed to track banner view:', error);
    }
  };

  const handleBannerClick = async () => {
    if (!banner) return;

    try {
      // Track click
      await supabase.from('ad_impressions').insert({
        banner_id: banner.id,
        campaign_id: banner.campaign_id,
        impression_type: 'click',
        page_path: window.location.pathname,
        session_id: sessionStorage.getItem('session_id') || undefined,
        device_type: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        browser: navigator.userAgent,
        referrer: document.referrer || undefined,
      });

      // Increment banner stats
      await supabase.rpc('increment_banner_stats', {
        p_banner_id: banner.id,
        p_stat_type: 'click',
      });

      // Open link
      window.open(banner.click_url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Failed to track banner click:', error);
      // Still open link even if tracking fails
      window.open(banner.click_url, '_blank', 'noopener,noreferrer');
    }
  };

  // Don't render if no banner or loading
  if (isLoading || !banner) return null;

  // Get appropriate image for device
  const isMobile = /Mobile|Android|iPhone/i.test(navigator.userAgent);
  const imageUrl = isMobile && banner.mobile_image_url ? banner.mobile_image_url : banner.image_url;

  return (
    <div 
      ref={bannerRef}
      className={`relative group cursor-pointer overflow-hidden ${className}`}
      onClick={handleBannerClick}
    >
      {/* Sponsored Label - Hidden on mobile sticky */}
      {location !== 'mobile_sticky' && (
        <div className="absolute top-2 right-2 z-10 px-3 py-1 bg-background/90 backdrop-blur-sm border border-border rounded-full">
          <div className="flex items-center gap-1.5">
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Sponsorlu</span>
          </div>
        </div>
      )}

      {/* Banner Image */}
      <div className={`relative w-full overflow-hidden ${
        location === 'mobile_sticky' 
          ? 'rounded border-none' 
          : 'rounded-lg border border-border/50 shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:scale-[1.01]'
      } ${location === 'sidebar' ? 'max-w-[300px]' : ''}`}>
        <OptimizedImage
          src={imageUrl}
          alt={banner.alt_text || banner.banner_name}
          className={`${location === 'mobile_sticky' ? 'w-full h-full object-cover' : 'w-full h-auto'} ${location === 'sidebar' ? 'max-w-full' : ''}`}
          width={location === 'mobile_sticky' ? 320 : location === 'sidebar' ? 300 : 1920}
          height={location === 'mobile_sticky' ? 100 : location === 'sidebar' ? 250 : 400}
          priority={location === 'hero'}
          sizes={
            location === 'hero' 
              ? '(max-width: 640px) 100vw, 1280px'
              : location === 'sidebar'
              ? '300px'
              : location === 'mobile_sticky'
              ? '100vw'
              : '(max-width: 640px) 100vw, 800px'
          }
        />

        {/* Hover Overlay - Not on mobile sticky */}
        {location !== 'mobile_sticky' && (
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
      </div>
    </div>
  );
}
