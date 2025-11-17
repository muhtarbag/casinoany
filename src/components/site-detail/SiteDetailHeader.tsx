import { ExternalLink, Star, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SiteDetailHeaderProps {
  site: any;
  logoUrl: string | null;
  averageRating: string;
  reviewCount: number;
  onAffiliateClick: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  favoriteLoading?: boolean;
}

export const SiteDetailHeader = ({
  site,
  logoUrl,
  averageRating,
  reviewCount,
  onAffiliateClick,
  isFavorite = false,
  onToggleFavorite,
  favoriteLoading = false
}: SiteDetailHeaderProps) => {
  return (
    <Card className="shadow-xl border-primary/20">
      <CardContent className="p-3 md:p-5">
        <div className="flex flex-col items-center text-center gap-1">
          {logoUrl && (
            <div className="flex-shrink-0 relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-secondary/20 to-transparent rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute inset-0 bg-primary/5 rounded-lg animate-[pulse_4s_ease-in-out_infinite]" />
              <img 
                src={logoUrl} 
                alt={`${site.name} logo`} 
                className="w-48 h-48 md:w-72 md:h-72 object-contain rounded-lg bg-card/50 p-4 relative z-10 transition-all duration-500 group-hover:scale-105"
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
            <div className="mb-2 animate-[fade-in_0.6s_ease-out_0.3s_both]">
              <Badge variant="outline" className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(234,179,8,0.2)]">
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
            
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <Button 
                size="lg" 
                className="flex-1 md:flex-none bg-gradient-secondary text-lg font-bold relative overflow-hidden group transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(234,179,8,0.4)]"
                onClick={onAffiliateClick}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                <span className="relative z-10 flex items-center gap-2">
                  Bonusu Hemen Al 
                  <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Button>
              
              {onToggleFavorite && (
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full md:w-auto border-2 hover:border-primary transition-all duration-300"
                  onClick={onToggleFavorite}
                  disabled={favoriteLoading}
                >
                  <Heart 
                    className={`w-5 h-5 transition-all duration-300 ${
                      isFavorite 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-foreground/70 hover:text-red-500'
                    }`}
                  />
                  <span className="ml-2">{isFavorite ? 'Favorilerde' : 'Favoriye Ekle'}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
