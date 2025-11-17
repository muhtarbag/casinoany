import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Gift, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useState } from 'react';
import { ProfileLayout } from '@/components/profile/ProfileLayout';
import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton';

export default function BonusTracking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    site_id: '',
    bonus_type: '',
    bonus_amount: '',
    wagering_requirement: '',
    received_date: '',
    expiry_date: '',
    notes: ''
  });

  const { data: bonuses, isLoading } = useQuery({
    queryKey: ['user-bonuses', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_bonus_tracking')
        .select(`
          *,
          betting_sites (
            name,
            slug,
            logo_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const { data: sites } = useQuery({
    queryKey: ['active-sites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  const createBonusMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('user_bonus_tracking')
        .insert({
          ...data,
          user_id: user?.id,
          bonus_amount: parseFloat(data.bonus_amount)
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-bonuses'] });
      setIsDialogOpen(false);
      setFormData({
        site_id: '',
        bonus_type: '',
        bonus_amount: '',
        wagering_requirement: '',
        received_date: '',
        expiry_date: '',
        notes: ''
      });
      toast.success('Bonus başarıyla eklendi');
    },
    onError: () => {
      toast.error('Bonus eklenirken bir hata oluştu');
    }
  });

  const updateBonusStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('user_bonus_tracking')
        .update({ status })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-bonuses'] });
      toast.success('Bonus durumu güncellendi');
    },
    onError: () => {
      toast.error('Bonus durumu güncellenirken bir hata oluştu');
    }
  });

  const deleteBonusMutation = useMutation({
    mutationFn: async (bonusId: string) => {
      const { error } = await supabase
        .from('user_bonus_tracking')
        .delete()
        .eq('id', bonusId)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-bonuses'] });
      toast.success('Bonus başarıyla silindi');
    },
    onError: () => {
      toast.error('Bonus silinirken bir hata oluştu');
    }
  });

  if (!user) {
    return (
      <ProfileLayout>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              Bonus takibinizi görmek için lütfen giriş yapın.
            </p>
            <Button onClick={() => navigate('/login')}>Giriş Yap</Button>
          </CardContent>
        </Card>
      </ProfileLayout>
    );
  }

  const statusColors: Record<string, string> = {
    active: 'default',
    completed: 'success',
    expired: 'secondary',
    cancelled: 'destructive'
  };

  const statusLabels: Record<string, string> = {
    active: 'Aktif',
    completed: 'Tamamlandı',
    expired: 'Süresi Doldu',
    cancelled: 'İptal Edildi'
  };

  return (
    <>
      <SEO 
        title="Bonus Takibi"
        description="Aktif bonuslarınızı takip edin"
      />
      <ProfileLayout>
        <div className="flex justify-end mb-6">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Bonus Ekle
              </Button>
            </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Yeni Bonus Ekle</DialogTitle>
                  <DialogDescription>
                    Aldığınız bonusu takip etmek için bilgilerini girin
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Site</Label>
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
                      <Label>Bonus Türü</Label>
                      <Input
                        value={formData.bonus_type}
                        onChange={(e) => setFormData({ ...formData, bonus_type: e.target.value })}
                        placeholder="Ör: Hoş Geldin Bonusu"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Bonus Miktarı (TL)</Label>
                      <Input
                        type="number"
                        value={formData.bonus_amount}
                        onChange={(e) => setFormData({ ...formData, bonus_amount: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label>Çevrim Şartı</Label>
                      <Input
                        value={formData.wagering_requirement}
                        onChange={(e) => setFormData({ ...formData, wagering_requirement: e.target.value })}
                        placeholder="Ör: 10x"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Alındığı Tarih</Label>
                      <Input
                        type="date"
                        value={formData.received_date}
                        onChange={(e) => setFormData({ ...formData, received_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Son Kullanma Tarihi</Label>
                      <Input
                        type="date"
                        value={formData.expiry_date}
                        onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Notlar</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Bonus hakkında notlarınız"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => createBonusMutation.mutate(formData)}
                    disabled={!formData.site_id || !formData.bonus_type || !formData.bonus_amount || !formData.received_date || createBonusMutation.isPending}
                  >
                    Bonus Ekle
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Bonus Takibi</CardTitle>
          <CardDescription>
            Aldığınız bonusları takip edin ve çevrim şartlarını yönetin
          </CardDescription>
        </CardHeader>
      </Card>

      {isLoading ? (
        <ProfileSkeleton />
      ) : bonuses && bonuses.length > 0 ? (
            <div className="space-y-4">
              {bonuses.map((bonus: any) => (
                <Card key={bonus.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        {bonus.betting_sites?.logo_url && (
                          <img 
                            src={bonus.betting_sites.logo_url} 
                            alt={bonus.betting_sites.name}
                            className="w-12 h-12 rounded object-contain"
                          />
                        )}
                        <div>
                          <CardTitle className="text-lg">{bonus.bonus_type}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-muted-foreground">
                              {bonus.betting_sites?.name}
                            </span>
                            <Badge variant={statusColors[bonus.status] as any}>
                              {statusLabels[bonus.status]}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={bonus.status}
                          onValueChange={(value) => updateBonusStatusMutation.mutate({ id: bonus.id, status: value })}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Aktif</SelectItem>
                            <SelectItem value="completed">Tamamlandı</SelectItem>
                            <SelectItem value="expired">Süresi Doldu</SelectItem>
                            <SelectItem value="cancelled">İptal Edildi</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteBonusMutation.mutate(bonus.id)}
                          disabled={deleteBonusMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Bonus Miktarı</p>
                        <p className="text-xl font-bold text-primary">
                          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(bonus.bonus_amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Çevrim Şartı</p>
                        <p className="font-semibold">{bonus.wagering_requirement || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Alındığı Tarih</p>
                        <p className="font-semibold">
                          {format(new Date(bonus.received_date), 'dd MMM yyyy', { locale: tr })}
                        </p>
                      </div>
                      {bonus.expiry_date && (
                        <div>
                          <p className="text-sm text-muted-foreground">Son Kullanma</p>
                          <p className="font-semibold">
                            {format(new Date(bonus.expiry_date), 'dd MMM yyyy', { locale: tr })}
                          </p>
                        </div>
                      )}
                    </div>
                    {bonus.notes && (
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-sm">{bonus.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <Gift className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Henüz bonus eklemediniz
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                İlk Bonusu Ekle
              </Button>
            </CardContent>
          </Card>
        )}
      </ProfileLayout>
    </>
  );
}
