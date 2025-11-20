import { memo, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import { SiteCardLogo } from './betting-site-card/SiteCardLogo';
import { SiteCardRating } from './betting-site-card/SiteCardRating';
import { SiteCardFavoriteButton } from './betting-site-card/SiteCardFavoriteButton';
import { SiteCardFeatures } from './betting-site-card/SiteCardFeatures';
import { SiteCardSocialLinks } from './betting-site-card/SiteCardSocialLinks';
import { SiteCardActions } from './betting-site-card/SiteCardActions';

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
  reviewCount = 0,
  priority = false,
}: BettingSiteCardProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { isFavorite: checkFavorite, toggleFavorite, isToggling } = useFavorites();
  const isFavorite = checkFavorite(id);

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

  const handleToggleFavorite = useCallback(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!id) return;
    
    toggleFavorite({ siteId: id, isFavorite });
  }, [user, id, isFavorite, toggleFavorite, navigate]);

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

  const handleDetailsClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    handleCardClick();
  }, [handleCardClick]);

  const handleAffiliateClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    trackClickMutation.mutate();
    window.open(affiliateUrl, '_blank');
  }, [trackClickMutation, affiliateUrl]);

  return (
    <Card 
      className="group relative overflow-hidden bg-card border border-border hover:border-primary/50 hover:shadow-hover transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
      role="article"
      aria-label={`${name} - Bahis sitesi kartı`}
    >
      <CardHeader className="space-y-4 p-6 relative">
        <div className="flex items-start justify-between gap-4">
          <SiteCardLogo logo={logo} name={name} priority={priority} />
          
          <div className="flex flex-col items-end gap-2">
            <SiteCardFavoriteButton
              isFavorite={isFavorite}
              isToggling={isToggling}
              name={name}
              onClick={handleFavoriteClick}
            />
            <SiteCardRating rating={rating} reviewCount={reviewCount} />
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
        <SiteCardFeatures features={features} siteId={id} />
        
        <SiteCardSocialLinks
          siteId={id}
          siteName={name}
          email={email}
          whatsapp={whatsapp}
          telegram={telegram}
          twitter={twitter}
          instagram={instagram}
          facebook={facebook}
          youtube={youtube}
        />
      </CardContent>

      <SiteCardActions
        onDetailsClick={handleDetailsClick}
        onAffiliateClick={handleAffiliateClick}
      />
    </Card>
  );
};

export const BettingSiteCard = memo(BettingSiteCardComponent);