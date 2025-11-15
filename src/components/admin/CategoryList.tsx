import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit, Trash2, Grip, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  useUpdateCategory,
  useDeleteCategory,
  useUpdateCategoryOrder,
  type CategoryWithStats,
} from '@/hooks/queries/useCategoryQueries';
import { cn } from '@/lib/utils';

interface CategoryListProps {
  categories: CategoryWithStats[];
  onEdit: (category: CategoryWithStats) => void;
}

interface SortableItemProps {
  category: CategoryWithStats;
  onEdit: (category: CategoryWithStats) => void;
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
}

function SortableItem({ category, onEdit, onToggle, onDelete }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-all',
        isDragging && 'opacity-50 shadow-lg scale-105'
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <Grip className="h-5 w-5" />
      </div>

      {/* Icon Preview */}
      <div
        className="flex-shrink-0 p-3 rounded-lg"
        style={{ backgroundColor: `${category.color}20` }}
      >
        <div
          className="w-8 h-8 flex items-center justify-center rounded text-white font-bold"
          style={{ backgroundColor: category.color }}
        >
          {category.icon.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold truncate">{category.name}</h3>
          {!category.is_active && (
            <Badge variant="secondary" className="text-xs">
              Pasif
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">
          /kategori/{category.slug}
        </p>
        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
          <span>{category.site_count} Site</span>
          <span>{category.blog_count} Blog</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <a
          href={`/kategori/${category.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Button variant="ghost" size="sm">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </a>

        <Switch
          checked={category.is_active}
          onCheckedChange={(checked) => onToggle(category.id, checked)}
        />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(category)}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(category.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function CategoryList({ categories, onEdit }: CategoryListProps) {
  const [items, setItems] = useState(categories);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const updateOrderMutation = useUpdateCategoryOrder();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sync with parent data
  if (categories !== items) {
    setItems(categories);
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Update display_order in backend
        const updates = newItems.map((item, index) => ({
          id: item.id,
          display_order: index,
        }));

        updateOrderMutation.mutate(updates);

        return newItems;
      });
    }
  };

  const handleToggle = (id: string, isActive: boolean) => {
    updateMutation.mutate({ id, is_active: isActive });
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, {
        onSuccess: () => {
          setDeleteId(null);
        },
      });
    }
  };

  if (!items.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Henüz kategori eklenmemiş.</p>
        <p className="text-sm mt-1">Yukarıdan "Yeni Kategori" butonuna tıklayın.</p>
      </div>
    );
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((category) => (
              <SortableItem
                key={category.id}
                category={category}
                onEdit={onEdit}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kategoriyi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu kategoriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              <br />
              <br />
              <strong>Not:</strong> Bu kategoriye bağlı siteler veya blog yazıları varsa silinemez.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
