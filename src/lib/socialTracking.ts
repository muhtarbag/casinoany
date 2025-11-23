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
 * ✅ FIXED: Tracks social media clicks directly in conversions table
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
    const conversionType = platformConversionMap[platform];
    
    if (!conversionType) {
      console.error(`Unknown platform: ${platform}`);
      return;
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Track directly in conversions table
    const sessionId = sessionStorage.getItem('analytics_session_id') || `session_${Date.now()}`;
    
    const { error } = await supabase
      .from('conversions')
      .insert({
        conversion_type: conversionType,
        page_path: window.location.pathname,
        site_id: siteId,
        conversion_value: 0,
        session_id: sessionId,
        user_id: user?.id || null,
        metadata: { platform, site_name: siteName },
      });

    if (error) {
      console.error('Social tracking error:', error);
      throw error;
    }
    
    console.log(`✅ Tracked ${platform} click for ${siteName || siteId}`);
  } catch (error) {
    console.error('Failed to track social click:', error);
    // Don't show error toast to user - tracking failure shouldn't affect UX
  }
};
