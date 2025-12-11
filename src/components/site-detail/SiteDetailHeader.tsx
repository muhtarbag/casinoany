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
              <img
                src={logoUrl}
                alt={`${site.name} logo`}
                width="448"
                height="448"
                className="w-80 h-80 md:w-[28rem] md:h-[28rem] object-contain relative z-10 transition-all duration-500 group-hover:scale-105"
                loading="eager"
                fetchPriority="high"
              />
            </div>
          )}

          <div className="w-full">
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-2 bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent leading-tight">
              {site.name}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
              <div className="flex items-center gap-2 bg-gradient-to-r from-gold/10 to-gold/5 px-4 py-2 rounded-full border border-gold/20">
                <Star className="w-6 h-6 fill-gold text-gold drop-shadow-lg" />
                <span className="font-bold text-xl text-gold drop-shadow-sm">{averageRating}</span>
                <span className="text-sm text-foreground/80 font-medium">
                  ({reviewCount} değerlendirme)
                </span>
              </div>

              {site.ownership_verified && (
                <Badge variant="outline" className="bg-gradient-to-r from-success/20 to-success/10 border-success text-success font-semibold px-3 py-1 text-sm shadow-lg shadow-success/20">
                  ✓ Doğrulanmış Site
                </Badge>
              )}

              {site.is_featured && (
                <Badge variant="secondary" className="bg-gradient-secondary shadow-lg">
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
              <div className="bg-gradient-to-br from-secondary/20 via-secondary/10 to-transparent border-2 border-secondary/40 rounded-xl p-4 mb-4 max-w-2xl mx-auto sticky top-20 z-10 md:relative md:top-auto backdrop-blur-md shadow-2xl shadow-secondary/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl animate-bounce">🎁</span>
                  <span className="font-bold text-lg bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">Hoş Geldin Bonusu</span>
                </div>
                <p className="text-xl md:text-2xl font-bold text-secondary mb-2 drop-shadow-sm">{site.bonus}</p>
                <div className="flex items-center justify-center gap-4 text-xs md:text-sm text-foreground/80">
                  <span className="flex items-center gap-1">✓ 2 dakikada kayıt</span>
                  <span className="flex items-center gap-1">✓ Anında bonus</span>
                </div>
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
                    className={`w-5 h-5 transition-all duration-300 ${isFavorite
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
