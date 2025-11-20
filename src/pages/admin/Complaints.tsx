import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search, Eye, EyeOff, MessageSquare, CheckCircle, XCircle, Clock, Filter, Check, Ban, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminComplaints() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [approvalFilter, setApprovalFilter] = useState<string>('all');
  const [siteFilter, setSiteFilter] = useState<string>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [responseText, setResponseText] = useState('');

  const { data: complaints, isLoading } = useQuery({
    queryKey: ['admin-complaints', statusFilter, approvalFilter, siteFilter, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('site_complaints')
        .select(`
          *,
          betting_sites (name, slug, logo_url),
          profiles (username, email, first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (approvalFilter !== 'all') {
        query = query.eq('approval_status', approvalFilter);
      }

      if (siteFilter !== 'all') {
        query = query.eq('site_id', siteFilter);
      }

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: sites } = useQuery({
    queryKey: ['active-sites-for-filter'],
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

  const { data: responses } = useQuery({
    queryKey: ['complaint-responses', selectedComplaint?.id],
    queryFn: async () => {
      if (!selectedComplaint) return [];
      const { data, error } = await supabase
        .from('complaint_responses')
        .select(`
          *,
          profiles (username, email, first_name, last_name)
        `)
        .eq('complaint_id', selectedComplaint.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedComplaint,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('site_complaints')
        .update({ 
          status,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-complaints'] });
      toast({
        title: 'Başarılı',
        description: 'Şikayet durumu güncellendi',
      });
    },
  });

  const approveComplaintMutation = useMutation({
    mutationFn: async (id: string) => {
      // Get complaint details for notification
      const { data: complaint } = await supabase
        .from('site_complaints')
        .select('user_id, title')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('site_complaints')
        .update({ 
          approval_status: 'approved',
          is_public: true,
          approved_at: new Date().toISOString(),
          approved_by: user?.id
        })
        .eq('id', id);
      if (error) throw error;

      // Send notification to user
      if (complaint?.user_id) {
        await supabase
          .from('user_status_notifications')
          .insert({
            user_id: complaint.user_id,
            notification_type: 'complaint_approved',
            title: 'Şikayetiniz Onaylandı',
            message: `"${complaint.title}" başlıklı şikayetiniz onaylanarak yayınlandı.`
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-complaints'] });
      toast({
        title: 'Başarılı',
        description: 'Şikayet yayınlandı ve kullanıcıya bildirim gönderildi',
      });
      setSelectedComplaint(null);
    },
  });

  const rejectComplaintMutation = useMutation({
    mutationFn: async (id: string) => {
      // Get complaint details for notification
      const { data: complaint } = await supabase
        .from('site_complaints')
        .select('user_id, title')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('site_complaints')
        .update({ 
          approval_status: 'rejected',
          is_public: false
        })
        .eq('id', id);
      if (error) throw error;

      // Send notification to user
      if (complaint?.user_id) {
        await supabase
          .from('user_status_notifications')
          .insert({
            user_id: complaint.user_id,
            notification_type: 'complaint_rejected',
            title: 'Şikayetiniz İncelendi',
            message: `"${complaint.title}" başlıklı şikayetiniz incelendi ancak yayınlanamadı. Detaylı bilgi için destek ekibimizle iletişime geçebilirsiniz.`
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-complaints'] });
      toast({
        title: 'Başarılı',
        description: 'Şikayet reddedildi ve kullanıcıya bildirim gönderildi',
      });
      setSelectedComplaint(null);
    },
  });

  const deleteComplaintMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('site_complaints')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-complaints'] });
      toast({
        title: 'Başarılı',
        description: 'Şikayet silindi',
      });
      setSelectedComplaint(null);
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, isPublic }: { id: string; isPublic: boolean }) => {
      const { error } = await supabase
        .from('site_complaints')
        .update({ is_public: isPublic })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-complaints'] });
      if (selectedComplaint) {
        setSelectedComplaint({ ...selectedComplaint, is_public: !selectedComplaint.is_public });
      }
      toast({
        title: 'Başarılı',
        description: 'Görünürlük ayarı güncellendi',
      });
    },
  });

  const addResponseMutation = useMutation({
    mutationFn: async (text: string) => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw new Error('Oturum bilgisi alınamadı');
      if (!user) throw new Error('Oturum açmanız gerekiyor');
      
      const { error } = await supabase
        .from('complaint_responses')
        .insert({
          complaint_id: selectedComplaint.id,
          user_id: user.id,
          response_text: text,
          is_official: true,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaint-responses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-complaints'] });
      setResponseText('');
      toast({
        title: 'Başarılı',
        description: 'Yanıt eklendi',
      });
    },
  });

  const statusLabels: Record<string, string> = {
    open: 'Açık',
    in_review: 'İnceleniyor',
    resolved: 'Çözüldü',
    closed: 'Kapalı',
  };

  const approvalLabels: Record<string, string> = {
    pending: 'İnceleme Bekliyor',
    approved: 'Yayında',
    rejected: 'Reddedildi',
  };

  const approvalColors: Record<string, 'default' | 'destructive' | 'secondary'> = {
    pending: 'default',
    approved: 'secondary',
    rejected: 'destructive',
  };

  const statusColors: Record<string, 'destructive' | 'default' | 'secondary' | 'outline'> = {
    open: 'destructive',
    in_review: 'default',
    resolved: 'secondary',
    closed: 'outline',
  };

  const categoryLabels: Record<string, string> = {
    odeme: 'Ödeme',
    bonus: 'Bonus',
    musteri_hizmetleri: 'Müşteri Hizmetleri',
    teknik: 'Teknik',
    guvenlik: 'Güvenlik',
    diger: 'Diğer',
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <XCircle className="w-4 h-4" />;
      case 'in_review': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <>
      <SEO title="Şikayet Yönetimi" description="Kullanıcı şikayetlerini yönetin" />
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Şikayet Yönetimi</h1>
          <p className="text-muted-foreground mt-2">
            Kullanıcı şikayetlerini görüntüleyin ve yönetin
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtreler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Ara</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Şikayet ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label>Onay Durumu</Label>
                <Select value={approvalFilter} onValueChange={setApprovalFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="pending">İnceleme Bekliyor</SelectItem>
                    <SelectItem value="approved">Yayında</SelectItem>
                    <SelectItem value="rejected">Reddedildi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Durum</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="open">Açık</SelectItem>
                    <SelectItem value="in_review">İnceleniyor</SelectItem>
                    <SelectItem value="resolved">Çözüldü</SelectItem>
                    <SelectItem value="closed">Kapalı</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Site</Label>
                <Select value={siteFilter} onValueChange={setSiteFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Siteler</SelectItem>
                    {sites?.map((site) => (
                      <SelectItem key={site.id} value={site.id}>
                        {site.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Complaints List */}
        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-muted rounded" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : complaints && complaints.length > 0 ? (
          <div className="space-y-4">
            {complaints.map((complaint: any) => (
              <Card key={complaint.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {complaint.betting_sites?.logo_url && (
                        <img
                          src={complaint.betting_sites.logo_url}
                          alt={complaint.betting_sites.name}
                          className="w-16 h-16 object-contain rounded"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-semibold text-lg">{complaint.title}</h3>
                          <Badge variant={approvalColors[complaint.approval_status || 'pending']}>
                            {approvalLabels[complaint.approval_status || 'pending']}
                          </Badge>
                          <Badge variant={statusColors[complaint.status]}>
                            {statusLabels[complaint.status]}
                          </Badge>
                          <Badge variant="outline">
                            {categoryLabels[complaint.category]}
                          </Badge>
                          {complaint.is_public ? (
                            <Badge variant="default" className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              Herkese Açık
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <EyeOff className="w-3 h-3" />
                              Özel
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {complaint.betting_sites?.name}
                        </p>
                        <p className="text-sm mb-2">{complaint.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            {format(new Date(complaint.created_at), 'dd MMM yyyy, HH:mm', { locale: tr })}
                          </span>
                          {complaint.profiles && (
                            <span>
                              {complaint.profiles.first_name} {complaint.profiles.last_name} 
                              ({complaint.profiles.email})
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {complaint.response_count || 0} yanıt
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {complaint.approval_status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => approveComplaintMutation.mutate(complaint.id)}
                            disabled={approveComplaintMutation.isPending}
                            className="gap-2"
                          >
                            <Check className="w-4 h-4" />
                            Yayınla
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => rejectComplaintMutation.mutate(complaint.id)}
                            disabled={rejectComplaintMutation.isPending}
                            className="gap-2"
                          >
                            <Ban className="w-4 h-4" />
                            Reddet
                          </Button>
                        </>
                      )}
                      {complaint.approval_status === 'rejected' && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => approveComplaintMutation.mutate(complaint.id)}
                          disabled={approveComplaintMutation.isPending}
                          className="gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Yayınla
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedComplaint(complaint)}
                      >
                        Detaylar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (confirm('Bu şikayeti silmek istediğinize emin misiniz?')) {
                            deleteComplaintMutation.mutate(complaint.id);
                          }
                        }}
                        disabled={deleteComplaintMutation.isPending}
                        className="gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Sil
                      </Button>
                      <Select
                        value={complaint.status}
                        onValueChange={(status) => 
                          updateStatusMutation.mutate({ id: complaint.id, status })
                        }
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Açık</SelectItem>
                          <SelectItem value="in_review">İnceleniyor</SelectItem>
                          <SelectItem value="resolved">Çözüldü</SelectItem>
                          <SelectItem value="closed">Kapalı</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Şikayet bulunamadı</p>
            </CardContent>
          </Card>
        )}

        {/* Complaint Detail Dialog */}
        <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedComplaint?.title}</DialogTitle>
              <DialogDescription>
                {selectedComplaint?.betting_sites?.name} - Şikayet Detayları
              </DialogDescription>
            </DialogHeader>

            {selectedComplaint && (
              <div className="space-y-4">
                {/* Visibility Toggle */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {selectedComplaint.is_public ? (
                          <Eye className="h-5 w-5 text-primary" />
                        ) : (
                          <EyeOff className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <Label className="text-base font-semibold">
                            {selectedComplaint.is_public ? 'Herkese Açık' : 'Özel'}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {selectedComplaint.is_public
                              ? 'Şikayet /sikayetler sayfasında görünüyor'
                              : 'Şikayet sadece kullanıcı ve yöneticiler tarafından görülebilir'}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={selectedComplaint.is_public}
                        onCheckedChange={(checked) =>
                          toggleVisibilityMutation.mutate({
                            id: selectedComplaint.id,
                            isPublic: checked,
                          })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Complaint Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Şikayet İçeriği</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{selectedComplaint.description}</p>
                  </CardContent>
                </Card>

                {/* Responses */}
                <Card>
                  <CardHeader>
                    <CardTitle>Yanıtlar ({responses?.length || 0})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {responses && responses.length > 0 ? (
                      responses.map((response: any) => (
                        <div
                          key={response.id}
                          className={`p-4 rounded-lg ${
                            response.is_official
                              ? 'bg-primary/10 border border-primary/20'
                              : 'bg-muted'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">
                                {response.profiles?.first_name} {response.profiles?.last_name}
                              </span>
                              {response.is_official && (
                                <Badge variant="default" className="text-xs">
                                  Resmi Yanıt
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(response.created_at), 'dd MMM yyyy, HH:mm', {
                                locale: tr,
                              })}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{response.response_text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Henüz yanıt yok
                      </p>
                    )}

                    {/* Add Response */}
                    <div className="space-y-2 pt-4 border-t">
                      <Label>Yanıt Ekle (Resmi Yanıt)</Label>
                      <Textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Yanıtınızı yazın..."
                        rows={4}
                      />
                      <Button
                        onClick={() => addResponseMutation.mutate(responseText)}
                        disabled={!responseText.trim() || addResponseMutation.isPending}
                      >
                        Yanıt Gönder
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
