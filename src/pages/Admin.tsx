import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Trash2, Upload, Edit, X, GripVertical } from 'lucide-react';
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

interface SiteFormData {
  name: string;
  rating: number;
  bonus: string;
  features: string;
  affiliate_link: string;
  email: string;
  whatsapp: string;
  telegram: string;
  twitter: string;
  instagram: string;
  facebook: string;
  youtube: string;
}

interface SortableItemProps {
  id: string;
  site: any;
  editingId: string | null;
  onEdit: (site: any) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

const SortableItem = ({ id, site, editingId, onEdit, onDelete, isDeleting }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
        editingId === site.id 
          ? 'bg-primary/20 border-2 border-primary' 
          : 'bg-muted hover:bg-muted/80'
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="w-5 h-5" />
      </div>
      
      <div className="flex items-center gap-3 flex-1">
        {site.logo_url && (
          <img src={site.logo_url} alt={site.name} className="w-10 h-10 object-contain rounded" />
        )}
        <div className="flex-1">
          <p className="font-medium">{site.name}</p>
          <p className="text-xs text-muted-foreground">
            Puan: {site.rating} | {site.features?.length || 0} özellik
          </p>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(site)}
          className="text-primary hover:text-primary"
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(site.id)}
          className="text-destructive hover:text-destructive"
          disabled={isDeleting || editingId === site.id}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

const Admin = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [orderedSites, setOrderedSites] = useState<any[]>([]);
  const [formData, setFormData] = useState<SiteFormData>({
    name: '',
    rating: 5,
    bonus: '',
    features: '',
    affiliate_link: '',
    email: '',
    whatsapp: '',
    telegram: '',
    twitter: '',
    instagram: '',
    facebook: '',
    youtube: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
      toast({
        title: 'Erişim Reddedildi',
        description: 'Bu sayfaya erişim yetkiniz yok',
        variant: 'destructive',
      });
    }
  }, [isAdmin, authLoading, navigate, toast]);

  const { data: sites, isLoading } = useQuery({
    queryKey: ['admin-betting-sites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Siteleri orderedSites'a sync et
  useEffect(() => {
    if (sites) {
      setOrderedSites(sites);
    }
  }, [sites]);

  const updateOrderMutation = useMutation({
    mutationFn: async (sites: any[]) => {
      const updates = sites.map((site, index) => ({
        id: site.id,
        display_order: index,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('betting_sites')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-betting-sites'] });
      queryClient.invalidateQueries({ queryKey: ['betting-sites'] });
      toast({ title: 'Başarılı!', description: 'Site sıralaması güncellendi' });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setOrderedSites((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Backend'e kaydet
        updateOrderMutation.mutate(newOrder);
        
        return newOrder;
      });
    }
  };

  const createSiteMutation = useMutation({
    mutationFn: async (data: SiteFormData) => {
      let logoUrl = null;

      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('site-logos')
          .upload(fileName, logoFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('site-logos')
          .getPublicUrl(fileName);
        logoUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from('betting_sites').insert({
        ...data,
        logo_url: logoUrl,
        features: data.features ? data.features.split(',').map((f: string) => f.trim()) : [],
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-betting-sites'] });
      queryClient.invalidateQueries({ queryKey: ['betting-sites'] });
      toast({ title: 'Başarılı!', description: 'Site eklendi' });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateSiteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SiteFormData }) => {
      let logoUrl = undefined;

      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('site-logos')
          .upload(fileName, logoFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('site-logos')
          .getPublicUrl(fileName);
        logoUrl = urlData.publicUrl;
      }

      const updateData: any = {
        ...data,
        features: data.features ? data.features.split(',').map((f: string) => f.trim()) : [],
      };

      if (logoUrl) {
        updateData.logo_url = logoUrl;
      }

      const { error } = await supabase
        .from('betting_sites')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-betting-sites'] });
      queryClient.invalidateQueries({ queryKey: ['betting-sites'] });
      toast({ title: 'Başarılı!', description: 'Site güncellendi' });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteSiteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('betting_sites').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-betting-sites'] });
      queryClient.invalidateQueries({ queryKey: ['betting-sites'] });
      toast({ title: 'Başarılı!', description: 'Site silindi' });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      rating: 5,
      bonus: '',
      features: '',
      affiliate_link: '',
      email: '',
      whatsapp: '',
      telegram: '',
      twitter: '',
      instagram: '',
      facebook: '',
      youtube: '',
    });
    setLogoFile(null);
    setEditingId(null);
  };

  const handleEdit = (site: any) => {
    setEditingId(site.id);
    setFormData({
      name: site.name,
      rating: Number(site.rating) || 5,
      bonus: site.bonus || '',
      features: site.features?.join(', ') || '',
      affiliate_link: site.affiliate_link,
      email: site.email || '',
      whatsapp: site.whatsapp || '',
      telegram: site.telegram || '',
      twitter: site.twitter || '',
      instagram: site.instagram || '',
      facebook: site.facebook || '',
      youtube: site.youtube || '',
    });
    setLogoFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.affiliate_link) {
      toast({
        title: 'Hata',
        description: 'Site adı ve affiliate link zorunludur',
        variant: 'destructive',
      });
      return;
    }
    
    setUploading(true);
    if (editingId) {
      await updateSiteMutation.mutateAsync({ id: editingId, data: formData });
    } else {
      await createSiteMutation.mutateAsync(formData);
    }
    setUploading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-primary bg-clip-text text-transparent">
          Admin Paneli
        </h1>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {editingId ? 'Site Düzenle' : 'Yeni Site Ekle'}
              </CardTitle>
              {editingId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetForm}
                  className="text-muted-foreground"
                >
                  <X className="w-4 h-4 mr-1" />
                  İptal
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Site Adı *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="logo">Logo {editingId && '(Değiştirmek için yeni logo seçin)'}</Label>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  />
                </div>

                <div>
                  <Label htmlFor="rating">Puan (1-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="bonus">Bonus</Label>
                  <Input
                    id="bonus"
                    value={formData.bonus}
                    onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                    placeholder="örn: %100 Hoşgeldin Bonusu"
                  />
                </div>

                <div>
                  <Label htmlFor="features">Özellikler (virgülle ayırın)</Label>
                  <Input
                    id="features"
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    placeholder="örn: Canlı Bahis, Casino, Slot"
                  />
                </div>

                <div>
                  <Label htmlFor="affiliate_link">Affiliate Link *</Label>
                  <Input
                    id="affiliate_link"
                    value={formData.affiliate_link}
                    onChange={(e) => setFormData({ ...formData, affiliate_link: e.target.value })}
                    placeholder="https://..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="+90..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="telegram">Telegram</Label>
                    <Input
                      id="telegram"
                      value={formData.telegram}
                      onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      value={formData.twitter}
                      onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={formData.instagram}
                      onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={formData.facebook}
                      onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="youtube">YouTube</Label>
                    <Input
                      id="youtube"
                      value={formData.youtube}
                      onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-gradient-primary" disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingId ? 'Güncelleniyor...' : 'Ekleniyor...'}
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      {editingId ? 'Güncelle' : 'Site Ekle'}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mevcut Siteler</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Siteleri sürükleyerek sıralamayı değiştirebilirsiniz
              </p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={orderedSites.map(s => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {orderedSites.map((site) => (
                        <SortableItem
                          key={site.id}
                          id={site.id}
                          site={site}
                          editingId={editingId}
                          onEdit={handleEdit}
                          onDelete={(id) => deleteSiteMutation.mutate(id)}
                          isDeleting={deleteSiteMutation.isPending}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
