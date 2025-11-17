import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import { Loader2 } from 'lucide-react';
import { PanelLayout } from '@/components/panel/PanelLayout';
import { SiteOwnerDashboard } from '@/components/panel/SiteOwnerDashboard';
import { SiteContentEditor } from '@/components/panel/SiteContentEditor';
import { SiteComplaintsManager } from '@/components/panel/SiteComplaintsManager';
import { SiteBasicInfoEditor } from '@/components/panel/SiteBasicInfoEditor';
import { SiteReportsExport } from '@/components/panel/SiteReportsExport';
import { NotificationCenter } from '@/components/panel/NotificationCenter';
import { UserFeedbackManager } from '@/components/panel/UserFeedbackManager';

const SiteManagement = () => {
  const { user, isSiteOwner, ownedSites } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  const { data: siteData, isLoading } = useQuery({
    queryKey: ['owned-site-full', user?.id],
    queryFn: async () => {
      if (!user || ownedSites.length === 0) return null;
      
      const { data: site, error: siteError } = await supabase
        .from('betting_sites')
        .select('*')
        .eq('id', ownedSites[0])
        .single();
      
      if (siteError) throw siteError;

      const { count: favoriteCount, error: favError } = await supabase
        .from('user_favorite_sites')
        .select('*', { count: 'exact', head: true })
        .eq('site_id', site.id);
      
      if (favError) console.error('Favorite count error:', favError);

      const { count: complaintsCount, error: compError } = await supabase
        .from('site_complaints')
        .select('*', { count: 'exact', head: true })
        .eq('site_id', site.id);
      
      if (compError) console.error('Complaints count error:', compError);

      const { data: stats, error: statsError } = await supabase
        .from('site_stats')
        .select('views, clicks')
        .eq('site_id', site.id)
        .single();
      
      if (statsError && statsError.code !== 'PGRST116') {
        console.error('Stats error:', statsError);
      }

      return {
        ...site,
        favoriteCount: favoriteCount || 0,
        complaintsCount: complaintsCount || 0,
        stats: stats || { views: 0, clicks: 0 },
      };
    },
    enabled: !!user && isSiteOwner && ownedSites.length > 0,
  });

  if (!user || !isSiteOwner) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Bu sayfaya erişim yetkiniz yok</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!siteData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground">
              Henüz onaylanmış siteniz bulunmuyor. Admin onayı bekleniyor.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getBreadcrumbs = () => {
    const breadcrumbMap: Record<string, string> = {
      'dashboard': 'Dashboard',
      'site-info': 'Site Bilgileri',
      'content': 'İçerik Yönetimi',
      'complaints': 'Şikayetler',
      'feedback': 'Geri Bildirimler',
      'notifications': 'Bildirimler',
      'reports': 'Raporlar ve İstatistikler'
    };
    
    return [{ label: breadcrumbMap[activeTab] || 'Dashboard' }];
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <SiteOwnerDashboard 
            siteId={siteData.id}
            siteName={siteData.name}
            siteData={siteData}
            onNavigate={setActiveTab}
          />
        );
      case 'site-info':
        return (
          <SiteBasicInfoEditor 
            siteId={siteData.id}
            siteData={siteData}
          />
        );
      case 'content':
        return <SiteContentEditor siteId={siteData.id} />;
      case 'complaints':
        return <SiteComplaintsManager siteId={siteData.id} />;
      case 'feedback':
        return <UserFeedbackManager siteId={siteData.id} />;
      case 'notifications':
        return <NotificationCenter siteId={siteData.id} />;
      case 'reports':
        return (
          <SiteReportsExport 
            siteId={siteData.id}
            siteName={siteData.name}
            siteData={siteData}
          />
        );
      default:
        return (
          <SiteOwnerDashboard 
            siteId={siteData.id}
            siteName={siteData.name}
            siteData={siteData}
            onNavigate={setActiveTab}
          />
        );
    }
  };

  return (
    <>
      <SEO 
        title={`${siteData.name} - Site Yönetimi`}
        description="Sitenizi yönetin, içerik düzenleyin, şikayetleri görüntüleyin"
      />
      
      <PanelLayout
        siteData={siteData}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        breadcrumbs={getBreadcrumbs()}
      >
        {renderContent()}
      </PanelLayout>
    </>
  );
};

export default SiteManagement;
