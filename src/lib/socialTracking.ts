import { supabase } from '@/integrations/supabase/client';

type SocialPlatform = 'email' | 'whatsapp' | 'telegram' | 'twitter' | 'instagram' | 'facebook' | 'youtube';

const platformConversionMap: Record<SocialPlatform, string> = {
  email: 'email_click',
  whatsapp: 'whatsapp_click',
  telegram: 'telegram_click',
  twitter: 'twitter_click',
  instagram: 'instagram_click',
  facebook: 'facebook_click',
  youtube: 'youtube_click',
};

/**
 * ✅ FIXED: Tracks social media clicks using increment_site_stats RPC
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
    const metricType = platformConversionMap[platform];
    
    if (!metricType) {
      console.error(`Unknown platform: ${platform}`);
      return;
    }

    console.log(`🔄 Tracking ${platform} click for ${siteName || siteId}`);
    
    // Use increment_site_stats RPC which writes to site_stats table
    const { error } = await supabase.rpc('increment_site_stats', {
      p_site_id: siteId,
      p_metric_type: metricType,
    });

    if (error) {
      console.error('Social tracking error:', error);
      throw error;
    }
    
    console.log(`✅ Tracked ${platform} click successfully`);
  } catch (error) {
    console.error('Failed to track social click:', error);
  }
};
