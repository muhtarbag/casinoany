import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminStats } from '@/hooks/admin/useAdminStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Eye, MousePointer, CheckSquare, TrendingUp, MessageSquare } from 'lucide-react';
import SiteStats from '@/components/SiteStats';
import BlogStats from '@/components/BlogStats';
import ReviewManagement from '@/components/ReviewManagement';
import { BlogManagement } from '@/components/BlogManagement';
import { BlogCommentManagement } from '@/components/BlogCommentManagement';
import { FeaturedSitesManagement } from '@/components/FeaturedSitesManagement';
import { AIAssistant } from '@/components/AIAssistant';
import { AnalysisHistory } from '@/components/AnalysisHistory';
import { ContentPlanner } from '@/components/ContentPlanner';
import { KeywordPerformance } from '@/components/KeywordPerformance';
import { SiteManagementContainer } from '@/features/sites/SiteManagementContainer';
import { CasinoContentManagement } from '@/components/CasinoContentManagement';
import { CasinoContentAnalytics } from '@/components/CasinoContentAnalytics';
import { NotificationManagement } from '@/components/NotificationManagement';
import { CarouselSettings } from '@/components/CarouselSettings';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { SystemHealthDashboard } from '@/components/SystemHealthDashboard';
import { SystemLogsViewer } from '@/components/SystemLogsViewer';
import { NewsManagement } from '@/components/NewsManagement';
import { RealtimeAnalyticsDashboard } from '@/components/RealtimeAnalyticsDashboard';
import GSCSetupGuide from '@/components/GSCSetupGuide';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Admin() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [formData, setFormData] = useState<SiteFormData>({
    name: '', slug: '', rating: 0, bonus: '', features: '', 
    affiliate_link: '', email: '', whatsapp: '', telegram: '', 
    twitter: '', instagram: '', facebook: '', youtube: ''
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderedSites, setOrderedSites] = useState<any[]>([]);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Auth check
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/');
      toast({ 
        title: 'Yetkisiz Erişim', 
        description: 'Bu sayfaya erişim yetkiniz yok.', 
        variant: 'destructive' 
      });
    }
  }, [user, isAdmin, authLoading, navigate, toast]);

  // Fetch user profile
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Use centralized stats hook
  const { dashboardStats, isLoadingStats, dailyPageViews, deviceStats, topPages } = useAdminStats();

  // Fetch betting sites
  const { data: sites, isLoading: sitesLoading } = useQuery({
    queryKey: ['betting-sites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: siteStats } = useSiteStats();

  // Update ordered sites when sites data changes
  useEffect(() => {
    if (sites) {
      setOrderedSites(sites);
    }
  }, [sites]);

  // Mutations (Site CRUD operations remain in this file for now - will be refactored)
  const createSiteMutation = useMutation({
    mutationFn: async ({ formData, logoFile }: { formData: SiteFormData; logoFile: File | null }) => {
      let logoUrl = null;
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${formData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('site-logos')
          .upload(fileName, logoFile, { upsert: true });
        
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage
          .from('site-logos')
          .getPublicUrl(fileName);
        
        logoUrl = publicUrlData.publicUrl;
      }

      const { error } = await (supabase as any).from('betting_sites').insert([{
        ...formData,
        features: formData.features ? formData.features.split(',').map((f: string) => f.trim()) : [],
        logo_url: logoUrl,
        is_active: true,
      }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['betting-sites'] });
      toast({ title: 'Başarılı', description: 'Site eklendi!' });
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: 'Hata', description: error.message, variant: 'destructive' });
    },
  });

  const updateSiteMutation = useMutation({
    mutationFn: async ({ id, formData, logoFile }: { id: string; formData: SiteFormData; logoFile: File | null }) => {
      let logoUrl;
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${formData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('site-logos')
          .upload(fileName, logoFile, { upsert: true });
        
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage
          .from('site-logos')
          .getPublicUrl(fileName);
        
        logoUrl = publicUrlData.publicUrl;
      }

      const updateData: any = {
        ...formData,
        features: formData.features ? formData.features.split(',').map((f: string) => f.trim()) : [],
      };

      if (logoUrl) {
        updateData.logo_url = logoUrl;
      }

      const { error } = await supabase.from('betting_sites').update(updateData).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['betting-sites'] });
      toast({ title: 'Başarılı', description: 'Site güncellendi!' });
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: 'Hata', description: error.message, variant: 'destructive' });
    },
  });

  const deleteSiteMutation = useMutation({
    mutationFn: async (id: string) => {
      setDeletingId(id);
      const { error } = await supabase.from('betting_sites').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['betting-sites'] });
      toast({ title: 'Başarılı', description: 'Site silindi.' });
      setDeletingId(null);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (siteIds: string[]) => {
      const { error } = await supabase.from('betting_sites').delete().in('id', siteIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['betting-sites'] });
      setSelectedSites([]);
      toast({ title: 'Başarılı', description: `${selectedSites.length} site silindi.` });
    },
  });

  const bulkToggleActiveMutation = useMutation({
    mutationFn: async ({ siteIds, isActive }: { siteIds: string[]; isActive: boolean }) => {
      const { error } = await supabase.from('betting_sites').update({ is_active: isActive }).in('id', siteIds);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['betting-sites'] });
      setSelectedSites([]);
      toast({ title: 'Başarılı', description: `${selectedSites.length} site ${variables.isActive ? 'aktif' : 'pasif'} yapıldı.` });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async (sites: any[]) => {
      const updates = sites.map((site, index) =>
        supabase.from('betting_sites').update({ display_order: index }).eq('id', site.id)
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['betting-sites'] });
      toast({ title: 'Başarılı', description: 'Sıra güncellendi.' });
    },
  });

  // Helper functions
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setOrderedSites((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        updateOrderMutation.mutate(newOrder);
        return newOrder;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateSiteMutation.mutate({ id: editingId, formData, logoFile });
    } else {
      createSiteMutation.mutate({ formData, logoFile });
    }
  };

  const generateSlug = (text: string): string => {
    const turkishMap: Record<string, string> = {
      'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g',
      'ı': 'i', 'İ': 'i', 'ö': 'o', 'Ö': 'o',
      'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u',
    };
    
    return text
      .split('')
      .map(char => turkishMap[char] || char)
      .join('')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const handleEdit = (site: any) => {
    setEditingId(site.id);
    setFormData({
      name: site.name,
      slug: site.slug || generateSlug(site.name),
      rating: site.rating,
      bonus: site.bonus || '',
      features: site.features?.join(', ') || '',
      affiliate_link: site.affiliate_link,
      email: site.email || '',
      whatsapp: site.whatsapp || '',
      telegram: site.telegram || '',
      twitter: site.twitter || '',
      instagram: site.instagram || '',
      facebook: site.facebook || '',
      youtube: site.youtube || ''
    });
  };

  const resetForm = () => {
    setFormData({
      name: '', slug: '', rating: 0, bonus: '', features: '',
      affiliate_link: '', email: '', whatsapp: '', telegram: '',
      twitter: '', instagram: '', facebook: '', youtube: ''
    });
    setLogoFile(null);
    setLogoPreview(null);
    setEditingId(null);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    const fileInput = document.getElementById('logo') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const toggleSiteSelection = (id: string) => {
    setSelectedSites(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    selectedSites.length === orderedSites.length
      ? setSelectedSites([])
      : setSelectedSites(orderedSites.map(s => s.id));
  };

  if (authLoading || sitesLoading || isLoadingStats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <AdminLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        username={userProfile?.username || 'Admin'}
      >
        <div className="space-y-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && dashboardStats && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Toplam Site</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats.totalSites}</div>
                    <p className="text-xs text-muted-foreground">
                      {dashboardStats.activeSites} aktif
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Toplam Görüntülenme</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats.totalViews.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      CTR: {dashboardStats.ctr}%
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Bekleyen Yorumlar</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats.pendingReviews}</div>
                    <p className="text-xs text-muted-foreground">
                      {dashboardStats.totalReviews} toplam yorum
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Blog Yazıları</CardTitle>
                    <CheckSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats.publishedBlogs}</div>
                    <p className="text-xs text-muted-foreground">
                      {dashboardStats.totalBlogPosts} toplam yazı
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Günlük Görüntülenme</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={dailyPageViews || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cihaz Dağılımı</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={deviceStats || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="hsl(var(--primary))"
                          dataKey="value"
                        >
                          {(deviceStats || []).map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>En Çok Ziyaret Edilen Sayfalar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={topPages || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="page" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="views" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Site Management Tab */}
          {activeTab === 'manage' && <SiteManagementContainer />}

          {/* Other tabs */}
          {activeTab === 'featured' && <FeaturedSitesManagement />}
          {activeTab === 'site-stats' && <SiteStats />}
          {activeTab === 'blog-stats' && <BlogStats />}
          {activeTab === 'reviews' && <ReviewManagement />}
          {activeTab === 'blog' && <BlogManagement />}
          {activeTab === 'comments' && <BlogCommentManagement />}
          {activeTab === 'ai' && <AIAssistant />}
          {activeTab === 'ai-history' && <AnalysisHistory />}
          {activeTab === 'content-planner' && <ContentPlanner />}
          {activeTab === 'keywords' && <KeywordPerformance />}
          {activeTab === 'casino-content' && <CasinoContentManagement />}
          {activeTab === 'casino-analytics' && <CasinoContentAnalytics />}
          {activeTab === 'notifications' && <NotificationManagement />}
          {activeTab === 'carousel' && <CarouselSettings />}
          {activeTab === 'analytics' && <AnalyticsDashboard />}
          {activeTab === 'health' && <SystemHealthDashboard />}
          {activeTab === 'logs' && <SystemLogsViewer />}
          {activeTab === 'news' && <NewsManagement />}
          {activeTab === 'realtime' && <RealtimeAnalyticsDashboard />}
          {activeTab === 'gsc' && <GSCSetupGuide />}
        </div>
      </AdminLayout>
    </>
  );
}
