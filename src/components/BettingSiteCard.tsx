import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ExternalLink, Mail, MessageCircle, Send } from 'lucide-react';
import { FaTwitter, FaInstagram, FaFacebook, FaYoutube } from 'react-icons/fa';

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

  const trackClickMutation = useMutation({
    mutationFn: async () => {
      if (!id) return;

      // Get current stats
      const { data: stats } = await supabase
        .from('site_stats')
        .select('*')
        .eq('site_id', id)
        .maybeSingle();

      if (stats) {
        await supabase
          .from('site_stats')
          .update({ clicks: stats.clicks + 1 })
          .eq('site_id', id);
      } else {
        await supabase
          .from('site_stats')
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
      className="group overflow-hidden bg-card border-border hover:border-primary transition-all duration-300 hover:shadow-glow cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logo ? (
              <img src={logo} alt={name} className="w-12 h-12 object-contain rounded" />
            ) : (
              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-lg font-bold">
                {name.charAt(0)}
              </div>
            )}
            <h3 className="text-xl font-bold">{name}</h3>
          </div>
          
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(rating)
                    ? 'fill-secondary text-secondary'
                    : 'text-muted-foreground'
                }`}
              />
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {bonus && (
          <div className="bg-gradient-secondary p-3 rounded-lg">
            <p className="text-sm font-semibold text-secondary-foreground">{bonus}</p>
          </div>
        )}

        {features && features.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {features.map((feature, idx) => (
              <Badge key={idx} variant="outline" className="bg-muted/50">
                {feature}
              </Badge>
            ))}
          </div>
        )}

        {socialLinks.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {socialLinks.map((link, idx) => {
              const Icon = link.icon;
              return (
                <a
                  key={idx}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-muted hover:bg-muted-foreground/20 transition-colors"
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

      <CardFooter>
        <Button 
          onClick={handleAffiliateClick}
          className="w-full bg-gradient-primary group-hover:shadow-glow transition-all"
        >
          Siteye Git
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
};
