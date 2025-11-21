import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Award, Shield, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { BettingSiteCard } from './BettingSiteCard';
import { SmartSearch } from './SmartSearch';
import { LoadingSpinner } from './LoadingSpinner';
import { Button } from './ui/button';
import BlurText from './BlurText';
import FloatingLines from './FloatingLines';
import LightRays from './LightRays';
import useEmblaCarousel from 'embla-carousel-react';
import { Link } from 'react-router-dom';

interface HeroProps {
  onSearch: (searchTerm: string) => void;
  searchTerm: string;
}

export const Hero = ({ onSearch, searchTerm }: HeroProps) => {
  const navigate = useNavigate();
  const [localSearch, setLocalSearch] = useState(searchTerm);
  
  // Sync local search with prop changes
  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);
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
    
    // FIX MEMORY LEAK: Cleanup event listeners
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Auto-scroll on mobile
  useEffect(() => {
    if (!emblaApi) return;
    
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    let autoScrollInterval: NodeJS.Timeout;

    // Wait a bit to ensure carousel is fully initialized
    const initDelay = setTimeout(() => {
      const handleAutoScroll = () => {
        if (!emblaApi) return;
        
        // Check if carousel can scroll
        if (emblaApi.canScrollNext()) {
          emblaApi.scrollNext();
        } else {
          // Loop back to start
          emblaApi.scrollTo(0);
        }
      };

      // Start auto-scroll for mobile with the configured duration
      autoScrollInterval = setInterval(handleAutoScroll, autoScrollDuration);

      // Clear interval on user interaction
      const clearAutoScroll = () => {
        if (autoScrollInterval) {
          clearInterval(autoScrollInterval);
        }
      };
      
      emblaApi.on('pointerDown', clearAutoScroll);

      return () => {
        if (autoScrollInterval) {
          clearInterval(autoScrollInterval);
        }
        emblaApi.off('pointerDown', clearAutoScroll);
      };
    }, 300); // Small delay to ensure everything is ready

    return () => {
      clearTimeout(initDelay);
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
      }
    };
  }, [emblaApi, autoScrollDuration]);

  // Fetch carousel settings (birleştirilmiş tek query)
  const { data: carouselSettings } = useQuery({
    queryKey: ['carousel-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['carousel_animation_type', 'carousel_auto_scroll_duration']);
      
      if (error) {
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

  // Fetch CMS content for hero title and description
  const { data: cmsContent } = useQuery({
    queryKey: ['hero-cms-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['hero_title', 'hero_description']);
      
      if (error) {
        return {
          hero_title: 'Türkiye\'nin En Güvenilir Casino ve Bahis Siteleri Karşılaştırma Platformu', 
          hero_description: 'Deneme bonusu veren siteler, yüksek oranlar ve güvenilir ödeme yöntemleri ile casino ve bahis sitelerini inceleyin. Uzman değerlendirmelerimiz ile en iyi seçimi yapın.'
        };
      }
      
      const contentMap: Record<string, string> = {};
      data?.forEach(item => {
        contentMap[item.setting_key] = item.setting_value;
      });
      
      return {
        hero_title: contentMap['hero_title'] || 'Türkiye\'nin En Güvenilir Casino ve Bahis Siteleri Karşılaştırma Platformu',
        hero_description: contentMap['hero_description'] || 'Deneme bonusu veren siteler, yüksek oranlar ve güvenilir ödeme yöntemleri ile casino ve bahis sitelerini inceleyin. Uzman değerlendirmelerimiz ile en iyi seçimi yapın.'
      };
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
      const { data, error } = await supabase
        .from('betting_sites')
        .select('id, name, slug, logo_url, rating, bonus, features, affiliate_link, email, whatsapp, telegram, twitter, instagram, facebook, youtube')
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
      
      const { data, error } = await supabase
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
      {/* Lightweight FloatingLines - Optimized for all devices */}
      <div className="absolute inset-0 w-full h-full opacity-30 pointer-events-none z-0">
        <FloatingLines 
          enabledWaves={['middle']}
          lineCount={8}
          lineDistance={6}
          bendRadius={3.0}
          bendStrength={-0.3}
          interactive={false}
          parallax={false}
          animationSpeed={0.5}
        />
      </div>

      {/* LightRays - Ultra minimal configuration */}
      <div className="absolute inset-0 w-full h-full opacity-20 pointer-events-none z-[1]">
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffff"
          raysSpeed={0.3}
          lightSpread={0.8}
          rayLength={1.2}
          fadeDistance={0.6}
          followMouse={false}
          mouseInfluence={0}
          noiseAmount={0}
          distortion={0}
          pulsating={false}
        />
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6 lg:px-8 max-w-[1280px] pt-4 pb-8 md:py-12 lg:py-16">
        <div className="text-center space-y-6 md:space-y-8 mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-primary/10 border border-primary/20">
            <Award className="w-3 h-3 md:w-4 md:h-4 text-primary" />
            <span className="text-xs md:text-sm font-semibold">Türkiye'nin #1 Bahis Sitesi Rehberi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-primary via-foreground to-accent bg-clip-text text-transparent">
              En İyi Bahis Siteleri
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-foreground to-accent bg-clip-text text-transparent text-lg sm:text-xl md:text-3xl lg:text-5xl font-normal mt-1 md:mt-2 block">
              Güvenilir ve Kazançlı
            </span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Lisanslı ve güvenilir bahis sitelerini inceleyin. <span className="text-foreground font-semibold">Yüksek bonuslar</span>, <span className="text-foreground font-semibold">hızlı ödemeler</span> ve <span className="text-foreground font-semibold">7/24 destek</span> imkanı.
          </p>
          <SmartSearch 
            onSearch={onSearch} 
            searchTerm={localSearch} 
            onNavigate={(slug) => navigate(`/${slug}`)}
          />
          
          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              onClick={() => onSearch('')}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-12 px-6 font-semibold border-2 hover:border-primary/50 transition-all"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              En İyi Siteleri Keşfet
            </Button>
            
            <Button
              asChild
              variant="default"
              size="lg"
              className="w-full sm:w-auto h-12 px-6 font-semibold bg-gradient-to-r from-primary via-primary/90 to-accent hover:from-primary/90 hover:via-primary/80 hover:to-accent/90 transition-all shadow-lg hover:shadow-xl"
            >
              <Link to="/sikayetler/yeni">
                <MessageSquare className="w-4 h-4 mr-2" />
                Şikayet Paylaş
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-3 md:gap-4 lg:gap-6 pt-4 md:pt-6">
            <div className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-lg bg-card border border-border">
              <TrendingUp className="w-4 h-4 md:w-6 md:h-6 text-primary flex-shrink-0" />
              <div className="text-left"><div className="text-lg md:text-2xl font-bold">100+</div><div className="text-xs md:text-sm text-muted-foreground">Bahis Sitesi</div></div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-lg bg-card border border-border">
              <Shield className="w-4 h-4 md:w-6 md:h-6 text-secondary flex-shrink-0" />
              <div className="text-left"><div className="text-lg md:text-2xl font-bold">%100</div><div className="text-xs md:text-sm text-muted-foreground">Lisanslı</div></div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-lg bg-card border border-border">
              <Award className="w-4 h-4 md:w-6 md:h-6 text-accent flex-shrink-0" />
              <div className="text-left"><div className="text-lg md:text-2xl font-bold">21.000+</div><div className="text-xs md:text-sm text-muted-foreground">Kullanıcı</div></div>
            </div>
          </div>
        </div>

        {isFeaturedLoading ? (
          <LoadingSpinner size="lg" text="Öne çıkan siteler yükleniyor..." />
        ) : featuredSites && featuredSites.length > 0 ? (
          <div className="relative -mx-4 px-4 py-16 overflow-hidden">
            {/* Premium Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            
            <div className="relative z-10 space-y-8">
              {/* Premium Header */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 backdrop-blur-sm">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">Premium Seçimler</span>
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                </div>
                
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-foreground to-accent bg-clip-text text-transparent animate-fade-in">
                  Öne Çıkan Siteler
                </h2>
                
                <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
                  En yüksek puanlı ve en çok tercih edilen bahis siteleri
                </p>
              </div>

              {/* Carousel Container */}
              <div className="relative max-w-7xl mx-auto group">
                {/* Navigation Buttons */}
                {canScrollPrev && (
                  <button
                    onClick={scrollPrev}
                    className="hidden md:flex absolute -left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-2xl hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}
                
                {canScrollNext && (
                  <button
                    onClick={scrollNext}
                    className="hidden md:flex absolute -right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-2xl hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}

                {/* Carousel */}
                <div 
                  className="overflow-hidden relative touch-pan-x rounded-2xl" 
                  ref={emblaRef}
                >
                  <div className="flex gap-4 md:gap-6">
                    {featuredSites.map((site, index) => {
                      const stats = (siteStats as any)?.find((s: any) => s.site_id === site.id);
                      return (
                        <div 
                          key={site.id} 
                          className="flex-[0_0_100%] min-w-0 md:flex-[0_0_calc(50%-0.75rem)] lg:flex-[0_0_calc(33.333%-1rem)] transition-all duration-300"
                        >
                          {/* Premium Badge */}
                          {index === 0 && (
                            <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-gold to-warning text-gold-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              En İyi Seçim
                            </div>
                          )}
                          
                          <div className="relative group/card">
                            {/* Glow Effect on Hover */}
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-accent to-primary rounded-2xl opacity-0 group-hover/card:opacity-75 blur transition-all duration-500" />
                            
                            <div className="relative">
                              <BettingSiteCard 
                                id={site.id}
                                slug={site.slug}
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
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Progress Dots */}
                <div className="flex justify-center gap-2 mt-6">
                  {featuredSites.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => emblaApi?.scrollTo(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === selectedIndex 
                          ? 'w-8 bg-gradient-to-r from-primary to-accent shadow-lg' 
                          : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Swipe Indicator (Mobile) */}
                <div className="md:hidden flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                  <ChevronRight className="w-4 h-4 animate-pulse" />
                  <span>Kaydırarak gezin</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};