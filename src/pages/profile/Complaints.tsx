import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Plus } from 'lucide-react';
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
import { SiteAdditionRequestDialog } from '@/components/SiteAdditionRequestDialog';

export default function Complaints() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showAdditionDialog, setShowAdditionDialog] = useState(false);
  const [formData, setFormData] = useState({
    site_id: '',
    title: '',
    description: '',
    complaint_type: 'diger'
  });

  const { data: complaints, isLoading } = useQuery({
    queryKey: ['user-complaints', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('site_complaints')
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

  const createComplaintMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('site_complaints')
        .insert({
          site_id: data.site_id,
          user_id: user?.id,
          title: data.title,
          description: data.description,
          category: data.complaint_type,
          severity: 'normal',
          is_public: false, // Kullanıcı panelinden oluşturulan şikayetler varsayılan olarak özel
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-complaints'] });
      setIsDialogOpen(false);
      setFormData({ site_id: '', title: '', description: '', complaint_type: 'diger' });
      toast.success('Şikayetiniz başarıyla oluşturuldu');
    },
    onError: () => {
      toast.error('Şikayet oluşturulurken bir hata oluştu');
    }
  });

  if (!user) {
    return (
      <ProfileLayout>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              Şikayetlerinizi görmek için lütfen giriş yapın.
            </p>
            <Button onClick={() => navigate('/login')}>Giriş Yap</Button>
          </CardContent>
        </Card>
      </ProfileLayout>
    );
  }

  const statusColors: Record<string, string> = {
    open: 'destructive',
    in_review: 'secondary',
    resolved: 'default',
    closed: 'outline'
  };

  const statusLabels: Record<string, string> = {
    open: 'Açık',
    in_review: 'İnceleniyor',
    resolved: 'Çözüldü',
    closed: 'Kapalı'
  };

  const complaintTypeLabels: Record<string, string> = {
    odeme: 'Ödeme',
    bonus: 'Bonus',
    musteri_hizmetleri: 'Müşteri Hizmetleri',
    teknik: 'Teknik',
    guvenlik: 'Güvenlik',
    diger: 'Diğer'
  };

  return (
    <>
      <SEO 
        title="Şikayetlerim"
        description="Site şikayetlerinizi takip edin"
      />
      <ProfileLayout>
        <div className="mb-6 flex items-center justify-between">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Şikayet
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yeni Şikayet Oluştur</DialogTitle>
                  <DialogDescription>
                    Bir bahis sitesi hakkında şikayetinizi bildirin
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Site</Label>
                    <Select
                      value={formData.site_id}
                      onValueChange={(value) => setFormData({ ...formData, site_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Site seçin" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border z-50 max-h-[300px] overflow-y-auto">
                        <div className="border-b border-border mb-2 pb-2 px-2 pt-2">
                          <button
                            type="button"
                            className="w-full text-left px-3 py-2.5 text-sm font-medium text-primary hover:bg-accent hover:text-accent-foreground rounded-md transition-colors flex items-center gap-2"
                            onClick={() => {
                              setShowAdditionDialog(true);
                            }}
                          >
                            <span className="text-lg font-bold">+</span>
                            <span>Sitemi bulamıyorum, eklemek istiyorum</span>
                          </button>
                        </div>
                        {sites?.map((site) => (
                          <SelectItem key={site.id} value={site.id}>
                            {site.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Şikayet Türü</Label>
                    <Select
                      value={formData.complaint_type}
                      onValueChange={(value) => setFormData({ ...formData, complaint_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="odeme">Ödeme</SelectItem>
                        <SelectItem value="bonus">Bonus</SelectItem>
                        <SelectItem value="musteri_hizmetleri">Müşteri Hizmetleri</SelectItem>
                        <SelectItem value="teknik">Teknik</SelectItem>
                        <SelectItem value="guvenlik">Güvenlik</SelectItem>
                        <SelectItem value="diger">Diğer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Başlık</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Şikayet başlığı"
                    />
                  </div>
                  <div>
                    <Label>Açıklama</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Şikayetinizi detaylı olarak açıklayın"
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => createComplaintMutation.mutate(formData)}
                    disabled={!formData.site_id || !formData.title || !formData.description || createComplaintMutation.isPending}
                  >
                    Şikayet Oluştur
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Şikayetlerim</CardTitle>
            <CardDescription>
              Bahis siteleri hakkındaki şikayetlerinizi görüntüleyin ve takip edin
            </CardDescription>
          </CardHeader>
        </Card>

        {isLoading ? (
          <ProfileSkeleton />
        ) : complaints && complaints.length > 0 ? (
            <div className="space-y-4">
              {complaints.map((complaint: any) => (
                <Card key={complaint.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        {complaint.betting_sites?.logo_url && (
                          <img 
                            src={complaint.betting_sites.logo_url} 
                            alt={complaint.betting_sites.name}
                            className="w-12 h-12 rounded object-contain"
                          />
                        )}
                          <div>
                            <CardTitle className="text-lg">{complaint.title}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-muted-foreground">
                                {complaint.betting_sites?.name}
                              </span>
                              <Badge variant={statusColors[complaint.status] as any}>
                                {statusLabels[complaint.status]}
                              </Badge>
                              <Badge variant="outline">
                                {complaintTypeLabels[complaint.category]}
                              </Badge>
                              {!complaint.is_public && (
                                <Badge variant="secondary">Özel</Badge>
                              )}
                            </div>
                          </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{complaint.description}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(complaint.created_at), 'dd MMMM yyyy, HH:mm', { locale: tr })}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/sikayetler/${complaint.slug || complaint.id}`)}
                      >
                        {complaint.response_count > 0 
                          ? `${complaint.response_count} Cevap Görüntüle` 
                          : 'Detayları Görüntüle'
                        }
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  Henüz şikayetiniz bulunmuyor
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  İlk Şikayeti Oluştur
                </Button>
              </CardContent>
            </Card>
          )}
      </ProfileLayout>
      <SiteAdditionRequestDialog 
        open={showAdditionDialog} 
        onOpenChange={setShowAdditionDialog} 
      />
    </>
  );
}
