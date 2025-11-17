import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BettingSiteCard } from './BettingSiteCard';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Search } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { EmptyState } from './EmptyState';
import { DynamicBanner } from './DynamicBanner';

export const PixelGrid = () => {
  const { data: sites, isLoading, error } = useQuery({
    queryKey: ['betting-sites-active'],
    queryFn: async () => {
      console.log('🔥 PixelGrid: Starting fetch...');
      const { data, error } = await supabase
        .from('betting_sites')
        .select('id, name, logo_url, rating, bonus, features, affiliate_link, slug, email, whatsapp, telegram, twitter, instagram, facebook, youtube, is_active, display_order, review_count, avg_rating')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('❌ PixelGrid fetch error:', error);
        throw error;
      }
      console.log('✅ PixelGrid fetched:', data?.length, 'sites');
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 min
    gcTime: 10 * 60 * 1000, // 10 min
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    enabled: true, // ✅ FIX: Force enable
  });

  console.log('📊 PixelGrid state:', { isLoading, hasData: !!sites, count: sites?.length, error });

  const { data: banners } = useQuery({
    queryKey: ['site-banners-home'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_banners')
        .select('*')
        .eq('is_active', true)
        .contains('display_pages', ['home'])
        .order('position', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data;
    },
    // ✅ BALANCE: Cache but allow initial load
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: true, // CRITICAL: Must fetch on first mount
  });

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Siteler yükleniyor..." fullScreen={false} className="py-20" />;
  }

  if (!sites || sites.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title="Henüz Site Bulunmuyor"
        description="Şu anda aktif bahis sitesi bulunmamaktadır. Lütfen daha sonra tekrar kontrol edin."
      />
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
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground animate-fade-in">
            Güvenilir Casino Sitelerini Keşfedin
          </h2>
          
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in px-4">
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
        {sites.map((site: any, index: number) => {
          // Find banners for this position
          const bannersAtPosition = banners?.filter(banner => banner.position === index) || [];
          
          return (
            <React.Fragment key={site.id}>
              <BettingSiteCard
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
                reviewCount={site.review_count || 0}
                avgRating={site.avg_rating || 0}
              />
              {bannersAtPosition.length > 0 && (
                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                  {bannersAtPosition.map(banner => (
                    <DynamicBanner
                      key={banner.id}
                      imageUrl={banner.image_url}
                      mobileImageUrl={banner.mobile_image_url}
                      altText={banner.alt_text}
                      targetUrl={banner.target_url}
                      title={banner.title}
                    />
                  ))}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
