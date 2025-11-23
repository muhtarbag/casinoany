import { memo, Fragment, useMemo } from 'react';
import { BettingSiteCard } from './BettingSiteCard';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Search } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { EmptyState } from './EmptyState';
import { HowItWorksSection } from './HowItWorksSection';
import { AdBanner } from './advertising/AdBanner';
import { useBettingSites } from '@/hooks/queries/useBettingSitesQueries';

interface PixelGridProps {
  searchTerm?: string;
}

export const PixelGrid = memo(({ searchTerm = '' }: PixelGridProps) => {
  // OPTIMIZED: Using centralized queries with proper caching
  const { data: sites, isLoading } = useBettingSites({ 
    isActive: true,
    orderBy: 'display_order'
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

  const firstBatch = filteredSites.slice(0, 60);
  const secondBatch = filteredSites.slice(60);

  return (
    <div className="space-y-8">
      {/* How It Works Section */}
      <HowItWorksSection />

      {/* First 60 Sites - Mobile: 1 column */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {firstBatch.map((site: any, index: number) => {
          const isPriority = index < 6;
          const showBetweenSitesAd = (index + 1) % 3 === 0;
          
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
              {showBetweenSitesAd && (
                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                  <AdBanner location="between_sites" className="w-full" />
                </div>
              )}
            </Fragment>
          );
        })}
      </div>

      {/* After 60 Sites - Mobile: 2 columns with compact design */}
      {secondBatch.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {secondBatch.map((site: any, index: number) => {
            const actualIndex = index + 60;
            const showBetweenSitesAd = (actualIndex + 1) % 3 === 0;
            
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
                  priority={false}
                  compact={true}
                />
                {showBetweenSitesAd && (
                  <div className="col-span-2 md:col-span-2 lg:col-span-3">
                    <AdBanner location="between_sites" className="w-full" />
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
});
