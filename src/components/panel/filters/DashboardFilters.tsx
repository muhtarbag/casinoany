import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Filter, X, Save, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  onSaveFilter?: (name: string, filters: FilterState) => void;
  savedFilters?: SavedFilter[];
}

export interface FilterState {
  dateRange?: DateRange;
  metricType?: string;
  comparison?: string;
  deviceType?: string;
}

export interface SavedFilter {
  id: string;
  name: string;
  filters: FilterState;
}

export function DashboardFilters({
  onFilterChange,
  onSaveFilter,
  savedFilters = [],
}: DashboardFiltersProps) {
  const isMobile = useIsMobile();
  const [filters, setFilters] = useState<FilterState>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const activeFilterCount = Object.keys(filters).filter(
    (key) => filters[key as keyof FilterState] !== undefined
  ).length;

  return (
    <Card className="border-dashed">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Filtreler</h3>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 text-xs"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Temizle
                </Button>
              )}
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-8"
                >
                  {isExpanded ? 'Daralt' : 'Genişlet'}
                </Button>
              )}
            </div>
          </div>

          {/* Filter Controls */}
          {(isExpanded || isMobile) && (
            <div className={cn('grid gap-3', isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4')}>
              {/* Date Range */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'justify-start text-left font-normal',
                      !filters.dateRange && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange?.from ? (
                      filters.dateRange.to ? (
                        <>
                          {format(filters.dateRange.from, 'dd MMM', { locale: tr })} -{' '}
                          {format(filters.dateRange.to, 'dd MMM', { locale: tr })}
                        </>
                      ) : (
                        format(filters.dateRange.from, 'dd MMM yyyy', { locale: tr })
                      )
                    ) : (
                      'Tarih aralığı seç'
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={filters.dateRange}
                    onSelect={(range) => updateFilter('dateRange', range)}
                    numberOfMonths={isMobile ? 1 : 2}
                    locale={tr}
                  />
                </PopoverContent>
              </Popover>

              {/* Metric Type */}
              <Select
                value={filters.metricType}
                onValueChange={(value) => updateFilter('metricType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Metrik türü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="views">Görüntülenmeler</SelectItem>
                  <SelectItem value="clicks">Tıklamalar</SelectItem>
                  <SelectItem value="conversions">Dönüşümler</SelectItem>
                  <SelectItem value="ratings">Değerlendirmeler</SelectItem>
                  <SelectItem value="complaints">Şikayetler</SelectItem>
                </SelectContent>
              </Select>

              {/* Comparison Period */}
              <Select
                value={filters.comparison}
                onValueChange={(value) => updateFilter('comparison', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Karşılaştırma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="previous-period">Önceki dönem</SelectItem>
                  <SelectItem value="last-week">Geçen hafta</SelectItem>
                  <SelectItem value="last-month">Geçen ay</SelectItem>
                  <SelectItem value="last-year">Geçen yıl</SelectItem>
                  <SelectItem value="industry-avg">Sektör ortalaması</SelectItem>
                </SelectContent>
              </Select>

              {/* Device Type */}
              <Select
                value={filters.deviceType}
                onValueChange={(value) => updateFilter('deviceType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Cihaz türü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="desktop">Masaüstü</SelectItem>
                  <SelectItem value="mobile">Mobil</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Saved Filters */}
          {savedFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <p className="text-xs text-muted-foreground w-full">Kayıtlı Filtreler:</p>
              {savedFilters.map((saved) => (
                <Button
                  key={saved.id}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters(saved.filters);
                    onFilterChange(saved.filters);
                  }}
                  className="h-7 text-xs"
                >
                  {saved.name}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
