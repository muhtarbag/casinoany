import { memo, useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ExternalLink, Heart, TrendingUp, Eye, MousePointerClick, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { OptimizedImage } from '@/components/OptimizedImage';
import { useToast } from '@/hooks/use-toast';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SocialMediaBar } from './BettingSiteCard/SocialMediaBar';
import { TrustBadges } from './BettingSiteCard/TrustBadges';

const getRandomBaseFromId = (id: string | undefined, min: number, max: number): number => {
  if (!id) return min;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash = hash & hash;
  }
  const normalized = Math.abs(hash) % (max - min + 1);
  return min + normalized;
};

interface BettingSiteCardProps {
  id?: string;
  slug?: string;
  name: string;
  logo?: string;
  rating: number;
  bonus?: string;
  features?: string[];
  affiliateUrl: string;
  email?: string;
  whatsapp?: string;
  telegram?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  views?: number;
  clicks?: number;
  reviewCount?: number;
  avgRating?: number;
  priority?: boolean;
}

const BettingSiteCardComponent = ({
  id,
  slug,
  name,
  logo,
  rating,
  bonus,
  features = [],
  affiliateUrl,
  email,
  whatsapp,
  telegram,
  twitter,
  instagram,
  facebook,
  youtube,
  views = 0,
  clicks = 0,
  reviewCount = 0,
  avgRating = 0,
  priority = false,
}: BettingSiteCardProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [featuresExpanded, setFeaturesExpanded] = useState(false);
  const { user } = useAuth();
  const { isFavorite: checkFavorite, toggleFavorite, isToggling } = useFavorites();
  const showFallback = !logo || !logoUrl || imageError;
  const isFavorite = checkFavorite(id);

  const baseViews = getRandomBaseFromId(id, 5000, 15000);
  const baseClicks = getRandomBaseFromId(id, 1000, 5000);
  const displayViews = baseViews + views;
  const displayClicks = baseClicks + clicks;
  const isTrending = displayViews > 10000;

  useEffect(() => {
    if (logo) {
      setIsLoading(true);
      setImageError(false);
      
      if (logo.startsWith('http')) {
        setLogoUrl(logo);
        setIsLoading(false);
      } else {
        const { data } = supabase.storage.from('site-logos').getPublicUrl(logo);
        setLogoUrl(data.publicUrl);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [logo]);

  const trackClickMutation = useMutation({
    mutationFn: async () => {
      if (!id) return;
      
      const { error } = await supabase.rpc('increment_site_stats', {
        p_site_id: id,
        p_metric_type: 'click'
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites', 'stats'] });
    },
  });

  const handleAffiliateClick = useCallback(() => {
    trackClickMutation.mutate();
    window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
  }, [affiliateUrl, trackClickMutation]);

  const handleDetailsClick = useCallback(() => {
    if (slug) {
      navigate(`/site/${slug}`);
    }
  }, [navigate, slug]);

  const handleFavoriteClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Giriş Yapmanız Gerekiyor",
        description: "Favorilere eklemek için lütfen giriş yapın.",
        variant: "destructive",
      });
      return;
    }

    if (!id) return;

    await toggleFavorite({ siteId: id, isFavorite });
    toast({
      title: isFavorite ? "Favorilerden Çıkarıldı" : "Favorilere Eklendi",
      description: isFavorite 
        ? `${name} favorilerinizden çıkarıldı.`
        : `${name} favorilerinize eklendi.`,
    });
  }, [user, id, isFavorite, toggleFavorite, name, toast]);

  const visibleFeatures = featuresExpanded ? features : features.slice(0, 3);
  const hasMoreFeatures = features.length > 3;

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-hover hover:scale-[1.02] bg-card border-border/50">
      {/* Shimmer loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      )}

      {/* Trending badge */}
      {isTrending && (
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="secondary" className="gap-1 bg-gradient-secondary text-secondary-foreground shadow-glow-gold animate-pulse">
            <TrendingUp className="w-3 h-3" />
            Popüler
          </Badge>
        </div>
      )}

      {/* Favorite button */}
      <button
        onClick={handleFavoriteClick}
        disabled={isToggling}
        className={cn(
          "absolute top-3 left-3 z-10 p-2 rounded-full transition-all duration-300",
          "bg-background/80 backdrop-blur-sm border border-border/50",
          "hover:scale-110 active:scale-95",
          isFavorite ? "text-destructive" : "text-muted-foreground hover:text-destructive"
        )}
        aria-label={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
      >
        <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
      </button>

      <div className="p-5">
        {/* Rating & Stats Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {/* Animated Rating */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "w-5 h-5 transition-all duration-300",
                    star <= Math.round(rating)
                      ? "fill-gold text-gold animate-pulse-slow"
                      : "text-muted-foreground"
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-foreground">{rating.toFixed(1)}</span>
          </div>

          {/* Popularity Metrics */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1" title={`${displayViews.toLocaleString('tr-TR')} görüntüleme`}>
              <Eye className="w-3.5 h-3.5" />
              <span>{(displayViews / 1000).toFixed(1)}k</span>
            </div>
            <div className="flex items-center gap-1" title={`${displayClicks.toLocaleString('tr-TR')} tıklama`}>
              <MousePointerClick className="w-3.5 h-3.5" />
              <span>{(displayClicks / 1000).toFixed(1)}k</span>
            </div>
          </div>
        </div>

        {/* Logo & Name */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden bg-muted border border-border/50">
            {!showFallback ? (
              <OptimizedImage
                src={logoUrl!}
                alt={`${name} logo`}
                width={80}
                height={56}
                className="object-contain w-full h-full p-2"
                priority={priority}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                {name.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-foreground truncate mb-1">
              {name}
            </h3>
            <TrustBadges reviewCount={reviewCount} />
          </div>
        </div>

        {/* Bonus - Prominent */}
        {bonus && (
          <div className="mb-4 p-3 rounded-lg bg-gradient-secondary/10 border border-secondary/20">
            <div className="text-xs font-medium text-secondary-foreground/70 mb-1">
              HOŞGELDİN BONUSU
            </div>
            <div className="text-lg font-bold bg-gradient-secondary bg-clip-text text-transparent">
              {bonus}
            </div>
          </div>
        )}

        {/* Features - Collapsible */}
        {features.length > 0 && (
          <Collapsible open={featuresExpanded} onOpenChange={setFeaturesExpanded}>
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-2">
                {visibleFeatures.map((feature, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs bg-muted hover:bg-muted/80 text-muted-foreground transition-all duration-200 hover:scale-105"
                  >
                    {feature}
                  </Badge>
                ))}
              </div>
              
              {hasMoreFeatures && (
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs text-accent hover:text-accent/80 font-medium"
                  >
                    {featuresExpanded ? (
                      <>
                        Daha az göster <ChevronUp className="ml-1 w-3 h-3" />
                      </>
                    ) : (
                      <>
                        {features.length - 3} özellik daha <ChevronDown className="ml-1 w-3 h-3" />
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
              )}
            </div>
            
            <CollapsibleContent>
              {/* Already rendered above */}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Social Media Compact Bar */}
        <SocialMediaBar
          email={email}
          whatsapp={whatsapp}
          telegram={telegram}
          twitter={twitter}
          instagram={instagram}
          facebook={facebook}
          youtube={youtube}
          siteName={name}
          siteId={id}
        />

        {/* CTA Buttons - Optimized Hierarchy */}
        <div className="flex gap-3 mt-4">
          <Button
            onClick={handleAffiliateClick}
            className="flex-1 bg-gradient-secondary hover:opacity-90 text-secondary-foreground font-bold shadow-glow-gold transition-all duration-300 hover:scale-105 active:scale-95 group relative overflow-hidden"
            size="lg"
          >
            {/* Ripple effect */}
            <span className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 transition-transform duration-300 rounded-lg" />
            <span className="relative flex items-center gap-2">
              Hemen Kayıt Ol
              <ExternalLink className="w-4 h-4" />
            </span>
          </Button>
          
          <Button
            onClick={handleDetailsClick}
            variant="outline"
            className="border-accent/30 text-accent hover:bg-accent/10 hover:border-accent transition-all duration-300 hover:scale-105"
            size="lg"
          >
            İncele
          </Button>
        </div>

        {/* Scarcity Element */}
        {reviewCount > 20 && (
          <div className="mt-3 text-center text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
              {reviewCount} kullanıcı deneyimini paylaştı
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};

export const BettingSiteCard = memo(BettingSiteCardComponent);
