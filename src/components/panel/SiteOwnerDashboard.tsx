import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Star, Users, TrendingUp } from 'lucide-react';

interface SiteOwnerDashboardProps {
  siteData: any;
}

export const SiteOwnerDashboard = ({ siteData }: SiteOwnerDashboardProps) => {
  return (
    <div className="space-y-6">
      {/* Site Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Site Bilgileri</CardTitle>
          <CardDescription>Sitenizin temel bilgileri ve durumu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Site Adı</p>
              <p className="text-lg font-semibold">{siteData.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Durum</p>
              <Badge variant={siteData.is_active ? "default" : "secondary"}>
                {siteData.is_active ? 'Aktif' : 'Pasif'}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Bonus</p>
              <p className="text-sm">{siteData.bonus || 'Bonus bilgisi yok'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Affiliate Link</p>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full"
              >
                <a href={siteData.affiliate_link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Siteye Git
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Performans Özeti</CardTitle>
          <CardDescription>Sitenizin son performans metrikleri</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="font-medium">Ortalama Puan</p>
                  <p className="text-sm text-muted-foreground">
                    {siteData.review_count || 0} değerlendirme
                  </p>
                </div>
              </div>
              <div className="text-2xl font-bold">
                {siteData.avg_rating?.toFixed(1) || '0.0'}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium">Favorilere Eklenme</p>
                  <p className="text-sm text-muted-foreground">
                    Kullanıcı ilgisi
                  </p>
                </div>
              </div>
              <div className="text-2xl font-bold">
                {siteData.favoriteCount}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">Görüntülenme</p>
                  <p className="text-sm text-muted-foreground">
                    Toplam site ziyareti
                  </p>
                </div>
              </div>
              <div className="text-2xl font-bold">
                {siteData.stats.views}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hızlı İşlemler</CardTitle>
          <CardDescription>Sık kullanılan işlemler</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Button variant="outline" className="justify-start" asChild>
              <a href={`/sites/${siteData.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Siteyi Görüntüle
              </a>
            </Button>
            <Button variant="outline" className="justify-start">
              <Star className="w-4 h-4 mr-2" />
              Değerlendirmeleri Gör
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Features List */}
      {siteData.features && siteData.features.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Özellikler</CardTitle>
            <CardDescription>Sitenizde sunulan özellikler</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {siteData.features.map((feature: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {feature}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
