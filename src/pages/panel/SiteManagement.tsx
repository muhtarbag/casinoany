import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import { Loader2, Heart, MessageSquare, TrendingUp, Edit } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

  const { data: siteData, isLoading } = useQuery({
    queryKey: ['owned-site-full', user?.id],
    queryFn: async () => {
      if (!user || ownedSites.length === 0) return null;
      
      // Get site with all related data
      const { data: site, error: siteError } = await supabase
        .from('betting_sites')
        .select('*')
        .eq('id', ownedSites[0])
        .single();
      
      if (siteError) throw siteError;

      // Get favorite count
      const { count: favoriteCount, error: favError } = await supabase
        .from('user_favorite_sites')
        .select('*', { count: 'exact', head: true })
        .eq('site_id', site.id);
      
      if (favError) console.error('Favorite count error:', favError);

      // Get complaints count
      const { count: complaintsCount, error: compError } = await supabase
        .from('site_complaints')
        .select('*', { count: 'exact', head: true })
        .eq('site_id', site.id);
      
      if (compError) console.error('Complaints count error:', compError);

      // Get stats
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

  return (
    <>
      <SEO 
        title={`${siteData.name} - Site Yönetimi`}
        description="Sitenizi yönetin, içerik düzenleyin, şikayetleri görüntüleyin"
      />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            {siteData.logo_url && (
              <img 
                src={siteData.logo_url} 
                alt={siteData.name} 
                className="w-16 h-16 object-contain rounded-lg border"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold">{siteData.name}</h1>
              <p className="text-muted-foreground">Site Yönetim Paneli</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Favorilere Eklenme
                </CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{siteData.favoriteCount}</div>
                <p className="text-xs text-muted-foreground">
                  Kullanıcı favoriye ekledi
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Şikayetler
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{siteData.complaintsCount}</div>
                <p className="text-xs text-muted-foreground">
                  Toplam şikayet
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Görüntülenme
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{siteData.stats.views}</div>
                <p className="text-xs text-muted-foreground">
                  Toplam görüntülenme
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Değerlendirme
                </CardTitle>
                <Edit className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {siteData.avg_rating?.toFixed(1) || '0.0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {siteData.review_count || 0} değerlendirme
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="settings">Site Yönetimi</TabsTrigger>
            <TabsTrigger value="content">İçerik Düzenleme</TabsTrigger>
            <TabsTrigger value="complaints">
              Şikayetler {siteData.complaintsCount > 0 && `(${siteData.complaintsCount})`}
            </TabsTrigger>
            <TabsTrigger value="stats">İstatistikler</TabsTrigger>
            <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
            <TabsTrigger value="feedback">Geri Bildirimler</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <SiteOwnerDashboard 
              siteId={siteData.id} 
              siteName={siteData.name}
              siteData={siteData} 
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <SiteBasicInfoEditor 
              siteId={siteData.id}
              siteData={siteData}
            />
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <SiteContentEditor siteId={siteData.id} />
          </TabsContent>

          <TabsContent value="complaints" className="space-y-4">
            <SiteComplaintsManager siteId={siteData.id} />
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <SiteReportsExport 
              siteId={siteData.id}
              siteName={siteData.name}
              siteData={siteData}
            />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <NotificationCenter siteId={siteData.id} />
          </TabsContent>

          <TabsContent value="feedback" className="space-y-4">
            <UserFeedbackManager siteId={siteData.id} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default SiteManagement;
