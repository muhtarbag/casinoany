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
import { GripVertical, Edit, Trash2, Eye, MousePointer, Loader2, ArrowUpDown } from 'lucide-react';

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
      className="p-4 mb-3 hover:shadow-md transition-all border-l-4"
    >
      <div className="flex items-center gap-4">
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab active:cursor-grabbing hover:text-primary transition-colors"
        >
          <GripVertical className="w-5 h-5" />
        </div>
        <Checkbox 
          checked={isSelected} 
          onCheckedChange={() => onToggleSelect(id)} 
        />
        {site.logo_url && (
          <img 
            src={site.logo_url} 
            alt={`${site.name} logo`}
            className="w-14 h-14 object-contain rounded-lg border bg-muted p-1" 
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-base">{site.name}</h3>
            {!site.is_active && <Badge variant="secondary">Pasif</Badge>}
            <Badge variant="outline" className="text-xs">
              ⭐ {site.rating.toFixed(1)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate">{site.slug}</p>
          <div className="flex gap-4 text-xs text-muted-foreground mt-2">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              {stats?.views || 0}
            </span>
            <span className="flex items-center gap-1.5">
              <MousePointer className="w-3.5 h-3.5" />
              {stats?.clicks || 0}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(site)}
            disabled={editingId === site.id}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                disabled={isDeleting === site.id}
                className="text-destructive hover:text-destructive"
              >
                {isDeleting === site.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Siteyi Sil</AlertDialogTitle>
                <AlertDialogDescription>
                  "{site.name}" sitesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(site.id)} className="bg-destructive">
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
  editingId: string | null;
  selectedSites: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onEdit: (site: Site) => void;
  onDelete: (id: string) => void;
  onReorder: (newOrder: Site[]) => void;
  isDeleting: string | null;
  isLoading: boolean;
}

export function EnhancedSiteList({
  sites,
  stats,
  editingId,
  selectedSites,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onDelete,
  onReorder,
  isDeleting,
  isLoading,
}: EnhancedSiteListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'views'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Filter and sort sites
  const filteredAndSortedSites = useMemo(() => {
    let filtered = sites.filter((site) => {
      const matchesSearch = site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           site.slug.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && site.is_active) ||
                           (statusFilter === 'inactive' && !site.is_active);
      
      const matchesRating = ratingFilter === 'all' ||
                           (ratingFilter === '5' && site.rating === 5) ||
                           (ratingFilter === '4' && site.rating >= 4) ||
                           (ratingFilter === '3' && site.rating >= 3);

      return matchesSearch && matchesStatus && matchesRating;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'rating') {
        comparison = a.rating - b.rating;
      } else if (sortBy === 'views') {
        const aViews = stats[a.id]?.views || 0;
        const bViews = stats[b.id]?.views || 0;
        comparison = aViews - bViews;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [sites, searchQuery, statusFilter, ratingFilter, sortBy, sortOrder, stats]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedSites.length / pageSize);
  const paginatedSites = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedSites.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedSites, currentPage, pageSize]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = paginatedSites.findIndex((s) => s.id === active.id);
      const newIndex = paginatedSites.findIndex((s) => s.id === over.id);
      const newOrder = arrayMove(paginatedSites, oldIndex, newIndex);
      onReorder(newOrder);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setRatingFilter('all');
    setCurrentPage(1);
  };

  if (isLoading) {
    return <SiteListSkeleton />;
  }

  return (
    <div className="space-y-6">
      <EnhancedTableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        ratingFilter={ratingFilter}
        onRatingFilterChange={setRatingFilter}
        totalItems={sites.length}
        filteredItems={filteredAndSortedSites.length}
        onClearFilters={handleClearFilters}
      />

      {filteredAndSortedSites.length === 0 ? (
        <EnhancedEmptyState
          type={sites.length === 0 ? 'no-data' : 'no-results'}
          onClearFilters={sites.length > 0 ? handleClearFilters : undefined}
        />
      ) : (
        <>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={paginatedSites.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {paginatedSites.map((site) => (
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

          <EnhancedTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredAndSortedSites.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </>
      )}
    </div>
  );
}
