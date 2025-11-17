import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThumbsUp, MessageSquare, ArrowLeft, CheckCircle, Shield, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const ComplaintDetail = () => {
  const { id } = useParams();
  const { user, isSiteOwner, ownedSites, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [responseText, setResponseText] = useState('');

  const { data: complaint, isLoading } = useQuery({
    queryKey: ['complaint', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_complaints')
        .select(`
          *,
          betting_sites (name, slug, logo_url)
        `)
        .eq('id', id)
        .maybeSingle(); // ✅ FIX: Use maybeSingle to prevent crash
      
      if (error) throw error;
      if (!data) throw new Error('Complaint not found');
      return data;
    },
  });

  const { data: responses } = useQuery({
    queryKey: ['complaint-responses', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('complaint_responses')
        .select(`
          *,
          profiles (username, email, first_name, last_name)
        `)
        .eq('complaint_id', id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const isOwnerOfThisSite = complaint && isSiteOwner && ownedSites.includes(complaint.site_id);

  const upvoteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('site_complaints')
        .update({ upvotes: (complaint?.upvotes || 0) + 1 })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaint', id] });
    },
  });

  const addResponseMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!user) throw new Error('Giriş yapmalısınız');
      
      const { error } = await supabase
        .from('complaint_responses')
        .insert({
          complaint_id: id,
          user_id: user.id,
          response_text: text,
          is_site_owner_response: isOwnerOfThisSite || false,
          is_official: isOwnerOfThisSite || false,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaint-responses', id] });
      setResponseText('');
      toast({
        title: 'Başarılı',
        description: 'Cevabınız eklendi',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Cevap eklenirken bir hata oluştu',
        variant: 'destructive',
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const { error } = await supabase
        .from('site_complaints')
        .update({ 
          status: newStatus,
          resolved_at: newStatus === 'resolved' ? new Date().toISOString() : null
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaint', id] });
      toast({
        title: 'Başarılı',
        description: 'Şikayet durumu güncellendi',
      });
    },
  });

  const togglePublicMutation = useMutation({
    mutationFn: async (isPublic: boolean) => {
      const { error } = await supabase
        .from('site_complaints')
        .update({ is_public: isPublic })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaint', id] });
      toast({
        title: 'Başarılı',
        description: 'Görünürlük ayarı güncellendi',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Güncelleme sırasında bir hata oluştu',
        variant: 'destructive',
      });
    },
  });

  const categoryLabels: Record<string, string> = {
    odeme: 'Ödeme',
    bonus: 'Bonus',
    musteri_hizmetleri: 'Müşteri Hizmetleri',
    teknik: 'Teknik',
    guvenlik: 'Güvenlik',
    diger: 'Diğer',
  };

  const statusLabels: Record<string, string> = {
    open: 'Açık',
    in_review: 'İnceleniyor',
    resolved: 'Çözüldü',
    closed: 'Kapalı',
  };

  const severityLabels: Record<string, string> = {
    low: 'Düşük',
    normal: 'Normal',
    high: 'Yüksek',
    critical: 'Kritik',
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'in_review': return 'default';
      case 'resolved': return 'secondary';
      case 'closed': return 'outline';
      default: return 'default';
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'low': return 'secondary';
      case 'normal': return 'default';
      case 'high': return 'destructive';
      case 'critical': return 'destructive';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!complaint) {
    return (
      <>
        <SEO title="Şikayet Bulunamadı" description="Aradığınız şikayet bulunamadı" />
        <Header />
        <div className="min-h-screen bg-gradient-dark">
          <div className="container mx-auto px-4 py-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Şikayet bulunamadı</p>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const canManageComplaint = isAdmin || isOwnerOfThisSite;
  const isOwnComplaint = user && complaint.user_id === user.id;

  return (
    <>
      <SEO 
        title={complaint.title}
        description={complaint.description.substring(0, 160)}
      />
      <Header />
      <div className="min-h-screen bg-gradient-dark">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/sikayetler">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Link>
        </Button>

        {/* Visibility Control for Own Complaints */}
        {isOwnComplaint && complaint.status === 'open' && (
          <Card className="mb-4 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {complaint.is_public ? (
                    <Eye className="h-5 w-5 text-primary" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <Label htmlFor="visibility-toggle" className="text-base font-semibold cursor-pointer">
                      {complaint.is_public ? 'Herkese Açık' : 'Özel'}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {complaint.is_public 
                        ? 'Şikayetiniz /sikayetler sayfasında görünüyor' 
                        : 'Şikayet sadece sizin ve site yöneticileri tarafından görülebilir'}
                    </p>
                  </div>
                </div>
                <Switch
                  id="visibility-toggle"
                  checked={complaint.is_public}
                  onCheckedChange={(checked) => togglePublicMutation.mutate(checked)}
                  disabled={togglePublicMutation.isPending}
                />
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start gap-4">
              {complaint.betting_sites?.logo_url && (
                <img
                  src={complaint.betting_sites.logo_url}
                  alt={complaint.betting_sites.name}
                  className="w-16 h-16 object-contain rounded"
                />
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <CardTitle className="text-2xl mb-2">{complaint.title}</CardTitle>
                    <Link
                      to={`/site/${complaint.betting_sites.slug}`}
                      className="text-primary hover:underline font-semibold"
                    >
                      {complaint.betting_sites.name}
                    </Link>
                  </div>
                  {canManageComplaint && (
                    <Select
                      value={complaint.status}
                      onValueChange={(value) => updateStatusMutation.mutate(value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Açık</SelectItem>
                        <SelectItem value="in_review">İnceleniyor</SelectItem>
                        <SelectItem value="resolved">Çözüldü</SelectItem>
                        <SelectItem value="closed">Kapalı</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={getStatusVariant(complaint.status)}>
                    {statusLabels[complaint.status]}
                  </Badge>
                  <Badge variant="outline">
                    {categoryLabels[complaint.category]}
                  </Badge>
                  <Badge variant={getSeverityVariant(complaint.severity)}>
                    {severityLabels[complaint.severity]}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 whitespace-pre-wrap">
              {complaint.description}
            </p>

            {complaint.status === 'resolved' && complaint.resolved_at && (
              <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <p className="font-semibold text-success">Şikayet Çözüldü</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(new Date(complaint.resolved_at), 'dd MMMM yyyy, HH:mm', { locale: tr })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => upvoteMutation.mutate()}
                disabled={upvoteMutation.isPending}
              >
                <ThumbsUp className="w-4 h-4 mr-1" />
                {complaint.upvotes}
              </Button>
              <span className="text-sm text-muted-foreground">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                {complaint.response_count} cevap
              </span>
              <span className="text-sm text-muted-foreground ml-auto">
                {complaint.user_id ? 'Kullanıcı' : complaint.anonymous_name}
                {' • '}
                {format(new Date(complaint.created_at), 'dd MMMM yyyy HH:mm', { locale: tr })}
              </span>
            </div>
          </CardContent>
        </Card>

        {responses && responses.length > 0 && (
          <div className="space-y-4 mb-6">
            <h2 className="text-xl font-semibold">Cevaplar ({responses.length})</h2>
            {responses.map((response: any) => (
              <Card key={response.id} className={response.is_official ? 'border-primary' : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {response.is_official && (
                        <Badge className="bg-primary">
                          <Shield className="w-3 h-3 mr-1" />
                          Resmi Yanıt
                        </Badge>
                      )}
                      {response.is_site_owner_response && !response.is_official && (
                        <Badge variant="secondary">
                          Site Yetkilisi
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm mb-3 whitespace-pre-wrap">
                    {response.response_text}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {response.profiles?.first_name || response.profiles?.username || response.profiles?.email}
                    </span>
                    <span>
                      {format(new Date(response.created_at), 'dd MMMM yyyy HH:mm', { locale: tr })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {user ? (
          <Card>
            <CardHeader>
              <CardTitle>Cevap Yaz</CardTitle>
            </CardHeader>
            <CardContent>
              {isOwnerOfThisSite && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4">
                  <p className="text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Bu sitenin yetkilisi olarak resmi yanıt vereceksiniz
                  </p>
                </div>
              )}
              <Textarea
                placeholder="Cevabınızı yazın..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={4}
                className="mb-4"
              />
              <Button
                onClick={() => addResponseMutation.mutate(responseText)}
                disabled={!responseText.trim() || addResponseMutation.isPending}
              >
                {addResponseMutation.isPending ? 'Gönderiliyor...' : 'Cevap Gönder'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">
                Cevap yazmak için giriş yapmalısınız
              </p>
              <Button asChild>
                <Link to="/login">Giriş Yap</Link>
              </Button>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ComplaintDetail;
