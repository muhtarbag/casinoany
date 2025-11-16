import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, MessageSquare, ArrowLeft, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useState } from 'react';

const ComplaintDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [responseText, setResponseText] = useState('');

  const { data: complaint, isLoading } = useQuery({
    queryKey: ['complaint', id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('site_complaints')
        .select(`
          *,
          betting_sites (name, slug, logo_url)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: responses } = useQuery({
    queryKey: ['complaint-responses', id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('complaint_responses')
        .select(`
          *,
          profiles (username, email)
        `)
        .eq('complaint_id', id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const upvoteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any)
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
      const { error } = await (supabase as any)
        .from('complaint_responses')
        .insert({
          complaint_id: id,
          user_id: user.id,
          response_text: text,
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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'in_review': return 'default';
      case 'resolved': return 'secondary';
      case 'closed': return 'outline';
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
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Şikayet bulunamadı</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={complaint.title}
        description={complaint.description.substring(0, 160)}
      />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/sikayetler">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Link>
        </Button>

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
                <CardTitle className="text-2xl mb-2">{complaint.title}</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Link to={`/sites/${complaint.betting_sites?.slug}`}>
                    <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                      {complaint.betting_sites?.name}
                    </Badge>
                  </Link>
                  <Badge variant="outline">
                    {categoryLabels[complaint.category]}
                  </Badge>
                  <Badge variant={getStatusVariant(complaint.status)}>
                    {statusLabels[complaint.status]}
                  </Badge>
                  {complaint.severity !== 'normal' && (
                    <Badge variant="destructive">
                      {complaint.severity === 'high' ? 'Yüksek Öncelik' : 
                       complaint.severity === 'critical' ? 'Kritik' : 'Düşük'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 whitespace-pre-wrap">
              {complaint.description}
            </p>

            {complaint.status === 'resolved' && complaint.resolution_comment && (
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                      Şikayet Çözüldü
                    </p>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      {complaint.resolution_comment}
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
                {responses?.length || 0} cevap
              </span>
              <span className="text-sm text-muted-foreground ml-auto">
                {format(new Date(complaint.created_at), 'dd MMMM yyyy HH:mm', { locale: tr })}
              </span>
            </div>
          </CardContent>
        </Card>

        {responses && responses.length > 0 && (
          <div className="space-y-4 mb-6">
            <h2 className="text-xl font-semibold">Cevaplar</h2>
            {responses.map((response: any) => (
              <Card key={response.id}>
                <CardContent className="pt-6">
                  {response.is_official && (
                    <Badge variant="default" className="mb-2">
                      Resmi Cevap
                    </Badge>
                  )}
                  <p className="text-sm text-muted-foreground mb-2 whitespace-pre-wrap">
                    {response.response_text}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {response.profiles?.username || 'Anonim'}
                    </span>
                    <span>
                      {format(new Date(response.created_at), 'dd MMM yyyy HH:mm', { locale: tr })}
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
                Cevap Gönder
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
    </>
  );
};

export default ComplaintDetail;