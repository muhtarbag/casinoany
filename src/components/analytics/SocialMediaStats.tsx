import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MessageCircle, Send } from 'lucide-react';
import { FaTwitter, FaInstagram, FaFacebook, FaYoutube } from 'react-icons/fa';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface SocialMediaStatsProps {
  statsData: any[];
}

export const SocialMediaStats = ({ statsData }: SocialMediaStatsProps) => {
  const socialPlatforms = [
    { key: 'email_clicks', label: 'Email', icon: Mail, color: '#6366f1' },
    { key: 'whatsapp_clicks', label: 'WhatsApp', icon: MessageCircle, color: '#25D366' },
    { key: 'telegram_clicks', label: 'Telegram', icon: Send, color: '#0088cc' },
    { key: 'twitter_clicks', label: 'Twitter', icon: FaTwitter, color: '#1DA1F2' },
    { key: 'instagram_clicks', label: 'Instagram', icon: FaInstagram, color: '#E4405F' },
    { key: 'facebook_clicks', label: 'Facebook', icon: FaFacebook, color: '#1877F2' },
    { key: 'youtube_clicks', label: 'YouTube', icon: FaYoutube, color: '#FF0000' },
  ];

  // Calculate total clicks per platform
  const platformTotals = socialPlatforms.map(platform => ({
    name: platform.label,
    clicks: statsData.reduce((sum, stat) => sum + (stat[platform.key] || 0), 0),
    icon: platform.icon,
    color: platform.color,
  })).filter(p => p.clicks > 0);

  const totalSocialClicks = platformTotals.reduce((sum, p) => sum + p.clicks, 0);

  const chartConfig = {
    clicks: {
      label: "Tıklamalar",
      color: "hsl(var(--primary))",
    },
  };

  if (totalSocialClicks === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Sosyal Medya Tıklamaları</CardTitle>
            <CardDescription>Toplam {totalSocialClicks.toLocaleString()} sosyal medya tıklaması</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {platformTotals.map((platform) => {
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