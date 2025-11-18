import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MessageCircle, Send, Twitter, Instagram, Facebook, Youtube } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SiteSocialMediaCardProps {
  siteId: string;
  siteName: string;
}

const socialPlatforms = [
  { key: 'email_clicks', label: 'Email', icon: Mail, color: 'text-blue-500' },
  { key: 'whatsapp_clicks', label: 'WhatsApp', icon: MessageCircle, color: 'text-green-500' },
  { key: 'telegram_clicks', label: 'Telegram', icon: Send, color: 'text-sky-500' },
  { key: 'twitter_clicks', label: 'Twitter/X', icon: Twitter, color: 'text-slate-900 dark:text-slate-100' },
  { key: 'instagram_clicks', label: 'Instagram', icon: Instagram, color: 'text-pink-500' },
  { key: 'facebook_clicks', label: 'Facebook', icon: Facebook, color: 'text-blue-600' },
  { key: 'youtube_clicks', label: 'YouTube', icon: Youtube, color: 'text-red-500' },
];

export const SiteSocialMediaCard = ({ siteId, siteName }: SiteSocialMediaCardProps) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['site-social-stats', siteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_stats')
        .select('email_clicks, whatsapp_clicks, telegram_clicks, twitter_clicks, instagram_clicks, facebook_clicks, youtube_clicks')
        .eq('site_id', siteId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const totalClicks = socialPlatforms.reduce((sum, platform) => {
    return sum + (stats?.[platform.key as keyof typeof stats] as number || 0);
  }, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {siteName} - Sosyal Medya Performansı
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-4 border-b">
            <span className="text-sm text-muted-foreground">Toplam Tıklama</span>
            <span className="text-2xl font-bold">{totalClicks.toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {socialPlatforms.map((platform) => {
              const Icon = platform.icon;
              const clicks = (stats?.[platform.key as keyof typeof stats] as number) || 0;
              const percentage = totalClicks > 0 ? ((clicks / totalClicks) * 100).toFixed(1) : '0';

              return (
                <div key={platform.key} className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
                  <Icon className={`h-6 w-6 mb-2 ${platform.color}`} />
                  <span className="text-xs text-muted-foreground mb-1">{platform.label}</span>
                  <span className="text-lg font-semibold">{clicks.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">%{percentage}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
