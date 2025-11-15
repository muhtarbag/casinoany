import { Database, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

interface TableEmptyStateProps {
  searchQuery?: string;
  onClearSearch?: () => void;
  onCreate?: () => void;
  createLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  searchEmptyTitle?: string;
  searchEmptyDescription?: string;
}

export function TableEmptyState({
  searchQuery,
  onClearSearch,
  onCreate,
  createLabel = 'Yeni Oluştur',
  emptyTitle = 'Henüz Veri Yok',
  emptyDescription = 'Başlamak için yeni bir kayıt oluşturun.',
  searchEmptyTitle = 'Sonuç Bulunamadı',
  searchEmptyDescription = 'Farklı bir arama terimi deneyin.'
}: TableEmptyStateProps) {
  // Search result empty
  if (searchQuery) {
    return (
      <EmptyState
        icon={Search}
        title={searchEmptyTitle}
        description={`"${searchQuery}" için ${searchEmptyDescription}`}
        action={
          onClearSearch
            ? {
                label: 'Aramayı Temizle',
                onClick: onClearSearch,
                variant: 'outline'
              }
            : undefined
        }
      />
    );
  }

  // Initial empty state
  return (
    <EmptyState
      icon={Database}
      title={emptyTitle}
      description={emptyDescription}
      action={
        onCreate
          ? {
              label: createLabel,
              onClick: onCreate,
              variant: 'default'
            }
          : undefined
      }
    >
      {onCreate && (
        <Button onClick={onCreate} size="lg" className="gap-2">
          <Plus className="h-4 w-4" />
          {createLabel}
        </Button>
      )}
    </EmptyState>
  );
}
