import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface AdvancedSearchProps {
  onSearch: (query: SearchQuery) => void;
  placeholder?: string;
  filters?: SearchFilter[];
}

export interface SearchQuery {
  term: string;
  status?: string;
  sortBy?: string;
  dateFilter?: string;
}

export interface SearchFilter {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

const defaultFilters: SearchFilter[] = [
  {
    key: 'status',
    label: 'Durum',
    options: [
      { value: 'all', label: 'Tümü' },
      { value: 'pending', label: 'Beklemede' },
      { value: 'resolved', label: 'Çözüldü' },
      { value: 'rejected', label: 'Reddedildi' },
    ],
  },
  {
    key: 'sortBy',
    label: 'Sırala',
    options: [
      { value: 'newest', label: 'En yeni' },
      { value: 'oldest', label: 'En eski' },
      { value: 'priority', label: 'Öncelik' },
      { value: 'rating', label: 'Değerlendirme' },
    ],
  },
  {
    key: 'dateFilter',
    label: 'Tarih',
    options: [
      { value: 'all', label: 'Tüm zamanlar' },
      { value: 'today', label: 'Bugün' },
      { value: 'week', label: 'Bu hafta' },
      { value: 'month', label: 'Bu ay' },
      { value: 'year', label: 'Bu yıl' },
    ],
  },
];

export function AdvancedSearch({
  onSearch,
  placeholder = 'Ara...',
  filters = defaultFilters,
}: AdvancedSearchProps) {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearch = () => {
    onSearch({
      term: searchTerm,
      ...activeFilters,
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    onSearch({
      term: searchTerm,
      ...newFilters,
    });
  };

  const clearFilter = (key: string) => {
    const { [key]: _, ...rest } = activeFilters;
    setActiveFilters(rest);
    onSearch({
      term: searchTerm,
      ...rest,
    });
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setActiveFilters({});
    onSearch({ term: '' });
  };

  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={placeholder}
            className="pl-9"
          />
        </div>

        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              {!isMobile && 'Filtreler'}
              {activeFilterCount > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">Gelişmiş Filtreler</h4>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-7 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Temizle
                  </Button>
                )}
              </div>

              {filters.map((filter) => (
                <div key={filter.key} className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    {filter.label}
                  </label>
                  <Select
                    value={activeFilters[filter.key]}
                    onValueChange={(value) => handleFilterChange(filter.key, value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder={`${filter.label} seç`} />
                    </SelectTrigger>
                    <SelectContent>
                      {filter.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}

              <Button
                onClick={() => setIsFilterOpen(false)}
                className="w-full"
                size="sm"
              >
                Filtreleri Uygula
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Button onClick={handleSearch}>
          {isMobile ? <Search className="h-4 w-4" /> : 'Ara'}
        </Button>
      </div>

      {/* Active Filter Tags */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([key, value]) => {
            const filter = filters.find((f) => f.key === key);
            const option = filter?.options.find((o) => o.value === value);
            if (!option) return null;

            return (
              <Badge
                key={key}
                variant="secondary"
                className="pl-2 pr-1 gap-1"
              >
                <span className="text-xs">
                  {filter.label}: {option.label}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter(key)}
                  className="h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
