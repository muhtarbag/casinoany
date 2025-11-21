import { memo, Fragment, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BettingSiteCard } from './BettingSiteCard';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Search } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { EmptyState } from './EmptyState';
import { DynamicBanner } from './DynamicBanner';
import { HowItWorksSection } from './HowItWorksSection';

interface PixelGridProps {
  searchTerm?: string;
}

export const PixelGrid = memo(({ searchTerm = '' }: PixelGridProps) => {
  const { data: sites, isLoading } = useQuery({
    queryKey: ['betting-sites-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('id, name, logo_url, rating, bonus, features, affiliate_link, slug, email, whatsapp, telegram, twitter, instagram, facebook, youtube, is_active, display_order, review_count, avg_rating')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const { data: banners } = useQuery({
    queryKey: ['site-banners-home'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_banners')
        .select('*')
        .eq('is_active', true)
        .contains('display_pages', ['home'])
        .order('position', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Filter sites based on search term
  const filteredSites = useMemo(() => {
    if (!sites || !searchTerm.trim()) {
      return sites || [];
    }

    const searchLower = searchTerm.toLowerCase().trim();
    return sites.filter(site =>
      site.name.toLowerCase().includes(searchLower) ||
      site.bonus?.toLowerCase().includes(searchLower) ||
      site.features?.some((feature: string) => 
        feature.toLowerCase().includes(searchLower)
      )
    );
  }, [sites, searchTerm]);

  if (isLoading) {
    return (
      <div className="py-20 space-y-8 animate-fade-in">
        <div className="container mx-auto px-4">
          {/* Clean loading skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-xl border border-border/40 bg-card/50 p-6 space-y-4">
                <div className="w-24 h-24 bg-muted/20 rounded-lg mx-auto animate-pulse" />
                <div className="space-y-2">
                  <div className="h-6 bg-muted/20 rounded animate-pulse" />
                  <div className="h-4 bg-muted/20 rounded w-3/4 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!filteredSites || filteredSites.length === 0) {
    if (searchTerm.trim()) {
      return (
        <EmptyState
          icon={Search}
          title={`"${searchTerm}" için Sonuç Bulunamadı`}
          description="Farklı bir arama terimi deneyin veya filtreleri temizleyin."
        />
      );
    }
    return (
      <EmptyState
        icon={Search}
        title="Henüz Site Bulunmuyor"
        description="Şu anda aktif bahis sitesi bulunmamaktadır. Lütfen daha sonra tekrar kontrol edin."
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Site Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSites.map((site: any, index: number) => {
          const isPriority = index < 6;
          // Find banners for this position
          const bannersAtPosition = banners?.filter(banner => banner.position === index) || [];
          
          return (
            <Fragment key={site.id}>
              <BettingSiteCard
                id={site.id}
                slug={site.slug}
                name={site.name}
                logo={site.logo_url || ''}
                rating={site.rating || 0}
                bonus={site.bonus || ''}
                features={site.features || []}
                affiliateUrl={site.affiliate_link || ''}
                email={site.email || ''}
                whatsapp={site.whatsapp || ''}
                telegram={site.telegram || ''}
                twitter={site.twitter || ''}
                instagram={site.instagram || ''}
                facebook={site.facebook || ''}
                youtube={site.youtube || ''}
                reviewCount={site.review_count || 0}
                avgRating={site.avg_rating || 0}
                priority={isPriority}
              />
              {bannersAtPosition.length > 0 && (
                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                  {bannersAtPosition.map(banner => (
                    <DynamicBanner
                      key={banner.id}
                      imageUrl={banner.image_url}
                      mobileImageUrl={banner.mobile_image_url}
                      altText={banner.alt_text}
                      targetUrl={banner.target_url}
                      title={banner.title}
                    />
                  ))}
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
});
