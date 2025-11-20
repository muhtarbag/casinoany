import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, ThumbsUp, MessageSquare, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ComplaintStats } from '@/components/complaints/ComplaintStats';
import { ComplaintFilters } from '@/components/complaints/ComplaintFilters';
import { EnhancedComplaintCard } from '@/components/complaints/EnhancedComplaintCard';
import { ComplaintAnalytics } from '@/components/complaints/ComplaintAnalytics';
import { LoadingState } from '@/components/ui/loading-state';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const Complaints = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [siteFilter, setSiteFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Get current user
  const { data: { user } = {} } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data;
    },
  });

  // Fetch user's likes
  const { data: userLikes = [] } = useQuery({
    queryKey: ['user-complaint-likes', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('complaint_likes')
        .select('complaint_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data.map(like => like.complaint_id);
    },
    enabled: !!user?.id,
  });

  const { data: complaints, isLoading } = useQuery({
    queryKey: ['complaints', searchTerm, categoryFilter, statusFilter, siteFilter, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('site_complaints')
        .select(`
          *,
          betting_sites (name, slug, logo_url)
        `)
        .eq('is_public', true);

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (siteFilter !== 'all') {
        query = query.eq('site_id', siteFilter);
      }

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Apply sorting
      switch (sortBy) {
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'most_responses':
          query = query.order('response_count', { ascending: false });
          break;
        case 'most_helpful':
          query = query.order('helpful_count', { ascending: false });
          break;
        default: // newest
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Like/unlike mutation
  const likeMutation = useMutation({
    mutationFn: async (complaintId: string) => {
      if (!user?.id) {
        throw new Error('Beğenmek için giriş yapmalısınız');
      }

      const isLiked = userLikes.includes(complaintId);

      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('complaint_likes')
          .delete()
          .eq('complaint_id', complaintId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('complaint_likes')
          .insert({
            complaint_id: complaintId,
            user_id: user.id,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-complaint-likes', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
    onError: (error: any) => {
      if (error.message.includes('giriş yap')) {
        toast({
          title: 'Giriş Yapın',
          description: 'Şikayetleri beğenmek için giriş yapmalısınız',
          action: (
            <Button size="sm" onClick={() => navigate('/login')}>
              Giriş Yap
            </Button>
          ),
        });
      } else {
        toast({
          title: 'Hata',
          description: error.message || 'Bir hata oluştu',
          variant: 'destructive',
        });
      }
    },
  });

  // Realtime subscription for new complaints and responses
  useEffect(() => {
    const complaintsChannel = supabase
      .channel('complaints-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_complaints',
          filter: 'is_public=eq.true',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['complaints'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaint_responses',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['complaints'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaint_likes',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['user-complaint-likes', user?.id] });
          queryClient.invalidateQueries({ queryKey: ['complaints'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(complaintsChannel);
    };
  }, [queryClient, user?.id]);

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

  return (
    <>
      <SEO 
        title="Şikayetler"
        description="Bahis siteleri hakkındaki kullanıcı şikayetlerini görüntüleyin"
      />
      <Header />
      <div className="min-h-screen bg-gradient-dark pt-[72px] md:pt-[84px]">
        <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="flex-1">
            <h1 className="text-xl md:text-3xl font-bold mb-1 md:mb-2">Şikayetler</h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              Bahis siteleri hakkındaki kullanıcı deneyimleri ve şikayetler
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto h-10 md:h-11" size="sm">
            <Link to="/sikayetler/yeni">
              <Plus className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Şikayet Et</span>
              <span className="sm:hidden">Yeni Şikayet</span>
            </Link>
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Input
                placeholder="Şikayet ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kategoriler</SelectItem>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid gap-3 md:gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4 md:p-6">
                  <div className="h-20 md:h-24 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : complaints && complaints.length > 0 ? (
          <div className="grid gap-3 md:gap-4">
            {complaints.map((complaint: any) => (
              <Card key={complaint.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      {complaint.betting_sites?.logo_url && (
                        <img
                          src={complaint.betting_sites.logo_url}
                          alt={complaint.betting_sites.name}
                          className="w-16 h-16 object-contain rounded"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">
                            {complaint.title}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-primary">
                              {complaint.betting_sites?.name}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {categoryLabels[complaint.category]}
                            </Badge>
                            <Badge variant={getStatusVariant(complaint.status)} className="text-xs">
                              {statusLabels[complaint.status]}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {complaint.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "flex items-center gap-1 h-auto p-1",
                              userLikes.includes(complaint.id) && "text-primary"
                            )}
                            onClick={(e) => {
                              e.preventDefault();
                              likeMutation.mutate(complaint.id);
                            }}
                            disabled={likeMutation.isPending}
                          >
                            <ThumbsUp className={cn(
                              "w-4 h-4",
                              userLikes.includes(complaint.id) && "fill-current"
                            )} />
                            {complaint.helpful_count || 0}
                          </Button>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {complaint.response_count || 0} cevap
                          </span>
                          <span>
                            {format(new Date(complaint.created_at), 'dd MMM yyyy', { locale: tr })}
                          </span>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/sikayetler/${complaint.id}`}>
                            Detay Gör
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Henüz şikayet bulunmuyor
              </p>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Complaints;