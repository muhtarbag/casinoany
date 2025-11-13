import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ExternalLink, Mail, MessageCircle, Send, ChevronRight } from 'lucide-react';
import { FaTwitter, FaInstagram, FaFacebook, FaYoutube } from 'react-icons/fa';
import { useState, useEffect } from 'react';

interface BettingSiteCardProps {
  id?: string;
  slug?: string;
  name: string;
  logo?: string;
  rating: number;
  bonus?: string;
  features?: string[];
  affiliateUrl: string;
  email?: string;
  whatsapp?: string;
  telegram?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
}

export const BettingSiteCard = ({
  id,
  slug,
  name,
  logo,
  rating,
  bonus,
  features,
  affiliateUrl,
  email,
  whatsapp,
  telegram,
  twitter,
  instagram,
  facebook,
  youtube,
}: BettingSiteCardProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (logo) {
      // Eğer logo zaten tam bir URL ise direkt kullan
      if (logo.startsWith('http')) {
        setLogoUrl(logo);
      } else {
        // Değilse storage'dan al
        const { data } = supabase.storage.from('site-logos').getPublicUrl(logo);
        setLogoUrl(data.publicUrl);
      }
    }
  }, [logo]);

  const trackClickMutation = useMutation({
    mutationFn: async () => {
      if (!id) return;
      const { data: stats } = await supabase
        .from('site_stats' as any)
        .select('*')
        .eq('site_id', id)
        .maybeSingle();

      if (stats) {
        await supabase.from('site_stats' as any)
          .update({ clicks: (stats as any).clicks + 1 })
          .eq('site_id', id);
      } else {
        await supabase.from('site_stats' as any)
          .insert({ site_id: id, clicks: 1, views: 0 });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-stats'] });
    },
  });

  const handleCardClick = () => {
    if (slug) {
      navigate(`/${slug}`);
    } else if (id) {
      navigate(`/site/${id}`);
    }
  };

  const handleAffiliateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackClickMutation.mutate();
    window.open(affiliateUrl, '_blank');
  };

  const socialLinks = [
    { url: email, icon: Mail, label: 'Email', href: `mailto:${email}` },
    { url: whatsapp, icon: MessageCircle, label: 'WhatsApp', href: `https://wa.me/${whatsapp}` },
    { url: telegram, icon: Send, label: 'Telegram', href: telegram },
    { url: twitter, icon: FaTwitter, label: 'Twitter', href: twitter },
    { url: instagram, icon: FaInstagram, label: 'Instagram', href: instagram },
    { url: facebook, icon: FaFacebook, label: 'Facebook', href: facebook },
    { url: youtube, icon: FaYoutube, label: 'YouTube', href: youtube },
  ].filter(link => link.url);

  return (
    <Card 
      className="group relative overflow-hidden bg-card border border-border hover:border-primary/50 hover:shadow-hover transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-shrink-0 w-20 h-20 bg-muted rounded-lg flex items-center justify-center overflow-hidden border border-border">
            {logoUrl ? (
              <img src={logoUrl} alt={name} className="w-full h-full object-contain p-2" />
            ) : (
              <span className="text-2xl font-bold text-muted-foreground">{name[0]}</span>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 rounded-lg border border-primary/20">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span className="font-bold text-sm">{rating.toFixed(1)}</span>
            </div>
            <span className="text-xs text-muted-foreground">Puan</span>
          </div>
        </div>
        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
          {name}
        </h3>
        {bonus && (
          <div className="flex items-center gap-2 px-3 py-2 bg-secondary/10 rounded-lg border border-secondary/20">
            <Badge variant="secondary" className="border-0 text-xs">BONUS</Badge>
            <span className="text-sm font-medium text-foreground">{bonus}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4 px-6 pb-6">
        {features && features.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">Özellikler</h4>
            <div className="flex flex-wrap gap-2">
              {features.slice(0, 3).map((feature, idx) => (
                <Badge key={idx} variant="success" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {features.length > 3 && (
                <Badge variant="success" className="text-xs">+{features.length - 3} daha</Badge>
              )}
            </div>
          </div>
        )}
        {socialLinks.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            {socialLinks.map((link, idx) => {
              const Icon = link.icon;
              return (
                <a key={idx} href={link.href} target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  aria-label={link.label}
                >
                  <Icon className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                </a>
              );
            })}
          </div>
        )}
      </CardContent>

      <CardFooter className="px-6 pb-6 pt-0 gap-2">
        <Button variant="outline" size="sm" className="flex-1 group/btn"
          onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
        >
          Detaylar
          <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
        <Button size="sm" className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold"
          onClick={handleAffiliateClick}
        >
          Siteye Git
          <ExternalLink className="w-4 h-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};