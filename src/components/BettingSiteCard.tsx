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
  compact?: boolean;
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
  compact = false,
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

  // ✅ FIXED: Track clicks in conversions table
  const trackClickMutation = useMutation({
    mutationFn: async () => {
      if (!id) return;
      
      const sessionId = sessionStorage.getItem('analytics_session_id') || `session_${Date.now()}`;
      
      const { error } = await supabase.rpc('track_conversion', {
        p_conversion_type: 'affiliate_click',
        p_page_path: window.location.pathname,
        p_site_id: id,
        p_conversion_value: 0,
        p_session_id: sessionId,
        p_metadata: { site_name: name },
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
      className={cn(
        "group relative overflow-hidden bg-card border border-border hover:border-primary/50 hover:shadow-hover transition-all duration-300 cursor-pointer",
        compact && "hover:scale-[1.02]"
      )}
      onClick={handleCardClick}
      role="article"
      aria-label={`${name} - Bahis sitesi kartı`}
    >
      <CardHeader className={cn("space-y-4 relative", compact ? "p-3" : "p-6")}>
        <div className="flex items-start justify-between gap-4">
          <div className={cn(
            "flex-shrink-0 flex items-center justify-center relative group/logo",
            compact ? "w-16 h-16" : "w-56 h-56 sm:w-44 sm:h-44 md:w-48 md:h-48"
          )} style={{ willChange: 'transform' }}>
            {/* Loading Skeleton */}
            {isLoading && !showFallback && (
              <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse rounded-xl" />
            )}
            
            {!showFallback ? (
              <OptimizedImage
                src={logoUrl!}
                alt={`${name} logo`}
                className={`w-full h-full object-contain transition-all duration-300 group-hover/logo:scale-105 ${
                  isLoading ? 'opacity-0' : 'opacity-100'
                }`}
                width={compact ? 64 : 224}
                height={compact ? 64 : 224}
                objectFit="contain"
                fetchPriority={priority ? 'high' : 'auto'}
                priority={priority}
                responsive={false}
                fallback="/placeholder.svg"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center animate-scale-in">
                <span className={cn(
                  "font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent",
                  compact ? "text-3xl" : "text-7xl sm:text-6xl md:text-7xl"
                )}>
                  {name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className={cn("flex flex-col items-end", compact ? "gap-1" : "gap-2")}>
            {/* Favorite Button */}
            {!compact && (
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
            )}
            
            {/* Rating */}
            <div className={cn(
              "flex items-center gap-1 bg-gold/10 rounded-lg border border-gold/20",
              compact ? "px-2 py-1" : "px-3 py-1.5"
            )}>
              <Star className={cn("fill-gold text-gold", compact ? "w-3 h-3" : "w-4 h-4")} />
              <span className={cn("font-bold", compact ? "text-xs" : "text-sm")}>{rating.toFixed(1)}</span>
            </div>
            {!compact && reviewCount > 0 && (
              <div className="text-xs text-muted-foreground">
                {reviewCount} yorum
              </div>
            )}
          </div>
        </div>
        <h3 className={cn(
          "font-bold text-foreground group-hover:text-primary transition-colors",
          compact ? "text-sm" : "text-xl"
        )}>
          {name}
        </h3>
        {bonus && (
          <div className={cn(
            "flex items-center gap-2 bg-secondary/10 rounded-lg border border-secondary/20",
            compact ? "px-2 py-1" : "px-3 py-2"
          )}>
            <Badge variant="secondary" className={cn("border-0", compact ? "text-[10px] px-1" : "text-xs")}>BONUS</Badge>
            <span className={cn("font-medium text-foreground", compact ? "text-xs" : "text-sm")}>{bonus}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className={cn("space-y-4", compact ? "px-3 pb-3" : "px-6 pb-6")}>
        {features && features.length > 0 && !compact && (
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
        {socialLinks.length > 0 && !compact && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            {socialLinks.map((link, idx) => {
              const Icon = link.icon;
              return (
                <a key={`social-${id}-${link.label}-${idx}`} href={link.href} target="_blank" rel="noopener noreferrer"
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔥 Social link clicked:', link.platform, 'for site:', name);
                    try {
                      await trackSocialClick(id || '', link.platform as any, name);
                      console.log('✅ Track completed successfully');
                    } catch (error) {
                      console.error('❌ Track failed:', error);
                    }
                    window.open(link.href, '_blank', 'noopener,noreferrer');
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

      <CardFooter className={cn("pt-0 gap-2", compact ? "px-3 pb-3 flex-col" : "px-6 pb-6")}>
        {!compact ? (
          <>
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
              <div className="absolute inset-0 w-full h-full">
                <div className="absolute inset-0 translate-x-[-100%] animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent w-[150%]" />
              </div>
              <div className="absolute inset-0 bg-white/5 animate-glow" />
              <span className="relative z-10 flex items-center gap-2 drop-shadow-lg">
                Siteye Git
                <ExternalLink className="w-4 h-4 group-hover/cta:translate-x-1 transition-all duration-300" />
              </span>
            </Button>
          </>
        ) : (
          <Button 
            size="sm" 
            className="w-full relative font-bold overflow-hidden group/cta transition-all duration-500 bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.6),0_0_50px_rgba(236,72,153,0.4)] text-white border-0"
            onClick={handleAffiliateClick}
          >
            <div className="absolute inset-0 w-full h-full">
              <div className="absolute inset-0 translate-x-[-100%] animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent w-[150%]" />
            </div>
            <div className="absolute inset-0 bg-white/5 animate-glow" />
            <span className="relative z-10 flex items-center gap-1 drop-shadow-lg text-xs">
              Siteye Git
              <ExternalLink className="w-3 h-3 group-hover/cta:translate-x-1 transition-all duration-300" />
            </span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export const BettingSiteCard = memo(BettingSiteCardComponent);