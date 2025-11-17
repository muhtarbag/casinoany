import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageSquare, Send, Filter, Search, AlertCircle, CheckCircle2, Clock, Inbox } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AdvancedSearch, SearchQuery } from './filters/AdvancedSearch';
import { EnhancedEmptyState } from './EnhancedEmptyState';
import { LoadingState } from '@/components/admin/LoadingState';

interface SiteComplaintsManagerProps {
  siteId: string;
}

export const SiteComplaintsManager = ({ siteId }: SiteComplaintsManagerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [responseText, setResponseText] = useState('');
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({ term: '' });

  // Fetch complaints
  const { data: complaints, isLoading } = useQuery({
    queryKey: ['site-complaints', siteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_complaints')
        .select(`
          *,
          complaint_responses(
            id,
            response_text,
            created_at,
            is_official,
            is_site_owner_response,
            user_id
          )
        `)
        .eq('site_id', siteId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!siteId,
  });

  // Add response mutation
  const addResponseMutation = useMutation({
    mutationFn: async ({ complaintId, text }: { complaintId: string; text: string }) => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw new Error('Oturum bilgisi alınamadı');
      if (!user) throw new Error('Oturum açmanız gerekiyor');

      const { error } = await supabase
        .from('complaint_responses')
        .insert({
          complaint_id: complaintId,
          user_id: user.id,
          response_text: text,
          is_site_owner_response: true,
          is_official: true,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-complaints', siteId] });
      queryClient.invalidateQueries({ queryKey: ['owned-site-full'] });
      setResponseText('');
      setSelectedComplaint(null);
      toast({
        title: 'Başarılı',
        description: 'Cevabınız gönderildi',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Cevap gönderilemedi',
        variant: 'destructive',
      });
    },
  });

  // Filter complaints
  const filteredComplaints = complaints?.filter((complaint) => {
    const matchesSearch = 
      complaint.title.toLowerCase().includes(searchQuery.term.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchQuery.term.toLowerCase());
    const matchesStatus = !searchQuery.status || searchQuery.status === 'all' || complaint.status === searchQuery.status;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return <LoadingState variant="spinner" text="Şikayetler yükleniyor..." />;
  }

  if (!filteredComplaints || filteredComplaints.length === 0) {
    return (
      <EnhancedEmptyState
        icon={Inbox}
        title="Henüz şikayet yok"
        description="Siteniz hakkında henüz şikayet bulunmuyor. Müşteri memnuniyeti için çalışmaya devam edin!"
        variant="centered"
      />
    );
  }

  // Calculate stats
  const stats = {
    total: complaints?.length || 0,
    pending: complaints?.filter(c => c.status === 'pending').length || 0,
    inProgress: complaints?.filter(c => c.status === 'in_progress').length || 0,
    resolved: complaints?.filter(c => c.status === 'resolved').length || 0,
    highPriority: complaints?.filter(c => c.severity === 'high').length || 0,
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'secondary', label: 'Beklemede', icon: Clock },
      in_progress: { variant: 'default', label: 'İnceleniyor', icon: AlertCircle },
      resolved: { variant: 'outline', label: 'Çözüldü', icon: CheckCircle2 },
    };
    return variants[status] || variants.pending;
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, any> = {
      low: { variant: 'outline', label: 'Düşük' },
      medium: { variant: 'secondary', label: 'Orta' },
      high: { variant: 'destructive', label: 'Yüksek' },
    };
    return variants[severity] || variants.low;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Toplam</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Beklemede</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">İnceleniyor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Çözüldü</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Yüksek Öncelik</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.highPriority}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {/* Search & Filters */}
      <AdvancedSearch
        onSearch={setSearchQuery}
        placeholder="Şikayet başlığı veya açıklama ara..."
        filters={[
          {
            key: 'status',
            label: 'Durum',
            options: [
              { value: 'all', label: 'Tümü' },
              { value: 'pending', label: 'Beklemede' },
              { value: 'in_progress', label: 'İnceleniyor' },
              { value: 'resolved', label: 'Çözüldü' },
            ],
          },
          {
            key: 'sortBy',
            label: 'Sırala',
            options: [
              { value: 'newest', label: 'En yeni' },
              { value: 'oldest', label: 'En eski' },
              { value: 'priority', label: 'Öncelik' },
            ],
          },
        ]}
      />

      {/* Complaints List */}
      <div className="space-y-4">
        {filteredComplaints && filteredComplaints.length > 0 ? (
          filteredComplaints.map((complaint) => {
            const statusInfo = getStatusBadge(complaint.status);
            const severityInfo = getSeverityBadge(complaint.severity);
            const StatusIcon = statusInfo.icon;
            const hasOwnerResponse = complaint.complaint_responses?.some(
              (r: any) => r.is_site_owner_response
            );

            return (
              <Card key={complaint.id} className={hasOwnerResponse ? 'border-green-200 dark:border-green-900' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-lg">{complaint.title}</CardTitle>
                        <Badge {...severityInfo} />
                        <Badge {...statusInfo}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                        {hasOwnerResponse && (
                          <Badge variant="outline" className="bg-green-50 dark:bg-green-950">
                            Cevaplanmış
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        {formatDistanceToNow(new Date(complaint.created_at), {
                          addSuffix: true,
                          locale: tr,
                        })}
                        {complaint.complaint_responses?.length > 0 && (
                          <span className="ml-2">
                            • {complaint.complaint_responses.length} cevap
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedComplaint(complaint)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Detay & Cevapla
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{complaint.title}</DialogTitle>
                          <DialogDescription>
                            {formatDistanceToNow(new Date(complaint.created_at), {
                              addSuffix: true,
                              locale: tr,
                            })}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Şikayet Detayı</h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {complaint.description}
                            </p>
                          </div>

                          {complaint.complaint_responses && complaint.complaint_responses.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2">Cevaplar ({complaint.complaint_responses.length})</h4>
                              <div className="space-y-3">
                                {complaint.complaint_responses.map((response: any) => (
                                  <div
                                    key={response.id}
                                    className={`p-3 rounded-lg ${
                                      response.is_site_owner_response
                                        ? 'bg-primary/10 border border-primary/20'
                                        : 'bg-muted'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      {response.is_site_owner_response && (
                                        <Badge variant="outline" className="text-xs">
                                          Site Sahibi
                                        </Badge>
                                      )}
                                      {response.is_official && (
                                        <Badge variant="secondary" className="text-xs">
                                          Resmi Yanıt
                                        </Badge>
                                      )}
                                      <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(response.created_at), {
                                          addSuffix: true,
                                          locale: tr,
                                        })}
                                      </span>
                                    </div>
                                    <p className="text-sm whitespace-pre-wrap">{response.response_text}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div>
                            <h4 className="font-semibold mb-2">Cevabınız</h4>
                            <Textarea
                              placeholder="Şikayete cevabınızı yazın..."
                              value={responseText}
                              onChange={(e) => setResponseText(e.target.value)}
                              rows={4}
                              className="mb-2"
                            />
                            <Button
                              onClick={() => {
                                if (responseText.trim()) {
                                  addResponseMutation.mutate({
                                    complaintId: complaint.id,
                                    text: responseText,
                                  });
                                }
                              }}
                              disabled={!responseText.trim() || addResponseMutation.isPending}
                              className="w-full"
                            >
                              {addResponseMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Gönderiliyor...
                                </>
                              ) : (
                                <>
                                  <Send className="mr-2 h-4 w-4" />
                                  Cevap Gönder
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {complaint.description}
                  </p>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery.term || searchQuery.status !== 'all'
                  ? 'Filtrelere uygun şikayet bulunamadı'
                  : 'Henüz şikayet bulunmuyor'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
