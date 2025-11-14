import { useMemo, useState, memo } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { EnhancedTableToolbar } from '@/components/table/EnhancedTableToolbar';
import { EnhancedTablePagination } from '@/components/table/EnhancedTablePagination';
import { EnhancedEmptyState } from '@/components/table/EnhancedEmptyState';
import { SiteListSkeleton } from './SiteListSkeleton';
import { DataExportDialog } from '@/components/export/DataExportDialog';
import { SavedFiltersDialog } from '@/components/search/SavedFiltersDialog';
import { GripVertical, Edit, Trash2, Eye, MousePointer, Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Site {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  rating: number;
  bonus?: string;
  is_active: boolean;
}

interface SiteStats {
  site_id: string;
  views: number;
  clicks: number;
}

interface SortableItemProps {
  id: string;
  site: Site;
  editingId: string | null;
  selectedSites: string[];
  onToggleSelect: (id: string) => void;
  onEdit: (site: Site) => void;
  onDelete: (id: string) => void;
  isDeleting: string | null;
  stats?: SiteStats;
}

const SortableItem = memo(({ 
  id, 
  site, 
  editingId, 
  selectedSites, 
  onToggleSelect, 
  onEdit, 
  onDelete, 
  isDeleting, 
  stats 
}: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const isMobile = useIsMobile();
  
  const style = { 
    transform: CSS.Transform.toString(transform), 
    transition, 
    opacity: isDragging ? 0.5 : 1 
  };
  const isSelected = selectedSites.includes(id);

  return (
    <Card 
      ref={setNodeRef} 
      style={{
        ...style,
        borderLeftColor: site.is_active ? 'hsl(var(--success))' : 'hsl(var(--muted))',
      }}
      className="p-3 sm:p-4 mb-3 hover:shadow-md transition-all border-l-4"
    >
      <div className="flex items-start sm:items-center gap-2 sm:gap-4">
        {!isMobile && (
          <div 
            {...attributes} 
            {...listeners} 
            className="cursor-grab active:cursor-grabbing hover:text-primary transition-colors"
          >
            <GripVertical className="w-5 h-5" />
          </div>
        )}
        <Checkbox 
          checked={isSelected} 
          onCheckedChange={() => onToggleSelect(id)} 
          className="mt-1 sm:mt-0"
        />
        {site.logo_url && (
          <img 
            src={site.logo_url} 
            alt={`${site.name} logo`}
            className="w-10 h-10 sm:w-14 sm:h-14 object-contain rounded-lg border bg-muted p-1 shrink-0" 
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-sm sm:text-base">{site.name}</h3>
            {!site.is_active && <Badge variant="secondary" className="text-xs">Pasif</Badge>}
            <Badge variant="outline" className="text-xs">
              ⭐ {site.rating.toFixed(1)}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">{site.slug}</p>
          <div className="flex gap-3 sm:gap-4 text-xs text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {stats?.views || 0}
            </span>
            <span className="flex items-center gap-1">
              <MousePointer className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {stats?.clicks || 0}
            </span>
          </div>
        </div>
        <div className="flex gap-1.5 sm:gap-2 shrink-0">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(site)}
            disabled={editingId === site.id}
            className="h-8 w-8 sm:h-9 sm:w-9"
          >
            <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                disabled={isDeleting === site.id}
                className="h-8 w-8 sm:h-9 sm:w-9 text-destructive hover:text-destructive"
              >
                {isDeleting === site.id ? (
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
              <AlertDialogHeader>
                <AlertDialogTitle>Siteyi Sil</AlertDialogTitle>
                <AlertDialogDescription>
                  "{site.name}" sitesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                <AlertDialogCancel className="w-full sm:w-auto">İptal</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDelete(site.id)} 
                  className="w-full sm:w-auto bg-destructive"
                >
                  Sil
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Card>
  );
});

interface EnhancedSiteListProps {
  sites: Site[];
  stats: Record<string, SiteStats>;
  selectedSites: string[];
  editingId: string | null;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onEdit: (site: Site) => void;
  onDelete: (id: string) => void;
  onReorder: (newOrder: Site[]) => void;
  isDeleting: string | null;
  isLoading?: boolean;
}

export function EnhancedSiteList({
  sites,
  stats,
  selectedSites,
  editingId,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onDelete,
  onReorder,
  isDeleting,
  isLoading,
}: EnhancedSiteListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'views' | 'order'>('order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showFiltersDialog, setShowFiltersDialog] = useState(false);
  const isMobile = useIsMobile();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter and sort logic
  const filteredAndSortedSites = useMemo(() => {
    let result = [...sites];

    // Search filter
    if (searchQuery) {
      result = result.filter(site =>
        site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.slug.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter === 'active') {
      result = result.filter(site => site.is_active);
    } else if (statusFilter === 'inactive') {
      result = result.filter(site => !site.is_active);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
        case 'views':
          const aViews = stats[a.id]?.views || 0;
          const bViews = stats[b.id]?.views || 0;
          comparison = aViews - bViews;
          break;
        case 'order':
        default:
          return 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [sites, searchQuery, statusFilter, sortBy, sortOrder, stats]);

  // Pagination
  const paginatedSites = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedSites.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedSites, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAndSortedSites.length / pageSize);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = paginatedSites.findIndex(site => site.id === active.id);
      const newIndex = paginatedSites.findIndex(site => site.id === over.id);
      const newOrder = arrayMove(paginatedSites, oldIndex, newIndex);
      onReorder(newOrder);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSortBy('order');
    setSortOrder('asc');
    setCurrentPage(1);
  };

  const handleApplySavedFilter = (filters: Record<string, any>) => {
    if (filters.searchQuery) setSearchQuery(filters.searchQuery);
    if (filters.statusFilter) setStatusFilter(filters.statusFilter);
  };

  const currentFilters = {
    searchQuery,
    statusFilter: statusFilter !== 'all' ? statusFilter : undefined,
  };

  if (isLoading) {
    return <SiteListSkeleton />;
  }

  const hasFilters = searchQuery || statusFilter !== 'all' || sortBy !== 'order';
  const isEmpty = sites.length === 0;
  const isFiltered = filteredAndSortedSites.length === 0 && !isEmpty;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <EnhancedTableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => setStatusFilter(value as 'all' | 'active' | 'inactive')}
        ratingFilter={sortBy === 'rating' ? sortOrder : 'all'}
        onRatingFilterChange={() => {}}
        totalItems={sites.length}
        filteredItems={filteredAndSortedSites.length}
        onClearFilters={handleClearFilters}
        onExport={() => setShowExportDialog(true)}
        onSavedFilters={() => setShowFiltersDialog(true)}
      />

      {/* List */}
      {isEmpty ? (
        <EnhancedEmptyState type="no-data" />
      ) : isFiltered ? (
        <EnhancedEmptyState type="no-results" onClearFilters={handleClearFilters} />
      ) : (
        <>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={paginatedSites.map(s => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {paginatedSites.map(site => (
                  <SortableItem
                    key={site.id}
                    id={site.id}
                    site={site}
                    editingId={editingId}
                    selectedSites={selectedSites}
                    onToggleSelect={onToggleSelect}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    isDeleting={isDeleting}
                    stats={stats[site.id]}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Pagination */}
          {!isMobile && (
            <EnhancedTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={filteredAndSortedSites.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
            />
          )}
          
          {/* Mobile Simple Pagination */}
          {isMobile && totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Önceki
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Sonraki
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
