import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Mail, MessageCircle, Send, Twitter, Instagram, Facebook, Youtube } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SocialMediaStatsProps {
  statsData: any[];
}

export const SocialMediaStats = ({ statsData }: SocialMediaStatsProps) => {
  const socialPlatforms = [
    { key: 'email_clicks', label: 'Email', icon: Mail, color: '#6366f1' },
    { key: 'whatsapp_clicks', label: 'WhatsApp', icon: MessageCircle, color: '#25D366' },
    { key: 'telegram_clicks', label: 'Telegram', icon: Send, color: '#0088cc' },
    { key: 'twitter_clicks', label: 'Twitter/X', icon: Twitter, color: '#1DA1F2' },
    { key: 'instagram_clicks', label: 'Instagram', icon: Instagram, color: '#E4405F' },
    { key: 'facebook_clicks', label: 'Facebook', icon: Facebook, color: '#1877F2' },
    { key: 'youtube_clicks', label: 'YouTube', icon: Youtube, color: '#FF0000' },
  ];

  // Calculate total clicks per platform
  const platformTotals: Record<string, number> = socialPlatforms.reduce((acc, platform) => {
    acc[platform.key] = statsData.reduce((sum, stat) => sum + (stat[platform.key] || 0), 0);
    return acc;
  }, {} as Record<string, number>);

  const totalSocialClicks = Object.values(platformTotals).reduce((sum, val) => sum + val, 0);

  const engagementRate = totalSocialClicks > 0 
    ? ((totalSocialClicks / statsData.length) * 100).toFixed(1) 
    : '0';

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Sosyal Medya Tıklaması
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSocialClicks.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aktif Platform Sayısı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {socialPlatforms.filter(p => platformTotals[p.key] > 0).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Engagement Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">%{engagementRate}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Site başına ortalama tıklama
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">{socialPlatforms.map((platform) => {
                const IconComponent = platform.icon;
                return (
                  <div key={platform.name} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                    <IconComponent className="w-6 h-6" style={{ color: platform.color }} />
                    <span className="text-sm font-medium">{platform.name}</span>
                    <span className="text-2xl font-bold">{platform.clicks.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Karşılaştırması</CardTitle>
          <CardDescription>Sosyal medya platformları tıklama dağılımı</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <BarChart data={platformTotals}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={100}
                className="text-xs"
              />
              <YAxis className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="clicks" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Top Sites per Platform */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Bazında En Aktif Siteler</CardTitle>
          <CardDescription>Her platformda en çok tıklanan siteler</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {platformTotals.slice(0, 3).map((platform) => {
              const topSites = [...statsData]
                .filter(stat => (stat[socialPlatforms.find(p => p.label === platform.name)?.key || ''] || 0) > 0)
                .sort((a, b) => {
                  const key = socialPlatforms.find(p => p.label === platform.name)?.key || '';
                  return (b[key] || 0) - (a[key] || 0);
                })
                .slice(0, 5);

              if (topSites.length === 0) return null;

              const IconComponent = platform.icon;
              
              return (
                <div key={platform.name} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-5 h-5" style={{ color: platform.color }} />
                    <h4 className="font-semibold">{platform.name}</h4>
                  </div>
                  <div className="space-y-2">
                    {topSites.map((stat, index) => {
                      const key = socialPlatforms.find(p => p.label === platform.name)?.key || '';
                      return (
                        <div key={stat.id} className="flex items-center justify-between p-2 rounded bg-muted/30">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">#{index + 1}</span>
                            <span className="font-medium">{stat.site_name}</span>
                          </div>
                          <span className="font-bold">{(stat[key] || 0).toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};