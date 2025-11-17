import { memo, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Star, Gift, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CompactSiteCardProps {
  site: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    rating: number | null;
    bonus: string | null;
    affiliate_link: string;
    review_count?: number;
    avg_rating?: number;
  };
}

export const CompactSiteCard = memo(({ site }: CompactSiteCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const showFallback = !site.logo_url || imageError;
  
  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
  }, []);
  
  const handleImageError = useCallback(() => {
    setImageError(true);
    setIsLoading(false);
  }, []);
  
  const displayRating = useMemo(() => 
    (site.avg_rating || site.rating || 0).toFixed(1),
    [site.avg_rating, site.rating]
  );

  return (
    <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/30 active:scale-95">
      {/* Gradient accent on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardContent className="p-5 sm:p-4 relative">
        {/* Logo Section - Kompakt */}
        <div className="flex items-center justify-center h-16 sm:h-14 mb-4 sm:mb-3 relative">
          {/* Loading Skeleton */}
          {isLoading && !showFallback && (
            <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse rounded" />
          )}
          
          {!showFallback ? (
            <img
              src={site.logo_url}
              alt={`${site.name} logo`}
              className={cn(
                "max-h-full max-w-full object-contain transition-opacity duration-300",
                isLoading ? "opacity-0" : "opacity-100 animate-fade-in"
              )}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 rounded-lg flex items-center justify-center animate-scale-in">
              <span className="text-4xl sm:text-3xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
                {site.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Site Name - Bold & Prominent */}
        <h3 className="text-center font-bold text-lg sm:text-base mb-3 sm:mb-2 truncate group-hover:text-primary transition-colors">
          {site.name}
        </h3>

        {/* Rating + Bonus - Single Line - MOBİL OPTIMIZE */}
        <div className="flex items-center justify-center gap-3 mb-4 sm:mb-3 text-sm flex-wrap">
          {site.rating && (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5 text-primary">
                <Star className="w-4 h-4 sm:w-3.5 sm:h-3.5 fill-primary" />
                <span className="font-bold text-base sm:text-sm">
                  {displayRating}
                </span>
              </div>
              {site.review_count > 0 && (
                <span className="text-xs text-muted-foreground">
                  {site.review_count} yorum
                </span>
              )}
            </div>
          )}
          
          {site.rating && site.bonus && (
            <span className="text-muted-foreground hidden sm:inline">•</span>
          )}
          
          {site.bonus && (
            <div className="flex items-center gap-1.5 text-accent">
              <Gift className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span className="font-semibold text-sm sm:text-xs">{site.bonus}</span>
            </div>
          )}
        </div>

        {/* Primary CTA - Kayıt Ol - MOBİL TOUCH TARGET */}
        <a
          href={site.affiliate_link}
          target="_blank"
          rel="noopener noreferrer"
          className="block mb-3 sm:mb-2"
        >
          <Button 
            size="lg"
            className="w-full h-12 sm:h-10 text-base sm:text-sm group-hover:bg-primary group-hover:scale-105 transition-all duration-200 shadow-md hover:shadow-xl active:scale-95"
          >
            Kayıt Ol
            <ArrowRight className="ml-2 w-5 h-5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </a>

        {/* Secondary Link - Detay - MOBİL TOUCH TARGET */}
        <Link 
          to={`/site/${site.slug}`} 
          className="block text-center text-sm sm:text-xs text-muted-foreground hover:text-primary transition-colors story-link py-2 sm:py-1"
        >
          detaylı inceleme
        </Link>
      </CardContent>
    </Card>
  );
});

CompactSiteCard.displayName = 'CompactSiteCard';
