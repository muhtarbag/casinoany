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
      <CardContent className="p-3 md:p-5">
        <div className="flex flex-col items-center text-center gap-1">
          {logoUrl && (
            <div className="flex-shrink-0 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-lg animate-shimmer" />
              <img 
                src={logoUrl} 
                alt={`${site.name} logo`} 
                className="w-48 h-48 md:w-72 md:h-72 object-contain rounded-lg bg-card/50 p-4 relative z-10 transition-all duration-300"
                loading="eager"
              />
            </div>
          )}
          
          <div className="w-full">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-1.5 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent leading-tight">
              {site.name}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <Star className="w-5 h-5 fill-gold text-gold" />
                <span className="font-bold text-lg">{averageRating}</span>
                <span className="text-sm text-foreground/70">
                  ({reviewCount} değerlendirme)
                </span>
              </div>
              
              {site.is_featured && (
                <Badge variant="secondary" className="bg-gradient-secondary">
                  ⭐ Öne Çıkan
                </Badge>
              )}
            </div>
            
            {/* Social Proof Badge */}
            <div className="mb-2">
              <Badge variant="outline" className="bg-primary/5 border-primary/20 animate-[pulse_3s_ease-in-out_infinite]">
                🔥 Son 24 saatte 50+ kişi tıkladı
              </Badge>
            </div>
            
            {site.bonus && (
              <div className="bg-gradient-secondary/10 border border-secondary/30 rounded-lg p-2.5 mb-3 max-w-2xl mx-auto sticky top-20 z-10 md:relative md:top-auto backdrop-blur-sm">
                <div className="flex items-center justify-center gap-2 mb-0.5">
                  <span className="text-xl">🎁</span>
                  <span className="font-bold text-base">Hoş Geldin Bonusu</span>
                </div>
                <p className="text-lg font-bold text-secondary mb-1">{site.bonus}</p>
                <p className="text-xs text-foreground/60">✓ 2 dakikada kayıt</p>
              </div>
            )}
            
            <Button 
              size="lg" 
              className="w-full md:w-auto bg-gradient-secondary hover:opacity-90 hover:scale-105 hover:shadow-2xl text-lg font-bold transition-all duration-300 relative overflow-hidden group"
              onClick={onAffiliateClick}
              style={{ boxShadow: '0 0 40px rgba(234, 179, 8, 0.3)' }}
            >
              <span className="relative z-10">Bonusu Hemen Al <ExternalLink className="ml-2 w-5 h-5 inline" /></span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
