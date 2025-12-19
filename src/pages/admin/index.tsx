import { useEffect, Suspense } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { showErrorToast } from '@/lib/toastHelpers';
import { Breadcrumb } from '@/components/Breadcrumb';
import { getTabIdFromPath, getRouteFromTabId, getBreadcrumbLabel } from '@/config/adminRoutes';

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
    return getTabIdFromPath(location.pathname);
  };

  const handleTabChange = (tabId: string) => {
    const route = getRouteFromTabId(tabId);
    navigate(route);
  };

  // Generate breadcrumb items from current route
  const getBreadcrumbItems = () => {
    const path = location.pathname.replace('/admin', '');
    if (!path || path === '/' || path === '/dashboard') {
      return [{ label: 'Genel Bakış' }];
    }

    const segments = path.split('/').filter(Boolean);
    const items = [];
    let currentPath = '/admin';

    for (let i = 0; i < segments.length; i++) {
      currentPath += `/${segments[i]}`;
      const isLast = i === segments.length - 1;

      items.push({
        label: getBreadcrumbLabel(segments[i]),
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
