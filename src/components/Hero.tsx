import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, TrendingUp, Award, Shield } from 'lucide-react';
import { BettingSiteCard } from './BettingSiteCard';

interface HeroProps {
  onSearch: (searchTerm: string) => void;
  searchTerm: string;
}

export const Hero = ({ onSearch, searchTerm }: HeroProps) => {
  const [localSearch, setLocalSearch] = useState(searchTerm);

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
      
      <div className="container mx-auto px-4 py-16 md:py-24">
        {/* Main Hero Content */}
        <div className="text-center space-y-8 mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Türkiye'nin #1 Bahis Sitesi Rehberi</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              En İyi Bahis Siteleri
            </span>
            <br />
            <span className="text-foreground text-3xl md:text-5xl">
              Güvenilir ve Kazançlı
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Lisanslı ve güvenilir bahis sitelerini inceleyin. 
            <span className="text-foreground font-semibold"> Yüksek bonuslar</span>, 
            <span className="text-foreground font-semibold"> hızlı ödemeler</span> ve 
            <span className="text-foreground font-semibold"> 7/24 destek</span> imkanı.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type="text"
                placeholder="Bahis sitesi ara..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-12 pr-32 py-7 text-lg rounded-2xl border-2 focus:border-primary shadow-lg focus:shadow-2xl focus:shadow-primary/20 transition-all"
              />
              <Button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-5 rounded-xl bg-gradient-primary hover:shadow-lg hover:shadow-primary/30 transition-all"
              >
                Ara
              </Button>
            </div>
          </form>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 pt-8">
            <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
              <TrendingUp className="w-6 h-6 text-primary" />
              <div className="text-left">
                <div className="text-2xl font-bold text-foreground">50+</div>
                <div className="text-sm text-muted-foreground">Bahis Sitesi</div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
              <Shield className="w-6 h-6 text-secondary" />
              <div className="text-left">
                <div className="text-2xl font-bold text-foreground">%100</div>
                <div className="text-sm text-muted-foreground">Lisanslı</div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
              <Award className="w-6 h-6 text-primary" />
              <div className="text-left">
                <div className="text-2xl font-bold text-foreground">1000+</div>
                <div className="text-sm text-muted-foreground">Kullanıcı Yorumu</div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Sites */}
        {featuredSites && featuredSites.length > 0 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-3">
                Öne Çıkan Siteler
              </h2>
              <p className="text-muted-foreground text-lg">
                En yüksek puanlı ve en çok tercih edilen bahis siteleri
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {featuredSites.map((site, index) => (
                <div 
                  key={site.id} 
                  className="animate-fade-in"
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
        )}
      </div>
    </div>
  );
};
