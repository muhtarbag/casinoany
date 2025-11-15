import { Link } from 'react-router-dom';
import { Star, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

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
  const showFallback = !site.logo_url || imageError;

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card/50 backdrop-blur">
      <CardHeader className="pb-3">
        {/* Logo */}
        <div className="flex items-center justify-center h-20 mb-3">
          {!showFallback ? (
            <img
              src={site.logo_url}
              alt={`${site.name} logo`}
              className="max-h-full max-w-full object-contain"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-muted rounded flex items-center justify-center">
              <span className="text-2xl font-bold text-muted-foreground">
                {site.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Site Name */}
        <h3 className="text-center font-semibold truncate group-hover:text-primary transition-colors">
          {site.name}
        </h3>

        {/* Rating */}
        {site.rating && (
          <div className="flex items-center justify-center gap-1 text-sm">
            <Star className="w-4 h-4 fill-primary text-primary" />
            <span className="font-bold">{site.rating.toFixed(1)}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="pb-3">
        {/* Bonus */}
        {site.bonus && (
          <div className="text-center">
            <Badge variant="secondary" className="text-xs">
              {site.bonus}
            </Badge>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-2 pt-3">
        {/* Detay Butonu */}
        <Link to={`/site/${site.slug}`} className="w-full">
          <Button variant="outline" size="sm" className="w-full">
            Detay
          </Button>
        </Link>

        {/* Kayıt Butonu */}
        <a
          href={site.affiliate_link}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full"
        >
          <Button size="sm" className="w-full gap-2">
            <ExternalLink className="w-4 h-4" />
            Kayıt Ol
          </Button>
        </a>
      </CardFooter>
    </Card>
  );
}
