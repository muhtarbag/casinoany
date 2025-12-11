import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/ui/loading-state';
import { useCategory } from '@/hooks/queries/useCategoryQueries';
import { useSites } from '@/hooks/queries/useSiteQueries';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, GripVertical, Plus, X, Search } from 'lucide-react';

interface SiteCategoryRelation {
  id: string;
  site_id: string;
  category_id: string;
  display_order: number;
  site: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    rating: number | null;
  };
}

function SortableItem({ site, onRemove }: { site: SiteCategoryRelation['site']; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: site.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-3 bg-card border rounded-lg">
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </button>
      {site.logo_url && (
        <img src={site.logo_url} alt={site.name} className="w-10 h-10 object-contain rounded" />
      )}
      <div className="flex-1">
        <p className="font-medium">{site.name}</p>
        <p className="text-sm text-muted-foreground">{site.slug}</p>
      </div>
      {site.rating && (
        <Badge variant="secondary">{site.rating}/10</Badge>
      )}
      <Button variant="ghost" size="icon" onClick={onRemove}>
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default function CategorySites() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: category, isLoading: categoryLoading } = useCategory(slug || '');
  const { data: allSites, isLoading: allSitesLoading } = useSites({ isActive: true });

  // Fetch category sites
  const { data: categorySites, isLoading: categorySitesLoading } = useQuery({
    queryKey: ['category-sites', category?.id],
    queryFn: async () => {
      if (!category?.id) return [];
      const { data, error } = await supabase
        .from('site_categories')
        .select(`
          id,
          site_id,
          category_id,
          display_order,
          betting_sites:site_id (
            id,
            name,
            slug,
            logo_url,
            rating
          )
        `)
        .eq('category_id', category.id)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return (data || []).map((item: any) => ({
        id: item.id,
        site_id: item.site_id,
        category_id: item.category_id,
        display_order: item.display_order,
        site: item.betting_sites,
      })) as SiteCategoryRelation[];
    },
    enabled: !!category?.id,
  });

  // Add site mutation
  const addSiteMutation = useMutation({
    mutationFn: async (siteId: string) => {
      if (!category?.id) throw new Error('Category not found');
      const maxOrder = Math.max(...(categorySites?.map(s => s.display_order) || [0]), 0);
      const { error } = await supabase
        .from('site_categories')
        .insert({
          site_id: siteId,
          category_id: category.id,
          display_order: maxOrder + 1,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category-sites', category?.id] });
      toast.success('Site kategoriye eklendi');
    },
    onError: (error: Error) => {
      toast.error('Site eklenemedi: ' + error.message);
    },
  });

  // Remove site mutation
  const removeSiteMutation = useMutation({
    mutationFn: async (relationId: string) => {
      const { error } = await supabase
        .from('site_categories')
        .delete()
        .eq('id', relationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category-sites', category?.id] });
      toast.success('Site kategoriden çıkarıldı');
    },
    onError: (error: Error) => {
      toast.error('Site çıkarılamadı: ' + error.message);
    },
  });

  // Update order mutation
  const updateOrderMutation = useMutation({
    mutationFn: async (items: SiteCategoryRelation[]) => {
      const updates = items.map((item, index) => 
        supabase
          .from('site_categories')
          .update({ display_order: index })
          .eq('id', item.id)
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category-sites', category?.id] });
      toast.success('Sıralama güncellendi');
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !categorySites) return;

    if (active.id !== over.id) {
      const oldIndex = categorySites.findIndex((item) => item.site.id === active.id);
      const newIndex = categorySites.findIndex((item) => item.site.id === over.id);
      const newOrder = arrayMove(categorySites, oldIndex, newIndex);
      updateOrderMutation.mutate(newOrder);
    }
  };

  const availableSites = allSites?.filter(site => 
    !categorySites?.some(cs => cs.site_id === site.id) &&
    site.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (categoryLoading || allSitesLoading || categorySitesLoading) {
    return <LoadingState variant="skeleton" rows={8} />;
  }

  if (!category) {
    return <div>Kategori bulunamadı</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/admin/content/categories')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{category.name} - Site Yönetimi</h1>
          <p className="text-muted-foreground mt-1">
            Bu kategoride gösterilecek siteleri seçin ve sıralayın
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Selected Sites */}
        <Card>
          <CardHeader>
            <CardTitle>Kategorideki Siteler ({categorySites?.length || 0})</CardTitle>
            <CardDescription>
              Siteleri sürükleyerek sıralayın
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!categorySites || categorySites.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Henüz site eklenmemiş
              </p>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={categorySites.map(s => s.site.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {categorySites.map((relation) => (
                      <SortableItem
                        key={relation.site.id}
                        site={relation.site}
                        onRemove={() => removeSiteMutation.mutate(relation.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </Card>

        {/* Available Sites */}
        <Card>
          <CardHeader>
            <CardTitle>Mevcut Siteler</CardTitle>
            <CardDescription>
              Kategoriye eklemek için siteye tıklayın
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Site ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {availableSites?.map((site) => (
                <button
                  key={site.id}
                  onClick={() => addSiteMutation.mutate(site.id)}
                  className="flex items-center gap-3 p-3 bg-muted/50 hover:bg-muted border rounded-lg w-full text-left transition-colors"
                  disabled={addSiteMutation.isPending}
                >
                  {site.logo_url && (
                    <img src={site.logo_url} alt={site.name} className="w-10 h-10 object-contain rounded" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{site.name}</p>
                    <p className="text-sm text-muted-foreground">{site.slug}</p>
                  </div>
                  {site.rating && (
                    <Badge variant="secondary">{site.rating}/10</Badge>
                  )}
                  <Plus className="w-4 h-4" />
                </button>
              ))}
              {availableSites?.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  {searchTerm ? 'Site bulunamadı' : 'Tüm siteler kategoriye eklendi'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
