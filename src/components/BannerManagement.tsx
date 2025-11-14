import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { optimizeImage, getOptimizedFileName, formatFileSize } from '@/utils/imageOptimizer';

interface Banner {
  id: string;
  title: string;
  image_url: string;
  target_url: string | null;
  position: number;
  display_pages: string[];
  is_active: boolean;
  display_order: number;
  alt_text: string | null;
}

interface BannerFormData {
  title: string;
  image_url: string;
  target_url: string;
  position: number;
  display_pages: string[];
  is_active: boolean;
  display_order: number;
  alt_text: string;
}

export const BannerManagement = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [formData, setFormData] = useState<BannerFormData>({
    title: '',
    image_url: '',
    target_url: '',
    position: 9,
    display_pages: ['home'],
    is_active: true,
    display_order: 0,
    alt_text: ''
  });

  const { data: banners, isLoading } = useQuery({
    queryKey: ['site-banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_banners')
        .select('*')
        .order('position', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as Banner[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: BannerFormData) => {
      const { error } = await supabase
        .from('site_banners')
        .insert([data]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-banners'] });
      toast.success('Banner başarıyla oluşturuldu');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Banner oluşturulurken hata: ' + error.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BannerFormData> }) => {
      const { error } = await supabase
        .from('site_banners')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-banners'] });
      toast.success('Banner başarıyla güncellendi');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Banner güncellenirken hata: ' + error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('site_banners')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-banners'] });
      toast.success('Banner başarıyla silindi');
    },
    onError: (error) => {
      toast.error('Banner silinirken hata: ' + error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      image_url: '',
      target_url: '',
      position: 9,
      display_pages: ['home'],
      is_active: true,
      display_order: 0,
      alt_text: ''
    });
    setEditingBanner(null);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      image_url: banner.image_url,
      target_url: banner.target_url || '',
      position: banner.position,
      display_pages: banner.display_pages,
      is_active: banner.is_active,
      display_order: banner.display_order,
      alt_text: banner.alt_text || ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingBanner) {
      updateMutation.mutate({ id: editingBanner.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const uploadImage = async (file: File) => {
    try {
      setIsOptimizing(true);
      const originalSize = file.size;
      
      toast.info('Görsel optimize ediliyor...', { duration: 2000 });
      
      // Optimize image
      const optimizedBlob = await optimizeImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.85,
        format: 'webp'
      });
      
      const optimizedSize = optimizedBlob.size;
      const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
      
      // Generate optimized filename
      const fileName = getOptimizedFileName(file.name, 'webp');
      const filePath = `banners/${fileName}`;

      // Upload optimized image
      const { error: uploadError } = await supabase.storage
        .from('notification-images')
        .upload(filePath, optimizedBlob, {
          contentType: 'image/webp',
          cacheControl: '31536000', // 1 year cache
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('notification-images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      
      toast.success(
        `Görsel yüklendi! ${formatFileSize(originalSize)} → ${formatFileSize(optimizedSize)} (%${savings} daha küçük)`,
        { duration: 4000 }
      );
    } catch (error: any) {
      toast.error('Görsel yüklenirken hata: ' + error.message);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadImage(file);
  };

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen bir görsel dosyası yükleyin');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Görsel boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    await uploadImage(file);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Banner Yönetimi</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBanner ? 'Banner Düzenle' : 'Yeni Banner Ekle'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Başlık</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="image">Banner Görseli</Label>
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragging
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    {isDragging
                      ? 'Görseli buraya bırakın'
                      : 'Görseli sürükleyin veya tıklayın'}
                  </p>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    PNG, JPG, WEBP (Maks. 5MB)
                  </p>
                </div>
                {formData.image_url && (
                  <div className="mt-4 relative">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setFormData({ ...formData, image_url: '' })}
                    >
                      Kaldır
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="alt_text">Alt Metin (SEO)</Label>
                <Input
                  id="alt_text"
                  value={formData.alt_text}
                  onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                  placeholder="Banner açıklaması"
                />
              </div>

              <div>
                <Label htmlFor="target_url">Hedef Link (Opsiyonel)</Label>
                <Input
                  id="target_url"
                  value={formData.target_url}
                  onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <Label htmlFor="position">Pozisyon (Kaçıncı karttan sonra)</Label>
                <Input
                  id="position"
                  type="number"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) })}
                  min="0"
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Örnek: 9 = 9. karttan sonra göster, 33 = 33. karttan sonra göster
                </p>
              </div>

              <div>
                <Label htmlFor="display_order">Görüntülenme Sırası</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="display_pages">Görüntülenecek Sayfalar</Label>
                <Select
                  value={formData.display_pages[0]}
                  onValueChange={(value) => setFormData({ ...formData, display_pages: [value] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Ana Sayfa</SelectItem>
                    <SelectItem value="all">Tüm Sayfalar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Aktif</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingBanner ? 'Güncelle' : 'Oluştur'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  İptal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {banners?.map((banner) => (
          <Card key={banner.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {banner.title}
                    {!banner.is_active && (
                      <span className="text-xs bg-muted px-2 py-1 rounded">Pasif</span>
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pozisyon: {banner.position}. karttan sonra
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(banner)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(banner.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <img
                  src={banner.image_url}
                  alt={banner.alt_text || banner.title}
                  className="w-48 h-24 object-cover rounded"
                />
                <div className="flex-1 space-y-2">
                  {banner.target_url && (
                    <p className="text-sm">
                      <span className="font-medium">Link:</span>{' '}
                      <a
                        href={banner.target_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {banner.target_url}
                      </a>
                    </p>
                  )}
                  <p className="text-sm">
                    <span className="font-medium">Sayfalar:</span> {banner.display_pages.join(', ')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!banners || banners.length === 0) && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ImageIcon className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Henüz banner eklenmemiş</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
