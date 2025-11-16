import { Mail } from 'lucide-react';
import { FaTwitter, FaInstagram, FaFacebook, FaYoutube, FaWhatsapp, FaTelegramPlane } from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface SiteDetailContactProps {
  site: any;
}

const trackSocialClick = async (siteId: string, platform: string) => {
  try {
    const { data: stats } = await supabase
      .from('site_stats')
      .select('*')
      .eq('site_id', siteId)
      .maybeSingle();

    const columnName = `${platform}_clicks`;
    
    if (stats) {
      const currentValue = Number(stats[columnName as keyof typeof stats] || 0);
      await supabase
        .from('site_stats')
        .update({ [columnName]: currentValue + 1 })
        .eq('site_id', siteId);
    } else {
      await supabase
        .from('site_stats')
        .insert({ 
          site_id: siteId, 
          views: 0, 
          clicks: 0,
          [columnName]: 1 
        });
    }
  } catch (error) {
    console.error('Error tracking social click:', error);
  }
};

export const SiteDetailContact = ({ site }: SiteDetailContactProps) => {
  const hasContactInfo = site.email || site.whatsapp || site.telegram || 
                        site.twitter || site.instagram || site.facebook || site.youtube;

  if (!hasContactInfo) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          İletişim Bilgileri
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 items-center justify-center">
          {site.email && (
            <a 
              href={`mailto:${site.email}`} 
              className="transition-all duration-200 ease-out hover:scale-125 hover:-translate-y-1 p-2 rounded-full hover:bg-primary/10 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Email"
              onClick={() => trackSocialClick(site.id, 'email')}
            >
              <Mail className="w-10 h-10 text-[#EA4335]" />
            </a>
          )}
          
          {site.whatsapp && (
            <a 
              href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`${site.name} hakkında bilgi almak istiyorum`)}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="transition-all duration-200 ease-out hover:scale-125 hover:-translate-y-1 p-2 rounded-full hover:bg-[#25D366]/10 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="WhatsApp"
              onClick={() => trackSocialClick(site.id, 'whatsapp')}
            >
              <FaWhatsapp className="w-10 h-10 text-[#25D366]" />
            </a>
          )}
          
          {site.telegram && (
            <a 
              href={`https://t.me/${site.telegram}?text=${encodeURIComponent(`${site.name} hakkında bilgi almak istiyorum`)}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="transition-all duration-200 ease-out hover:scale-125 hover:-translate-y-1 p-2 rounded-full hover:bg-[#0088cc]/10 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Telegram"
              onClick={() => trackSocialClick(site.id, 'telegram')}
            >
              <FaTelegramPlane className="w-10 h-10 text-[#0088cc]" />
            </a>
          )}
          
          {site.twitter && (
            <a 
              href={site.twitter} 
              target="_blank" 
              rel="noopener noreferrer"
              className="transition-all duration-200 ease-out hover:scale-125 hover:-translate-y-1 p-2 rounded-full hover:bg-[#1DA1F2]/10 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Twitter"
              onClick={() => trackSocialClick(site.id, 'twitter')}
            >
              <FaTwitter className="w-10 h-10 text-[#1DA1F2]" />
            </a>
          )}
          
          {site.instagram && (
            <a 
              href={site.instagram} 
              target="_blank" 
              rel="noopener noreferrer"
              className="transition-all duration-200 ease-out hover:scale-125 hover:-translate-y-1 p-2 rounded-full hover:bg-[#E4405F]/10 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Instagram"
              onClick={() => trackSocialClick(site.id, 'instagram')}
            >
              <FaInstagram className="w-10 h-10 text-[#E4405F]" />
            </a>
          )}
          
          {site.facebook && (
            <a 
              href={site.facebook} 
              target="_blank" 
              rel="noopener noreferrer"
              className="transition-all duration-200 ease-out hover:scale-125 hover:-translate-y-1 p-2 rounded-full hover:bg-[#1877F2]/10 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Facebook"
              onClick={() => trackSocialClick(site.id, 'facebook')}
            >
              <FaFacebook className="w-10 h-10 text-[#1877F2]" />
            </a>
          )}
          
          {site.youtube && (
            <a 
              href={site.youtube} 
              target="_blank" 
              rel="noopener noreferrer"
              className="transition-all duration-200 ease-out hover:scale-125 hover:-translate-y-1 p-2 rounded-full hover:bg-[#FF0000]/10 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="YouTube"
              onClick={() => trackSocialClick(site.id, 'youtube')}
            >
              <FaYoutube className="w-10 h-10 text-[#FF0000]" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
