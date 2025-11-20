import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSEOMetrics, useCalculateSEOScore } from '@/hooks/queries/useSEOQueries';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface SEOScoreCardProps {
  siteId: string;
}

export const SEOScoreCard = ({ siteId }: SEOScoreCardProps) => {
  const { data: seo, isLoading } = useSEOMetrics(siteId);
  const calculateSEO = useCalculateSEOScore();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SEO Skoru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            <div className="h-20 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Mükemmel';
    if (score >= 60) return 'İyi';
    if (score >= 40) return 'Orta';
    return 'Zayıf';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              SEO Sağlık Skoru
            </CardTitle>
            <CardDescription>
              {seo?.last_analyzed_at && (
                <>
                  Son analiz:{' '}
                  {formatDistanceToNow(new Date(seo.last_analyzed_at), {
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
            onClick={() => calculateSEO.mutate(siteId)}
            disabled={calculateSEO.isPending}
          >
            <RefreshCw className={`h-4 w-4 ${calculateSEO.isPending ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Genel SEO Skoru */}
        <div className="text-center space-y-2">
          <div className={`text-5xl font-bold ${getScoreColor(seo?.seo_score || 0)}`}>
            {seo?.seo_score?.toFixed(0) || '0'}
          </div>
          <Badge variant="outline">{getScoreLabel(seo?.seo_score || 0)}</Badge>
          <Progress value={seo?.seo_score || 0} className="h-2" />
        </div>

        {/* Skor Bileşenleri */}
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">İçerik Kalitesi</span>
              <span className="font-medium">{seo?.content_score?.toFixed(0)}/30</span>
            </div>
            <Progress value={(seo?.content_score || 0) * 3.33} className="h-1" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Meta Etiketler</span>
              <span className="font-medium">{seo?.meta_score?.toFixed(0)}/40</span>
            </div>
            <Progress value={(seo?.meta_score || 0) * 2.5} className="h-1" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Teknik SEO</span>
              <span className="font-medium">{seo?.technical_score?.toFixed(0)}/30</span>
            </div>
            <Progress value={(seo?.technical_score || 0) * 3.33} className="h-1" />
          </div>
        </div>

        {/* Durum Göstergeleri */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            {seo?.has_meta_title ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">Meta Title</span>
          </div>
          <div className="flex items-center gap-2">
            {seo?.has_meta_description ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">Meta Description</span>
          </div>
        </div>

        {/* İçerik Uzunluğu */}
        <div className="pt-4 border-t">
          <div className="text-sm text-muted-foreground">Toplam İçerik</div>
          <div className="text-2xl font-bold text-primary">
            {seo?.content_length?.toLocaleString() || '0'} karakter
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
