import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ComplaintFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  siteFilter: string;
  setSiteFilter: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
}

export const ComplaintFilters = ({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  siteFilter,
  setSiteFilter,
  sortBy,
  setSortBy,
}: ComplaintFiltersProps) => {
  const { data: sites } = useQuery({
    queryKey: ['active-sites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const hasActiveFilters = 
    searchTerm || 
    categoryFilter !== 'all' || 
    statusFilter !== 'all' || 
    siteFilter !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setSiteFilter('all');
    setSortBy('newest');
  };

  return (
    <Card className="mb-4 md:mb-6">
      <CardContent className="p-4 md:pt-6">
        <div className="flex items-center gap-2 mb-3 md:mb-4">
          <Filter className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
          <h3 className="text-sm md:text-base font-semibold">Filtreler</h3>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="ml-auto h-8 md:h-9"
            >
              <X className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              <span className="hidden sm:inline">Temizle</span>
            </Button>
          )}
        </div>
        
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          <Input
            placeholder="Şikayet ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kategoriler</SelectItem>
              <SelectItem value="odeme">Ödeme</SelectItem>
              <SelectItem value="bonus">Bonus</SelectItem>
              <SelectItem value="musteri_hizmetleri">Müşteri Hizmetleri</SelectItem>
              <SelectItem value="teknik">Teknik</SelectItem>
              <SelectItem value="guvenlik">Güvenlik</SelectItem>
              <SelectItem value="diger">Diğer</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="open">Açık</SelectItem>
              <SelectItem value="in_review">İnceleniyor</SelectItem>
              <SelectItem value="resolved">Çözüldü</SelectItem>
              <SelectItem value="closed">Kapalı</SelectItem>
            </SelectContent>
          </Select>

          <Select value={siteFilter} onValueChange={setSiteFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Siteler</SelectItem>
              {sites?.map((site) => (
                <SelectItem key={site.id} value={site.id}>
                  {site.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sırala" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">En Yeni</SelectItem>
              <SelectItem value="oldest">En Eski</SelectItem>
              <SelectItem value="most_responses">En Çok Yanıtlanan</SelectItem>
              <SelectItem value="most_helpful">En Faydalı</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
