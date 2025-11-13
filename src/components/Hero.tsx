import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, TrendingUp, Award, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { BettingSiteCard } from './BettingSiteCard';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect } from 'react';

interface HeroProps {
  onSearch: (searchTerm: string) => void;
  searchTerm: string;
}

export const Hero = ({ onSearch, searchTerm }: HeroProps) => {
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: 'start',
    skipSnaps: false,
    dragFree: false,
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

  // Öne çıkan siteleri getir (en yüksek puanlı 3 site)
  const { data: featuredSites } = useQuery({
    queryKey: ['featured-sites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearch);
    // Scroll to results
    document.getElementById('sites-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-background -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent -z-10" />
      
      <div className="container mx-auto px-4 py-8 md:py-16 lg:py-24">
        {/* Main Hero Content */}
        <div className="text-center space-y-4 md:space-y-8 mb-8 md:mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <Award className="w-3 h-3 md:w-4 md:h-4 text-primary" />
            <span className="text-xs md:text-sm font-semibold text-primary">Türkiye'nin #1 Bahis Sitesi Rehberi</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight px-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              En İyi Bahis Siteleri
            </span>
            <br />
            <span className="text-foreground text-xl sm:text-2xl md:text-3xl lg:text-5xl">
              Güvenilir ve Kazançlı
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            Lisanslı ve güvenilir bahis sitelerini inceleyin. 
            <span className="text-foreground font-semibold"> Yüksek bonuslar</span>, 
            <span className="text-foreground font-semibold"> hızlı ödemeler</span> ve 
            <span className="text-foreground font-semibold"> 7/24 destek</span> imkanı.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto px-4">
            <div className="relative group">
              <Search className="absolute left-6 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
              <Input
                type="text"
                placeholder="Bahis sitesi ara..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-10 md:pl-12 pr-20 md:pr-32 py-5 md:py-7 text-base md:text-lg rounded-xl md:rounded-2xl border-2 focus:border-primary shadow-lg focus:shadow-2xl focus:shadow-primary/20 transition-all w-full"
              />
              <Button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 md:px-6 py-3 md:py-5 rounded-lg md:rounded-xl bg-gradient-primary hover:shadow-lg hover:shadow-primary/30 transition-all text-sm md:text-base"
              >
                Ara
              </Button>
            </div>
          </form>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-8 pt-4 md:pt-8 px-4">
            <div className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
              <TrendingUp className="w-4 h-4 md:w-6 md:h-6 text-primary" />
              <div className="text-left">
                <div className="text-lg md:text-2xl font-bold text-foreground">50+</div>
                <div className="text-xs md:text-sm text-muted-foreground">Bahis Sitesi</div>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
              <Shield className="w-4 h-4 md:w-6 md:h-6 text-secondary" />
              <div className="text-left">
                <div className="text-lg md:text-2xl font-bold text-foreground">%100</div>
                <div className="text-xs md:text-sm text-muted-foreground">Lisanslı</div>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
              <Award className="w-4 h-4 md:w-6 md:h-6 text-primary" />
              <div className="text-left">
                <div className="text-lg md:text-2xl font-bold text-foreground">1000+</div>
                <div className="text-xs md:text-sm text-muted-foreground">Kullanıcı Yorumu</div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Sites */}
        {featuredSites && featuredSites.length > 0 && (
          <div className="space-y-6 md:space-y-8">
            <div className="text-center px-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2 md:mb-3">
                Öne Çıkan Siteler
              </h2>
              <p className="text-muted-foreground text-sm md:text-base lg:text-lg">
                En yüksek puanlı ve en çok tercih edilen bahis siteleri
              </p>
            </div>

            {/* Carousel Container */}
            <div className="relative max-w-7xl mx-auto px-4">
              {/* Navigation Buttons - Desktop */}
              <button
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm border border-border hover:bg-card hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110 shadow-lg"
                aria-label="Previous"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={scrollNext}
                disabled={!canScrollNext}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm border border-border hover:bg-card hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110 shadow-lg"
                aria-label="Next"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Embla Carousel */}
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-4 md:gap-6 lg:gap-8 touch-pan-y">
                  {featuredSites.map((site, index) => (
                    <div 
                      key={site.id} 
                      className="flex-[0_0_100%] min-w-0 md:flex-[0_0_calc(50%-1rem)] lg:flex-[0_0_calc(33.333%-1.5rem)] animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
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
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Carousel Indicators - Mobile */}
              <div className="flex md:hidden justify-center gap-2 mt-6">
                {featuredSites.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => emblaApi?.scrollTo(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      selectedIndex === index 
                        ? 'bg-primary w-6' 
                        : 'bg-muted-foreground/30'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
