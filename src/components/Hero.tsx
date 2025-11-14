import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Award, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { BettingSiteCard } from './BettingSiteCard';
import { SmartSearch } from './SmartSearch';
import { LoadingSpinner } from './LoadingSpinner';
import useEmblaCarousel from 'embla-carousel-react';

interface HeroProps {
  onSearch: (searchTerm: string) => void;
  searchTerm: string;
}

export const Hero = ({ onSearch, searchTerm }: HeroProps) => {
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [animationType, setAnimationType] = useState<string>('slide');
  const [autoScrollDuration, setAutoScrollDuration] = useState<number>(2500);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: 'start',
    skipSnaps: false,
    dragFree: false,
    duration: 20,
    containScroll: 'trimSnaps'
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  // Auto-scroll on mobile
  useEffect(() => {
    if (!emblaApi) return;
    
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    const handleAutoScroll = () => {
      if (!emblaApi) return;
      emblaApi.scrollNext();
    };

    // Start auto-scroll for mobile with smoother transition
    const autoScrollInterval = setInterval(handleAutoScroll, autoScrollDuration);

    // Clear interval on user interaction
    const clearAutoScroll = () => clearInterval(autoScrollInterval);
    emblaApi.on('pointerDown', clearAutoScroll);

    return () => {
      clearInterval(autoScrollInterval);
      emblaApi.off('pointerDown', clearAutoScroll);
    };
  }, [emblaApi, autoScrollDuration]);

  // Fetch carousel settings (birleştirilmiş tek query)
  const { data: carouselSettings } = useQuery({
    queryKey: ['carousel-settings'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['carousel_animation_type', 'carousel_auto_scroll_duration']);
      
      if (error) {
        console.error('Error fetching carousel settings:', error);
        return { animation: 'slide', duration: 2500 };
      }
      
      const settings = data?.reduce((acc: any, item: any) => {
        if (item.setting_key === 'carousel_animation_type') acc.animation = item.setting_value;
        if (item.setting_key === 'carousel_auto_scroll_duration') acc.duration = parseInt(item.setting_value);
        return acc;
      }, { animation: 'slide', duration: 2500 });
      
      return settings;
    },
  });

  useEffect(() => {
    if (carouselSettings?.animation) {
      setAnimationType(carouselSettings.animation);
    }
    if (carouselSettings?.duration) {
      setAutoScrollDuration(carouselSettings.duration);
    }
  }, [carouselSettings]);

  const { data: featuredSites, isLoading: isFeaturedLoading } = useQuery({
    queryKey: ['featured-sites'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('betting_sites')
        .select('id, name, logo_url, rating, bonus, features, affiliate_link, email, whatsapp, telegram, twitter, instagram, facebook, youtube')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('rating', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const featuredIds = featuredSites?.map((site: any) => site.id) || [];

  const { data: siteStats } = useQuery({
    queryKey: ['site-stats', ...featuredIds.sort()],
    queryFn: async () => {
      if (!featuredSites || featuredSites.length === 0) return [];
      
      const { data, error } = await (supabase as any)
        .from('site_stats')
        .select('site_id, views, clicks')
        .in('site_id', featuredIds);
      if (error) throw error;
      return data || [];
    },
    enabled: !!featuredSites && featuredSites.length > 0,
  });


  return (
    <div className="relative overflow-hidden bg-background touch-manipulation">
      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-20">
        <div className="text-center space-y-4 md:space-y-6 lg:space-y-8 mb-8 md:mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-primary/10 border border-primary/20">
            <Award className="w-3 h-3 md:w-4 md:h-4 text-primary" />
            <span className="text-xs md:text-sm font-semibold">Türkiye'nin #1 Bahis Sitesi Rehberi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-bold leading-tight">
            <span className="text-primary">En İyi Bahis Siteleri</span><br />
            <span className="text-foreground text-lg sm:text-xl md:text-3xl lg:text-5xl font-normal mt-1 md:mt-2 block">Güvenilir ve Kazançlı</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Lisanslı ve güvenilir bahis sitelerini inceleyin. <span className="text-foreground font-semibold">Yüksek bonuslar</span>, <span className="text-foreground font-semibold">hızlı ödemeler</span> ve <span className="text-foreground font-semibold">7/24 destek</span> imkanı.
          </p>
          <SmartSearch onSearch={onSearch} searchTerm={localSearch} />
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 lg:gap-6 pt-4 md:pt-6">
            <div className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-lg bg-card border border-border">
              <TrendingUp className="w-4 h-4 md:w-6 md:h-6 text-primary flex-shrink-0" />
              <div className="text-left"><div className="text-lg md:text-2xl font-bold">50+</div><div className="text-xs md:text-sm text-muted-foreground">Bahis Sitesi</div></div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-lg bg-card border border-border">
              <Shield className="w-4 h-4 md:w-6 md:h-6 text-secondary flex-shrink-0" />
              <div className="text-left"><div className="text-lg md:text-2xl font-bold">%100</div><div className="text-xs md:text-sm text-muted-foreground">Lisanslı</div></div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-lg bg-card border border-border">
              <Award className="w-4 h-4 md:w-6 md:h-6 text-accent flex-shrink-0" />
              <div className="text-left"><div className="text-lg md:text-2xl font-bold">1000+</div><div className="text-xs md:text-sm text-muted-foreground">Kullanıcı</div></div>
            </div>
          </div>
        </div>
        {isFeaturedLoading ? (
          <LoadingSpinner size="lg" text="Öne çıkan siteler yükleniyor..." />
        ) : featuredSites && featuredSites.length > 0 ? (
          <div className="relative -mx-4 px-4 py-12 overflow-hidden">
            {/* Animated Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
              <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute top-1/2 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="relative z-10 space-y-8">
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-2">Öne Çıkan Siteler</h2>
                <p className="text-muted-foreground text-sm sm:text-base md:text-lg">En yüksek puanlı ve en çok tercih edilen bahis siteleri</p>
              </div>
              <div className="relative max-w-7xl mx-auto">
                <div 
                  className="overflow-hidden relative touch-pan-x" 
                  ref={emblaRef}
                >
                  <div className="flex gap-4 md:gap-6">
                    {featuredSites.map((site, index) => {
                      const stats = (siteStats as any)?.find((s: any) => s.site_id === site.id);
                      return (
                        <div 
                          key={site.id} 
                          className="flex-[0_0_100%] min-w-0 md:flex-[0_0_calc(50%-0.75rem)] lg:flex-[0_0_calc(33.333%-1rem)] transition-opacity duration-300"
                        >
                          <BettingSiteCard 
                            id={site.id} 
                            name={site.name} 
                            logo={site.logo_url || undefined} 
                            rating={Number(site.rating) || 0} 
                            bonus={site.bonus || undefined} 
                            features={site.features || undefined} 
                            affiliateUrl={site.affiliate_link} 
                            email={site.email || undefined} 
                            whatsapp={site.whatsapp || undefined} 
                            telegram={site.telegram || undefined} 
                            twitter={site.twitter || undefined} 
                            instagram={site.instagram || undefined} 
                            facebook={site.facebook || undefined} 
                            youtube={site.youtube || undefined}
                            views={stats?.views || 0}
                            clicks={stats?.clicks || 0}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};