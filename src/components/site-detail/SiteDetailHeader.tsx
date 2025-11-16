import { ExternalLink, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SiteDetailHeaderProps {
  site: any;
  logoUrl: string | null;
  averageRating: string;
  reviewCount: number;
  onAffiliateClick: () => void;
}

export const SiteDetailHeader = ({
  site,
  logoUrl,
  averageRating,
  reviewCount,
  onAffiliateClick
}: SiteDetailHeaderProps) => {
  return (
    <Card className="shadow-xl border-primary/20">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col items-center text-center gap-6">
          {logoUrl && (
            <div className="flex-shrink-0">
              <img 
                src={logoUrl} 
                alt={`${site.name} logo`} 
                className="w-48 h-48 md:w-72 md:h-72 object-contain rounded-lg bg-card/50 p-4"
              />
            </div>
          )}
          
          <div className="w-full">
            <h1 className="text-2xl md:text-4xl font-bold mb-3 text-foreground">{site.name}</h1>
            
            <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
              <div className="flex items-center gap-1.5">
                <Star className="w-5 h-5 fill-gold text-gold" />
                <span className="font-bold text-lg">{averageRating}</span>
                <span className="text-sm text-muted-foreground">
                  ({reviewCount} değerlendirme)
                </span>
              </div>
              
              {site.is_featured && (
                <Badge variant="secondary" className="bg-gradient-secondary">
                  ⭐ Öne Çıkan
                </Badge>
              )}
            </div>
            
            {site.bonus && (
              <div className="bg-gradient-secondary/10 border border-secondary/30 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-2xl">🎁</span>
                  <span className="font-bold text-lg">Hoş Geldin Bonusu</span>
                </div>
                <p className="text-xl font-bold text-secondary">{site.bonus}</p>
              </div>
            )}
            
            <Button 
              size="lg" 
              className="w-full md:w-auto bg-gradient-secondary hover:opacity-90 text-lg font-bold shadow-glow-gold animate-pulse"
              onClick={onAffiliateClick}
            >
              Siteye Git <ExternalLink className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
