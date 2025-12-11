import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, Filter, Download, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BonusFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedSite: string;
  onSiteChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
  sites: Array<{ id: string; name: string }>;
  onClearFilters: () => void;
  onExport?: () => void;
  onSaveFilter?: () => void;
  totalCount: number;
  filteredCount: number;
}

export const BonusFilters = ({
  searchQuery,
  onSearchChange,
  selectedSite,
  onSiteChange,
  selectedStatus,
  onStatusChange,
  selectedType,
  onTypeChange,
  sites,
  onClearFilters,
  onExport,
  onSaveFilter,
  totalCount,
  filteredCount,
}: BonusFiltersProps) => {
  const hasActiveFilters = searchQuery || selectedSite !== 'all' || selectedStatus !== 'all' || selectedType !== 'all';

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Bonus ara..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={selectedSite} onValueChange={onSiteChange}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Tüm Siteler" />
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

        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="inactive">Pasif</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedType} onValueChange={onTypeChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Bonus Türü" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Türler</SelectItem>
            <SelectItem value="no_deposit">Deneme Bonusu</SelectItem>
            <SelectItem value="welcome">Hoş Geldin Bonusu</SelectItem>
            <SelectItem value="deposit">Yatırım Bonusu</SelectItem>
            <SelectItem value="free_spins">Free Spin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-8"
            >
              <X className="w-4 h-4 mr-1" />
              Filtreleri Temizle
            </Button>
          )}
          <div className="text-sm text-muted-foreground">
            {filteredCount === totalCount ? (
              <span>Toplam {totalCount} bonus</span>
            ) : (
              <span>
                {filteredCount} / {totalCount} bonus gösteriliyor
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onSaveFilter && (
            <Button variant="outline" size="sm" onClick={onSaveFilter}>
              <Save className="w-4 h-4 mr-1" />
              Filtreyi Kaydet
            </Button>
          )}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="w-4 h-4 mr-1" />
              Dışa Aktar
            </Button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <Badge variant="secondary">
              Arama: {searchQuery}
            </Badge>
          )}
          {selectedSite !== 'all' && (
            <Badge variant="secondary">
              Site: {sites?.find(s => s.id === selectedSite)?.name}
            </Badge>
          )}
          {selectedStatus !== 'all' && (
            <Badge variant="secondary">
              Durum: {selectedStatus === 'active' ? 'Aktif' : 'Pasif'}
            </Badge>
          )}
          {selectedType !== 'all' && (
            <Badge variant="secondary">
              Tür: {selectedType}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
