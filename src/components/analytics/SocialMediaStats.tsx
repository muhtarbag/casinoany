import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Mail, MessageCircle, Send, Twitter, Instagram, Facebook, Youtube } from 'lucide-react';

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
    const total = statsData.reduce((sum, stat) => {
      const value = stat[platform.key] || 0;
      return sum + value;
    }, 0);
    acc[platform.key] = total;
    return acc;
  }, {} as Record<string, number>);

  const totalSocialClicks = Object.values(platformTotals).reduce((sum: number, val: number) => sum + val, 0);

  const engagementRate = totalSocialClicks > 0 && statsData.length > 0
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
            <div className="text-3xl font-bold">{totalSocialClicks}</div>
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
      <Card>
        <CardHeader>
          <CardTitle>Sosyal Medya Tıklamaları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {socialPlatforms.map((platform) => {
              const Icon = platform.icon;
              const clicks = platformTotals[platform.key] || 0;
              const percentage = totalSocialClicks > 0 ? ((clicks / totalSocialClicks) * 100).toFixed(1) : '0';

              return (
                <div key={platform.key} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                  <Icon className="w-6 h-6" style={{ color: platform.color }} />
                  <span className="text-sm font-medium">{platform.label}</span>
                  <span className="text-2xl font-bold">{clicks}</span>
                  <span className="text-xs text-muted-foreground">%{percentage}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Karşılaştırması</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={socialPlatforms.map(p => ({
              name: p.label,
              clicks: platformTotals[p.key] || 0,
              fill: p.color,
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="clicks" fill="#8884d8" name="Tıklama" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Sites per Platform */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {socialPlatforms
          .filter(platform => platformTotals[platform.key] > 0)
          .sort((a, b) => (platformTotals[b.key] || 0) - (platformTotals[a.key] || 0))
          .slice(0, 3)
          .map((platform) => {
            const Icon = platform.icon;
            // Get top 5 sites for this platform
            const topSites = statsData
              .map(stat => ({
                name: stat.site_name || 'Bilinmeyen Site',
                clicks: stat[platform.key] || 0,
              }))
              .filter(site => site.clicks > 0)
              .sort((a, b) => b.clicks - a.clicks)
              .slice(0, 5);

            return (
              <Card key={platform.key}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Icon className="w-5 h-5" style={{ color: platform.color }} />
                    {platform.label} - En Aktif Siteler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {topSites.map((site, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/30">
                        <span className="text-sm font-medium truncate">{site.name}</span>
                        <span className="text-sm text-muted-foreground">{site.clicks} tıklama</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
};
