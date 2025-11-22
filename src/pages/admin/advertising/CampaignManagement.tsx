import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, TrendingUp, DollarSign, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function CampaignManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch campaigns with stats
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['admin-campaigns-full'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .select(`
          *,
          banners:ad_banners(count),
          revenue:ad_revenue(revenue_amount)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Update campaign status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('ad_campaigns')
        .update({ campaign_status: status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns-full'] });
      toast({ title: 'Kampanya durumu güncellendi' });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: { variant: 'default', label: 'Aktif' },
      pending: { variant: 'secondary', label: 'Beklemede' },
      paused: { variant: 'outline', label: 'Durduruldu' },
      completed: { variant: 'secondary', label: 'Tamamlandı' },
      rejected: { variant: 'destructive', label: 'Reddedildi' },
    };

    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const calculateTotalRevenue = (campaign: any) => {
    if (!campaign.revenue) return 0;
    return campaign.revenue.reduce((sum: number, r: any) => sum + (r.revenue_amount || 0), 0);
  };

  if (isLoading) {
    return <div className="p-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kampanya Yönetimi</h1>
          <p className="text-muted-foreground mt-1">
            Reklam kampanyalarını yönetin
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Kampanya
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Yeni Kampanya Oluştur</DialogTitle>
            </DialogHeader>
            <CampaignForm onSuccess={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Toplam Kampanya</span>
          </div>
          <div className="text-2xl font-bold">{campaigns?.length || 0}</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Eye className="w-4 h-4" />
            <span className="text-sm">Aktif Kampanya</span>
          </div>
          <div className="text-2xl font-bold text-green-500">
            {campaigns?.filter(c => c.campaign_status === 'active').length || 0}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Toplam Gelir</span>
          </div>
          <div className="text-2xl font-bold">
            €{campaigns?.reduce((sum, c) => sum + calculateTotalRevenue(c), 0).toFixed(2)}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Bekleyen</span>
          </div>
          <div className="text-2xl font-bold text-yellow-500">
            {campaigns?.filter(c => c.campaign_status === 'pending').length || 0}
          </div>
        </Card>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns?.map((campaign) => (
          <Card key={campaign.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">{campaign.advertiser_name}</h3>
                  {getStatusBadge(campaign.campaign_status)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">E-posta</div>
                    <div className="font-medium">{campaign.advertiser_email}</div>
                  </div>

                  <div>
                    <div className="text-muted-foreground">Telefon</div>
                    <div className="font-medium">{campaign.advertiser_phone || '-'}</div>
                  </div>

                  <div>
                    <div className="text-muted-foreground">Kampanya Tipi</div>
                    <div className="font-medium capitalize">{campaign.campaign_type}</div>
                  </div>

                  <div>
                    <div className="text-muted-foreground">Banner Sayısı</div>
                    <div className="font-medium">{(campaign.banners as any)?.[0]?.count || 0}</div>
                  </div>

                  <div>
                    <div className="text-muted-foreground">Başlangıç</div>
                    <div className="font-medium">
                      {format(new Date(campaign.start_date), 'dd MMM yyyy', { locale: tr })}
                    </div>
                  </div>

                  <div>
                    <div className="text-muted-foreground">Bitiş</div>
                    <div className="font-medium">
                      {campaign.end_date 
                        ? format(new Date(campaign.end_date), 'dd MMM yyyy', { locale: tr })
                        : 'Belirsiz'
                      }
                    </div>
                  </div>

                  <div>
                    <div className="text-muted-foreground">Bütçe</div>
                    <div className="font-medium">€{campaign.total_budget?.toFixed(2)}</div>
                  </div>

                  <div>
                    <div className="text-muted-foreground">Gelir</div>
                    <div className="font-medium text-green-600">
                      €{calculateTotalRevenue(campaign).toFixed(2)}
                    </div>
                  </div>
                </div>

                {campaign.notes && (
                  <div className="mt-4 p-3 bg-muted rounded-md text-sm">
                    <div className="text-muted-foreground mb-1">Notlar:</div>
                    <div>{campaign.notes}</div>
                  </div>
                )}
              </div>

              {/* Status Actions */}
              <div className="flex flex-col gap-2 ml-4">
                {campaign.campaign_status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => updateStatusMutation.mutate({
                        id: campaign.id,
                        status: 'active'
                      })}
                    >
                      Onayla
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateStatusMutation.mutate({
                        id: campaign.id,
                        status: 'rejected'
                      })}
                    >
                      Reddet
                    </Button>
                  </>
                )}

                {campaign.campaign_status === 'active' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatusMutation.mutate({
                      id: campaign.id,
                      status: 'paused'
                    })}
                  >
                    Durdur
                  </Button>
                )}

                {campaign.campaign_status === 'paused' && (
                  <Button
                    size="sm"
                    onClick={() => updateStatusMutation.mutate({
                      id: campaign.id,
                      status: 'active'
                    })}
                  >
                    Aktifleştir
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Campaign Form
function CampaignForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    advertiser_name: '',
    advertiser_email: '',
    advertiser_phone: '',
    advertiser_company: '',
    campaign_type: 'banner',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: '',
    total_budget: 0,
    notes: '',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createCampaignMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('ad_campaigns')
        .insert({
          ...data,
          end_date: data.end_date || null,
          campaign_status: 'pending',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns-full'] });
      toast({ title: 'Kampanya oluşturuldu' });
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
    createCampaignMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Reklam Veren Adı *</Label>
          <Input 
            value={formData.advertiser_name}
            onChange={(e) => setFormData(prev => ({ ...prev, advertiser_name: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Firma Adı</Label>
          <Input 
            value={formData.advertiser_company}
            onChange={(e) => setFormData(prev => ({ ...prev, advertiser_company: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>E-posta *</Label>
          <Input 
            type="email"
            value={formData.advertiser_email}
            onChange={(e) => setFormData(prev => ({ ...prev, advertiser_email: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Telefon</Label>
          <Input 
            value={formData.advertiser_phone}
            onChange={(e) => setFormData(prev => ({ ...prev, advertiser_phone: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Kampanya Tipi</Label>
        <Select 
          value={formData.campaign_type}
          onValueChange={(value) => setFormData(prev => ({ ...prev, campaign_type: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="banner">Banner Reklamı</SelectItem>
            <SelectItem value="sponsored_content">Sponsorlu İçerik</SelectItem>
            <SelectItem value="featured_placement">Öne Çıkarılmış Yerleşim</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Başlangıç Tarihi *</Label>
          <Input 
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Bitiş Tarihi</Label>
          <Input 
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Toplam Bütçe (€)</Label>
        <Input 
          type="number"
          step="0.01"
          value={formData.total_budget}
          onChange={(e) => setFormData(prev => ({ ...prev, total_budget: Number(e.target.value) }))}
        />
      </div>

      <div className="space-y-2">
        <Label>Notlar</Label>
        <Textarea 
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" disabled={createCampaignMutation.isPending}>
        {createCampaignMutation.isPending ? 'Oluşturuluyor...' : 'Kampanya Oluştur'}
      </Button>
    </form>
  );
}
