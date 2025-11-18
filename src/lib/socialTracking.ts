import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type SocialPlatform = 'email' | 'whatsapp' | 'telegram' | 'twitter' | 'instagram' | 'facebook' | 'youtube';

const platformMetricMap: Record<SocialPlatform, string> = {
  email: 'email_click',
  whatsapp: 'whatsapp_click',
  telegram: 'telegram_click',
  twitter: 'twitter_click',
  instagram: 'instagram_click',
  facebook: 'facebook_click',
  youtube: 'youtube_click',
};

/**
 * Tracks social media link clicks for analytics
 * @param siteId - The ID of the betting site
 * @param platform - The social media platform
 * @param siteName - Optional site name for better toast messages
 */
export const trackSocialClick = async (
  siteId: string,
  platform: SocialPlatform,
  siteName?: string
): Promise<void> => {
  try {
    const metricType = platformMetricMap[platform];
    
    if (!metricType) {
      console.error(`Unknown platform: ${platform}`);
      return;
    }

    // Call RPC function to increment stats atomically
    const { error } = await supabase.rpc('increment_site_stats', {
      p_site_id: siteId,
      p_metric_type: metricType,
    });

    if (error) {
      console.error('Social tracking error:', error);
      throw error;
    }

    // Optional: Show success feedback (can be disabled for less intrusive UX)
    // toast({
    //   title: 'Yönlendiriliyorsunuz',
    //   description: `${siteName || 'Site'} - ${platform}`,
    // });
  } catch (error) {
    console.error('Failed to track social click:', error);
    // Don't show error toast to user - tracking failure shouldn't affect UX
  }
};
