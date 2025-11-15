import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, SlidersHorizontal, X, Download, Bookmark } from 'lucide-react';

interface EnhancedTableToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  ratingFilter: string;
  onRatingFilterChange: (value: string) => void;
  totalItems: number;
  filteredItems: number;
  onClearFilters: () => void;
  onExport?: () => void;
  onSavedFilters?: () => void;
  searchPlaceholder?: string;
  statusOptions?: { value: string; label: string }[];
  ratingOptions?: { value: string; label: string }[];
}

export function EnhancedTableToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  ratingFilter,
  onRatingFilterChange,
  totalItems,
  filteredItems,
  onClearFilters,
  onExport,
  onSavedFilters,
  searchPlaceholder = "Site adı veya slug ile ara...",
  statusOptions = [
    { value: "all", label: "Tüm Durumlar" },
    { value: "active", label: "Aktif" },
    { value: "inactive", label: "Pasif" }
  ],
  ratingOptions = [
    { value: "all", label: "Tüm Ratingler" },
    { value: "5", label: "⭐ 5 Yıldız" },
    { value: "4", label: "⭐ 4+ Yıldız" },
    { value: "3", label: "⭐ 3+ Yıldız" }
  ]
}: EnhancedTableToolbarProps) {
  const hasActiveFilters = searchQuery || statusFilter !== 'all' || ratingFilter !== 'all';
  const isFiltered = filteredItems < totalItems;

  return (
    <div className="space-y-4">
      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          {onExport && (
            <Button variant="outline" size="default" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Dışa Aktar
            </Button>
          )}
          {onSavedFilters && (
            <Button variant="outline" size="default" onClick={onSavedFilters}>
              <Bookmark className="h-4 w-4 mr-2" />
              Filtreler
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Filtreler:</span>
        </div>

        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={ratingFilter} onValueChange={onRatingFilterChange}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            {ratingOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-9 px-2 lg:px-3"
          >
            <X className="h-4 w-4 mr-2" />
            Filtreleri Temizle
          </Button>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          Toplam <Badge variant="secondary" className="mx-1">{totalItems}</Badge> kayıttan
          {isFiltered && (
            <>
              {' '}<Badge variant="default" className="mx-1">{filteredItems}</Badge> tanesi gösteriliyor
            </>
          )}
        </span>
      </div>
    </div>
  );
}
