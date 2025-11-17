import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageSquare, Send } from 'lucide-react';
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

interface SiteComplaintsManagerProps {
  siteId: string;
}

export const SiteComplaintsManager = ({ siteId }: SiteComplaintsManagerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [responseText, setResponseText] = useState('');

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
      const { data: { user } } = await supabase.auth.getUser();
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

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'secondary', label: 'Beklemede' },
      in_progress: { variant: 'default', label: 'İnceleniyor' },
      resolved: { variant: 'outline', label: 'Çözüldü' },
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
    <div className="space-y-4">
      {complaints && complaints.length > 0 ? (
        complaints.map((complaint) => (
          <Card key={complaint.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-lg">{complaint.title}</CardTitle>
                  <CardDescription>
                    {complaint.anonymous_name || 'Anonim Kullanıcı'} • {' '}
                    {formatDistanceToNow(new Date(complaint.created_at), {
                      addSuffix: true,
                      locale: tr,
                    })}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge {...getStatusBadge(complaint.status)}>
                    {getStatusBadge(complaint.status).label}
                  </Badge>
                  <Badge {...getSeverityBadge(complaint.severity)}>
                    {getSeverityBadge(complaint.severity).label}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Kategori</p>
                <Badge variant="outline">{complaint.category}</Badge>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Şikayet Detayı</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {complaint.description}
                </p>
              </div>

              {/* Responses */}
              {complaint.complaint_responses && complaint.complaint_responses.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">
                    Cevaplar ({complaint.complaint_responses.length})
                  </p>
                  <div className="space-y-2">
                    {complaint.complaint_responses.map((response: any) => (
                      <div key={response.id} className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          {response.is_site_owner_response && (
                            <Badge variant="default" className="text-xs">Site Yetkilisi</Badge>
                          )}
                          {response.is_official && (
                            <Badge variant="secondary" className="text-xs">Resmi Cevap</Badge>
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

              {/* Response Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedComplaint(complaint)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Cevap Ver
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Şikayete Cevap Ver</DialogTitle>
                    <DialogDescription>
                      Resmi cevabınız şikayeti yapan kullanıcı ve diğer ziyaretçiler tarafından görülebilecek
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Şikayet</p>
                      <p className="text-sm text-muted-foreground">{complaint.description}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Cevabınız</label>
                      <Textarea
                        placeholder="Şikayete cevabınızı yazın..."
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        rows={6}
                        className="resize-none"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
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
                      >
                        {addResponseMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Gönderiliyor...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Cevabı Gönder
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Henüz sitenizle ilgili şikayet bulunmuyor
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
