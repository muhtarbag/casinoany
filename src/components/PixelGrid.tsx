import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BettingSiteCard } from './BettingSiteCard';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, TrendingUp } from 'lucide-react';

export const PixelGrid = () => {
  const { data: sites, isLoading } = useQuery({
    queryKey: ['betting-sites-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data;
    },
    staleTime: 0,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!sites || sites.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground text-lg">Henüz kayıtlı bahis sitesi bulunmamaktadır.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Animasyonlu CTA */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 p-8 md:p-12 backdrop-blur-sm border border-primary/20 group hover:border-primary/40 transition-all duration-500">
        {/* Animated Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 animate-pulse opacity-50" />
        
        {/* Content */}
        <div className="relative z-10 text-center space-y-6">
          <div className="flex items-center justify-center gap-2 animate-fade-in">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              En İyi Seçimler
            </span>
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-foreground animate-fade-in">
            Güvenilir Casino Sitelerini Keşfedin
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in">
            Yüksek bonuslar, hızlı ödemeler ve 7/24 destek sunan lisanslı casino sitelerini karşılaştırın
          </p>
          
          <div className="flex items-center justify-center gap-4 pt-4 animate-fade-in">
            <Button 
              size="lg" 
              className="shadow-glow hover:shadow-hover transition-all duration-300 hover:scale-105 group"
            >
              <TrendingUp className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Siteleri İncele
            </Button>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 pt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span>50+ Lisanslı Site</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span>Güncel Bonuslar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span>Detaylı İncelemeler</span>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Site Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sites.map((site: any) => (
          <BettingSiteCard
            key={site.id}
            id={site.id}
            slug={site.slug}
            name={site.name}
            logo={site.logo_url || ''}
            rating={site.rating || 0}
            bonus={site.bonus || ''}
            features={site.features || []}
            affiliateUrl={site.affiliate_link || ''}
            email={site.email || ''}
            whatsapp={site.whatsapp || ''}
            telegram={site.telegram || ''}
            twitter={site.twitter || ''}
            instagram={site.instagram || ''}
            facebook={site.facebook || ''}
            youtube={site.youtube || ''}
          />
        ))}
      </div>
    </div>
  );
};
