import { useEffect, Suspense } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { showErrorToast } from '@/lib/toastHelpers';
import { Breadcrumb } from '@/components/Breadcrumb';

export default function AdminRoot() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Auth check with proper redirect - only trigger after auth is fully loaded
  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        // Use window.location.replace to completely break any potential loops
        window.location.replace('/');
        showErrorToast(new Error('Unauthorized'), 'Bu sayfaya erişim yetkiniz yok.');
      }
    }
  }, [user, isAdmin, authLoading]);

  // Redirect /admin to /admin/dashboard - only if authenticated
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      if (location.pathname === '/admin' || location.pathname === '/admin/') {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [location.pathname, navigate, authLoading, user, isAdmin]);

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

  // Get active tab from route
  const getActiveTab = () => {
    const path = location.pathname.replace('/admin/', '').replace('/admin', '');
    if (!path || path === 'dashboard') return 'dashboard';
    
    // Map routes to tab IDs for sidebar
    const routeToTabMap: Record<string, string> = {
      'sites': 'manage',
      'sites/featured': 'featured',
      'sites/stats': 'site-stats',
      'sites/addition-requests': 'site-requests',
      'blog': 'blog',
      'blog/stats': 'blog-stats',
      'blog/comments': 'comments',
      'reviews': 'reviews',
      'complaints': 'complaints',
      'analytics': 'analytics',
      'analytics/keywords': 'keywords',
      'content/casino': 'casino-content',
      'content/categories': 'categories',
      'content/casino-analytics': 'casino-analytics',
      'content/planner': 'content-planner',
      'sites/banners': 'banners',
      'finance/affiliate': 'affiliate',
      'finance/bonus': 'bonus',
      'finance/bonus-requests': 'bonus-requests',
      'notifications': 'notifications',
      'news': 'news',
      'system/health': 'health',
      'system/logs': 'logs',
      'system/history': 'history',
      'system/users': 'users',
      'system/roles': 'roles',
      'system/build-health': 'build-health',
      'system/footer': 'footer',
    };
    
    return routeToTabMap[path] || path;
  };

  const handleTabChange = (tabId: string) => {
    // Map tab IDs to routes
    const tabToRouteMap: Record<string, string> = {
      'dashboard': '/admin/dashboard',
      'manage': '/admin/sites',
      'featured': '/admin/sites/featured',
      'site-stats': '/admin/sites/stats',
      'site-requests': '/admin/sites/addition-requests',
      'blog-stats': '/admin/blog/stats',
      'comments': '/admin/blog/comments',
      'reviews': '/admin/reviews',
      'complaints': '/admin/complaints',
      'blog': '/admin/blog',
      'analytics': '/admin/analytics',
      'keywords': '/admin/analytics/keywords',
      'casino-content': '/admin/content/casino',
      'categories': '/admin/content/categories',
      'casino-analytics': '/admin/content/casino-analytics',
      'content-planner': '/admin/content/planner',
      'banners': '/admin/sites/banners',
      'affiliate': '/admin/finance/affiliate',
      'bonus': '/admin/finance/bonus',
      'bonus-requests': '/admin/finance/bonus-requests',
      'notifications': '/admin/notifications',
      'news': '/admin/news',
      'health': '/admin/system/health',
      'logs': '/admin/system/logs',
      'history': '/admin/system/history',
      'users': '/admin/system/users',
      'roles': '/admin/system/roles',
      'build-health': '/admin/system/build-health',
      'footer': '/admin/system/footer',
    };
    
    const route = tabToRouteMap[tabId] || `/admin/${tabId}`;
    navigate(route);
  };

  // Generate breadcrumb items from current route
  const getBreadcrumbItems = () => {
    const path = location.pathname.replace('/admin', '');
    if (!path || path === '/' || path === '/dashboard') {
      return [{ label: 'Genel Bakış' }];
    }
    
    const segments = path.split('/').filter(Boolean);
    const labelMap: Record<string, string> = {
      'sites': 'Siteler',
      'featured': 'Öne Çıkanlar',
      'stats': 'İstatistikler',
      'blog': 'Blog',
      'comments': 'Yorumlar',
      'reviews': 'Değerlendirmeler',
      'analytics': 'Analytics',
      'realtime': 'Canlı Takip',
      'keywords': 'Anahtar Kelimeler',
      'content': 'İçerik',
      'casino': 'Casino',
      'casino-analytics': 'Casino Analytics',
      'planner': 'Planlama',
      'ai': 'AI Asistan',
      'history': 'Geçmiş',
      'finance': 'Finans',
      'affiliate': 'Affiliate',
      'bonus': 'Bonus',
      'bonus-requests': 'Bonus Talepleri',
      'notifications': 'Bildirimler',
      'news': 'Haberler',
      'system': 'Sistem',
      'domains': 'Domain Yönetimi',
      'health': 'Sistem Durumu',
      'logs': 'Sistem Logları',
      'performance': 'Performance İzleme',
      'roles': 'Rol Yönetimi',
      'users': 'Kullanıcılar',
      'build-health': 'Build Sağlığı',
      'categories': 'Kategoriler',
      'banners': 'Banner Yönetimi',
      'footer': 'Footer Yönetimi',
    };
    
    const items = [];
    let currentPath = '/admin';
    
    for (let i = 0; i < segments.length; i++) {
      currentPath += `/${segments[i]}`;
      const isLast = i === segments.length - 1;
      
      items.push({
        label: labelMap[segments[i]] || segments[i],
        href: isLast ? undefined : currentPath,
      });
    }
    
    return items;
  };

  // Show loading only during auth check
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render admin layout if not authorized - redirect will happen in useEffect
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AdminLayout
      activeTab={getActiveTab()}
      onTabChange={handleTabChange}
      username={userProfile?.username || 'Admin'}
    >
      <Breadcrumb items={getBreadcrumbItems()} />
      {/* Suspense boundary for lazy-loaded admin pages */}
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }>
        <Outlet />
      </Suspense>
    </AdminLayout>
  );
}
