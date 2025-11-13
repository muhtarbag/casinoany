import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BettingSiteCard } from './BettingSiteCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Loader2, Search, X, Star, Filter } from 'lucide-react';

export const PixelGrid = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const { data: sites, isLoading } = useQuery({
    queryKey: ['betting-sites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Tüm özellikleri topla
  const allFeatures = useMemo(() => {
    if (!sites) return [];
    const featuresSet = new Set<string>();
    sites.forEach(site => {
      site.features?.forEach((feature: string) => featuresSet.add(feature));
    });
    return Array.from(featuresSet).sort();
  }, [sites]);

  // Filtrelenmiş siteler
  const filteredSites = useMemo(() => {
    if (!sites) return [];

    return sites.filter(site => {
      // İsme göre arama
      const matchesSearch = site.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Puana göre filtreleme
      const matchesRating = Number(site.rating || 0) >= minRating;
      
      // Özelliklere göre filtreleme
      const matchesFeatures = selectedFeatures.length === 0 || 
        selectedFeatures.every(feature => site.features?.includes(feature));

      return matchesSearch && matchesRating && matchesFeatures;
    });
  }, [sites, searchTerm, minRating, selectedFeatures]);

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setMinRating(0);
    setSelectedFeatures([]);
  };

  const hasActiveFilters = searchTerm || minRating > 0 || selectedFeatures.length > 0;

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
    <div className="space-y-6">
      {/* Filtre Paneli */}
      <Card className="p-6 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Filtrele ve Ara</h2>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="ml-auto text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Temizle
            </Button>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Arama */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Site Ara</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Site adı ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Minimum Puan */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Minimum Puan</label>
            <div className="flex items-center gap-3">
              {[0, 3, 4, 4.5].map(rating => (
                <Button
                  key={rating}
                  variant={minRating === rating ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMinRating(rating)}
                  className="flex items-center gap-1"
                >
                  {rating > 0 && <Star className="w-3 h-3 fill-current" />}
                  {rating === 0 ? 'Tümü' : rating}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Özellik Filtreleri */}
        {allFeatures.length > 0 && (
          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium">Özellikler</label>
            <div className="flex flex-wrap gap-2">
              {allFeatures.map(feature => (
                <Badge
                  key={feature}
                  variant={selectedFeatures.includes(feature) ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={() => toggleFeature(feature)}
                >
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Sonuç Sayısı */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredSites.length} site bulundu
        </p>
      </div>

      {/* Site Kartları */}
      {filteredSites.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">Filtrelere uygun site bulunamadı.</p>
          <Button 
            variant="outline" 
            onClick={clearFilters}
            className="mt-4"
          >
            Filtreleri Temizle
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSites.map((site) => (
            <BettingSiteCard
              key={site.id}
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
          ))}
        </div>
      )}
    </div>
  );
};
