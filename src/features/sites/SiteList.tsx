import { useMemo } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { GripVertical, Edit, Trash2, Eye, MousePointer, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

const SortableItem = ({ 
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
    <div 
      ref={setNodeRef} 
      style={style} 
      className="bg-card border rounded-lg p-4 mb-2 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-4">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="w-5 h-5 text-muted-foreground" />
        </div>
        <Checkbox 
          checked={isSelected} 
          onCheckedChange={() => onToggleSelect(id)} 
          className="w-4 h-4" 
        />
        {site.logo_url && (
          <img 
            src={site.logo_url} 
            alt={site.name} 
            className="w-12 h-12 object-contain rounded" 
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{site.name}</h3>
            {!site.is_active && <Badge variant="secondary">Pasif</Badge>}
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {stats?.views || 0} görüntülenme
            </span>
            <span className="flex items-center gap-1">
              <MousePointer className="w-3 h-3" />
              {stats?.clicks || 0} tıklama
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
                variant="ghost"
                size="icon"
                disabled={isDeleting === site.id}
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
                <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                <AlertDialogDescription>
                  {site.name} sitesini silmek üzeresiniz. Bu işlem geri alınamaz.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(site.id)}>
                  Sil
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

interface SiteListProps {
  sites: Site[];
  siteStats?: SiteStats[];
  selectedSites: string[];
  editingId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onEdit: (site: Site) => void;
  onDelete: (id: string) => void;
  onDragEnd: (event: DragEndEvent) => void;
  isDeleting: string | null;
}

export function SiteList({
  sites,
  siteStats = [],
  selectedSites,
  editingId,
  searchQuery,
  onSearchChange,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onDelete,
  onDragEnd,
  isDeleting,
}: SiteListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const filteredSites = useMemo(() => {
    return sites.filter(site => 
      site.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sites, searchQuery]);

  const allSelected = useMemo(() => {
    return filteredSites.length > 0 && selectedSites.length === filteredSites.length;
  }, [filteredSites, selectedSites]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div>
        <Input
          placeholder="Site ara..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Select All */}
      <div className="flex items-center gap-2">
        <Checkbox 
          checked={allSelected} 
          onCheckedChange={onToggleSelectAll} 
          className="w-4 h-4"
        />
        <span className="text-sm text-muted-foreground">Tümünü Seç</span>
      </div>

      {/* Site List with Drag & Drop */}
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragEnd={onDragEnd}
      >
        <SortableContext 
          items={filteredSites.map(s => s.id)} 
          strategy={verticalListSortingStrategy}
        >
          {filteredSites.map((site) => (
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
              stats={siteStats.find((s) => s.site_id === site.id)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
