import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ExternalLink, Mail, MessageCircle, Send } from 'lucide-react';
import { FaTwitter, FaInstagram, FaFacebook, FaYoutube } from 'react-icons/fa';
import { useState, useEffect } from 'react';

interface BettingSiteCardProps {
  id?: string;
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
      const { data } = supabase.storage.from('site-logos').getPublicUrl(logo);
      setLogoUrl(data.publicUrl);
    }
  }, [logo]);

  const trackClickMutation = useMutation({
    mutationFn: async () => {
      if (!id) return;

      // Get current stats
      const { data: stats } = await supabase
        .from('site_stats' as any)
        .select('*')
        .eq('site_id', id)
        .maybeSingle();

      if (stats) {
        await supabase
          .from('site_stats' as any)
          .update({ clicks: (stats as any).clicks + 1 })
          .eq('site_id', id);
      } else {
        await supabase
          .from('site_stats' as any)
          .insert({ site_id: id, clicks: 1, views: 0 });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-stats'] });
    },
  });

  const handleCardClick = () => {
    if (id) {
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
      className="group relative overflow-hidden bg-card hover:bg-card/80 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-4">
        {/* Logo Section - Horizontal Layout */}
        <div className="flex items-center justify-center min-h-[80px] mb-4">
          {logoUrl ? (
            <div className="w-full max-w-[280px] h-[80px] flex items-center justify-center">
              <img 
                src={logoUrl} 
                alt={name} 
                className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = `<div class="text-3xl font-bold text-foreground">${name}</div>`;
                }}
              />
            </div>
          ) : (
            <h3 className="text-2xl font-bold text-foreground">{name}</h3>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center justify-center gap-1 py-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 transition-all duration-300 ${
                i < Math.floor(rating)
                  ? 'fill-yellow-500 text-yellow-500'
                  : 'fill-muted text-muted'
              }`}
            />
          ))}
          <span className="ml-2 text-sm font-semibold text-foreground">
            {rating.toFixed(1)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-4">
        {/* Bonus Section */}
        {bonus && (
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-3 rounded-lg border border-primary/10">
            <p className="text-center text-sm font-semibold text-foreground line-clamp-2">
              {bonus}
            </p>
          </div>
        )}

        {/* Features */}
        {features && features.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {features.slice(0, 4).map((feature, idx) => (
              <Badge 
                key={idx} 
                variant="secondary"
                className="text-xs"
              >
                {feature}
              </Badge>
            ))}
            {features.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{features.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Social Links */}
        {socialLinks.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {socialLinks.map((link, idx) => {
              const Icon = link.icon;
              return (
                <a
                  key={idx}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-muted hover:bg-primary/10 transition-colors"
                  title={link.label}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 pb-4">
        <Button 
          onClick={handleAffiliateClick}
          className="w-full bg-gradient-primary hover:shadow-lg hover:scale-[1.02] transition-all duration-300 font-semibold"
          size="lg"
        >
          Siteye Git
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
};
