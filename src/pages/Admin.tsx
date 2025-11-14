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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Trash2, Upload, Edit, X, GripVertical, Eye, MousePointer, CheckSquare, TrendingUp, Users, MessageSquare, Clock, Sparkles, Search, Calendar, ChevronDown, Settings, FileText, BarChart3, LayoutDashboard } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, subDays } from 'date-fns';
import { tr } from 'date-fns/locale';
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
import { RefreshCw, Star } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
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
    <div ref={setNodeRef} style={style} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${editingId === site.id ? 'bg-primary/20 border-2 border-primary' : isSelected ? 'bg-primary/10 border-2 border-primary' : 'bg-muted hover:bg-muted/80'}`}>
      <Checkbox checked={isSelected} onCheckedChange={() => onToggleSelect(id)} onClick={(e) => e.stopPropagation()} />
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="flex items-center gap-3 flex-1">
        {site.logo_url && <img src={site.logo_url} alt={site.name} className="w-10 h-10 object-contain rounded" />}
        <div className="flex-1">
          <p className="font-medium">{site.name}</p>
          {site.slug && (
            <p className="text-xs text-primary/70 font-mono">/{site.slug}</p>
          )}
          <p className="text-xs text-muted-foreground">Puan: {site.rating} | {site.features?.length || 0} özellik</p>
          <div className="flex items-center gap-4 flex-wrap">
            {stats && (
              <p className="text-xs text-muted-foreground mt-1">
                <Eye className="inline w-3 h-3 mr-1" />{stats.views || 0} görüntülenme | 
                <MousePointer className="inline w-3 h-3 ml-2 mr-1" />{stats.clicks || 0} tıklama
              </p>
            )}
            {site.created_at && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(site.created_at), 'dd MMM yyyy', { locale: tr })}
              </p>
            )}
          </div>
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
  const [formData, setFormData] = useState<SiteFormData>({ name: '', slug: '', rating: 0, bonus: '', features: '', affiliate_link: '', email: '', whatsapp: '', telegram: '', twitter: '', instagram: '', facebook: '', youtube: '' });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

      // Get active sites
      const { count: activeSitesCount } = await supabase
        .from('betting_sites')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get total users
      const { count: usersCount } = await (supabase as any)
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total reviews
      const { count: reviewsCount } = await (supabase as any)
        .from('site_reviews')
        .select('*', { count: 'exact', head: true });

      // Get pending reviews
      const { count: pendingReviewsCount } = await (supabase as any)
        .from('site_reviews')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', false);
      
      // Get approved reviews
      const { count: approvedReviewsCount } = await (supabase as any)
        .from('site_reviews')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', true);

      // Get total blog posts
      const { count: blogPostsCount } = await (supabase as any)
        .from('blog_posts')
        .select('*', { count: 'exact', head: true });
      
      // Get published blog posts
      const { count: publishedBlogsCount } = await (supabase as any)
        .from('blog_posts')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

      // Get total blog comments
      const { count: blogCommentsCount } = await (supabase as any)
        .from('blog_comments')
        .select('*', { count: 'exact', head: true });
      
      // Get pending blog comments
      const { count: pendingCommentsCount } = await (supabase as any)
        .from('blog_comments')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', false);

      // Get total views and clicks
      const { data: statsData } = await supabase
        .from('site_stats' as any)
        .select('views, clicks');

      const totalViews = statsData?.reduce((sum: number, stat: any) => sum + (stat.views || 0), 0) || 0;
      const totalClicks = statsData?.reduce((sum: number, stat: any) => sum + (stat.clicks || 0), 0) || 0;
      
      // Get blog views
      const { data: blogData } = await (supabase as any)
        .from('blog_posts')
        .select('view_count');
      const totalBlogViews = blogData?.reduce((sum: number, post: any) => sum + (post.view_count || 0), 0) || 0;

      // Calculate CTR (Click Through Rate)
      const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : '0';

      return {
        totalSites: sitesCount || 0,
        activeSites: activeSitesCount || 0,
        totalUsers: usersCount || 0,
        totalReviews: reviewsCount || 0,
        pendingReviews: pendingReviewsCount || 0,
        approvedReviews: approvedReviewsCount || 0,
        totalBlogPosts: blogPostsCount || 0,
        publishedBlogs: publishedBlogsCount || 0,
        totalBlogComments: blogCommentsCount || 0,
        pendingComments: pendingCommentsCount || 0,
        totalViews,
        totalClicks,
        totalBlogViews,
        ctr,
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

  const { data: siteStats } = useSiteStats();

  // Dashboard analytics data
  const { data: dailyPageViews } = useQuery({
    queryKey: ['daily-page-views'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('page_views')
        .select('created_at')
        .gte('created_at', subDays(new Date(), 30).toISOString());
      
      if (error) throw error;
      
      // Group by date
      const viewsByDate = data.reduce((acc: any, view: any) => {
        const date = format(new Date(view.created_at), 'dd MMM', { locale: tr });
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});
      
      return Object.entries(viewsByDate).map(([date, count]) => ({ date, count }));
    },
  });

  const { data: deviceStats } = useQuery({
    queryKey: ['device-stats'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('page_views')
        .select('device_type')
        .gte('created_at', subDays(new Date(), 30).toISOString());
      
      if (error) throw error;
      
      const deviceCounts = data.reduce((acc: any, view: any) => {
        const device = view.device_type || 'Unknown';
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      }, {});
      
      return Object.entries(deviceCounts).map(([name, value]) => ({ name, value }));
    },
  });

  const { data: topPages } = useQuery({
    queryKey: ['top-pages'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('page_views')
        .select('page_path')
        .gte('created_at', subDays(new Date(), 30).toISOString());
      
      if (error) throw error;
      
      const pageCounts = data.reduce((acc: any, view: any) => {
        const path = view.page_path || '/';
        acc[path] = (acc[path] || 0) + 1;
        return acc;
      }, {});
      
      return Object.entries(pageCounts)
        .map(([page, views]) => ({ page, views }))
        .sort((a: any, b: any) => b.views - a.views)
        .slice(0, 5);
    },
  });

  const { data: dailyConversions } = useQuery({
    queryKey: ['daily-conversions'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('conversions')
        .select('created_at')
        .gte('created_at', subDays(new Date(), 30).toISOString());
      
      if (error) throw error;
      
      const conversionsByDate = data.reduce((acc: any, conversion: any) => {
        const date = format(new Date(conversion.created_at), 'dd MMM', { locale: tr });
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});
      
      return Object.entries(conversionsByDate).map(([date, count]) => ({ date, count }));
    },
  });

  const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--chart-1))', 'hsl(var(--chart-2))'];

  const [orderedSites, setOrderedSites] = useState(sites || []);
  useEffect(() => { if (sites) setOrderedSites(sites); }, [sites]);

  // Filter sites based on search query
  const filteredSites = orderedSites.filter((site: any) =>
    site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.bonus?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.slug?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        name: data.formData.name,
        slug: data.formData.slug,
        rating: data.formData.rating,
        bonus: data.formData.bonus,
        features: data.formData.features.split(',').map(f => f.trim()),
        affiliate_link: data.formData.affiliate_link,
        logo_url: logoUrl,
        email: data.formData.email || null,
        whatsapp: data.formData.whatsapp || null,
        telegram: data.formData.telegram || null,
        twitter: data.formData.twitter || null,
        instagram: data.formData.instagram || null,
        facebook: data.formData.facebook || null,
        youtube: data.formData.youtube || null,
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
      const updateData: any = { name: data.formData.name, slug: data.formData.slug, rating: data.formData.rating, bonus: data.formData.bonus, features: data.formData.features.split(',').map(f => f.trim()), affiliate_link: data.formData.affiliate_link, email: data.formData.email || null, whatsapp: data.formData.whatsapp || null, telegram: data.formData.telegram || null, twitter: data.formData.twitter || null, instagram: data.formData.instagram || null, facebook: data.formData.facebook || null, youtube: data.formData.youtube || null };
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
  
  // Slug generation function with Turkish character conversion
  const generateSlug = (text: string): string => {
    const turkishMap: Record<string, string> = {
      'ç': 'c', 'Ç': 'c',
      'ğ': 'g', 'Ğ': 'g',
      'ı': 'i', 'İ': 'i',
      'ö': 'o', 'Ö': 'o',
      'ş': 's', 'Ş': 's',
      'ü': 'u', 'Ü': 'u',
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
  
  const handleEdit = (site: any) => { setEditingId(site.id); setFormData({ name: site.name, slug: site.slug || generateSlug(site.name), rating: site.rating, bonus: site.bonus || '', features: site.features?.join(', ') || '', affiliate_link: site.affiliate_link, email: site.email || '', whatsapp: site.whatsapp || '', telegram: site.telegram || '', twitter: site.twitter || '', instagram: site.instagram || '', facebook: site.facebook || '', youtube: site.youtube || '' }); };
  const resetForm = () => { 
    setFormData({ name: '', slug: '', rating: 0, bonus: '', features: '', affiliate_link: '', email: '', whatsapp: '', telegram: '', twitter: '', instagram: '', facebook: '', youtube: '' }); 
    setLogoFile(null); 
    setLogoPreview(null);
    setEditingId(null); 
  };

  // Logo optimization function
  const optimizeLogo = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set target dimensions (max 400x400, maintain aspect ratio)
        const maxSize = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const optimizedFile = new File([blob], file.name, {
                type: 'image/webp',
                lastModified: Date.now(),
              });
              resolve(optimizedFile);
            } else {
              reject(new Error('Logo optimizasyonu başarısız'));
            }
          },
          'image/webp',
          0.85
        );
      };

      img.onerror = () => reject(new Error('Logo yüklenemedi'));
      reader.onerror = () => reject(new Error('Dosya okunamadı'));
      reader.readAsDataURL(file);
    });
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setLogoFile(null);
      setLogoPreview(null);
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Geçersiz Format',
        description: 'Sadece JPG, PNG, WebP veya SVG formatları desteklenir.',
        variant: 'destructive',
      });
      e.target.value = '';
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: 'Dosya Çok Büyük',
        description: 'Logo dosyası maksimum 5MB olabilir.',
        variant: 'destructive',
      });
      e.target.value = '';
      return;
    }

    try {
      // SVG files don't need optimization
      if (file.type === 'image/svg+xml') {
        setLogoFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setLogoPreview(e.target?.result as string);
        reader.readAsDataURL(file);
        toast({
          title: 'Logo Yüklendi',
          description: `${file.name} başarıyla yüklendi.`,
        });
      } else {
        // Optimize other image formats
        toast({
          title: 'Logo Optimize Ediliyor',
          description: 'Lütfen bekleyin...',
        });
        
        const optimizedFile = await optimizeLogo(file);
        setLogoFile(optimizedFile);
        
        const reader = new FileReader();
        reader.onload = (e) => setLogoPreview(e.target?.result as string);
        reader.readAsDataURL(optimizedFile);

        const originalSizeKB = (file.size / 1024).toFixed(0);
        const optimizedSizeKB = (optimizedFile.size / 1024).toFixed(0);
        
        toast({
          title: 'Logo Optimize Edildi',
          description: `${originalSizeKB}KB → ${optimizedSizeKB}KB (WebP formatı, 400x400 max)`,
        });
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: error instanceof Error ? error.message : 'Logo işlenirken hata oluştu',
        variant: 'destructive',
      });
      e.target.value = '';
    }
  };

  const clearLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    const fileInput = document.getElementById('logo') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };
  const toggleSiteSelection = (id: string) => { setSelectedSites(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]); };
  const toggleSelectAll = () => { selectedSites.length === orderedSites.length ? setSelectedSites([]) : setSelectedSites(orderedSites.map(s => s.id)); };

  const clearCache = () => {
    queryClient.clear();
    toast({ title: 'Cache Temizlendi', description: 'Tüm cache başarıyla temizlendi.' });
  };

  const handleAiSuggestSite = async () => {
    if (!formData.name) {
      toast({ title: 'Hata', description: 'Lütfen önce site adını girin.', variant: 'destructive' });
      return;
    }

    setIsAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-ai-assistant', {
        body: { type: 'suggest-site-details', data: { siteName: formData.name } }
      });

      if (error) throw error;

      if (data.success) {
        setFormData(prev => ({
          ...prev,
          bonus: data.data.bonus || prev.bonus,
          features: data.data.features || prev.features,
          rating: data.data.rating || prev.rating,
        }));
        toast({ title: 'Başarılı', description: 'AI önerileri başarıyla uygulandı!' });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('AI suggestion error:', error);
      toast({ 
        title: 'AI Hatası', 
        description: error.message || 'AI önerisi alınırken hata oluştu.', 
        variant: 'destructive' 
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  if (authLoading || sitesLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Hoş Geldin, {userProfile?.username || 'Admin'}! 👋
            </h1>
            <p className="text-muted-foreground">
              İşte platformunuzun genel durumu
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearCache}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Cache Temizle
          </Button>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Siteler</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats?.totalSites || 0}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats?.activeSites || 0} aktif
              </p>
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
              <p className="text-xs text-muted-foreground">
                {dashboardStats?.approvedReviews || 0} onaylı
              </p>
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
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="w-full overflow-x-auto pb-2 -mx-4 px-4 scrollbar-thin">
            <TabsList className="inline-flex h-auto flex-nowrap w-auto min-w-full justify-start gap-2">
              {/* Genel Bakış - Ana Tab */}
              <TabsTrigger value="dashboard" className="whitespace-nowrap gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Genel Bakış
              </TabsTrigger>

              {/* Site Yönetimi Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant={['manage', 'featured', 'settings'].includes(activeTab) ? 'default' : 'ghost'}
                    size="sm"
                    className="whitespace-nowrap gap-2 h-9 px-3 data-[state=open]:bg-accent"
                  >
                    <Settings className="w-4 h-4" />
                    Site Yönetimi
                    <ChevronDown className="w-4 h-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem onClick={() => setActiveTab('manage')}>
                    Site Yönetimi
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('featured')}>
                    Öne Çıkanlar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('settings')}>
                    Ayarlar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* İçerik Yönetimi Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant={['casino', 'blog', 'planner', 'reviews', 'notifications', 'news'].includes(activeTab) ? 'default' : 'ghost'}
                    size="sm"
                    className="whitespace-nowrap gap-2 h-9 px-3 data-[state=open]:bg-accent"
                  >
                    <FileText className="w-4 h-4" />
                    İçerik Yönetimi
                    <ChevronDown className="w-4 h-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem onClick={() => setActiveTab('casino')}>
                    Casino İçerik
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('blog')}>
                    Blog
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('news')}>
                    Haberler (RSS)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('planner')}>
                    İçerik Planlama
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('reviews')}>
                    Yorumlar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('notifications')}>
                    Bildirimler & Popup
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Analizler Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant={['analytics', 'traffic', 'keywords', 'stats', 'ai', 'history', 'health', 'logs'].includes(activeTab) ? 'default' : 'ghost'}
                    size="sm"
                    className="whitespace-nowrap gap-2 h-9 px-3 data-[state=open]:bg-accent"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Analizler & AI
                    <ChevronDown className="w-4 h-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem onClick={() => setActiveTab('analytics')}>
                    İçerik Analitiği
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('traffic')}>
                    Analytics
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('keywords')}>
                    Keyword Performans
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('stats')}>
                    İstatistikler
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('health')}>
                    Sistem Sağlığı
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('logs')}>
                    Sistem Logları
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('ai')}>
                    AI Asistan
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('history')}>
                    Analiz Geçmişi
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TabsList>
          </div>
          
          {/* Dashboard Tab Content */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Toplam Site</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats?.totalSites || 0}</div>
                  <p className="text-xs text-muted-foreground">Aktif bahis siteleri</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Toplam Görüntüleme</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats?.totalViews.toLocaleString() || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Ortalama: {dashboardStats?.totalSites ? Math.round(dashboardStats.totalViews / dashboardStats.totalSites) : 0} / site
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Toplam Tıklama</CardTitle>
                  <MousePointer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats?.totalClicks.toLocaleString() || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Ortalama: {dashboardStats?.totalSites ? Math.round(dashboardStats.totalClicks / dashboardStats.totalSites) : 0} / site
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Hızlı Eylemler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button onClick={() => setActiveTab('manage')} variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Site Ekle
                  </Button>
                  <Button onClick={() => setActiveTab('blog')} variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Blog Yazısı Ekle
                  </Button>
                  <Button onClick={() => setActiveTab('reviews')} variant="outline" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Yorumları İncele
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Son Aktiviteler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Toplam blog: {dashboardStats?.totalBlogPosts || 0}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Bekleyen yorumlar: {dashboardStats?.pendingReviews || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Günlük Sayfa Görüntüleme Trendi
                  </CardTitle>
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
                      <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    En Popüler Sayfalar
                  </CardTitle>
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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Ziyaretçi Cihaz Dağılımı
                  </CardTitle>
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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckSquare className="w-5 h-5" />
                    Günlük Conversion Trendi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dailyConversions || []}>
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
                      <Bar dataKey="count" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="manage" className="space-y-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{editingId ? 'Site Düzenle' : 'Yeni Site Ekle'}</CardTitle>
                {!editingId && formData.name && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAiSuggestSite}
                    disabled={isAiLoading}
                    className="gap-2"
                  >
                    {isAiLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        AI Düşünüyor...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        AI ile Doldur
                      </>
                    )}
                  </Button>
                )}
              </CardHeader>
              <CardContent><form onSubmit={handleSubmit} className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><Label htmlFor="name">Site Adı</Label><Input id="name" value={formData.name} onChange={(e) => handleNameChange(e.target.value)} required /></div><div><Label htmlFor="slug">URL Slug <span className="text-xs text-muted-foreground">(Otomatik oluşturulur)</span></Label><Input id="slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="ornek-site-adi" required /></div><div><Label htmlFor="rating">Puan</Label><Input id="rating" type="number" min="0" max="5" step="0.1" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })} required /></div><div className="md:col-span-2"><Label htmlFor="bonus">Bonus</Label><Input id="bonus" value={formData.bonus} onChange={(e) => setFormData({ ...formData, bonus: e.target.value })} /></div><div className="md:col-span-2"><Label htmlFor="features">Özellikler</Label><Input id="features" value={formData.features} onChange={(e) => setFormData({ ...formData, features: e.target.value })} /></div><div className="md:col-span-2"><Label htmlFor="affiliate_link">Link</Label><Input id="affiliate_link" value={formData.affiliate_link} onChange={(e) => setFormData({ ...formData, affiliate_link: e.target.value })} required /></div><div><Label htmlFor="email">Email</Label><Input id="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div><div><Label htmlFor="whatsapp">WhatsApp</Label><Input id="whatsapp" value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} /></div><div><Label htmlFor="telegram">Telegram</Label><Input id="telegram" value={formData.telegram} onChange={(e) => setFormData({ ...formData, telegram: e.target.value })} /></div><div><Label htmlFor="twitter">Twitter</Label><Input id="twitter" value={formData.twitter} onChange={(e) => setFormData({ ...formData, twitter: e.target.value })} /></div><div><Label htmlFor="instagram">Instagram</Label><Input id="instagram" value={formData.instagram} onChange={(e) => setFormData({ ...formData, instagram: e.target.value })} /></div><div><Label htmlFor="facebook">Facebook</Label><Input id="facebook" value={formData.facebook} onChange={(e) => setFormData({ ...formData, facebook: e.target.value })} /></div><div><Label htmlFor="youtube">YouTube</Label><Input id="youtube" value={formData.youtube} onChange={(e) => setFormData({ ...formData, youtube: e.target.value })} /></div><div className="md:col-span-2"><Label htmlFor="logo">Logo</Label><Input id="logo" type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} /></div></div><div className="flex gap-2"><Button type="submit" disabled={createSiteMutation.isPending || updateSiteMutation.isPending}>{createSiteMutation.isPending || updateSiteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : editingId ? <Edit className="w-4 h-4 mr-2" /> : <Upload className="w-4 h-4 mr-2" />}{editingId ? 'Güncelle' : 'Ekle'}</Button>{editingId && <Button type="button" variant="outline" onClick={resetForm}><X className="w-4 h-4 mr-2" />İptal</Button>}</div></form></CardContent></Card>
            {selectedSites.length > 0 && <Card className="bg-primary/10"><CardContent className="pt-6"><div className="flex items-center gap-4 flex-wrap"><p className="font-semibold">{selectedSites.length} site seçildi</p><div className="flex gap-2"><AlertDialog><AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="w-4 h-4 mr-2" />Seçilenleri Sil</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Emin misiniz?</AlertDialogTitle><AlertDialogDescription>{selectedSites.length} site silinecek.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>İptal</AlertDialogCancel><AlertDialogAction onClick={() => bulkDeleteMutation.mutate(selectedSites)}>Sil</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog><Button variant="outline" size="sm" onClick={() => bulkToggleActiveMutation.mutate({ siteIds: selectedSites, isActive: true })}>Aktif Yap</Button><Button variant="outline" size="sm" onClick={() => bulkToggleActiveMutation.mutate({ siteIds: selectedSites, isActive: false })}>Pasif Yap</Button></div></div></CardContent></Card>}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Mevcut Siteler ({filteredSites.length})</CardTitle>
                  <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                    <CheckSquare className="w-4 h-4 mr-2" />
                    {selectedSites.length === orderedSites.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Site adı veya bonus ile ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={filteredSites.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {filteredSites.map((site) => { 
                        const siteStatData = (siteStats as any[] || []).find((s: any) => s.site_id === site.id); 
                        return <SortableItem key={site.id} id={site.id} site={site} editingId={editingId} selectedSites={selectedSites} onToggleSelect={toggleSiteSelection} onEdit={handleEdit} onDelete={(id) => deleteSiteMutation.mutate(id)} isDeleting={deletingId === site.id} stats={siteStatData} />; 
                      })}
                    </div>
                  </SortableContext>
                </DndContext>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="featured">
            <FeaturedSitesManagement />
          </TabsContent>
          <TabsContent value="settings">
            <CarouselSettings />
          </TabsContent>
          <TabsContent value="casino">
            <CasinoContentManagement />
          </TabsContent>
          <TabsContent value="analytics">
            <CasinoContentAnalytics />
          </TabsContent>
          <TabsContent value="traffic">
            <AnalyticsDashboard />
          </TabsContent>
          <TabsContent value="blog">
            <div className="space-y-6">
              <BlogManagement />
              <BlogCommentManagement />
            </div>
          </TabsContent>
          <TabsContent value="planner">
            <ContentPlanner onNavigateToBlog={() => setActiveTab('blog')} />
          </TabsContent>
          <TabsContent value="keywords">
            <KeywordPerformance />
          </TabsContent>
          <TabsContent value="reviews"><ReviewManagement /></TabsContent>
          <TabsContent value="notifications">
            <NotificationManagement />
          </TabsContent>
          <TabsContent value="stats">
            <Tabs defaultValue="site-stats" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="site-stats">Site İstatistikleri</TabsTrigger>
                <TabsTrigger value="blog-stats">Blog İstatistikleri</TabsTrigger>
              </TabsList>
              <TabsContent value="site-stats" className="mt-6">
                <SiteStats />
              </TabsContent>
              <TabsContent value="blog-stats" className="mt-6">
                <BlogStats />
              </TabsContent>
            </Tabs>
          </TabsContent>
          <TabsContent value="ai">
            <AIAssistant />
          </TabsContent>
          <TabsContent value="history">
            <AnalysisHistory />
          </TabsContent>
          <TabsContent value="health">
            <SystemHealthDashboard />
          </TabsContent>
          <TabsContent value="logs">
            <SystemLogsViewer />
          </TabsContent>
          <TabsContent value="news">
            <NewsManagement />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}

