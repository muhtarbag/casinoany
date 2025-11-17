import { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ExternalLink, Mail, MessageCircle, Send, ChevronRight, Heart } from 'lucide-react';
import { FaTwitter, FaInstagram, FaFacebook, FaYoutube } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { OptimizedImage } from '@/components/OptimizedImage';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
}: BettingSiteCardProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAdmin } = useAuth();
  const showFallback = !logo || !logoUrl || imageError;

  // Check if site is in favorites
  const { data: isFavorite, isLoading: isFavoriteLoading } = useQuery({
    queryKey: ['is-favorite', id, user?.id],
    queryFn: async () => {
      if (!user || !id) return false;
      const { data, error } = await supabase
        .from('user_favorite_sites')
        .select('id')
        .eq('user_id', user.id)
        .eq('site_id', id)
        .maybeSingle();
      
      if (error) return false;
      return !!data;
    },
    enabled: !!user && !!id,
  });


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

  const trackClickMutation = useMutation({
    mutationFn: async () => {
      if (!id) return;
      const { data: stats } = await supabase
        .from('site_stats')
        .select('*')
        .eq('site_id', id)
        .maybeSingle();

      if (stats) {
        await supabase.from('site_stats')
          .update({ clicks: stats.clicks + 1 })
          .eq('site_id', id);
      } else {
        await supabase.from('site_stats')
          .insert({ site_id: id, clicks: 1, views: 0 });
      }
    },
    onSuccess: () => {
      // Invalidate all site-related queries (stats, featured, lists, etc.)
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.invalidateQueries({ queryKey: ['site-stats'] });
      queryClient.invalidateQueries({ queryKey: ['featured-sites'] });
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        navigate('/login');
        return;
      }
      
      if (!id) return;

      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorite_sites')
          .delete()
          .eq('user_id', user.id)
          .eq('site_id', id);
        
        if (error) throw error;
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('user_favorite_sites')
          .insert({
            user_id: user.id,
            site_id: id,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['is-favorite', id, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-favorites'] });
      toast({
        title: isFavorite ? 'Favorilerden çıkarıldı' : 'Favorilere eklendi',
        description: isFavorite ? `${name} favorilerden kaldırıldı` : `${name} favorilere eklendi`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Bir hata oluştu',
        variant: 'destructive',
      });
    },
  });

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteMutation.mutate();
  }, [toggleFavoriteMutation]);

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

  const socialLinks = useMemo(() => [
    { url: email, icon: Mail, label: 'Email', href: `mailto:${email}`, color: '#6366f1' },
    { url: whatsapp, icon: MessageCircle, label: 'WhatsApp', href: `https://wa.me/${whatsapp}`, color: '#25D366' },
    { url: telegram, icon: Send, label: 'Telegram', href: telegram, color: '#0088cc' },
    { url: twitter, icon: FaTwitter, label: 'Twitter', href: twitter, color: '#1DA1F2' },
    { url: instagram, icon: FaInstagram, label: 'Instagram', href: instagram, color: '#E4405F' },
    { url: facebook, icon: FaFacebook, label: 'Facebook', href: facebook, color: '#1877F2' },
    { url: youtube, icon: FaYoutube, label: 'YouTube', href: youtube, color: '#FF0000' },
  ].filter(link => link.url), [email, whatsapp, telegram, twitter, instagram, facebook, youtube]);

  return (
    <Card 
      className="group relative overflow-hidden bg-card border border-border hover:border-primary/50 hover:shadow-hover transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="space-y-4 p-6 relative">
        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-4 right-4 z-10 rounded-full transition-all duration-200",
            "hover:scale-110 active:scale-95",
            isFavorite 
              ? "text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" 
              : "text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
          )}
          onClick={handleFavoriteClick}
          disabled={toggleFavoriteMutation.isPending || isFavoriteLoading}
        >
          <Heart 
            className={cn(
              "h-5 w-5 transition-all",
              isFavorite && "fill-current"
            )} 
          />
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-shrink-0 w-48 h-32 bg-card/80 rounded-lg flex items-center justify-center overflow-hidden border-2 border-border/50 shadow-sm relative">
            {/* Loading Skeleton */}
            {isLoading && !showFallback && (
              <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse" />
            )}
            
            {!showFallback ? (
              <OptimizedImage
                src={logoUrl!}
                alt={`${name} logo`}
                className={`w-full h-full object-contain p-2 transition-opacity duration-300 ${
                  isLoading ? 'opacity-0' : 'opacity-100'
                }`}
                width={96}
                height={96}
                objectFit="contain"
                fetchPriority="auto"
                responsive={false}
                fallback="/placeholder.svg"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center animate-scale-in">
                <span className="text-4xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
                  {name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
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
                <Badge key={idx} variant="success" className="text-xs">
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
                <a key={idx} href={link.href} target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
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