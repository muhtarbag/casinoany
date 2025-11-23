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
  { key: 'email_clicks', label: 'Email', icon: Mail, color: '#6366f1' },
  { key: 'whatsapp_clicks', label: 'WhatsApp', icon: MessageCircle, color: '#25D366' },
  { key: 'telegram_clicks', label: 'Telegram', icon: Send, color: '#0088cc' },
  { key: 'twitter_clicks', label: 'X', icon: Twitter, color: '#1DA1F2' },
  { key: 'instagram_clicks', label: 'Instagram', icon: Instagram, color: '#E4405F' },
  { key: 'facebook_clicks', label: 'Facebook', icon: Facebook, color: '#1877F2' },
  { key: 'youtube_clicks', label: 'YouTube', icon: Youtube, color: '#FF0000' },
];

export const SiteSocialMediaCard = ({ siteId, siteName }: SiteSocialMediaCardProps) => {
  // ✅ FIXED: Fetch from conversions table (real data source)
  const { data: stats, isLoading } = useQuery({
    queryKey: ['site-social-stats', siteId],
    queryFn: async () => {
      // Get social media clicks from conversions table
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
      
      // Aggregate clicks by platform
      const clicks = conversions?.reduce((acc, conv) => {
        const platformMap: Record<string, keyof typeof acc> = {
          'email_click': 'email_clicks',
          'whatsapp_click': 'whatsapp_clicks',
          'telegram_click': 'telegram_clicks',
          'twitter_click': 'twitter_clicks',
          'instagram_click': 'instagram_clicks',
          'facebook_click': 'facebook_clicks',
          'youtube_click': 'youtube_clicks',
        };
        
        const field = platformMap[conv.conversion_type];
        if (field) {
          acc[field]++;
        }
        
        return acc;
      }, {
        email_clicks: 0,
        whatsapp_clicks: 0,
        telegram_clicks: 0,
        twitter_clicks: 0,
        instagram_clicks: 0,
        facebook_clicks: 0,
        youtube_clicks: 0,
      }) || {
        email_clicks: 0,
        whatsapp_clicks: 0,
        telegram_clicks: 0,
        twitter_clicks: 0,
        instagram_clicks: 0,
        facebook_clicks: 0,
        youtube_clicks: 0,
      };
      
      return clicks;
    },
  });

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="pt-0">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const totalClicks = socialPlatforms.reduce((sum, platform) => {
    return sum + (stats?.[platform.key as keyof typeof stats] as number || 0);
  }, 0);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center justify-between">
          <span>{siteName}</span>
          <span className="text-sm font-normal text-muted-foreground">
            {totalClicks.toLocaleString()} tıklama
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {socialPlatforms
            .filter(platform => (stats?.[platform.key as keyof typeof stats] as number || 0) > 0)
            .map((platform) => {
              const Icon = platform.icon;
              const clicks = stats?.[platform.key as keyof typeof stats] as number || 0;
              const percentage = totalClicks > 0 ? ((clicks / totalClicks) * 100).toFixed(0) : '0';

              return (
                <div
                  key={platform.key}
                  className="flex flex-col items-center gap-1 p-2 rounded-md bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <Icon className="w-4 h-4 flex-shrink-0" style={{ color: platform.color }} />
                  <p className="text-xs font-semibold">{clicks}</p>
                  <p className="text-[10px] text-muted-foreground">%{percentage}</p>
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
};
