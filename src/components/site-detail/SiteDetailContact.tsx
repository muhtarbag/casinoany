import { Mail, ChevronDown } from 'lucide-react';
import { FaTwitter, FaInstagram, FaFacebook, FaYoutube, FaWhatsapp, FaTelegramPlane } from 'react-icons/fa';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { trackSocialClick } from '@/lib/socialTracking';
import { 
  normalizeWhatsAppUrl, 
  normalizeTelegramUrl, 
  normalizeTwitterUrl, 
  normalizeInstagramUrl, 
  normalizeFacebookUrl, 
  normalizeYouTubeUrl 
} from '@/lib/socialMediaHelpers';

interface SiteDetailContactProps {
  site: any;
}

export const SiteDetailContact = ({ site }: SiteDetailContactProps) => {
  const hasContactInfo = site.email || site.whatsapp || site.telegram || 
                        site.twitter || site.instagram || site.facebook || site.youtube;

  if (!hasContactInfo) return null;

  // Normalize all social media URLs
  const whatsappUrl = normalizeWhatsAppUrl(site.whatsapp);
  const telegramUrl = normalizeTelegramUrl(site.telegram);
  const twitterUrl = normalizeTwitterUrl(site.twitter);
  const instagramUrl = normalizeInstagramUrl(site.instagram);
  const facebookUrl = normalizeFacebookUrl(site.facebook);
  const youtubeUrl = normalizeYouTubeUrl(site.youtube);

  // Count active channels
  const activeChannels = [
    site.email, whatsappUrl, telegramUrl, twitterUrl, 
    instagramUrl, facebookUrl, youtubeUrl
  ].filter(Boolean).length;

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="contact" className="border rounded-lg px-4 bg-card">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center justify-between w-full pr-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary" />
              <span className="font-semibold">İletişim & Sosyal Medya</span>
            </div>
            <Badge variant="secondary" className="mr-2">
              {activeChannels} kanal
            </Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-wrap gap-4 items-center justify-center py-4">
          {site.email && (
            <a 
              href={`mailto:${site.email}`} 
              className="group relative transition-all duration-300 ease-out hover:scale-110 p-2 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Email"
              onClick={() => trackSocialClick(site.id, 'email')}
            >
              <div className="absolute inset-0 rounded-full bg-[#EA4335] opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
              <div className="absolute inset-0 rounded-full bg-[#EA4335] opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              <Mail className="w-10 h-10 text-[#EA4335] relative z-10 group-hover:text-white transition-colors duration-300" />
            </a>
          )}
          
          {whatsappUrl && (
            <a 
              href={whatsappUrl}
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative transition-all duration-300 ease-out hover:scale-110 p-2 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="WhatsApp"
              onClick={() => trackSocialClick(site.id, 'whatsapp')}
            >
              <div className="absolute inset-0 rounded-full bg-[#25D366] opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
              <div className="absolute inset-0 rounded-full bg-[#25D366] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <FaWhatsapp className="w-10 h-10 text-[#25D366] relative z-10 group-hover:text-white transition-colors duration-300" />
            </a>
          )}
          
          {telegramUrl && (
            <a 
              href={telegramUrl}
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative transition-all duration-300 ease-out hover:scale-110 p-2 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Telegram"
              onClick={() => trackSocialClick(site.id, 'telegram')}
            >
              <div className="absolute inset-0 rounded-full bg-[#0088cc] opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
              <div className="absolute inset-0 rounded-full bg-[#0088cc] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <FaTelegramPlane className="w-10 h-10 text-[#0088cc] relative z-10 group-hover:text-white transition-colors duration-300" />
            </a>
          )}
          
          {twitterUrl && (
            <a 
              href={twitterUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative transition-all duration-300 ease-out hover:scale-110 p-2 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Twitter"
              onClick={() => trackSocialClick(site.id, 'twitter')}
            >
              <div className="absolute inset-0 rounded-full bg-[#1DA1F2] opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
              <div className="absolute inset-0 rounded-full bg-[#1DA1F2] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <FaTwitter className="w-10 h-10 text-[#1DA1F2] relative z-10 group-hover:text-white transition-colors duration-300" />
            </a>
          )}
          
          {instagramUrl && (
            <a 
              href={instagramUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative transition-all duration-300 ease-out hover:scale-110 p-2 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Instagram"
              onClick={() => trackSocialClick(site.id, 'instagram')}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737] opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <FaInstagram className="w-10 h-10 text-[#E1306C] relative z-10 group-hover:text-white transition-colors duration-300" />
            </a>
          )}
          
          {facebookUrl && (
            <a 
              href={facebookUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative transition-all duration-300 ease-out hover:scale-110 p-2 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Facebook"
              onClick={() => trackSocialClick(site.id, 'facebook')}
            >
              <div className="absolute inset-0 rounded-full bg-[#1877F2] opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
              <div className="absolute inset-0 rounded-full bg-[#1877F2] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <FaFacebook className="w-10 h-10 text-[#1877F2] relative z-10 group-hover:text-white transition-colors duration-300" />
            </a>
          )}
          
          {youtubeUrl && (
            <a 
              href={youtubeUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative transition-all duration-300 ease-out hover:scale-110 p-2 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="YouTube"
              onClick={() => trackSocialClick(site.id, 'youtube')}
            >
              <div className="absolute inset-0 rounded-full bg-[#FF0000] opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
              <div className="absolute inset-0 rounded-full bg-[#FF0000] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <FaYoutube className="w-10 h-10 text-[#FF0000] relative z-10 group-hover:text-white transition-colors duration-300" />
            </a>
          )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
