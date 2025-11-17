import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from './LoadingSpinner';
import { OptimizedImage } from '@/components/OptimizedImage';

export const FeaturedSitesSection = () => {
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

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!featuredSites || featuredSites.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {featuredSites.map((site) => (
        <Link 
          key={site.slug}
          to={`/site/${site.slug}`}
          className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center gap-4 mb-4">
            {site.logo_url ? (
              <OptimizedImage
                src={site.logo_url}
                alt={`${site.name} logo`}
                className="w-16 h-16 rounded-lg"
                width={64}
                height={64}
                objectFit="contain"
                fetchPriority="auto"
                responsive={false}
                fallback="/placeholder.svg"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                <span className="text-2xl font-bold">{site.name.charAt(0)}</span>
              </div>
            )}
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
