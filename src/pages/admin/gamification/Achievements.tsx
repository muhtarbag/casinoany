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
import { Plus, Pencil, Trash2, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingState } from '@/components/ui/loading-state';
import * as LucideIcons from 'lucide-react';

export default function AchievementsManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<any>(null);
  const [isActive, setIsActive] = useState(true);
  const queryClient = useQueryClient();

  const { data: achievements, isLoading } = useQuery({
    queryKey: ['achievements-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievement_definitions')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      return data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (achievement: any) => {
      const { error } = await supabase
        .from('achievement_definitions')
        .insert([achievement]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements-admin'] });
      toast.success('Başarı oluşturuldu');
      setIsDialogOpen(false);
      setEditingAchievement(null);
    },
    onError: () => {
      toast.error('Başarı oluşturulamadı');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (achievement: any) => {
      const { error } = await supabase
        .from('achievement_definitions')
        .update(achievement)
        .eq('id', achievement.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements-admin'] });
      toast.success('Başarı güncellendi');
      setIsDialogOpen(false);
      setEditingAchievement(null);
    },
    onError: () => {
      toast.error('Başarı güncellenemedi');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('achievement_definitions')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements-admin'] });
      toast.success('Başarı silindi');
    },
    onError: () => {
      toast.error('Başarı silinemedi');
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const achievement = {
      code: formData.get('code') as string,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      icon: formData.get('icon') as string,
      color: formData.get('color') as string,
      category: formData.get('category') as string,
      requirement_type: formData.get('requirement_type') as string,
      requirement_value: formData.get('requirement_value') ? Number(formData.get('requirement_value')) : null,
      points_reward: Number(formData.get('points_reward')),
      display_order: Number(formData.get('display_order')),
      is_active: isActive,
    };

    if (editingAchievement) {
      updateMutation.mutate({ ...achievement, id: editingAchievement.id });
    } else {
      createMutation.mutate(achievement);
    }
  };

  const handleDialogOpen = (achievement: any = null) => {
    setEditingAchievement(achievement);
    setIsActive(achievement?.is_active ?? true);
    setIsDialogOpen(true);
  };

  const getIconComponent = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="h-5 w-5 text-white" /> : <Trophy className="h-5 w-5 text-white" />;
  };

  if (isLoading) {
    return <LoadingState text="Başarılar yükleniyor..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Başarı Yönetimi</h1>
          <p className="text-muted-foreground">Kullanıcı başarılarını ve rozetlerini yönetin</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleDialogOpen()}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Başarı
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAchievement ? 'Başarıyı Düzenle' : 'Yeni Başarı Oluştur'}</DialogTitle>
              <DialogDescription>
                Kullanıcıların kazanabileceği yeni bir başarı tanımlayın
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Kod</Label>
                  <Input id="code" name="code" required defaultValue={editingAchievement?.code} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">İsim</Label>
                  <Input id="name" name="name" required defaultValue={editingAchievement?.name} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea id="description" name="description" required defaultValue={editingAchievement?.description} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="icon">İkon</Label>
                  <Input id="icon" name="icon" required defaultValue={editingAchievement?.icon} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Renk</Label>
                  <Input id="color" name="color" type="color" required defaultValue={editingAchievement?.color || '#3b82f6'} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Select name="category" defaultValue={editingAchievement?.category || 'activity'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="social">Sosyal</SelectItem>
                      <SelectItem value="loyalty">Sadakat</SelectItem>
                      <SelectItem value="activity">Aktivite</SelectItem>
                      <SelectItem value="special">Özel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requirement_type">Gereksinim Tipi</Label>
                  <Select name="requirement_type" defaultValue={editingAchievement?.requirement_type || 'count'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="count">Sayı</SelectItem>
                      <SelectItem value="milestone">Mil Taşı</SelectItem>
                      <SelectItem value="special">Özel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requirement_value">Gereksinim Değeri</Label>
                  <Input id="requirement_value" name="requirement_value" type="number" defaultValue={editingAchievement?.requirement_value || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="points_reward">Puan Ödülü</Label>
                  <Input id="points_reward" name="points_reward" type="number" required defaultValue={editingAchievement?.points_reward || 0} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display_order">Görüntüleme Sırası</Label>
                  <Input id="display_order" name="display_order" type="number" required defaultValue={editingAchievement?.display_order || 0} />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} />
                <Label htmlFor="is_active">Aktif</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  İptal
                </Button>
                <Button type="submit">
                  {editingAchievement ? 'Güncelle' : 'Oluştur'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tanımlı Başarılar</CardTitle>
          <CardDescription>Tüm başarıların listesi ve detayları</CardDescription>
        </CardHeader>
        <CardContent>
          {!achievements || achievements.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 mx-auto text-muted-foreground opacity-20 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Henüz başarı yok</h3>
              <p className="text-muted-foreground mb-4">Kullanıcılarınız için ilk başarıyı oluşturun</p>
              <Button onClick={() => handleDialogOpen()}>
                <Plus className="mr-2 h-4 w-4" />
                İlk Başarıyı Oluştur
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Başarı</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Puan</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {achievements.map((achievement) => (
                    <TableRow key={achievement.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" 
                            style={{ backgroundColor: achievement.color }}
                          >
                            {getIconComponent(achievement.icon)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{achievement.name}</p>
                            <p className="text-sm text-muted-foreground truncate">{achievement.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{achievement.category}</Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{achievement.points_reward} puan</TableCell>
                      <TableCell>
                        <Badge variant={achievement.is_active ? 'default' : 'secondary'}>
                          {achievement.is_active ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDialogOpen(achievement)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm('Bu başarıyı silmek istediğinizden emin misiniz?')) {
                                deleteMutation.mutate(achievement.id);
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
