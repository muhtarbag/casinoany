import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from './LoadingSpinner';
import { OptimizedImage } from '@/components/OptimizedImage';
import { useMemo } from 'react';

interface FeaturedSitesSectionProps {
  searchTerm?: string;
}

export const FeaturedSitesSection = ({ searchTerm = '' }: FeaturedSitesSectionProps) => {
  const { data: featuredSites, isLoading } = useQuery({
    queryKey: ['featured-sites-for-homepage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('name, slug, logo_url, rating, bonus, review_count, avg_rating')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('rating', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
  });

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
        <Link 
          key={site.slug}
          to={`/${site.slug}`}
          className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <div className="flex-shrink-0 w-44 h-32 sm:w-32 sm:h-24 md:w-36 md:h-28 bg-card dark:bg-card rounded-xl flex items-center justify-center border-3 border-primary/30 shadow-xl ring-4 ring-primary/20 transition-all duration-300 hover:shadow-2xl hover:ring-primary/40 hover:scale-105 hover:border-primary/50">
              {site.logo_url ? (
                <OptimizedImage
                  src={site.logo_url}
                  alt={`${site.name} logo`}
                  className="w-40 h-28 sm:w-28 sm:h-20 md:w-32 md:h-24 object-contain p-2"
                  width={160}
                  height={112}
                  objectFit="contain"
                  fetchPriority="high"
                  priority={true}
                  responsive={false}
                  fallback="/placeholder.svg"
                />
              ) : (
                <span className="text-5xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
                  {site.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base sm:text-lg group-hover:text-primary transition-colors truncate">
                {site.name} İnceleme
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                ⭐ {(site.avg_rating || site.rating || 0).toFixed(1)}/5.0
                {site.review_count > 0 && ` (${site.review_count} yorum)`}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {site.bonus || 'Bonus bilgisi mevcut değil'}
          </p>
          <span className="text-primary text-sm font-semibold group-hover:underline">
            Detaylı İncelemeyi Oku →
          </span>
        </Link>
      ))}
    </div>
  );
};
