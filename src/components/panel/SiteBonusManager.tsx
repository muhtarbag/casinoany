import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  is_active: boolean;
  created_at: string;
}

interface SiteBonusManagerProps {
  siteId: string;
}

export const SiteBonusManager = ({ siteId }: SiteBonusManagerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBonus, setEditingBonus] = useState<BonusOffer | null>(null);
  const [deletingBonusId, setDeletingBonusId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    bonus_amount: '',
    bonus_type: 'no_deposit',
    wagering_requirement: '',
    terms: '',
    eligibility: '',
    validity_period: '',
  });

  // Fetch bonuses for this site
  const { data: bonuses, isLoading } = useQuery({
    queryKey: ['site-bonuses', siteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bonus_offers')
        .select('*')
        .eq('site_id', siteId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BonusOffer[];
    },
    enabled: !!siteId,
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
          .insert([{
            ...data,
            site_id: siteId,
            is_active: false, // Admin onayına kadar pasif
          }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-bonuses', siteId] });
      toast({
        title: 'Başarılı',
        description: editingBonus 
          ? 'Bonus güncellendi.' 
          : 'Bonus eklendi. Admin onayından sonra yayınlanacaktır.',
      });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'İşlem başarısız oldu.',
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
      queryClient.invalidateQueries({ queryKey: ['site-bonuses', siteId] });
      toast({
        title: 'Başarılı',
        description: 'Bonus silindi.',
      });
      setDeletingBonusId(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Silme işlemi başarısız oldu.',
        variant: 'destructive',
      });
    },
  });

  const handleOpenDialog = (bonus?: BonusOffer) => {
    if (bonus) {
      setEditingBonus(bonus);
      setFormData({
        title: bonus.title,
        bonus_amount: bonus.bonus_amount,
        bonus_type: bonus.bonus_type,
        wagering_requirement: bonus.wagering_requirement || '',
        terms: bonus.terms || '',
        eligibility: bonus.eligibility || '',
        validity_period: bonus.validity_period || '',
      });
    } else {
      setEditingBonus(null);
      setFormData({
        title: '',
        bonus_amount: '',
        bonus_type: 'no_deposit',
        wagering_requirement: '',
        terms: '',
        eligibility: '',
        validity_period: '',
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

  const getBonusTypeName = (type: string) => {
    const types: Record<string, string> = {
      'no_deposit': 'Deneme Bonusu',
      'welcome': 'Hoşgeldin Bonusu',
      'deposit': 'Yatırım Bonusu',
      'reload': 'Yeniden Yükleme',
      'cashback': 'Cashback',
      'free_spins': 'Bedava Spin',
      'other': 'Diğer',
    };
    return types[type] || type;
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <Badge className="bg-green-500/10 text-green-600 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Yayında
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200">
        <Clock className="w-3 h-3 mr-1" />
        Onay Bekliyor
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bonus & Kampanya Yönetimi</h2>
          <p className="text-muted-foreground">
            Siteniz için bonus ve kampanyalar ekleyin
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Bonus Ekle
        </Button>
      </div>

      {bonuses && bonuses.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {bonuses.map((bonus) => (
            <Card key={bonus.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{bonus.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {getBonusTypeName(bonus.bonus_type)}
                    </CardDescription>
                  </div>
                  {getStatusBadge(bonus.is_active)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Bonus Tutarı</p>
                    <p className="font-semibold">{bonus.bonus_amount}</p>
                  </div>
                  {bonus.wagering_requirement && (
                    <div>
                      <p className="text-muted-foreground">Çevirme Şartı</p>
                      <p className="font-semibold">{bonus.wagering_requirement}</p>
                    </div>
                  )}
                  {bonus.validity_period && (
                    <div>
                      <p className="text-muted-foreground">Geçerlilik</p>
                      <p className="font-semibold">{bonus.validity_period}</p>
                    </div>
                  )}
                  {bonus.eligibility && (
                    <div>
                      <p className="text-muted-foreground">Uygunluk</p>
                      <p className="font-semibold">{bonus.eligibility}</p>
                    </div>
                  )}
                </div>

                {bonus.terms && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Şartlar ve Koşullar:</p>
                    <p className="text-sm line-clamp-3">{bonus.terms}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(bonus)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Düzenle
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeletingBonusId(bonus.id)}
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Sil
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Henüz bonus eklenmemiş
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              İlk Bonusu Ekle
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Bonus Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBonus ? 'Bonus Düzenle' : 'Yeni Bonus Ekle'}
            </DialogTitle>
            <DialogDescription>
              {editingBonus 
                ? 'Bonus bilgilerini güncelleyin' 
                : 'Yeni bonus ekleyin. Admin onayından sonra yayınlanacaktır.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Bonus Başlığı *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Örn: %100 Hoşgeldin Bonusu"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bonus_type">Bonus Türü *</Label>
                <Select
                  value={formData.bonus_type}
                  onValueChange={(value) => setFormData({ ...formData, bonus_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_deposit">Deneme Bonusu</SelectItem>
                    <SelectItem value="welcome">Hoşgeldin Bonusu</SelectItem>
                    <SelectItem value="deposit">Yatırım Bonusu</SelectItem>
                    <SelectItem value="reload">Yeniden Yükleme</SelectItem>
                    <SelectItem value="cashback">Cashback</SelectItem>
                    <SelectItem value="free_spins">Bedava Spin</SelectItem>
                    <SelectItem value="other">Diğer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bonus_amount">Bonus Tutarı *</Label>
                <Input
                  id="bonus_amount"
                  value={formData.bonus_amount}
                  onChange={(e) => setFormData({ ...formData, bonus_amount: e.target.value })}
                  placeholder="Örn: 500 TL veya %100"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="wagering_requirement">Çevirme Şartı</Label>
                <Input
                  id="wagering_requirement"
                  value={formData.wagering_requirement}
                  onChange={(e) => setFormData({ ...formData, wagering_requirement: e.target.value })}
                  placeholder="Örn: 10x"
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
            </div>

            <div>
              <Label htmlFor="eligibility">Uygunluk Koşulları</Label>
              <Input
                id="eligibility"
                value={formData.eligibility}
                onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                placeholder="Örn: Yeni üyeler"
              />
            </div>

            <div>
              <Label htmlFor="terms">Şartlar ve Koşullar</Label>
              <Textarea
                id="terms"
                value={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                placeholder="Bonus kullanım şartlarını detaylı açıklayın..."
                rows={4}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                İptal
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingBonus ? 'Güncelle' : 'Ekle'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingBonusId} onOpenChange={() => setDeletingBonusId(null)}>
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
              onClick={() => deletingBonusId && deleteMutation.mutate(deletingBonusId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
