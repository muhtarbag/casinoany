import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Gift } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingState } from '@/components/ui/loading-state';

export default function RewardsManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: rewards, isLoading } = useQuery({
    queryKey: ['rewards-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      return data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (reward: any) => {
      const { error } = await supabase
        .from('loyalty_rewards')
        .insert([reward]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards-admin'] });
      toast.success('Ödül oluşturuldu');
      setIsDialogOpen(false);
      setEditingReward(null);
    },
    onError: () => {
      toast.error('Ödül oluşturulamadı');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (reward: any) => {
      const { error } = await supabase
        .from('loyalty_rewards')
        .update(reward)
        .eq('id', reward.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards-admin'] });
      toast.success('Ödül güncellendi');
      setIsDialogOpen(false);
      setEditingReward(null);
    },
    onError: () => {
      toast.error('Ödül güncellenemedi');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('loyalty_rewards')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards-admin'] });
      toast.success('Ödül silindi');
    },
    onError: () => {
      toast.error('Ödül silinemedi');
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const reward = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      points_cost: Number(formData.get('points_cost')),
      reward_type: formData.get('reward_type') as string,
      reward_value: formData.get('reward_value') as string,
      min_tier: formData.get('min_tier') as string,
      terms: formData.get('terms') as string,
      display_order: Number(formData.get('display_order')),
      stock_quantity: formData.get('stock_quantity') ? Number(formData.get('stock_quantity')) : null,
      is_active: formData.get('is_active') === 'true',
    };

    if (editingReward) {
      updateMutation.mutate({ ...reward, id: editingReward.id });
    } else {
      createMutation.mutate(reward);
    }
  };

  const getRewardTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      bonus: 'Bonus',
      cashback: 'Cashback',
      free_spin: 'Free Spin',
      vip_access: 'VIP Erişim',
      custom: 'Özel'
    };
    return types[type] || type;
  };

  if (isLoading) {
    return <LoadingState text="Ödüller yükleniyor..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ödül Yönetimi</h1>
          <p className="text-muted-foreground">Sadakat ödüllerini ve kampanyalarını yönetin</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingReward(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Ödül
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingReward ? 'Ödülü Düzenle' : 'Yeni Ödül Oluştur'}</DialogTitle>
              <DialogDescription>
                Kullanıcıların puanlarıyla alabileceği yeni bir ödül tanımlayın
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Başlık</Label>
                  <Input id="title" name="title" required defaultValue={editingReward?.title} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="points_cost">Puan Maliyeti</Label>
                  <Input id="points_cost" name="points_cost" type="number" required defaultValue={editingReward?.points_cost} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea id="description" name="description" required defaultValue={editingReward?.description} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reward_type">Ödül Tipi</Label>
                  <Select name="reward_type" defaultValue={editingReward?.reward_type || 'bonus'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bonus">Bonus</SelectItem>
                      <SelectItem value="cashback">Cashback</SelectItem>
                      <SelectItem value="free_spin">Free Spin</SelectItem>
                      <SelectItem value="vip_access">VIP Erişim</SelectItem>
                      <SelectItem value="custom">Özel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reward_value">Ödül Değeri</Label>
                  <Input id="reward_value" name="reward_value" defaultValue={editingReward?.reward_value} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min_tier">Minimum Tier</Label>
                  <Select name="min_tier" defaultValue={editingReward?.min_tier || 'bronze'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bronze">Bronze</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="platinum">Platinum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Stok Miktarı (opsiyonel)</Label>
                  <Input id="stock_quantity" name="stock_quantity" type="number" defaultValue={editingReward?.stock_quantity || ''} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="terms">Şartlar ve Koşullar</Label>
                <Textarea id="terms" name="terms" defaultValue={editingReward?.terms} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_order">Görüntüleme Sırası</Label>
                <Input id="display_order" name="display_order" type="number" required defaultValue={editingReward?.display_order || 0} />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="is_active" name="is_active" defaultChecked={editingReward?.is_active ?? true} />
                <Label htmlFor="is_active">Aktif</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  İptal
                </Button>
                <Button type="submit">
                  {editingReward ? 'Güncelle' : 'Oluştur'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tanımlı Ödüller</CardTitle>
          <CardDescription>Tüm ödüllerin listesi ve detayları</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ödül</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead>Maliyet</TableHead>
                <TableHead>Min. Tier</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rewards?.map((reward) => (
                <TableRow key={reward.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Gift className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{reward.title}</p>
                        <p className="text-sm text-muted-foreground">{reward.description}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getRewardTypeLabel(reward.reward_type)}</Badge>
                  </TableCell>
                  <TableCell>{reward.points_cost} puan</TableCell>
                  <TableCell>
                    <Badge>{reward.min_tier.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={reward.is_active ? 'default' : 'secondary'}>
                      {reward.is_active ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingReward(reward);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('Bu ödülü silmek istediğinizden emin misiniz?')) {
                            deleteMutation.mutate(reward.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
