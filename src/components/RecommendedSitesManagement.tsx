import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, GripVertical, Save, CheckSquare, AlertCircle, CheckCircle, Info, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

interface RecommendedSite {
  id: string;
  site_id: string;
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
  const [selectedSites, setSelectedSites] = useState<Set<string>>(new Set());
  const [localRecommendations, setLocalRecommendations] = useState<RecommendedSite[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Fetch recommended sites from global pool
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['global-recommended-sites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recommended_sites_pool')
        .select(`
          id,
          site_id,
          display_order,
          betting_sites!recommended_sites_pool_site_id_fkey (
            name,
            slug,
            logo_url
          )
        `)
        .order('display_order');
      if (error) throw error;
      return data as RecommendedSite[];
    },
  });

  // Update local state when recommendations change
  useEffect(() => {
    if (recommendations) {
      setLocalRecommendations(recommendations);
    }
  }, [recommendations]);

  // Add recommendations mutation (multiple sites)
  const addMutation = useMutation({
    mutationFn: async (siteIds: string[]) => {
      if (siteIds.length === 0) {
        throw new Error('Site seçimi gerekli');
      }

      const currentCount = localRecommendations?.length || 0;
      const availableSlots = 15 - currentCount;

      if (siteIds.length > availableSlots) {
        throw new Error(`Maksimum ${availableSlots} site daha ekleyebilirsiniz`);
      }

      // Get next display order
      const { data: maxOrder } = await supabase
        .from('recommended_sites_pool')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .maybeSingle();

      let nextOrder = (maxOrder?.display_order ?? -1) + 1;

      // Insert all selected sites
      const inserts = siteIds.map((siteId) => ({
        site_id: siteId,
        display_order: nextOrder++,
      }));

      const { error } = await supabase
        .from('recommended_sites_pool')
        .insert(inserts);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['global-recommended-sites'] });
      setSelectedSites(new Set());
      toast({ title: `${selectedSites.size} site global havuza eklendi` });
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
        .from('recommended_sites_pool')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['global-recommended-sites'] });
      toast({ title: 'Site global havuzdan kaldırıldı' });
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
      const promises = items.map((item, index) => 
        supabase
          .from('recommended_sites_pool')
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
      queryClient.invalidateQueries({ queryKey: ['global-recommended-sites'] });
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
    (site) => !localRecommendations?.find((rec) => rec.site_id === site.id)
  );

  const filteredSites = availableSites?.filter((site) => 
    site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasOrderChanged = JSON.stringify(localRecommendations?.map(r => r.id)) !== 
                          JSON.stringify(recommendations?.map(r => r.id));

  const handleToggleSite = (siteId: string) => {
    const newSelected = new Set(selectedSites);
    if (newSelected.has(siteId)) {
      newSelected.delete(siteId);
    } else {
      const remainingSlots = 15 - (localRecommendations?.length || 0);
      if (newSelected.size >= remainingSlots) {
        toast({
          title: 'Uyarı',
          description: `Maksimum ${remainingSlots} site daha seçebilirsiniz`,
          variant: 'destructive'
        });
        return;
      }
      newSelected.add(siteId);
    }
    setSelectedSites(newSelected);
  };

  const handleSelectAll = () => {
    const remainingSlots = 15 - (localRecommendations?.length || 0);
    if (!filteredSites) return;
    
    const sitesToSelect = filteredSites.slice(0, remainingSlots);
    setSelectedSites(new Set(sitesToSelect.map(s => s.id)));
  };

  const handleDeselectAll = () => {
    setSelectedSites(new Set());
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Global Öneriler Havuzu</h1>
        <p className="text-muted-foreground mt-2">
          Tüm site detay sayfalarında gösterilecek önerilen siteleri buradan yönetin
        </p>
      </div>

      <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Nasıl Çalışır?</strong> Buradan seçtiğiniz siteler, <strong>TÜM</strong> site detay sayfalarında "Önerilen Siteler" bölümünde gösterilecek. Maksimum 15 site ekleyebilirsiniz.
        </AlertDescription>
      </Alert>

      <Card className="border-2">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">Önerilen Siteler</CardTitle>
              <CardDescription className="mt-1.5">
                Maksimum 15 site seçebilirsiniz
              </CardDescription>
            </div>
            {localRecommendations?.length > 0 && (
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {localRecommendations.length}/15 Site
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          {/* Add Sites with Checkboxes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-muted-foreground" />
                <label className="text-sm font-semibold">Önerilen Siteleri Seçin</label>
                {selectedSites.size > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedSites.size} seçili
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={!filteredSites || filteredSites.length === 0}
                >
                  Tümünü Seç
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                  disabled={selectedSites.size === 0}
                >
                  Temizle
                </Button>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Site ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {localRecommendations?.length >= 15 ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Maksimum 15 site eklenmiş. Yeni site eklemek için önce mevcut sitelerden birini kaldırın.
                </AlertDescription>
              </Alert>
            ) : filteredSites && filteredSites.length > 0 ? (
              <>
                <ScrollArea className="h-[300px] border rounded-lg p-2">
                  <div className="space-y-2">
                    {filteredSites.map((site) => (
                      <div
                        key={site.id}
                        onClick={() => handleToggleSite(site.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-muted/50 ${
                          selectedSites.has(site.id)
                            ? 'border-primary bg-primary/5'
                            : 'border-border'
                        }`}
                      >
                        <Checkbox
                          checked={selectedSites.has(site.id)}
                          onCheckedChange={() => handleToggleSite(site.id)}
                          className="pointer-events-none"
                        />
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted/30 p-2 border">
                          <img
                            src={site.logo_url}
                            alt={site.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{site.name}</p>
                          <p className="text-xs text-muted-foreground truncate">/{site.slug}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">
                    {15 - (localRecommendations?.length || 0)} slot boş
                  </p>
                  <Button
                    onClick={() => addMutation.mutate(Array.from(selectedSites))}
                    disabled={selectedSites.size === 0 || addMutation.isPending}
                    size="lg"
                    className="px-6"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {selectedSites.size > 0 ? `${selectedSites.size} Site Ekle` : 'Site Ekle'}
                  </Button>
                </div>
              </>
            ) : searchQuery ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  "{searchQuery}" araması için sonuç bulunamadı.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Tüm siteler zaten global havuza eklenmiş.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Current Recommendations */}
          <div className="space-y-4 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                <label className="text-sm font-semibold">
                  Mevcut Öneriler
                  {localRecommendations && localRecommendations.length > 0 && (
                    <span className="text-muted-foreground font-normal ml-2">
                      ({localRecommendations.length}/15)
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
        </CardContent>
      </Card>
    </div>
  );
};
