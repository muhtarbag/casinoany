import { Button } from '@/components/ui/button';
import { SearchX, Database, Plus } from 'lucide-react';

interface EnhancedEmptyStateProps {
  type: 'no-data' | 'no-results';
  onAction?: () => void;
  onClearFilters?: () => void;
}

export function EnhancedEmptyState({ type, onAction, onClearFilters }: EnhancedEmptyStateProps) {
  if (type === 'no-results') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <SearchX className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Sonuç Bulunamadı</h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          Arama kriterlerinize uygun site bulunamadı. Filtreleri temizleyip tekrar deneyin.
        </p>
        {onClearFilters && (
          <Button variant="outline" onClick={onClearFilters}>
            Filtreleri Temizle
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Database className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Henüz Site Eklenmemiş</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        Başlamak için ilk sitenizi ekleyin. Site ekledikten sonra buradan yönetebilirsiniz.
      </p>
      {onAction && (
        <Button onClick={onAction}>
          <Plus className="h-4 w-4 mr-2" />
          İlk Siteyi Ekle
        </Button>
      )}
    </div>
  );
}
