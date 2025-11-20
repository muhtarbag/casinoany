import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Shield, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { useReputationScore, useCalculateReputationScore } from '@/hooks/queries/useReputationQueries';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ReputationScoreCardProps {
  siteId: string;
}

export const ReputationScoreCard = ({ siteId }: ReputationScoreCardProps) => {
  const { data: reputation, isLoading } = useReputationScore(siteId);
  const calculateScore = useCalculateReputationScore();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            İtibar Skoru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            <div className="h-20 bg-muted rounded" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrustLevelColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'bg-green-500';
      case 'high': return 'bg-blue-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrustLevelLabel = (level: string) => {
    switch (level) {
      case 'excellent': return 'Mükemmel';
      case 'high': return 'Yüksek';
      case 'medium': return 'Orta';
      case 'low': return 'Düşük';
      default: return 'Beklemede';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              İtibar Skoru
            </CardTitle>
            <CardDescription>
              {reputation?.last_calculated_at && (
                <>
                  Son güncelleme:{' '}
                  {formatDistanceToNow(new Date(reputation.last_calculated_at), {
                    addSuffix: true,
                    locale: tr,
                  })}
                </>
              )}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => calculateScore.mutate(siteId)}
            disabled={calculateScore.isPending}
          >
            <RefreshCw className={`h-4 w-4 ${calculateScore.isPending ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Genel Skor */}
        <div className="text-center space-y-2">
          <div className="text-5xl font-bold text-primary">
            {reputation?.reputation_score?.toFixed(1) || '0.0'}
          </div>
          <div className="flex items-center justify-center gap-2">
            <Badge className={getTrustLevelColor(reputation?.trust_level || 'pending')}>
              {getTrustLevelLabel(reputation?.trust_level || 'pending')}
            </Badge>
          </div>
          <Progress value={reputation?.reputation_score || 0} className="h-2" />
        </div>

        {/* Skor Bileşenleri */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Puan</span>
              <span className="font-medium">{reputation?.rating_score?.toFixed(1)}/25</span>
            </div>
            <Progress value={(reputation?.rating_score || 0) * 4} className="h-1" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Yorumlar</span>
              <span className="font-medium">{reputation?.review_score?.toFixed(1)}/20</span>
            </div>
            <Progress value={(reputation?.review_score || 0) * 5} className="h-1" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Şikayet Çözümü</span>
              <span className="font-medium">{reputation?.complaint_resolution_score?.toFixed(1)}/25</span>
            </div>
            <Progress value={(reputation?.complaint_resolution_score || 0) * 4} className="h-1" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Yanıt Süresi</span>
              <span className="font-medium">{reputation?.response_time_score?.toFixed(1)}/20</span>
            </div>
            <Progress value={(reputation?.response_time_score || 0) * 5} className="h-1" />
          </div>
        </div>

        {/* Metrikler */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <div className="text-2xl font-bold text-primary">
              {reputation?.complaint_resolution_rate?.toFixed(0) || '0'}%
            </div>
            <div className="text-xs text-muted-foreground">Çözüm Oranı</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">
              {reputation?.avg_response_time_hours?.toFixed(0) || '0'}h
            </div>
            <div className="text-xs text-muted-foreground">Ort. Yanıt Süresi</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
