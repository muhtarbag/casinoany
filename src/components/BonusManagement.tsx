import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Loader2, GripVertical, Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BonusImageUploader } from '@/components/bonus/BonusImageUploader';

interface BonusOffer {
  id: string;
  site_id: string;
  title: string;
  bonus_amount: string;
  bonus_type: string;
  wagering_requirement: string | null;
  terms: string | null;
  eligibility: string | null;
  validity_period: string | null;
  display_order: number;
  is_active: boolean;
  image_url: string | null;
}

export const BonusManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBonus, setEditingBonus] = useState<BonusOffer | null>(null);
  const [formData, setFormData] = useState({
    site_id: '',
    title: '',
    bonus_amount: '',
    bonus_type: 'no_deposit',
    wagering_requirement: '',
    terms: '',
    eligibility: '',
    validity_period: '',
    display_order: 0,
    is_active: true,
    image_url: '',
  });

  // Fetch all bonus offers
  const { data: bonusOffers, isLoading: isLoadingBonuses } = useQuery({
    queryKey: ['bonus-offers-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bonus_offers')
        .select('*, betting_sites!inner(name, logo_url, slug)')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch all sites for dropdown
  const { data: sites } = useQuery({
    queryKey: ['sites-for-bonus'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingBonus) {
        const { error } = await supabase
          .from('bonus_offers')
          .update(data)
          .eq('id', editingBonus.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('bonus_offers')
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bonus-offers-admin'] });
      queryClient.invalidateQueries({ queryKey: ['bonus-offers'] });
      toast({
        title: 'Başarılı',
        description: editingBonus ? 'Bonus güncellendi.' : 'Bonus eklendi.',
      });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bonus_offers')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bonus-offers-admin'] });
      queryClient.invalidateQueries({ queryKey: ['bonus-offers'] });
      toast({
        title: 'Başarılı',
        description: 'Bonus silindi.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (items: BonusOffer[]) => {
      const updates = items.map(async (item, index) => {
        const { error } = await supabase
          .from('bonus_offers')
          .update({ display_order: index })
          .eq('id', item.id);
        if (error) throw error;
        return true;
      });
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bonus-offers-admin'] });
      queryClient.invalidateQueries({ queryKey: ['bonus-offers'] });
      toast({
        title: 'Başarılı',
        description: 'Sıralama güncellendi.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Quick approve/reject mutations
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('bonus_offers')
        .update({ is_active: isActive })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bonus-offers-admin'] });
      queryClient.invalidateQueries({ queryKey: ['bonus-offers'] });
      toast({
        title: 'Başarılı',
        description: variables.isActive ? 'Bonus onaylandı.' : 'Bonus reddedildi.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
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

    if (over && active.id !== over.id) {
      const oldIndex = bonusOffers?.findIndex((item) => item.id === active.id) ?? -1;
      const newIndex = bonusOffers?.findIndex((item) => item.id === over.id) ?? -1;

      if (oldIndex !== -1 && newIndex !== -1 && bonusOffers) {
        const newItems = arrayMove(bonusOffers, oldIndex, newIndex);
        reorderMutation.mutate(newItems);
      }
    }
  };

  const handleOpenDialog = (bonus?: BonusOffer) => {
    if (bonus) {
      setEditingBonus(bonus);
      setFormData({
        site_id: bonus.site_id,
        title: bonus.title,
        bonus_amount: bonus.bonus_amount,
        bonus_type: bonus.bonus_type,
        wagering_requirement: bonus.wagering_requirement || '',
        terms: bonus.terms || '',
        eligibility: bonus.eligibility || '',
        validity_period: bonus.validity_period || '',
        display_order: bonus.display_order,
        is_active: bonus.is_active,
        image_url: bonus.image_url || '',
      });
    } else {
      setEditingBonus(null);
      setFormData({
        site_id: '',
        title: '',
        bonus_amount: '',
        bonus_type: 'no_deposit',
        wagering_requirement: '',
        terms: '',
        eligibility: '',
        validity_period: '',
        display_order: 0,
        is_active: true,
        image_url: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingBonus(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  if (isLoadingBonuses) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bonus Yönetimi</CardTitle>
              <CardDescription>
                Deneme bonusu ve kampanya tekliflerini yönetin
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Bonus Ekle
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingBonus ? 'Bonus Düzenle' : 'Yeni Bonus Ekle'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="site_id">Casino Sitesi *</Label>
                    <Select
                      value={formData.site_id}
                      onValueChange={(value) => setFormData({ ...formData, site_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Site seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {sites?.map((site) => (
                          <SelectItem key={site.id} value={site.id}>
                            {site.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="title">Başlık *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="bonus_amount">Bonus Miktarı *</Label>
                    <Input
                      id="bonus_amount"
                      value={formData.bonus_amount}
                      onChange={(e) => setFormData({ ...formData, bonus_amount: e.target.value })}
                      placeholder="Örn: 100 TL"
                      required
                    />
                  </div>

                  <BonusImageUploader
                    currentImageUrl={formData.image_url}
                    onImageUploaded={(url) => setFormData({ ...formData, image_url: url })}
                    onImageRemoved={() => setFormData({ ...formData, image_url: '' })}
                  />

                  <div>
                    <Label htmlFor="bonus_type">Bonus Türü</Label>
                    <Select
                      value={formData.bonus_type}
                      onValueChange={(value) => setFormData({ ...formData, bonus_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no_deposit">Deneme Bonusu</SelectItem>
                        <SelectItem value="welcome">Hoş Geldin Bonusu</SelectItem>
                        <SelectItem value="deposit">Yatırım Bonusu</SelectItem>
                        <SelectItem value="free_spins">Free Spin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="wagering_requirement">Çevrim Şartı</Label>
                    <Input
                      id="wagering_requirement"
                      value={formData.wagering_requirement}
                      onChange={(e) => setFormData({ ...formData, wagering_requirement: e.target.value })}
                      placeholder="Örn: 20x çevrim şartı"
                    />
                  </div>

                  <div>
                    <Label htmlFor="terms">Şartlar ve Koşullar</Label>
                    <Textarea
                      id="terms"
                      value={formData.terms}
                      onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="eligibility">Kimler Katılabilir</Label>
                    <Input
                      id="eligibility"
                      value={formData.eligibility}
                      onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                      placeholder="Örn: Yeni Üyeler"
                    />
                  </div>

                  <div>
                    <Label htmlFor="validity_period">Geçerlilik Süresi</Label>
                    <Input
                      id="validity_period"
                      value={formData.validity_period}
                      onChange={(e) => setFormData({ ...formData, validity_period: e.target.value })}
                      placeholder="Örn: 30 gün"
                    />
                  </div>

                  <div>
                    <Label htmlFor="display_order">Sıralama</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Aktif</Label>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                      İptal
                    </Button>
                    <Button type="submit" disabled={saveMutation.isPending}>
                      {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {editingBonus ? 'Güncelle' : 'Ekle'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={bonusOffers?.map(b => b.id) ?? []}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {bonusOffers?.map((bonus: any) => (
                  <SortableBonusItem
                    key={bonus.id}
                    bonus={bonus}
                    onEdit={handleOpenDialog}
                    onDelete={deleteMutation.mutate}
                    onApprove={(id) => updateStatusMutation.mutate({ id, isActive: true })}
                    onReject={(id) => updateStatusMutation.mutate({ id, isActive: false })}
                  />
                ))}
                {bonusOffers?.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Henüz bonus eklenmemiş.
                  </p>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>
    </div>
  );
};

interface SortableBonusItemProps {
  bonus: any;
  onEdit: (bonus: any) => void;
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const SortableBonusItem = ({ bonus, onEdit, onDelete, onApprove, onReject }: SortableBonusItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: bonus.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-4 rounded-lg border bg-card"
    >
      <button
        className="cursor-grab active:cursor-grabbing touch-none p-1 hover:bg-muted rounded"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </button>
      
      <div className="flex items-center justify-between flex-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {bonus.betting_sites?.logo_url && (
              <img
                src={bonus.betting_sites.logo_url}
                alt={bonus.betting_sites?.name}
                className="w-12 h-12 object-contain rounded"
              />
            )}
            {bonus.image_url && (
              <img
                src={bonus.image_url}
                alt={bonus.title}
                className="w-16 h-12 object-cover rounded border"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>
          <div>
            <p className="font-medium">{bonus.title}</p>
            <p className="text-sm text-muted-foreground">
              {bonus.betting_sites?.name} - {bonus.bonus_amount}
            </p>
            <p className="text-xs text-muted-foreground">
              {bonus.is_active ? '✓ Aktif' : '✗ Pasif'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!bonus.is_active && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onApprove(bonus.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4 mr-1" />
              Onay
            </Button>
          )}
          {bonus.is_active && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onReject(bonus.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              <X className="w-4 h-4 mr-1" />
              Red
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(bonus)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Bonusu silmek istediğinize emin misiniz?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bu işlem geri alınamaz. Bonus kalıcı olarak silinecektir.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(bonus.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
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
