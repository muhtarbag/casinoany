import { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ExternalLink, Mail, MessageCircle, Send, ChevronRight, Heart } from 'lucide-react';
import { FaTwitter, FaInstagram, FaFacebook, FaYoutube, FaWhatsapp, FaTelegramPlane } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { OptimizedImage } from '@/components/OptimizedImage';
import { useToast } from '@/hooks/use-toast';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';
import { trackSocialClick } from '@/lib/socialTracking';
import { 
  normalizeWhatsAppUrl, 
  normalizeTelegramUrl, 
  normalizeTwitterUrl, 
  normalizeInstagramUrl, 
  normalizeFacebookUrl, 
  normalizeYouTubeUrl 
} from '@/lib/socialMediaHelpers';

// Helper function to generate consistent random number from site ID
const getRandomBaseFromId = (id: string | undefined, min: number, max: number): number => {
  if (!id) return min;
  
  // Simple hash function to convert ID to number
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to range
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
  features,
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
  const { user, isAdmin } = useAuth();
  const { isFavorite: checkFavorite, toggleFavorite, isToggling } = useFavorites();
  const showFallback = !logo || !logoUrl || imageError;

  // ✅ OPTIMIZE EDİLDİ: O(1) lookup - kart başına query yok
  const isFavorite = checkFavorite(id);


  useEffect(() => {
    if (logo) {
      setIsLoading(true);
      setImageError(false);
      
      // Eğer logo zaten tam bir URL ise direkt kullan
      if (logo.startsWith('http')) {
        setLogoUrl(logo);
        setIsLoading(false);
      } else {
        // Değilse storage'dan al
        const { data } = supabase.storage.from('site-logos').getPublicUrl(logo);
        setLogoUrl(data.publicUrl);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [logo]);

  // ✅ DÜZELTILDI: Thread-safe UPSERT kullanıyor (race condition yok)
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
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.invalidateQueries({ queryKey: ['site-stats'] });
      queryClient.invalidateQueries({ queryKey: ['featured-sites'] });
    },
  });

  // ✅ OPTIMIZE EDİLDİ: Global favorites hook kullanıyor
  const handleToggleFavorite = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!id) return;
    
    toggleFavorite({ siteId: id, isFavorite });
  };

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    handleToggleFavorite();
  }, [handleToggleFavorite]);

  const handleCardClick = useCallback(() => {
    if (slug) {
      navigate(`/${slug}`);
    } else if (id) {
      navigate(`/site/${id}`);
    }
  }, [slug, id, navigate]);

  const handleAffiliateClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    trackClickMutation.mutate();
    window.open(affiliateUrl, '_blank');
  }, [trackClickMutation, affiliateUrl]);

  const socialLinks = useMemo(() => {
    const links = [
      { url: email, icon: Mail, label: 'Email', href: `mailto:${email}`, color: '#6366f1', platform: 'email' },
      { 
        url: whatsapp, 
        icon: FaWhatsapp, 
        label: 'WhatsApp', 
        href: normalizeWhatsAppUrl(whatsapp) || '', 
        color: '#25D366', 
        platform: 'whatsapp' 
      },
      { 
        url: telegram, 
        icon: FaTelegramPlane, 
        label: 'Telegram', 
        href: normalizeTelegramUrl(telegram) || '', 
        color: '#0088cc', 
        platform: 'telegram' 
      },
      { url: twitter, icon: FaTwitter, label: 'Twitter', href: normalizeTwitterUrl(twitter) || '', color: '#1DA1F2', platform: 'twitter' },
      { url: instagram, icon: FaInstagram, label: 'Instagram', href: normalizeInstagramUrl(instagram) || '', color: '#E4405F', platform: 'instagram' },
      { url: facebook, icon: FaFacebook, label: 'Facebook', href: normalizeFacebookUrl(facebook) || '', color: '#1877F2', platform: 'facebook' },
      { url: youtube, icon: FaYoutube, label: 'YouTube', href: normalizeYouTubeUrl(youtube) || '', color: '#FF0000', platform: 'youtube' },
    ].filter(link => link.url);
    
    return links;
  }, [email, whatsapp, telegram, twitter, instagram, facebook, youtube, name]);

  return (
    <Card 
      className="group relative overflow-hidden bg-card border border-border hover:border-primary/50 hover:shadow-hover transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
      role="article"
      aria-label={`${name} - Bahis sitesi kartı`}
    >
      <CardHeader className="space-y-4 p-6 relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-shrink-0 w-48 h-32 sm:w-56 sm:h-36 md:w-64 md:h-40 lg:w-72 lg:h-44 bg-card dark:bg-card rounded-xl flex items-center justify-center overflow-hidden border-2 border-border hover:border-primary/70 shadow-md hover:shadow-xl ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300 relative group/logo" style={{ willChange: 'transform' }}>
            {/* Loading Skeleton */}
            {isLoading && !showFallback && (
              <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse" />
            )}
            
            {!showFallback ? (
              <OptimizedImage
                src={logoUrl!}
                alt={`${name} logo`}
                className={`w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 object-contain p-1 transition-all duration-300 group-hover/logo:scale-105 ${
                  isLoading ? 'opacity-0' : 'opacity-100'
                }`}
                width={144}
                height={144}
                objectFit="contain"
                fetchPriority={priority ? 'high' : 'auto'}
                priority={priority}
                responsive={false}
                fallback="/placeholder.svg"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center animate-scale-in">
                <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
                  {name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {/* Favorite Button */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-full transition-all duration-200",
                "hover:scale-110 active:scale-95",
                isFavorite 
                  ? "text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" 
                  : "text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
              )}
              onClick={handleFavoriteClick}
              disabled={isToggling}
              aria-label={isFavorite ? `${name} favorilerden çıkar` : `${name} favorilere ekle`}
            >
              <Heart 
                className={cn(
                  "h-5 w-5 transition-all",
                  isFavorite && "fill-current"
                )} 
                aria-hidden="true"
              />
            </Button>
            
            {/* Rating */}
            <div className="flex items-center gap-1 px-3 py-1.5 bg-gold/10 rounded-lg border border-gold/20">
              <Star className="w-4 h-4 fill-gold text-gold" />
              <span className="font-bold text-sm">{rating.toFixed(1)}</span>
            </div>
            {reviewCount > 0 && (
              <div className="text-xs text-muted-foreground">
                {reviewCount} yorum
              </div>
            )}
          </div>
        </div>
        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
          {name}
        </h3>
        {bonus && (
          <div className="flex items-center gap-2 px-3 py-2 bg-secondary/10 rounded-lg border border-secondary/20">
            <Badge variant="secondary" className="border-0 text-xs">BONUS</Badge>
            <span className="text-sm font-medium text-foreground">{bonus}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4 px-6 pb-6">
        {features && features.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">Özellikler</h4>
            <div className="flex flex-wrap gap-2">
              {features.slice(0, 3).map((feature, idx) => (
                <Badge key={`feature-${id}-${feature}-${idx}`} variant="success" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {features.length > 3 && (
                <Badge variant="success" className="text-xs">+{features.length - 3} daha</Badge>
              )}
            </div>
          </div>
        )}
        {socialLinks.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            {socialLinks.map((link, idx) => {
              const Icon = link.icon;
              return (
                <a key={`social-${id}-${link.label}-${idx}`} href={link.href} target="_blank" rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                    trackSocialClick(id || '', link.platform as any, name);
                  }}
                  className="flex items-center justify-center p-2 rounded-lg transition-all duration-300 group/social relative overflow-hidden"
                  aria-label={link.label}
                  style={{ 
                    backgroundColor: 'hsl(var(--muted))',
                    // @ts-ignore - CSS custom property
                    '--brand-color': link.color,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = link.color;
                    const icon = e.currentTarget.querySelector('svg');
                    if (icon) {
                      (icon as SVGElement).style.color = '#ffffff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'hsl(var(--muted))';
                    const icon = e.currentTarget.querySelector('svg');
                    if (icon) {
                      (icon as SVGElement).style.color = link.color;
                    }
                  }}
                >
                  <Icon 
                    className="w-4 h-4 transition-all duration-300 group-hover/social:scale-110" 
                    style={{ color: link.color }}
                  />
                </a>
              );
            })}
          </div>
        )}
      </CardContent>

      <CardFooter className="px-6 pb-6 pt-0 gap-2">
        <Button variant="outline" size="sm" className="flex-1 group/btn"
          onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
        >
          Detaylar
          <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
        <Button 
          size="sm" 
          className="flex-1 relative font-bold overflow-hidden group/cta transition-all duration-500 bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.6),0_0_50px_rgba(236,72,153,0.4)] hover:scale-[1.02] text-white border-0"
          onClick={handleAffiliateClick}
        >
          {/* Animated shimmer overlay - more visible and slower */}
          <div className="absolute inset-0 w-full h-full">
            <div className="absolute inset-0 translate-x-[-100%] animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent w-[150%]" />
          </div>
          
          {/* Subtle pulse glow background */}
          <div className="absolute inset-0 bg-white/5 animate-glow" />
          
          {/* Button content */}
          <span className="relative z-10 flex items-center gap-2 drop-shadow-lg">
            Siteye Git
            <ExternalLink className="w-4 h-4 group-hover/cta:translate-x-1 transition-all duration-300" />
          </span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export const BettingSiteCard = memo(BettingSiteCardComponent);