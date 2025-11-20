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
          <div className="flex items-center gap-4 mb-4">
            <div className="w-28 h-28 bg-card dark:bg-card rounded-lg flex items-center justify-center border-2 border-border shadow-md ring-2 ring-primary/20 transition-all duration-300 hover:shadow-xl hover:ring-primary/40">
              {site.logo_url ? (
                <OptimizedImage
                  src={site.logo_url}
                  alt={`${site.name} logo`}
                  className="w-24 h-24 object-contain"
                  width={96}
                  height={96}
                  objectFit="contain"
                  fetchPriority="high"
                  priority={true}
                  responsive={false}
                  fallback="/placeholder.svg"
                />
              ) : (
                <span className="text-3xl font-bold text-primary">
                  {site.name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                {site.name} İnceleme
              </h3>
              <p className="text-sm text-muted-foreground">
                ⭐ {(site.avg_rating || site.rating || 0).toFixed(1)}/5.0
                {site.review_count > 0 && ` (${site.review_count} yorum)`}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
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
