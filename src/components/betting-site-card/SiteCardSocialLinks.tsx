import { Mail } from 'lucide-react';
import { FaTwitter, FaInstagram, FaFacebook, FaYoutube, FaWhatsapp, FaTelegramPlane } from 'react-icons/fa';
import { 
  normalizeWhatsAppUrl, 
  normalizeTelegramUrl, 
  normalizeTwitterUrl, 
  normalizeInstagramUrl, 
  normalizeFacebookUrl, 
  normalizeYouTubeUrl 
} from '@/lib/socialMediaHelpers';
import { trackSocialClick } from '@/lib/socialTracking';

interface SiteCardSocialLinksProps {
  siteId?: string;
  siteName: string;
  email?: string;
  whatsapp?: string;
  telegram?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
}

export const SiteCardSocialLinks = ({
  siteId,
  siteName,
  email,
  whatsapp,
  telegram,
  twitter,
  instagram,
  facebook,
  youtube,
}: SiteCardSocialLinksProps) => {
  const links = [
    { url: email, icon: Mail, label: 'Email', href: `mailto:${email}`, color: '#6366f1', platform: 'email' },
    { 
      url: whatsapp, 
      icon: FaWhatsapp, 
      label: 'WhatsApp', 
      href: normalizeWhatsAppUrl(whatsapp) || '', 
      color: '#25D366', 
      platform: 'whatsapp' 
    },
    { 
      url: telegram, 
      icon: FaTelegramPlane, 
      label: 'Telegram', 
      href: normalizeTelegramUrl(telegram) || '', 
      color: '#0088cc', 
      platform: 'telegram' 
    },
    { url: twitter, icon: FaTwitter, label: 'Twitter', href: normalizeTwitterUrl(twitter) || '', color: '#1DA1F2', platform: 'twitter' },
    { url: instagram, icon: FaInstagram, label: 'Instagram', href: normalizeInstagramUrl(instagram) || '', color: '#E4405F', platform: 'instagram' },
    { url: facebook, icon: FaFacebook, label: 'Facebook', href: normalizeFacebookUrl(facebook) || '', color: '#1877F2', platform: 'facebook' },
    { url: youtube, icon: FaYoutube, label: 'YouTube', href: normalizeYouTubeUrl(youtube) || '', color: '#FF0000', platform: 'youtube' },
  ].filter(link => link.url);

  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
      {links.map((link, idx) => {
        const Icon = link.icon;
        return (
          <a 
            key={`social-${siteId}-${link.label}-${idx}`} 
            href={link.href} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              trackSocialClick(siteId || '', link.platform as any, siteName);
            }}
            className="flex items-center justify-center p-2 rounded-lg transition-all duration-300 group/social relative overflow-hidden"
            aria-label={link.label}
            style={{ 
              backgroundColor: 'hsl(var(--muted))',
              // @ts-ignore
              '--brand-color': link.color,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = link.color;
              const icon = e.currentTarget.querySelector('svg');
              if (icon) {
                (icon as SVGElement).style.color = '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'hsl(var(--muted))';
              const icon = e.currentTarget.querySelector('svg');
              if (icon) {
                (icon as SVGElement).style.color = link.color;
              }
            }}
          >
            <Icon 
              className="w-4 h-4 transition-all duration-300 group-hover/social:scale-110" 
              style={{ color: link.color }}
            />
          </a>
        );
      })}
    </div>
  );
};
