import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { 
  Building2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Bell,
  BarChart3,
  Settings,
  AlertCircle,
  User
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: siteOwnerStatus } = useQuery({
    queryKey: ['site-owner-status', user?.id],
    queryFn: async () => {
      const { data: role } = await supabase
        .from('user_roles')
        .select('role, status')
        .eq('user_id', user?.id)
        .eq('role', 'site_owner')
        .single();

      if (!role) return null;

      const { data: siteOwner } = await supabase
        .from('site_owners')
        .select(`
          *,
          betting_sites (
            id,
            name,
            slug,
            logo_url,
            is_active
          )
        `)
        .eq('user_id', user?.id)
        .single();

      return { role, siteOwner };
    },
    enabled: !!user?.id,
  });

  const { data: notifications } = useQuery({
    queryKey: ['user-notifications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_status_notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  if (!siteOwnerStatus?.role || profile?.user_type === 'individual') {
    return (
      <>
        <SEO title="Panel" description="Kullanıcı paneli" />
        <div className="min-h-screen bg-background py-12">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Hoş Geldiniz</h1>
              <p className="text-muted-foreground mt-2">{user?.email}</p>
            </div>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/profile')}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Profilim</CardTitle>
                    <CardDescription>Profil bilgilerinizi görüntüleyin</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-600 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Onaylandı</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-600 border-red-200"><XCircle className="w-3 h-3 mr-1" />Reddedildi</Badge>;
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200"><Clock className="w-3 h-3 mr-1" />İnceleniyor</Badge>;
    }
  };

  return (
    <>
      <SEO title="Site Sahibi Paneli" description="Site sahibi yönetim paneli" />
      <div className="min-h-screen bg-background py-12">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Building2 className="w-8 h-8 text-primary" />
              Site Sahibi Paneli
            </h1>
            <p className="text-muted-foreground mt-2">{profile?.company_name || user?.email}</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Başvuru Durumu</span>
                {getStatusBadge(siteOwnerStatus.role.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {siteOwnerStatus.role.status === 'pending' && (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertTitle>Başvurunuz İnceleniyor</AlertTitle>
                  <AlertDescription>
                    Başvurunuz sistem yöneticileri tarafından değerlendiriliyor.
                  </AlertDescription>
                </Alert>
              )}

              {siteOwnerStatus.role.status === 'approved' && siteOwnerStatus.siteOwner?.betting_sites && (
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  {siteOwnerStatus.siteOwner.betting_sites.logo_url && (
                    <img 
                      src={siteOwnerStatus.siteOwner.betting_sites.logo_url} 
                      alt={siteOwnerStatus.siteOwner.betting_sites.name}
                      className="w-16 h-16 object-contain rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{siteOwnerStatus.siteOwner.betting_sites.name}</h3>
                    <p className="text-sm text-muted-foreground">/{siteOwnerStatus.siteOwner.betting_sites.slug}</p>
                  </div>
                  <Badge variant={siteOwnerStatus.siteOwner.betting_sites.is_active ? 'default' : 'secondary'}>
                    {siteOwnerStatus.siteOwner.betting_sites.is_active ? 'Aktif' : 'Pasif'}
                  </Badge>
                </div>
              )}

              {siteOwnerStatus.role.status === 'rejected' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Başvurunuz Reddedildi</AlertTitle>
                  <AlertDescription>
                    Başvurunuz değerlendirildi ancak şu an için onaylanamamıştır.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {notifications && notifications.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />Bildirimler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className={`p-4 rounded-lg border ${notification.is_read ? 'bg-background' : 'bg-primary/5 border-primary/20'}`}>
                    <h4 className="font-semibold text-sm">{notification.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {siteOwnerStatus.role.status === 'approved' && (
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/panel/site-management')}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Settings className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Site Yönetimi</CardTitle>
                      <CardDescription>Site bilgilerini düzenle</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>İstatistikler</CardTitle>
                      <CardDescription>Site performansı</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/profile/settings')}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Profil</CardTitle>
                      <CardDescription>Hesap ayarları</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
