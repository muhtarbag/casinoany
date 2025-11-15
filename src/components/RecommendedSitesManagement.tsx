import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, GripVertical, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface RecommendedSite {
  id: string;
  site_id: string;
  recommended_site_id: string;
  display_order: number;
  betting_sites: {
    name: string;
    slug: string;
    logo_url: string;
  };
}

interface SortableItemProps {
  id: string;
  site: RecommendedSite;
  onRemove: (id: string) => void;
}

function SortableItem({ id, site, onRemove }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      
      <img 
        src={site.betting_sites.logo_url} 
        alt={site.betting_sites.name}
        className="w-8 h-8 object-contain rounded"
      />
      
      <div className="flex-1">
        <p className="font-medium text-sm">{site.betting_sites.name}</p>
        <p className="text-xs text-muted-foreground">{site.betting_sites.slug}</p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(site.id)}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

export const RecommendedSitesManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMainSite, setSelectedMainSite] = useState<string>('');
  const [selectedRecommendedSite, setSelectedRecommendedSite] = useState<string>('');
  const [localRecommendations, setLocalRecommendations] = useState<RecommendedSite[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch all sites
  const { data: allSites } = useQuery({
    queryKey: ['all-betting-sites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('id, name, slug, logo_url')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // Fetch recommended sites for selected main site
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['site-recommendations', selectedMainSite],
    queryFn: async () => {
      if (!selectedMainSite) return [];
      const { data, error } = await supabase
        .from('site_recommended_sites')
        .select(`
          id,
          site_id,
          recommended_site_id,
          display_order,
          betting_sites!site_recommended_sites_recommended_site_id_fkey (
            name,
            slug,
            logo_url
          )
        `)
        .eq('site_id', selectedMainSite)
        .order('display_order');
      if (error) throw error;
      return data as RecommendedSite[];
    },
    enabled: !!selectedMainSite,
  });

  // Update local state when recommendations change
  useEffect(() => {
    if (recommendations) {
      setLocalRecommendations(recommendations);
    }
  }, [recommendations]);

  // Add recommendation mutation
  const addMutation = useMutation({
    mutationFn: async () => {
      if (!selectedMainSite || !selectedRecommendedSite) {
        throw new Error('Site seçimi gerekli');
      }

      // Check if already exists
      const { data: existing } = await supabase
        .from('site_recommended_sites')
        .select('id')
        .eq('site_id', selectedMainSite)
        .eq('recommended_site_id', selectedRecommendedSite)
        .maybeSingle();

      if (existing) {
        throw new Error('Bu site zaten öneriler listesinde');
      }

      // Get next display order
      const { data: maxOrder } = await supabase
        .from('site_recommended_sites')
        .select('display_order')
        .eq('site_id', selectedMainSite)
        .order('display_order', { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextOrder = (maxOrder?.display_order ?? -1) + 1;

      const { error } = await supabase
        .from('site_recommended_sites')
        .insert({
          site_id: selectedMainSite,
          recommended_site_id: selectedRecommendedSite,
          display_order: nextOrder,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-recommendations', selectedMainSite] });
      setSelectedRecommendedSite('');
      toast({ title: 'Önerilen site eklendi' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Hata', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  // Remove recommendation mutation
  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('site_recommended_sites')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-recommendations', selectedMainSite] });
      toast({ title: 'Önerilen site kaldırıldı' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Hata', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  // Save order mutation
  const saveOrderMutation = useMutation({
    mutationFn: async (items: RecommendedSite[]) => {
      // Update each item's display_order individually
      const promises = items.map((item, index) => 
        supabase
          .from('site_recommended_sites')
          .update({ display_order: index })
          .eq('id', item.id)
      );

      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error);
      
      if (errors.length > 0) {
        throw new Error('Bazı güncellemeler başarısız oldu');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-recommendations', selectedMainSite] });
      toast({ title: 'Sıralama kaydedildi' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Hata', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLocalRecommendations((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const availableSites = allSites?.filter(
    (site) => 
      site.id !== selectedMainSite && 
      !localRecommendations?.find((rec) => rec.recommended_site_id === site.id)
  );

  const hasOrderChanged = JSON.stringify(localRecommendations?.map(r => r.id)) !== 
                          JSON.stringify(recommendations?.map(r => r.id));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Önerilen Siteler Yönetimi</CardTitle>
          <CardDescription>
            Her site için gösterilecek önerilen siteleri yönetin (maksimum 4 site)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Site Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Ana Site Seçin</label>
            <Select value={selectedMainSite} onValueChange={setSelectedMainSite}>
              <SelectTrigger>
                <SelectValue placeholder="Site seçin..." />
              </SelectTrigger>
              <SelectContent>
                {allSites?.map((site) => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedMainSite && (
            <>
              {/* Add Recommended Site */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Önerilen Site Ekle
                  {localRecommendations?.length >= 4 && (
                    <Badge variant="secondary" className="ml-2">Maksimum 4 site</Badge>
                  )}
                </label>
                <div className="flex gap-2">
                  <Select 
                    value={selectedRecommendedSite} 
                    onValueChange={setSelectedRecommendedSite}
                    disabled={!availableSites || availableSites.length === 0 || localRecommendations?.length >= 4}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Önerilecek siteyi seçin..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSites?.map((site) => (
                        <SelectItem key={site.id} value={site.id}>
                          {site.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => addMutation.mutate()}
                    disabled={!selectedRecommendedSite || addMutation.isPending || localRecommendations?.length >= 4}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ekle
                  </Button>
                </div>
              </div>

              {/* Current Recommendations */}
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Yükleniyor...</div>
              ) : localRecommendations && localRecommendations.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Mevcut Öneriler ({localRecommendations.length}/4)
                    </label>
                    {hasOrderChanged && (
                      <Button
                        size="sm"
                        onClick={() => saveOrderMutation.mutate(localRecommendations)}
                        disabled={saveOrderMutation.isPending}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Sıralamayı Kaydet
                      </Button>
                    )}
                  </div>
                  
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={localRecommendations.map(r => r.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {localRecommendations.map((site) => (
                          <SortableItem
                            key={site.id}
                            id={site.id}
                            site={site}
                            onRemove={() => removeMutation.mutate(site.id)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                  
                  <p className="text-xs text-muted-foreground">
                    💡 Sürükle-bırak ile sıralayın, ardından "Sıralamayı Kaydet" butonuna tıklayın
                  </p>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground p-4 border rounded-lg text-center">
                  Henüz önerilen site eklenmemiş. Yukarıdan site ekleyerek başlayın.
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
