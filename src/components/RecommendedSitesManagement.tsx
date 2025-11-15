import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, GripVertical, Save, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-4 p-4 bg-card rounded-lg border-2 transition-all ${
        isDragging 
          ? 'border-primary shadow-lg scale-[1.02] opacity-90' 
          : 'border-border hover:border-primary/50 hover:shadow-md'
      }`}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="cursor-grab active:cursor-grabbing p-2 -ml-2 rounded-md hover:bg-muted/50 transition-colors"
      >
        <GripVertical className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      
      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-muted/30 p-2 border border-border">
        <img 
          src={site.betting_sites.logo_url} 
          alt={site.betting_sites.name}
          className="w-full h-full object-contain"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{site.betting_sites.name}</p>
        <p className="text-xs text-muted-foreground truncate">/{site.betting_sites.slug}</p>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(site.id)}
        className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
      >
        <Trash2 className="w-4 h-4 mr-1" />
        Kaldır
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
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Önerilen Siteler</h1>
        <p className="text-muted-foreground mt-2">
          Site detay sayfalarında gösterilecek önerilen siteleri yönetin
        </p>
      </div>

      <Card className="border-2">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">Site Önerileri</CardTitle>
              <CardDescription className="mt-1.5">
                Her site için maksimum 4 önerilen site ekleyebilir ve sıralayabilirsiniz
              </CardDescription>
            </div>
            {selectedMainSite && localRecommendations?.length > 0 && (
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {localRecommendations.length}/4 Site
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          {/* Main Site Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <label className="text-sm font-semibold">1. Ana Siteyi Seçin</label>
            </div>
            <Select value={selectedMainSite} onValueChange={setSelectedMainSite}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Öneriler eklemek istediğiniz siteyi seçin..." />
              </SelectTrigger>
              <SelectContent>
                {allSites?.map((site) => (
                  <SelectItem key={site.id} value={site.id}>
                    <div className="flex items-center gap-2">
                      <img src={site.logo_url} alt={site.name} className="w-5 h-5 object-contain" />
                      {site.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!selectedMainSite && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Önce bir ana site seçin, ardından bu site için öneriler ekleyebilirsiniz
                </AlertDescription>
              </Alert>
            )}
          </div>

          {selectedMainSite && (
            <>
              {/* Add Recommended Site */}
              <div className="space-y-3 pb-6 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-muted-foreground" />
                    <label className="text-sm font-semibold">2. Önerilen Site Ekle</label>
                  </div>
                  {localRecommendations?.length >= 4 && (
                    <Badge variant="outline" className="border-orange-500/50 text-orange-600">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Maksimum 4 site
                    </Badge>
                  )}
                </div>
                <div className="flex gap-3">
                  <Select 
                    value={selectedRecommendedSite} 
                    onValueChange={setSelectedRecommendedSite}
                    disabled={!availableSites || availableSites.length === 0 || localRecommendations?.length >= 4}
                  >
                    <SelectTrigger className="flex-1 h-11">
                      <SelectValue placeholder={
                        availableSites?.length === 0 
                          ? "Tüm siteler eklendi" 
                          : "Önerilecek siteyi seçin..."
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSites?.map((site) => (
                        <SelectItem key={site.id} value={site.id}>
                          <div className="flex items-center gap-2">
                            <img src={site.logo_url} alt={site.name} className="w-5 h-5 object-contain" />
                            {site.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => addMutation.mutate()}
                    disabled={!selectedRecommendedSite || addMutation.isPending || localRecommendations?.length >= 4}
                    size="lg"
                    className="px-6"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ekle
                  </Button>
                </div>
              </div>

              {/* Current Recommendations */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <label className="text-sm font-semibold">
                      3. Sıralama ve Yönetim
                      {localRecommendations && localRecommendations.length > 0 && (
                        <span className="text-muted-foreground font-normal ml-2">
                          ({localRecommendations.length}/4)
                        </span>
                      )}
                    </label>
                  </div>
                  {hasOrderChanged && (
                    <Button
                      onClick={() => saveOrderMutation.mutate(localRecommendations)}
                      disabled={saveOrderMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Sıralamayı Kaydet
                    </Button>
                  )}
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center space-y-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                      <p className="text-sm text-muted-foreground">Yükleniyor...</p>
                    </div>
                  </div>
                ) : localRecommendations && localRecommendations.length > 0 ? (
                  <div className="space-y-4">
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={localRecommendations.map(r => r.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-3">
                          {localRecommendations.map((site, index) => (
                            <div key={site.id} className="flex items-center gap-3">
                              <Badge variant="outline" className="w-8 h-8 flex items-center justify-center rounded-full">
                                {index + 1}
                              </Badge>
                              <div className="flex-1">
                                <SortableItem
                                  id={site.id}
                                  site={site}
                                  onRemove={() => removeMutation.mutate(site.id)}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                    
                    <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                      <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>İpucu:</strong> Siteleri sürükleyip bırakarak sıralayın. Değişiklikleri kaydetmek için "Sıralamayı Kaydet" butonuna tıklayın.
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <div className="text-center py-12 px-4 border-2 border-dashed rounded-lg bg-muted/20">
                    <div className="mx-auto w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                      <Plus className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium mb-1">Henüz önerilen site yok</p>
                    <p className="text-xs text-muted-foreground">
                      Yukarıdaki alandan site ekleyerek başlayın
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
