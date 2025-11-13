import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import ReviewManagement from '@/components/ReviewManagement';
import { BlogManagement } from '@/components/BlogManagement';
import { RefreshCw } from 'lucide-react';

interface SiteFormData {
  name: string;
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
    <div ref={setNodeRef} style={style} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${editingId === site.id ? 'bg-primary/20 border-2 border-primary' : isSelected ? 'bg-primary/10 border-2 border-primary' : 'bg-muted hover:bg-muted/80'}`}>
      <Checkbox checked={isSelected} onCheckedChange={() => onToggleSelect(id)} onClick={(e) => e.stopPropagation()} />
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="flex items-center gap-3 flex-1">
        {site.logo_url && <img src={site.logo_url} alt={site.name} className="w-10 h-10 object-contain rounded" />}
        <div className="flex-1">
          <p className="font-medium">{site.name}</p>
          <p className="text-xs text-muted-foreground">Puan: {site.rating} | {site.features?.length || 0} özellik</p>
          {stats && <p className="text-xs text-muted-foreground mt-1"><Eye className="inline w-3 h-3 mr-1" />{stats.views || 0} görüntülenme | <MousePointer className="inline w-3 h-3 ml-2 mr-1" />{stats.clicks || 0} tıklama</p>}
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => onEdit(site)}><Edit className="w-4 h-4" /></Button>
        <Button size="sm" variant="destructive" onClick={() => onDelete(site.id)} disabled={isDeleting}>
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
};

export default function Admin() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<SiteFormData>({ name: '', rating: 0, bonus: '', features: '', affiliate_link: '', email: '', whatsapp: '', telegram: '', twitter: '', instagram: '', facebook: '', youtube: '' });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('manage');
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/');
      toast({ title: 'Yetkisiz Erişim', description: 'Bu sayfaya erişim yetkiniz yok.', variant: 'destructive' });
    }
  }, [user, isAdmin, authLoading, navigate, toast]);

  // Fetch user profile for welcome message
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

  // Fetch dashboard statistics
  const { data: dashboardStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Get total sites
      const { count: sitesCount } = await supabase
        .from('betting_sites')
        .select('*', { count: 'exact', head: true });

      // Get total users
      const { count: usersCount } = await (supabase as any)
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total reviews
      const { count: reviewsCount } = await (supabase as any)
        .from('site_reviews')
        .select('*', { count: 'exact', head: true });

      // Get pending reviews
      const { count: pendingCount } = await (supabase as any)
        .from('site_reviews')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', false);

      // Get total views and clicks
      const { data: statsData } = await supabase
        .from('site_stats' as any)
        .select('views, clicks');

      const totalViews = statsData?.reduce((sum: number, stat: any) => sum + (stat.views || 0), 0) || 0;
      const totalClicks = statsData?.reduce((sum: number, stat: any) => sum + (stat.clicks || 0), 0) || 0;

      return {
        totalSites: sitesCount || 0,
        totalUsers: usersCount || 0,
        totalReviews: reviewsCount || 0,
        pendingReviews: pendingCount || 0,
        totalViews,
        totalClicks,
      };
    },
  });

  const { data: sites, isLoading: sitesLoading } = useQuery({
    queryKey: ['betting-sites'],
    queryFn: async () => {
      const { data, error } = await supabase.from('betting_sites').select('*').order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: siteStats } = useQuery({
    queryKey: ['all-site-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_stats' as any).select('*');
      if (error) throw error;
      return data;
    },
  });

  const [orderedSites, setOrderedSites] = useState(sites || []);
  useEffect(() => { if (sites) setOrderedSites(sites); }, [sites]);

  const createSiteMutation = useMutation({
    mutationFn: async (data: { formData: SiteFormData; logoFile: File | null }) => {
      let logoUrl = null;
      if (data.logoFile) {
        const fileExt = data.logoFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('site-logos').upload(fileName, data.logoFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('site-logos').getPublicUrl(fileName);
        logoUrl = publicUrl;
      }
      const { error } = await supabase.from('betting_sites').insert({
        name: data.formData.name, rating: data.formData.rating, bonus: data.formData.bonus,
        features: data.formData.features.split(',').map(f => f.trim()), affiliate_link: data.formData.affiliate_link,
        logo_url: logoUrl, email: data.formData.email || null, whatsapp: data.formData.whatsapp || null,
        telegram: data.formData.telegram || null, twitter: data.formData.twitter || null,
        instagram: data.formData.instagram || null, facebook: data.formData.facebook || null, youtube: data.formData.youtube || null,
      });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['betting-sites'] }); toast({ title: 'Başarılı', description: 'Bahis sitesi başarıyla eklendi.' }); resetForm(); },
    onError: (error: Error) => { toast({ title: 'Hata', description: error.message, variant: 'destructive' }); },
  });

  const updateSiteMutation = useMutation({
    mutationFn: async (data: { id: string; formData: SiteFormData; logoFile: File | null }) => {
      let logoUrl = null;
      if (data.logoFile) {
        const fileExt = data.logoFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        await supabase.storage.from('site-logos').upload(fileName, data.logoFile);
        const { data: { publicUrl } } = supabase.storage.from('site-logos').getPublicUrl(fileName);
        logoUrl = publicUrl;
      }
      const updateData: any = { name: data.formData.name, rating: data.formData.rating, bonus: data.formData.bonus, features: data.formData.features.split(',').map(f => f.trim()), affiliate_link: data.formData.affiliate_link, email: data.formData.email || null, whatsapp: data.formData.whatsapp || null, telegram: data.formData.telegram || null, twitter: data.formData.twitter || null, instagram: data.formData.instagram || null, facebook: data.formData.facebook || null, youtube: data.formData.youtube || null };
      if (logoUrl) updateData.logo_url = logoUrl;
      const { error } = await supabase.from('betting_sites').update(updateData).eq('id', data.id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['betting-sites'] }); toast({ title: 'Başarılı', description: 'Site güncellendi.' }); resetForm(); setEditingId(null); },
  });

  const deleteSiteMutation = useMutation({
    mutationFn: async (id: string) => { setDeletingId(id); const { error } = await supabase.from('betting_sites').delete().eq('id', id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['betting-sites'] }); toast({ title: 'Başarılı', description: 'Site silindi.' }); setDeletingId(null); },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (siteIds: string[]) => { const { error } = await supabase.from('betting_sites').delete().in('id', siteIds); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['betting-sites'] }); setSelectedSites([]); toast({ title: 'Başarılı', description: `${selectedSites.length} site silindi.` }); },
  });

  const bulkToggleActiveMutation = useMutation({
    mutationFn: async ({ siteIds, isActive }: { siteIds: string[], isActive: boolean }) => { const { error } = await supabase.from('betting_sites').update({ is_active: isActive }).in('id', siteIds); if (error) throw error; },
    onSuccess: (_, variables) => { queryClient.invalidateQueries({ queryKey: ['betting-sites'] }); setSelectedSites([]); toast({ title: 'Başarılı', description: `${selectedSites.length} site ${variables.isActive ? 'aktif' : 'pasif'} yapıldı.` }); },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async (sites: any[]) => { const updates = sites.map((site, index) => supabase.from('betting_sites').update({ display_order: index }).eq('id', site.id)); await Promise.all(updates); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['betting-sites'] }); toast({ title: 'Başarılı', description: 'Sıra güncellendi.' }); },
  });

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

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); editingId ? updateSiteMutation.mutate({ id: editingId, formData, logoFile }) : createSiteMutation.mutate({ formData, logoFile }); };
  const handleEdit = (site: any) => { setEditingId(site.id); setFormData({ name: site.name, rating: site.rating, bonus: site.bonus || '', features: site.features?.join(', ') || '', affiliate_link: site.affiliate_link, email: site.email || '', whatsapp: site.whatsapp || '', telegram: site.telegram || '', twitter: site.twitter || '', instagram: site.instagram || '', facebook: site.facebook || '', youtube: site.youtube || '' }); };
  const resetForm = () => { setFormData({ name: '', rating: 0, bonus: '', features: '', affiliate_link: '', email: '', whatsapp: '', telegram: '', twitter: '', instagram: '', facebook: '', youtube: '' }); setLogoFile(null); setEditingId(null); };
  const toggleSiteSelection = (id: string) => { setSelectedSites(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]); };
  const toggleSelectAll = () => { selectedSites.length === orderedSites.length ? setSelectedSites([]) : setSelectedSites(orderedSites.map(s => s.id)); };

  if (authLoading || sitesLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Hoş Geldin, {userProfile?.username || 'Admin'}! 👋
          </h1>
          <p className="text-muted-foreground">
            İşte platformunuzun genel durumu
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <Button 
            size="lg" 
            onClick={() => setActiveTab('manage')}
            className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <Upload className="w-5 h-5" />
            Yeni Site Ekle
          </Button>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => setActiveTab('reviews')}
            className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <CheckSquare className="w-5 h-5" />
            Yorumları Onayla
            {dashboardStats && dashboardStats.pendingReviews > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                {dashboardStats.pendingReviews}
              </span>
            )}
          </Button>
        </div>

        {/* Dashboard Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Siteler</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats?.totalSites || 0}</div>
              <p className="text-xs text-muted-foreground">Aktif bahis siteleri</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Kullanıcılar</CardTitle>
              <Users className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">Kayıtlı kullanıcı</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Yorumlar</CardTitle>
              <MessageSquare className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats?.totalReviews || 0}</div>
              <p className="text-xs text-muted-foreground">Kullanıcı yorumu</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bekleyen Yorumlar</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats?.pendingReviews || 0}</div>
              <p className="text-xs text-muted-foreground">Onay bekliyor</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Görüntülenme</CardTitle>
              <Eye className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats?.totalViews.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">Site görüntüleme</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Tıklama</CardTitle>
              <MousePointer className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats?.totalClicks.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">Affiliate tıklaması</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="manage">Site Yönetimi</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="reviews">Yorumlar</TabsTrigger>
            <TabsTrigger value="stats">İstatistikler</TabsTrigger>
          </TabsList>
          <TabsContent value="manage" className="space-y-8">
            <Card><CardHeader><CardTitle>{editingId ? 'Site Düzenle' : 'Yeni Site Ekle'}</CardTitle></CardHeader><CardContent><form onSubmit={handleSubmit} className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><Label htmlFor="name">Site Adı</Label><Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div><div><Label htmlFor="rating">Puan</Label><Input id="rating" type="number" min="0" max="5" step="0.1" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })} required /></div><div className="md:col-span-2"><Label htmlFor="bonus">Bonus</Label><Input id="bonus" value={formData.bonus} onChange={(e) => setFormData({ ...formData, bonus: e.target.value })} /></div><div className="md:col-span-2"><Label htmlFor="features">Özellikler</Label><Input id="features" value={formData.features} onChange={(e) => setFormData({ ...formData, features: e.target.value })} /></div><div className="md:col-span-2"><Label htmlFor="affiliate_link">Link</Label><Input id="affiliate_link" value={formData.affiliate_link} onChange={(e) => setFormData({ ...formData, affiliate_link: e.target.value })} required /></div><div><Label htmlFor="email">Email</Label><Input id="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div><div><Label htmlFor="whatsapp">WhatsApp</Label><Input id="whatsapp" value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} /></div><div><Label htmlFor="telegram">Telegram</Label><Input id="telegram" value={formData.telegram} onChange={(e) => setFormData({ ...formData, telegram: e.target.value })} /></div><div><Label htmlFor="twitter">Twitter</Label><Input id="twitter" value={formData.twitter} onChange={(e) => setFormData({ ...formData, twitter: e.target.value })} /></div><div><Label htmlFor="instagram">Instagram</Label><Input id="instagram" value={formData.instagram} onChange={(e) => setFormData({ ...formData, instagram: e.target.value })} /></div><div><Label htmlFor="facebook">Facebook</Label><Input id="facebook" value={formData.facebook} onChange={(e) => setFormData({ ...formData, facebook: e.target.value })} /></div><div><Label htmlFor="youtube">YouTube</Label><Input id="youtube" value={formData.youtube} onChange={(e) => setFormData({ ...formData, youtube: e.target.value })} /></div><div className="md:col-span-2"><Label htmlFor="logo">Logo</Label><Input id="logo" type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} /></div></div><div className="flex gap-2"><Button type="submit" disabled={createSiteMutation.isPending || updateSiteMutation.isPending}>{createSiteMutation.isPending || updateSiteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : editingId ? <Edit className="w-4 h-4 mr-2" /> : <Upload className="w-4 h-4 mr-2" />}{editingId ? 'Güncelle' : 'Ekle'}</Button>{editingId && <Button type="button" variant="outline" onClick={resetForm}><X className="w-4 h-4 mr-2" />İptal</Button>}</div></form></CardContent></Card>
            {selectedSites.length > 0 && <Card className="bg-primary/10"><CardContent className="pt-6"><div className="flex items-center gap-4 flex-wrap"><p className="font-semibold">{selectedSites.length} site seçildi</p><div className="flex gap-2"><AlertDialog><AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="w-4 h-4 mr-2" />Seçilenleri Sil</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Emin misiniz?</AlertDialogTitle><AlertDialogDescription>{selectedSites.length} site silinecek.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>İptal</AlertDialogCancel><AlertDialogAction onClick={() => bulkDeleteMutation.mutate(selectedSites)}>Sil</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog><Button variant="outline" size="sm" onClick={() => bulkToggleActiveMutation.mutate({ siteIds: selectedSites, isActive: true })}>Aktif Yap</Button><Button variant="outline" size="sm" onClick={() => bulkToggleActiveMutation.mutate({ siteIds: selectedSites, isActive: false })}>Pasif Yap</Button></div></div></CardContent></Card>}
            <Card><CardHeader><div className="flex justify-between items-center"><CardTitle>Mevcut Siteler ({orderedSites.length})</CardTitle><Button variant="outline" size="sm" onClick={toggleSelectAll}><CheckSquare className="w-4 h-4 mr-2" />{selectedSites.length === orderedSites.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}</Button></div></CardHeader><CardContent><DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}><SortableContext items={orderedSites.map(s => s.id)} strategy={verticalListSortingStrategy}><div className="space-y-2">{orderedSites.map((site) => { const siteStatData = (siteStats as any[] || []).find((s: any) => s.site_id === site.id); return <SortableItem key={site.id} id={site.id} site={site} editingId={editingId} selectedSites={selectedSites} onToggleSelect={toggleSiteSelection} onEdit={handleEdit} onDelete={(id) => deleteSiteMutation.mutate(id)} isDeleting={deletingId === site.id} stats={siteStatData} />; })}</div></SortableContext></DndContext></CardContent></Card>
          </TabsContent>
          <TabsContent value="blog"><BlogManagement /></TabsContent>
          <TabsContent value="reviews"><ReviewManagement /></TabsContent>
          <TabsContent value="stats"><SiteStats /></TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}

