import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SocialPlatformTrendsProps {
  statsData: any[];
}

export const SocialPlatformTrends = ({ statsData }: SocialPlatformTrendsProps) => {
  // Calculate total clicks per platform
  const platformTotals = statsData.reduce((acc, site) => {
    acc.email = (acc.email || 0) + (site.email_clicks || 0);
    acc.whatsapp = (acc.whatsapp || 0) + (site.whatsapp_clicks || 0);
    acc.telegram = (acc.telegram || 0) + (site.telegram_clicks || 0);
    acc.twitter = (acc.twitter || 0) + (site.twitter_clicks || 0);
    acc.instagram = (acc.instagram || 0) + (site.instagram_clicks || 0);
    acc.facebook = (acc.facebook || 0) + (site.facebook_clicks || 0);
    acc.youtube = (acc.youtube || 0) + (site.youtube_clicks || 0);
    return acc;
  }, {} as Record<string, number>);

  const chartData = [
    { name: 'Email', clicks: platformTotals.email || 0, fill: '#3b82f6' },
    { name: 'WhatsApp', clicks: platformTotals.whatsapp || 0, fill: '#22c55e' },
    { name: 'Telegram', clicks: platformTotals.telegram || 0, fill: '#0ea5e9' },
    { name: 'Twitter/X', clicks: platformTotals.twitter || 0, fill: '#0f172a' },
    { name: 'Instagram', clicks: platformTotals.instagram || 0, fill: '#ec4899' },
    { name: 'Facebook', clicks: platformTotals.facebook || 0, fill: '#2563eb' },
    { name: 'YouTube', clicks: platformTotals.youtube || 0, fill: '#ef4444' },
  ].filter(item => item.clicks > 0);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Platform Trend Analizi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Henüz sosyal medya tıklama verisi bulunmuyor
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Trend Analizi</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="clicks" fill="#8884d8" name="Tıklama" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
