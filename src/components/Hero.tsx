import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Award, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { BettingSiteCard } from './BettingSiteCard';
import { SmartSearch } from './SmartSearch';
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
    dragFree: false
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

  // Auto-scroll on mobile every 3 seconds
  useEffect(() => {
    if (!emblaApi) return;
    
    // Always check on mount and resize
    const handleAutoScroll = () => {
      const isMobile = window.innerWidth < 768;
      if (!isMobile) return;
      
      // Use scrollNext which automatically handles loop
      emblaApi.scrollNext();
    };

    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    // Start auto-scroll for mobile
    const autoScrollInterval = setInterval(handleAutoScroll, autoScrollDuration);

    return () => clearInterval(autoScrollInterval);
  }, [emblaApi, autoScrollDuration]);

  // Fetch carousel settings
  const { data: carouselSettings } = useQuery({
    queryKey: ['carousel-settings'],
    queryFn: async () => {
      const { data: animData, error: animError } = await supabase
        .from('site_settings')
        .select('*')
        .eq('setting_key', 'carousel_animation_type')
        .single();
      
      const { data: durationData, error: durationError } = await supabase
        .from('site_settings')
        .select('*')
        .eq('setting_key', 'carousel_auto_scroll_duration')
        .single();
      
      if (animError || durationError) {
        console.error('Error fetching carousel settings:', animError || durationError);
        return { animation: { setting_value: 'slide' }, duration: { setting_value: '2500' } };
      }
      
      return { animation: animData, duration: durationData };
    },
  });

  useEffect(() => {
    if (carouselSettings?.animation?.setting_value) {
      setAnimationType(carouselSettings.animation.setting_value);
    }
    if (carouselSettings?.duration?.setting_value) {
      setAutoScrollDuration(parseInt(carouselSettings.duration.setting_value));
    }
  }, [carouselSettings]);

  const { data: featuredSites } = useQuery({
    queryKey: ['featured-sites'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('betting_sites')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('rating', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
    staleTime: 0,
  });


  return (
    <div className="relative overflow-hidden bg-background">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center space-y-6 md:space-y-8 mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Türkiye'nin #1 Bahis Sitesi Rehberi</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold">
            <span className="text-primary">En İyi Bahis Siteleri</span><br />
            <span className="text-foreground text-xl sm:text-2xl md:text-4xl lg:text-5xl font-normal mt-2 block">Güvenilir ve Kazançlı</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Lisanslı ve güvenilir bahis sitelerini inceleyin. <span className="text-foreground font-semibold">Yüksek bonuslar</span>, <span className="text-foreground font-semibold">hızlı ödemeler</span> ve <span className="text-foreground font-semibold">7/24 destek</span> imkanı.
          </p>
          <SmartSearch onSearch={onSearch} searchTerm={localSearch} />
          <div className="flex flex-wrap justify-center gap-6 pt-6">
            <div className="flex items-center gap-3 px-6 py-3 rounded-lg bg-card border border-border">
              <TrendingUp className="w-6 h-6 text-primary" />
              <div className="text-left"><div className="text-2xl font-bold">50+</div><div className="text-sm text-muted-foreground">Bahis Sitesi</div></div>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 rounded-lg bg-card border border-border">
              <Shield className="w-6 h-6 text-secondary" />
              <div className="text-left"><div className="text-2xl font-bold">%100</div><div className="text-sm text-muted-foreground">Lisanslı</div></div>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 rounded-lg bg-card border border-border">
              <Award className="w-6 h-6 text-accent" />
              <div className="text-left"><div className="text-2xl font-bold">1000+</div><div className="text-sm text-muted-foreground">Kullanıcı</div></div>
            </div>
          </div>
        </div>
        {featuredSites && featuredSites.length > 0 && (
          <div className="relative -mx-4 px-4 py-12 overflow-hidden">
            {/* Animated Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
              <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute top-1/2 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="relative z-10 space-y-8">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2">Öne Çıkan Siteler</h2>
                <p className="text-muted-foreground text-base sm:text-lg">En yüksek puanlı ve en çok tercih edilen bahis siteleri</p>
              </div>
              <div className="relative max-w-7xl mx-auto">
                <button 
                  onClick={scrollPrev} 
                  disabled={!canScrollPrev} 
                  className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center rounded-lg bg-card border border-border hover:border-primary hover:scale-110 disabled:opacity-30 transition-all duration-300 hover:shadow-lg" 
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={scrollNext} 
                  disabled={!canScrollNext} 
                  className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center rounded-lg bg-card border border-border hover:border-primary hover:scale-110 disabled:opacity-30 transition-all duration-300 hover:shadow-lg" 
                  aria-label="Next"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <div 
                  className="overflow-hidden relative" 
                  ref={emblaRef}
                  onTouchStart={(e) => {
                    setIsDragging(true);
                    setDragStartX(e.touches[0].clientX);
                  }}
                  onTouchMove={(e) => {
                    if (isDragging) {
                      const offset = e.touches[0].clientX - dragStartX;
                      setDragOffset(offset);
                    }
                  }}
                  onTouchEnd={() => {
                    setIsDragging(false);
                    setDragOffset(0);
                    // Haptic feedback (vibrate)
                    if ('vibrate' in navigator) {
                      navigator.vibrate(10);
                    }
                  }}
                >
                  {isDragging && Math.abs(dragOffset) > 20 && (
                    <div className="absolute inset-0 bg-primary/5 pointer-events-none z-20 transition-opacity duration-200" />
                  )}
                  <div className={`flex gap-6 carousel-${animationType} transition-transform duration-200`} style={{ transform: isDragging ? `translateX(${dragOffset * 0.1}px)` : '' }}>
                    {featuredSites.map((site, index) => (
                      <div 
                        key={site.id} 
                        className={`flex-[0_0_100%] min-w-0 md:flex-[0_0_calc(50%-1rem)] lg:flex-[0_0_calc(33.333%-1.5rem)] embla__slide ${selectedIndex === index ? 'is-snapped' : ''} transition-transform duration-300 ${isDragging && selectedIndex === index ? 'scale-[0.98]' : ''}`}
                      >
                        <BettingSiteCard id={site.id} name={site.name} logo={site.logo_url || undefined} rating={Number(site.rating) || 0} bonus={site.bonus || undefined} features={site.features || undefined} affiliateUrl={site.affiliate_link} email={site.email || undefined} whatsapp={site.whatsapp || undefined} telegram={site.telegram || undefined} twitter={site.twitter || undefined} instagram={site.instagram || undefined} facebook={site.facebook || undefined} youtube={site.youtube || undefined} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-center gap-2 mt-6">
                  {featuredSites.map((_, index) => (
                    <button 
                      key={index} 
                      onClick={() => emblaApi?.scrollTo(index)} 
                      className={`h-2 rounded-full transition-all duration-300 ${selectedIndex === index ? 'bg-primary w-8' : 'bg-muted-foreground/30 w-2 hover:bg-muted-foreground/50'}`} 
                      aria-label={`Go to slide ${index + 1}`} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};