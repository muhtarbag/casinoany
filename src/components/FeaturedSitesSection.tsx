import { Link } from 'react-router-dom';
import { LoadingSpinner } from './LoadingSpinner';
import { OptimizedImage } from '@/components/OptimizedImage';
import { useMemo } from 'react';
import { useFeaturedSites } from '@/hooks/queries/useBettingSitesQueries';

interface FeaturedSitesSectionProps {
  searchTerm?: string;
  featuredSites?: any[];
  isLoading?: boolean;
}

export const FeaturedSitesSection = ({
  searchTerm = '',
  featuredSites,
  isLoading
}: FeaturedSitesSectionProps) => {

  // Filter sites based on search term
  const filteredSites = useMemo(() => {
    if (!featuredSites || !searchTerm.trim()) {
      return featuredSites || [];
    }

    const searchLower = searchTerm.toLowerCase().trim();
    return featuredSites.filter(site =>
      site.name.toLowerCase().includes(searchLower) ||
      site.bonus?.toLowerCase().includes(searchLower)
    );
  }, [featuredSites, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!filteredSites || filteredSites.length === 0) {
    if (searchTerm.trim()) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            "{searchTerm}" için sonuç bulunamadı.
          </p>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {filteredSites.map((site) => (
        <div
          key={site.slug}
          className="group bg-card border border-border rounded-xl p-4 sm:p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
        >
          {/* Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-xl flex items-center justify-center border-2 border-border shadow-sm p-2">
              {site.logo_url ? (
                <OptimizedImage
                  src={site.logo_url}
                  alt={`${site.name} logo`}
                  className="w-full h-full object-contain"
                  width={112}
                  height={112}
                  objectFit="contain"
                  responsive={false}
                  fallback="/placeholder.svg"
                />
              ) : (
                <span className="text-3xl font-bold text-primary">
                  {site.name.charAt(0)}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0 py-1">
              <Link to={`/${site.slug}`} className="block">
                <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-primary transition-colors truncate">
                  {site.name}
                </h3>
              </Link>

              <div className="flex items-center gap-1 mb-2">
                <span className="text-yellow-500 text-sm">⭐</span>
                <span className="font-semibold text-sm">{(site.avg_rating || site.rating || 0).toFixed(1)}</span>
                <span className="text-muted-foreground text-xs">/ 5.0</span>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2 leading-snug mb-2">
                {site.bonus || 'Özel bonus fırsatları sizi bekliyor.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link
              to={`/${site.slug}`}
              className="flex items-center justify-center px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-secondary/80 transition-colors"
            >
              İncele
            </Link>
            <a
              href={site.affiliate_link || '#'}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="flex items-center justify-center px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold shadow-md hover:shadow-lg hover:bg-primary/90 transition-all"
            >
              Siteye Git ⚡
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};
