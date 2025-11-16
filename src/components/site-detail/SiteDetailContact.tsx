import { Mail, MessageCircle } from 'lucide-react';
import { FaTwitter, FaInstagram, FaFacebook, FaYoutube } from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SiteDetailContactProps {
  site: any;
}

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
      <CardContent className="space-y-4">
        {site.email && (
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-primary" />
            <a 
              href={`mailto:${site.email}`} 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {site.email}
            </a>
          </div>
        )}
        
        {site.whatsapp && (
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-primary" />
            <a 
              href={`https://wa.me/${site.whatsapp}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              WhatsApp: {site.whatsapp}
            </a>
          </div>
        )}
        
        {site.telegram && (
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-primary" />
            <a 
              href={`https://t.me/${site.telegram}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Telegram: @{site.telegram}
            </a>
          </div>
        )}
        
        <div className="flex gap-3 pt-2">
          {site.twitter && (
            <a 
              href={site.twitter} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-all hover:scale-110"
              aria-label="Twitter"
            >
              <FaTwitter className="w-6 h-6" />
            </a>
          )}
          {site.instagram && (
            <a 
              href={site.instagram} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-all hover:scale-110"
              aria-label="Instagram"
            >
              <FaInstagram className="w-6 h-6" />
            </a>
          )}
          {site.facebook && (
            <a 
              href={site.facebook} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-all hover:scale-110"
              aria-label="Facebook"
            >
              <FaFacebook className="w-6 h-6" />
            </a>
          )}
          {site.youtube && (
            <a 
              href={site.youtube} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-all hover:scale-110"
              aria-label="YouTube"
            >
              <FaYoutube className="w-6 h-6" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
