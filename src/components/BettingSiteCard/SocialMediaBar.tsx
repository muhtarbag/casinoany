import { memo } from 'react';
import { Mail, MessageCircle } from 'lucide-react';
import { FaTwitter, FaInstagram, FaFacebook, FaYoutube, FaWhatsapp, FaTelegramPlane } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import { trackSocialClick } from '@/lib/socialTracking';
import { 
  normalizeWhatsAppUrl, 
  normalizeTelegramUrl, 
  normalizeTwitterUrl, 
  normalizeInstagramUrl, 
  normalizeFacebookUrl, 
  normalizeYouTubeUrl 
} from '@/lib/socialMediaHelpers';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface SocialMediaBarProps {
  email?: string;
  whatsapp?: string;
  telegram?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  siteName: string;
  siteId?: string;
}

interface SocialLink {
  icon: React.ReactNode;
  url: string;
  label: string;
  color: string;
  platform: string;
}

export const SocialMediaBar = memo(({
  email,
  whatsapp,
  telegram,
  twitter,
  instagram,
  facebook,
  youtube,
  siteName,
  siteId,
}: SocialMediaBarProps) => {
  const handleSocialClick = (platform: string, url: string) => {
    if (siteId) {
      trackSocialClick(siteId, platform as any, siteName);
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const socialLinks: SocialLink[] = [];

  if (whatsapp) {
    socialLinks.push({
      icon: <FaWhatsapp className="w-4 h-4" />,
      url: normalizeWhatsAppUrl(whatsapp),
      label: 'WhatsApp',
      color: 'hover:text-[#25D366]',
      platform: 'whatsapp'
    });
  }

  if (telegram) {
    socialLinks.push({
      icon: <FaTelegramPlane className="w-4 h-4" />,
      url: normalizeTelegramUrl(telegram),
      label: 'Telegram',
      color: 'hover:text-[#0088cc]',
      platform: 'telegram'
    });
  }

  if (twitter) {
    socialLinks.push({
      icon: <FaTwitter className="w-4 h-4" />,
      url: normalizeTwitterUrl(twitter),
      label: 'Twitter',
      color: 'hover:text-[#1DA1F2]',
      platform: 'twitter'
    });
  }

  if (instagram) {
    socialLinks.push({
      icon: <FaInstagram className="w-4 h-4" />,
      url: normalizeInstagramUrl(instagram),
      label: 'Instagram',
      color: 'hover:text-[#E4405F]',
      platform: 'instagram'
    });
  }

  if (facebook) {
    socialLinks.push({
      icon: <FaFacebook className="w-4 h-4" />,
      url: normalizeFacebookUrl(facebook),
      label: 'Facebook',
      color: 'hover:text-[#1877F2]',
      platform: 'facebook'
    });
  }

  if (youtube) {
    socialLinks.push({
      icon: <FaYoutube className="w-4 h-4" />,
      url: normalizeYouTubeUrl(youtube),
      label: 'YouTube',
      color: 'hover:text-[#FF0000]',
      platform: 'youtube'
    });
  }

  if (email) {
    socialLinks.push({
      icon: <Mail className="w-4 h-4" />,
      url: `mailto:${email}`,
      label: 'E-posta',
      color: 'hover:text-accent',
      platform: 'email'
    });
  }

  if (socialLinks.length === 0) return null;

  return (
    <div className="flex items-center gap-1 pb-3 border-b border-border/50">
      <MessageCircle className="w-4 h-4 text-muted-foreground mr-1" />
      <div className="flex items-center gap-1 flex-wrap">
        {socialLinks.map((link, index) => (
          <HoverCard key={index} openDelay={200}>
            <HoverCardTrigger asChild>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSocialClick(link.platform, link.url);
                }}
                className={cn(
                  "p-2 rounded-md transition-all duration-300",
                  "text-muted-foreground hover:bg-muted/50",
                  "hover:scale-110 active:scale-95",
                  link.color
                )}
                aria-label={link.label}
              >
                {link.icon}
              </button>
            </HoverCardTrigger>
            <HoverCardContent 
              side="top" 
              className="w-auto p-2 text-xs"
              sideOffset={5}
            >
              {link.label}
            </HoverCardContent>
          </HoverCard>
        ))}
      </div>
    </div>
  );
});

SocialMediaBar.displayName = 'SocialMediaBar';
