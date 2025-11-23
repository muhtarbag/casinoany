import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Mail, 
  MessageCircle, 
  Twitter, 
  Instagram, 
  Facebook, 
  Youtube,
  ExternalLink
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SiteMetricsGridProps {
  siteId: string;
  siteData: any;
}

export const SiteMetricsGrid = ({ siteId, siteData }: SiteMetricsGridProps) => {
  // Fetch social media clicks from conversions table
  const { data: socialStats } = useQuery({
    queryKey: ['site-social-stats', siteId],
    queryFn: async () => {
      const { data: conversions, error } = await supabase
        .from('conversions')
        .select('conversion_type')
        .eq('site_id', siteId)
        .in('conversion_type', [
          'email_click',
          'whatsapp_click',
          'telegram_click',
          'twitter_click',
          'instagram_click',
          'facebook_click',
          'youtube_click'
        ]);

      if (error) throw error;

      // Aggregate clicks by type
      const stats = {
        email_clicks: 0,
        whatsapp_clicks: 0,
        telegram_clicks: 0,
        twitter_clicks: 0,
        instagram_clicks: 0,
        facebook_clicks: 0,
        youtube_clicks: 0,
      };

      conversions?.forEach(conv => {
        switch (conv.conversion_type) {
          case 'email_click': stats.email_clicks++; break;
          case 'whatsapp_click': stats.whatsapp_clicks++; break;
          case 'telegram_click': stats.telegram_clicks++; break;
          case 'twitter_click': stats.twitter_clicks++; break;
          case 'instagram_click': stats.instagram_clicks++; break;
          case 'facebook_click': stats.facebook_clicks++; break;
          case 'youtube_click': stats.youtube_clicks++; break;
        }
      });

      return stats;
    },
    enabled: !!siteId,
  });

  // Fetch rating distribution
  const { data: ratingDistribution } = useQuery({
    queryKey: ['site-rating-distribution', siteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_reviews')
        .select('rating')
        .eq('site_id', siteId)
        .eq('is_approved', true);

      if (error) throw error;

      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      data?.forEach(review => {
        const rating = Math.floor(review.rating);
        if (rating >= 1 && rating <= 5) {
          distribution[rating as keyof typeof distribution]++;
        }
      });

      return distribution;
    },
    enabled: !!siteId,
  });

  const totalRatings = ratingDistribution 
    ? Object.values(ratingDistribution).reduce((a, b) => a + b, 0)
    : 0;

  const SocialStatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    color 
  }: { 
    icon: any; 
    label: string; 
    value: number; 
    color: string;
  }) => (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-lg font-bold">{value}</span>
    </div>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Social Media Stats */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Sosyal Medya Etkileşimleri</CardTitle>
          <CardDescription>
            Kullanıcıların sosyal medya linklerinize tıklama sayıları
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SocialStatCard 
              icon={Mail} 
              label="Email" 
              value={socialStats?.email_clicks || 0}
              color="bg-blue-500"
            />
            <SocialStatCard 
              icon={MessageCircle} 
              label="WhatsApp" 
              value={socialStats?.whatsapp_clicks || 0}
              color="bg-green-500"
            />
            <SocialStatCard 
              icon={Twitter} 
              label="Twitter" 
              value={socialStats?.twitter_clicks || 0}
              color="bg-sky-500"
            />
            <SocialStatCard 
              icon={Instagram} 
              label="Instagram" 
              value={socialStats?.instagram_clicks || 0}
              color="bg-pink-500"
            />
            <SocialStatCard 
              icon={Facebook} 
              label="Facebook" 
              value={socialStats?.facebook_clicks || 0}
              color="bg-blue-600"
            />
            <SocialStatCard 
              icon={MessageCircle} 
              label="Telegram" 
              value={socialStats?.telegram_clicks || 0}
              color="bg-sky-400"
            />
            <SocialStatCard 
              icon={Youtube} 
              label="YouTube" 
              value={socialStats?.youtube_clicks || 0}
              color="bg-red-500"
            />
            <SocialStatCard 
              icon={ExternalLink} 
              label="Affiliate" 
              value={siteData.stats?.clicks || 0}
              color="bg-purple-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Puan Dağılımı</CardTitle>
          <CardDescription>
            Kullanıcı değerlendirmelerinin dağılımı
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ratingDistribution && [5, 4, 3, 2, 1].map(rating => {
              const count = ratingDistribution[rating as keyof typeof ratingDistribution] || 0;
              const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
              
              return (
                <div key={rating} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="font-medium">{rating} Yıldız</span>
                    </span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
          {totalRatings === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              Henüz değerlendirme bulunmuyor
            </p>
          )}
        </CardContent>
      </Card>

      {/* Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Etkileşim Oranları</CardTitle>
          <CardDescription>
            Kullanıcı davranış analizi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Tıklama Oranı (CTR)</span>
                <span className="font-bold">
                  {siteData.stats?.views > 0 
                    ? ((siteData.stats.clicks / siteData.stats.views) * 100).toFixed(2)
                    : '0.00'}%
                </span>
              </div>
              <Progress 
                value={siteData.stats?.views > 0 
                  ? (siteData.stats.clicks / siteData.stats.views) * 100
                  : 0
                } 
                className="h-2" 
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Favoriye Eklenme Oranı</span>
                <span className="font-bold">
                  {siteData.stats?.views > 0 
                    ? ((siteData.favoriteCount / siteData.stats.views) * 100).toFixed(2)
                    : '0.00'}%
                </span>
              </div>
              <Progress 
                value={siteData.stats?.views > 0 
                  ? (siteData.favoriteCount / siteData.stats.views) * 100
                  : 0
                } 
                className="h-2" 
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Yorum Yapma Oranı</span>
                <span className="font-bold">
                  {siteData.stats?.views > 0 
                    ? ((siteData.review_count / siteData.stats.views) * 100).toFixed(2)
                    : '0.00'}%
                </span>
              </div>
              <Progress 
                value={siteData.stats?.views > 0 
                  ? (siteData.review_count / siteData.stats.views) * 100
                  : 0
                } 
                className="h-2" 
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
