import { Link } from 'react-router-dom';
import { Star, Gift, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
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
  };
}

export function CompactSiteCard({ site }: CompactSiteCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const showFallback = !site.logo_url || imageError;

  return (
    <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/30">
      {/* Gradient accent on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardContent className="p-4 relative">
        {/* Logo Section - Kompakt */}
        <div className="flex items-center justify-center h-14 mb-3 relative">
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
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setImageError(true);
                setIsLoading(false);
              }}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 rounded-lg flex items-center justify-center animate-scale-in">
              <span className="text-3xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
                {site.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Site Name - Bold & Prominent */}
        <h3 className="text-center font-bold text-base mb-2 truncate group-hover:text-primary transition-colors">
          {site.name}
        </h3>

        {/* Rating + Bonus - Single Line */}
        <div className="flex items-center justify-center gap-3 mb-3 text-sm">
          {site.rating && (
            <div className="flex items-center gap-1 text-primary">
              <Star className="w-3.5 h-3.5 fill-primary" />
              <span className="font-bold">{site.rating.toFixed(1)}</span>
            </div>
          )}
          
          {site.rating && site.bonus && (
            <span className="text-muted-foreground">•</span>
          )}
          
          {site.bonus && (
            <div className="flex items-center gap-1 text-accent">
              <Gift className="w-3.5 h-3.5" />
              <span className="font-semibold text-xs">{site.bonus}</span>
            </div>
          )}
        </div>

        {/* Primary CTA - Kayıt Ol */}
        <a
          href={site.affiliate_link}
          target="_blank"
          rel="noopener noreferrer"
          className="block mb-2"
        >
          <Button 
            size="sm" 
            className="w-full group-hover:bg-primary group-hover:scale-105 transition-all duration-200 shadow-md hover:shadow-xl"
          >
            Kayıt Ol
            <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </a>

        {/* Secondary Link - Detay */}
        <Link 
          to={`/site/${site.slug}`} 
          className="block text-center text-xs text-muted-foreground hover:text-primary transition-colors story-link"
        >
          detaylı inceleme
        </Link>
      </CardContent>
    </Card>
  );
}
