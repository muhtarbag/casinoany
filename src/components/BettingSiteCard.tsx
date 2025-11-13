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
      className="group relative overflow-hidden bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/60 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 cursor-pointer hover:-translate-y-2 hover:bg-card/80"
      onClick={handleCardClick}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-secondary/0 group-hover:from-primary/5 group-hover:via-transparent group-hover:to-secondary/5 transition-all duration-700 ease-out" />
      
      {/* Shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
      </div>
      <CardHeader className="relative pb-3 md:pb-4 pt-4 md:pt-6 z-10">
        {/* Logo Section - Horizontal Layout */}
        <div className="flex items-center justify-center min-h-[60px] md:min-h-[80px] mb-3 md:mb-4">
          {logoUrl ? (
            <div className="w-full max-w-[200px] md:max-w-[280px] h-[60px] md:h-[80px] flex items-center justify-center relative">
              {/* Logo glow on hover */}
              <div className="absolute inset-0 blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-700 bg-primary/20" />
              <img 
                src={logoUrl} 
                alt={name} 
                className="relative max-w-full max-h-full object-contain group-hover:scale-110 group-hover:brightness-110 transition-all duration-500 ease-out drop-shadow-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = `<div class="text-xl md:text-3xl font-bold text-foreground group-hover:scale-110 transition-transform duration-500">${name}</div>`;
                }}
              />
            </div>
          ) : (
            <h3 className="text-xl md:text-2xl font-bold text-foreground group-hover:scale-110 group-hover:text-primary transition-all duration-500">{name}</h3>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center justify-center gap-0.5 md:gap-1 py-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 md:w-5 md:h-5 transition-all duration-500 ease-out ${
                i < Math.floor(rating)
                  ? 'fill-yellow-500 text-yellow-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]'
                  : 'fill-muted text-muted group-hover:fill-muted-foreground/30'
              }`}
              style={{ transitionDelay: `${i * 50}ms` }}
            />
          ))}
          <span className="ml-1 md:ml-2 text-xs md:text-sm font-semibold text-foreground group-hover:text-primary group-hover:scale-105 transition-all duration-300">
            {rating.toFixed(1)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-3 md:space-y-4 pb-3 md:pb-4 px-4 md:px-6 z-10">
        {/* Bonus Section */}
        {bonus && (
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 group-hover:from-primary/10 group-hover:to-secondary/10 p-2.5 md:p-3 rounded-lg border border-primary/10 group-hover:border-primary/30 transition-all duration-500 group-hover:shadow-lg">
            <p className="text-center text-xs md:text-sm font-semibold text-foreground group-hover:scale-105 transition-transform duration-300 line-clamp-2">
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
                className="text-xs group-hover:scale-105 transition-all duration-300 hover:bg-primary/20"
                style={{ transitionDelay: `${idx * 50}ms` }}
              >
                {feature}
              </Badge>
            ))}
            {features.length > 4 && (
              <Badge 
                variant="outline" 
                className="text-xs group-hover:scale-105 group-hover:bg-primary/10 transition-all duration-300"
                style={{ transitionDelay: `${4 * 50}ms` }}
              >
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
                  className="p-2 rounded-lg bg-muted hover:bg-primary/20 hover:scale-125 hover:rotate-6 transition-all duration-300 ease-out hover:shadow-lg"
                  title={link.label}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Icon className="w-4 h-4 hover:text-primary transition-colors duration-300" />
                </a>
              );
            })}
          </div>
        )}
      </CardContent>

      <CardFooter className="relative pt-2 pb-3 md:pb-4 px-4 md:px-6 z-10">
        <Button 
          onClick={handleAffiliateClick}
          className="w-full bg-gradient-primary hover:shadow-2xl hover:shadow-primary/40 hover:scale-[1.03] transition-all duration-500 ease-out font-semibold relative overflow-hidden group/btn h-11 md:h-12 text-sm md:text-base"
        >
          {/* Button shine effect */}
          <div className="absolute inset-0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <span className="relative flex items-center justify-center gap-1.5 md:gap-2">
            Siteye Git
            <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover/btn:translate-x-1 group-hover/btn:scale-110 transition-all duration-300" />
          </span>
        </Button>
      </CardFooter>
    </Card>
  );
};
