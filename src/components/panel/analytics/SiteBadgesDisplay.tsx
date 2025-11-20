import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSiteBadges } from '@/hooks/queries/useReputationQueries';
import { Shield, Star, Zap, TrendingUp, Award, Clock } from 'lucide-react';

interface SiteBadgesDisplayProps {
  siteId: string;
  variant?: 'card' | 'inline';
}

const getBadgeIcon = (badgeType: string) => {
  switch (badgeType) {
    case 'verified': return Shield;
    case 'top_rated': return Star;
    case 'quick_response': return Zap;
    case 'rising_star': return TrendingUp;
    case 'excellent_service': return Award;
    default: return Shield;
  }
};

export const SiteBadgesDisplay = ({ siteId, variant = 'card' }: SiteBadgesDisplayProps) => {
  const { data: badges, isLoading } = useSiteBadges(siteId);

  if (isLoading) {
    return variant === 'card' ? (
      <Card>
        <CardHeader>
          <CardTitle>Rozetler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-24 bg-muted rounded-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    ) : (
      <div className="flex gap-2 flex-wrap animate-pulse">
        {[1, 2].map((i) => (
          <div key={i} className="h-6 w-20 bg-muted rounded-full" />
        ))}
      </div>
    );
  }

  if (!badges || badges.length === 0) {
    return null;
  }

  const badgesContent = (
    <div className="flex gap-2 flex-wrap">
      {badges.map((badge) => {
        const Icon = getBadgeIcon(badge.badge_type);
        return (
          <Badge
            key={badge.id}
            variant="outline"
            className="gap-1 font-medium"
            style={{ borderColor: badge.badge_color, color: badge.badge_color }}
          >
            <Icon className="h-3 w-3" />
            {badge.badge_label}
          </Badge>
        );
      })}
    </div>
  );

  if (variant === 'inline') {
    return badgesContent;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Rozetler
        </CardTitle>
      </CardHeader>
      <CardContent>{badgesContent}</CardContent>
    </Card>
  );
};
