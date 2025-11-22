import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Eye, EyeOff, Trash2, ExternalLink, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';

const BANNER_LOCATIONS = [
  { value: 'hero', label: 'Homepage Hero', size: '1920x400' },
  { value: 'sidebar', label: 'Sidebar', size: '300x600' },
  { value: 'blog_inline', label: 'Blog Inline', size: '728x90' },
  { value: 'mobile_sticky', label: 'Mobile Sticky', size: '320x100' },
  { value: 'category_top', label: 'Category Top', size: '970x250' },
  { value: 'between_sites', label: 'Between Sites', size: '728x90' },
];

export default function BannerManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all banners
  const { data: banners, isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_banners')
        .select(`
          *,
          campaign:ad_campaigns(advertiser_name, campaign_status)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch campaigns for dropdown
  const { data: campaigns } = useQuery({
    queryKey: ['admin-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .select('id, advertiser_name, campaign_status')
        .in('campaign_status', ['active', 'pending']);

      if (error) throw error;
      return data;
    },
  });

  // Toggle banner active status
  const toggleBannerMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('ad_banners')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      toast({ title: 'Banner durumu güncellendi' });
    },
    onError: (error) => {
      toast({ 
        title: 'Hata', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  // Delete banner
  const deleteBannerMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ad_banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      toast({ title: 'Banner silindi' });
    },
    onError: (error) => {
      toast({ 
        title: 'Hata', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  const calculateCTR = (clicks: number, impressions: number) => {
    if (impressions === 0) return '0.00';
    return ((clicks / impressions) * 100).toFixed(2);
  };

  if (isLoading) {
    return <div className="p-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Banner Yönetimi</h1>
          <p className="text-muted-foreground mt-1">
            Reklam bannerlarını yönetin ve performanslarını takip edin
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yeni Banner Ekle</DialogTitle>
            </DialogHeader>
            <BannerForm 
              campaigns={campaigns || []} 
              onSuccess={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Toplam Banner</div>
          <div className="text-2xl font-bold mt-1">{banners?.length || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Aktif Banner</div>
          <div className="text-2xl font-bold mt-1 text-green-500">
            {banners?.filter(b => b.is_active).length || 0}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Toplam Gösterim</div>
          <div className="text-2xl font-bold mt-1">
            {banners?.reduce((sum, b) => sum + (b.current_impressions || 0), 0).toLocaleString()}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Toplam Tıklama</div>
          <div className="text-2xl font-bold mt-1">
            {banners?.reduce((sum, b) => sum + (b.current_clicks || 0), 0).toLocaleString()}
          </div>
        </Card>
      </div>

      {/* Banners List */}
      <div className="space-y-4">
        {BANNER_LOCATIONS.map((location) => {
          const locationBanners = banners?.filter(b => b.banner_location === location.value) || [];
          
          return (
            <Card key={location.value} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{location.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    Önerilen boyut: {location.size} • {locationBanners.length} banner
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {locationBanners.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Bu lokasyonda banner yok
                  </div>
                ) : (
                  locationBanners.map((banner) => (
                    <div 
                      key={banner.id}
                      className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      {/* Banner Preview */}
                      <img 
                        src={banner.image_url} 
                        alt={banner.banner_name}
                        className="w-32 h-20 object-cover rounded border border-border"
                      />

                      {/* Banner Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{banner.banner_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {(banner.campaign as any)?.advertiser_name}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>👁️ {banner.current_impressions?.toLocaleString()}</span>
                          <span>🖱️ {banner.current_clicks?.toLocaleString()}</span>
                          <span>CTR: {calculateCTR(banner.current_clicks || 0, banner.current_impressions || 0)}%</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(banner.click_url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingBanner(banner)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>

                        <Switch
                          checked={banner.is_active}
                          onCheckedChange={() => toggleBannerMutation.mutate({
                            id: banner.id,
                            isActive: banner.is_active
                          })}
                        />

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm('Bu banner\'ı silmek istediğinize emin misiniz?')) {
                              deleteBannerMutation.mutate(banner.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingBanner} onOpenChange={(open) => !open && setEditingBanner(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Banner Düzenle</DialogTitle>
          </DialogHeader>
          <BannerForm 
            campaigns={campaigns || []} 
            banner={editingBanner}
            onSuccess={() => setEditingBanner(null)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Banner Form Component
function BannerForm({ campaigns, banner, onSuccess }: { campaigns: any[]; banner?: any; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    campaign_id: banner?.campaign_id || '',
    banner_name: banner?.banner_name || '',
    banner_location: banner?.banner_location || '',
    banner_size: banner?.banner_size || '',
    image_url: banner?.image_url || '',
    mobile_image_url: banner?.mobile_image_url || '',
    click_url: banner?.click_url || '',
    alt_text: banner?.alt_text || '',
    priority: banner?.priority || 0,
    start_date: banner?.start_date ? format(new Date(banner.start_date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    end_date: banner?.end_date ? format(new Date(banner.end_date), 'yyyy-MM-dd') : '',
    cpm_rate: banner?.cpm_rate || 0,
    cpc_rate: banner?.cpc_rate || 0,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveBannerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        ...data,
        start_date: new Date(data.start_date).toISOString(),
        end_date: data.end_date ? new Date(data.end_date).toISOString() : null,
      };

      if (banner) {
        const { error } = await supabase
          .from('ad_banners')
          .update(payload)
          .eq('id', banner.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ad_banners')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      toast({ title: banner ? 'Banner güncellendi' : 'Banner oluşturuldu' });
      onSuccess();
    },
    onError: (error) => {
      toast({ 
        title: 'Hata', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveBannerMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Kampanya *</Label>
        {campaigns.length === 0 ? (
          <div className="p-4 border border-border rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-2">
              ⚠️ Henüz kampanya oluşturulmamış. Önce bir kampanya oluşturmalısınız.
            </p>
            <p className="text-xs text-muted-foreground">
              "Kampanyalar" sekmesine gidip yeni kampanya ekleyin.
            </p>
          </div>
        ) : (
          <Select 
            value={formData.campaign_id} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, campaign_id: value }))}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Kampanya seçin" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-popover">
              {campaigns.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.advertiser_name} ({campaign.campaign_status})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-2">
        <Label>Banner Adı</Label>
        <Input 
          value={formData.banner_name}
          onChange={(e) => setFormData(prev => ({ ...prev, banner_name: e.target.value }))}
          placeholder="Örn: Hero Banner - Aralık 2024"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Lokasyon</Label>
          <Select 
            value={formData.banner_location} 
            onValueChange={(value) => {
              const location = BANNER_LOCATIONS.find(l => l.value === value);
              setFormData(prev => ({ 
                ...prev, 
                banner_location: value,
                banner_size: location?.size || ''
              }));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Lokasyon seçin" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-popover">
              {BANNER_LOCATIONS.map((loc) => (
                <SelectItem key={loc.value} value={loc.value}>
                  {loc.label} ({loc.size})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Öncelik</Label>
          <Input 
            type="number"
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: Number(e.target.value) }))}
            placeholder="0-100"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Banner Görseli URL</Label>
        <Input 
          value={formData.image_url}
          onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
          placeholder="https://..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Mobil Görseli URL (Opsiyonel)</Label>
        <Input 
          value={formData.mobile_image_url}
          onChange={(e) => setFormData(prev => ({ ...prev, mobile_image_url: e.target.value }))}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-2">
        <Label>Tıklama URL'si</Label>
        <Input 
          value={formData.click_url}
          onChange={(e) => setFormData(prev => ({ ...prev, click_url: e.target.value }))}
          placeholder="https://..."
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Başlangıç Tarihi</Label>
          <Input 
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Bitiş Tarihi (Opsiyonel)</Label>
          <Input 
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>CPM Oranı (€)</Label>
          <Input 
            type="number"
            step="0.01"
            value={formData.cpm_rate}
            onChange={(e) => setFormData(prev => ({ ...prev, cpm_rate: Number(e.target.value) }))}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label>CPC Oranı (€)</Label>
          <Input 
            type="number"
            step="0.01"
            value={formData.cpc_rate}
            onChange={(e) => setFormData(prev => ({ ...prev, cpc_rate: Number(e.target.value) }))}
            placeholder="0.00"
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={saveBannerMutation.isPending || campaigns.length === 0}
      >
        {saveBannerMutation.isPending 
          ? (banner ? 'Güncelleniyor...' : 'Oluşturuluyor...') 
          : (banner ? 'Banner Güncelle' : 'Banner Oluştur')
        }
      </Button>
      
      {campaigns.length === 0 && (
        <p className="text-xs text-center text-muted-foreground">
          Önce bir kampanya oluşturmalısınız
        </p>
      )}
    </form>
  );
}
