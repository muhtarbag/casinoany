import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, TrendingUp, Award, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { BettingSiteCard } from './BettingSiteCard';
import useEmblaCarousel from 'embla-carousel-react';

interface HeroProps {
  onSearch: (searchTerm: string) => void;
  searchTerm: string;
}

export const Hero = ({ onSearch, searchTerm }: HeroProps) => {
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearch);
    document.getElementById('sites-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="relative overflow-hidden bg-background">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center space-y-6 md:space-y-8 mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Türkiye'nin #1 Bahis Sitesi Rehberi</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold">
            <span className="text-primary">En İyi Bahis Siteleri</span><br />
            <span className="text-foreground text-2xl md:text-4xl lg:text-5xl font-normal mt-2 block">Güvenilir ve Kazançlı</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Lisanslı ve güvenilir bahis sitelerini inceleyin. <span className="text-foreground font-semibold">Yüksek bonuslar</span>, <span className="text-foreground font-semibold">hızlı ödemeler</span> ve <span className="text-foreground font-semibold">7/24 destek</span> imkanı.
          </p>
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
              <Input type="text" placeholder="Bahis sitesi ara..." value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} className="pl-12 pr-24 py-6 text-lg rounded-lg border-2 border-border focus:border-primary w-full" />
              <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-4 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90">Ara</Button>
            </div>
          </form>
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
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">Öne Çıkan Siteler</h2>
              <p className="text-muted-foreground text-lg">En yüksek puanlı ve en çok tercih edilen bahis siteleri</p>
            </div>
            <div className="relative max-w-7xl mx-auto">
              <button onClick={scrollPrev} disabled={!canScrollPrev} className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center rounded-lg bg-card border border-border hover:border-primary disabled:opacity-30 transition-all" aria-label="Previous"><ChevronLeft className="w-6 h-6" /></button>
              <button onClick={scrollNext} disabled={!canScrollNext} className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center rounded-lg bg-card border border-border hover:border-primary disabled:opacity-30 transition-all" aria-label="Next"><ChevronRight className="w-6 h-6" /></button>
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-6">
                  {featuredSites.map((site) => (
                    <div key={site.id} className="flex-[0_0_100%] min-w-0 md:flex-[0_0_calc(50%-1rem)] lg:flex-[0_0_calc(33.333%-1.5rem)]">
                      <BettingSiteCard id={site.id} name={site.name} logo={site.logo_url || undefined} rating={Number(site.rating) || 0} bonus={site.bonus || undefined} features={site.features || undefined} affiliateUrl={site.affiliate_link} email={site.email || undefined} whatsapp={site.whatsapp || undefined} telegram={site.telegram || undefined} twitter={site.twitter || undefined} instagram={site.instagram || undefined} facebook={site.facebook || undefined} youtube={site.youtube || undefined} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex md:hidden justify-center gap-2 mt-6">
                {featuredSites.map((_, index) => (
                  <button key={index} onClick={() => emblaApi?.scrollTo(index)} className={`w-2 h-2 rounded-full transition-all ${selectedIndex === index ? 'bg-primary w-6' : 'bg-muted-foreground/30'}`} aria-label={`Go to slide ${index + 1}`} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};