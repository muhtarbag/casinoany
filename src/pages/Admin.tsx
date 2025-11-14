import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminStats } from '@/hooks/admin/useAdminStats';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Trash2, Upload, Edit, X, GripVertical, Eye, MousePointer, CheckSquare, TrendingUp, Users, MessageSquare, Clock } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
import { AdminLogoInput } from './AdminLogoInput';
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
import { useSiteStats } from '@/hooks/queries/useSiteQueries';

interface SiteFormData {
  name: string;
  slug: string;
  rating: number;
  bonus: string;
  features: string;
  affiliate_link: string;
  email: string;
  whatsapp: string;
  telegram: string;
  twitter: string;
  instagram: string;
  facebook: string;
  youtube: string;
}

const SortableItem = ({ id, site, editingId, selectedSites, onToggleSelect, onEdit, onDelete, isDeleting, stats }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const isSelected = selectedSites.includes(id);

  return (
    <div ref={setNodeRef} style={style} className="bg-card border rounded-lg p-4 mb-2 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="w-5 h-5 text-muted-foreground" />
        </div>
        <Checkbox checked={isSelected} onCheckedChange={() => onToggleSelect(id)} />
        {site.logo_url && (
          <img src={site.logo_url} alt={site.name} className="w-12 h-12 object-contain rounded" />
        )}
        <div className="flex-1">
          <h3 className="font-semibold">{site.name}</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {stats?.views || 0}
            </span>
            <span className="flex items-center gap-1">
              <MousePointer className="w-4 h-4" />
              {stats?.clicks || 0}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(site)}
            disabled={editingId === site.id}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={isDeleting === site.id}
              >
                {isDeleting === site.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                <AlertDialogDescription>
                  {site.name} sitesini silmek üzeresiniz. Bu işlem geri alınamaz.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(site.id)}>
                  Sil
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

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
      <Header />
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
          {activeTab === 'manage' && (
            <Card>
              <CardHeader>
                <CardTitle>Site Yönetimi</CardTitle>
                <CardDescription>Bahis sitelerini ekleyin, düzenleyin ve yönetin</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Site Adı*</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="slug">Slug*</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="rating">Rating (1-5)*</Label>
                      <Input
                        id="rating"
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="affiliate_link">Affiliate Link*</Label>
                      <Input
                        id="affiliate_link"
                        type="url"
                        value={formData.affiliate_link}
                        onChange={(e) => setFormData({ ...formData, affiliate_link: e.target.value })}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="bonus">Bonus</Label>
                      <Input
                        id="bonus"
                        value={formData.bonus}
                        onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="features">Özellikler (virgülle ayırın)</Label>
                      <Input
                        id="features"
                        value={formData.features}
                        onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="logo">Logo</Label>
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                      />
                      {logoPreview && (
                        <div className="mt-2 relative inline-block">
                          <img src={logoPreview} alt="Preview" className="w-20 h-20 object-contain" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2"
                            onClick={clearLogo}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={createSiteMutation.isPending || updateSiteMutation.isPending}>
                      {editingId ? 'Güncelle' : 'Ekle'}
                    </Button>
                    {editingId && (
                      <Button type="button" variant="outline" onClick={resetForm}>
                        İptal
                      </Button>
                    )}
                  </div>
                </form>

                {/* Site List */}
                <div className="space-y-4">
                  {selectedSites.length > 0 && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => bulkDeleteMutation.mutate(selectedSites)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {selectedSites.length} Seçili Siteyi Sil
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => bulkToggleActiveMutation.mutate({ siteIds: selectedSites, isActive: true })}
                      >
                        Aktif Yap
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => bulkToggleActiveMutation.mutate({ siteIds: selectedSites, isActive: false })}
                      >
                        Pasif Yap
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-4">
                    <Checkbox checked={selectedSites.length === orderedSites.length} onCheckedChange={toggleSelectAll} />
                    <span className="text-sm text-muted-foreground">Tümünü Seç</span>
                  </div>

                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={orderedSites.map(s => s.id)} strategy={verticalListSortingStrategy}>
                      {orderedSites.map((site) => (
                        <SortableItem
                          key={site.id}
                          id={site.id}
                          site={site}
                          editingId={editingId}
                          selectedSites={selectedSites}
                          onToggleSelect={toggleSiteSelection}
                          onEdit={handleEdit}
                          onDelete={(id: string) => deleteSiteMutation.mutate(id)}
                          isDeleting={deletingId}
                          stats={siteStats?.find((s: any) => s.site_id === site.id)}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
              </CardContent>
            </Card>
          )}

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
      <Footer />
    </>
  );
}
