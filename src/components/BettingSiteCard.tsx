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
      className="group relative overflow-hidden bg-gradient-to-br from-card via-card to-card/50 border-2 border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 cursor-pointer backdrop-blur-sm"
      onClick={handleCardClick}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardHeader className="relative pb-6 pt-6">
        {/* Logo Section with Premium Design */}
        <div className="flex items-center justify-center mb-6">
          {logoUrl ? (
            <div className="relative w-32 h-32 bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border shadow-lg group-hover:shadow-2xl group-hover:shadow-primary/20 group-hover:scale-105 transition-all duration-500 p-4 flex items-center justify-center overflow-hidden">
              {/* Glow effect behind logo */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img 
                src={logoUrl} 
                alt={name} 
                className="relative w-full h-full object-contain z-10 group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">${name.charAt(0)}</div>`;
                }}
              />
            </div>
          ) : (
            <div className="w-32 h-32 bg-gradient-primary rounded-2xl flex items-center justify-center text-4xl font-bold text-primary-foreground shadow-lg group-hover:shadow-2xl group-hover:shadow-primary/30 group-hover:scale-105 transition-all duration-500">
              {name.charAt(0)}
            </div>
          )}
        </div>

        {/* Site Name & Rating */}
        <div className="text-center space-y-3">
          <h3 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
            {name}
          </h3>
          
          <div className="flex items-center justify-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 transition-all duration-300 ${
                  i < Math.floor(rating)
                    ? 'fill-secondary text-secondary group-hover:scale-110'
                    : 'text-muted-foreground/40'
                }`}
              />
            ))}
            <span className="ml-2 text-sm font-semibold text-muted-foreground">
              {rating.toFixed(1)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-5 px-6 pb-6">
        {/* Bonus Section with Premium Design */}
        {bonus && (
          <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 p-4 rounded-xl border border-primary/20 shadow-inner group-hover:shadow-lg group-hover:border-primary/40 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse" />
            <p className="relative text-center text-sm font-bold bg-gradient-primary bg-clip-text text-transparent">
              {bonus}
            </p>
          </div>
        )}

        {/* Features with Modern Badges */}
        {features && features.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {features.slice(0, 3).map((feature, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className="bg-muted/50 border-border/50 hover:bg-muted hover:border-primary/30 transition-all duration-300 backdrop-blur-sm"
              >
                {feature}
              </Badge>
            ))}
            {features.length > 3 && (
              <Badge 
                variant="outline" 
                className="bg-primary/10 border-primary/20 text-primary font-semibold"
              >
                +{features.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Social Links with Hover Effects */}
        {socialLinks.length > 0 && (
          <div className="flex flex-wrap gap-2.5 justify-center pt-2">
            {socialLinks.map((link, idx) => {
              const Icon = link.icon;
              return (
                <a
                  key={idx}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-muted/50 hover:bg-primary/20 hover:scale-110 transition-all duration-300 border border-border/50 hover:border-primary/30 backdrop-blur-sm group/social"
                  title={link.label}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Icon className="w-4 h-4 group-hover/social:text-primary transition-colors" />
                </a>
              );
            })}
          </div>
        )}
      </CardContent>

      <CardFooter className="relative px-6 pb-6">
        <Button 
          onClick={handleAffiliateClick}
          className="w-full bg-gradient-primary hover:shadow-2xl hover:shadow-primary/30 hover:scale-105 transition-all duration-300 text-base font-bold py-6 rounded-xl relative overflow-hidden group/btn"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000" />
          <span className="relative flex items-center justify-center gap-2">
            Siteye Git
            <ExternalLink className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
          </span>
        </Button>
      </CardFooter>
    </Card>
  );
};
