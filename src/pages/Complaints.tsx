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

  const { data: allComplaints, isLoading } = useQuery({
    queryKey: ['complaints', categoryFilter, statusFilter, siteFilter, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('site_complaints')
        .select(`
          *,
          betting_sites (name, slug, logo_url)
        `)
        .eq('is_public', true)
        .eq('approval_status', 'approved');

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (siteFilter !== 'all') {
        query = query.eq('site_id', siteFilter);
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

  // Client-side filtering for search term (includes site name)
  const complaints = allComplaints?.filter((complaint: any) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const titleMatch = complaint.title?.toLowerCase().includes(searchLower);
    const descMatch = complaint.description?.toLowerCase().includes(searchLower);
    const siteNameMatch = complaint.betting_sites?.name?.toLowerCase().includes(searchLower);
    
    return titleMatch || descMatch || siteNameMatch;
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
        title="Bahis Siteleri Şikayetleri 2025 | Kullanıcı Deneyimleri ve Çözümler"
        description="Bahis sitelerinde yaşanan sorunlar ve kullanıcı şikayetleri. Gerçek deneyimler, çözüm önerileri ve şeffaf değerlendirmeler. Şikayetinizi paylaşın veya diğer kullanıcıların deneyimlerinden faydalanın."
        keywords={[
          'bahis siteleri şikayetleri',
          'casino şikayetleri',
          'bahis sitesi sorunları',
          'para çekme şikayeti',
          'bonus şikayeti',
          'müşteri hizmetleri şikayeti',
          'bahis sitesi dolandırıcılık',
          'kullanıcı deneyimleri',
          'bahis siteleri forum',
          'güvenilir bahis siteleri'
        ]}
      />
      <Header />
      <div className="min-h-screen bg-gradient-dark pt-16 md:pt-[72px]">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-b from-card/50 via-background to-background border-b border-border/40">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1280px] py-12 md:py-16 relative">
            <div className="text-center space-y-6 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <AlertCircle className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Kullanıcı Deneyimleri ve Şikayetler</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-foreground to-accent bg-clip-text text-transparent leading-tight">
                Bahis Siteleri Şikayetleri
              </h1>
              
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Bahis sitelerinde yaşadığınız sorunları paylaşın, diğer kullanıcıların deneyimlerinden faydalanın. 
                Şeffaf ve güvenilir bir topluluk için şikayetlerinizi bildirin, çözüm önerilerini keşfedin.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <div className="flex items-center gap-3 px-5 py-3 rounded-lg bg-card border border-border">
                  <MessageSquare className="w-5 h-5 text-accent flex-shrink-0" />
                  <div className="text-left">
                    <div className="text-lg font-bold">{complaints?.length || 0}+</div>
                    <div className="text-xs text-muted-foreground">Aktif Şikayet</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-5 py-3 rounded-lg bg-card border border-border">
                  <ThumbsUp className="w-5 h-5 text-success flex-shrink-0" />
                  <div className="text-left">
                    <div className="text-lg font-bold">%100</div>
                    <div className="text-xs text-muted-foreground">Şeffaflık</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-5 py-3 rounded-lg bg-card border border-border">
                  <AlertCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="text-left">
                    <div className="text-lg font-bold">7/24</div>
                    <div className="text-xs text-muted-foreground">Destek</div>
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <Button asChild size="lg" className="h-12 px-8 text-base font-semibold shadow-lg hover:shadow-xl transition-all">
                  <Link to="/sikayetler/yeni">
                    <Plus className="w-5 h-5 mr-2" />
                    Şikayetini Paylaş
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-bold mb-1">Tüm Şikayetler</h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              Filtreleyerek aradığınız şikayeti bulabilirsiniz
            </p>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Input
                placeholder="Şikayet veya site adı ara..."
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
                          <Link to={`/sikayetler/${complaint.slug || complaint.id}`}>
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