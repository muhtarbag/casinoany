import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';
import { CheckCircle, XCircle, Trash2, Loader2, Building2, User, Shield, UserCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const Users = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('individual');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) throw profilesError;
      if (!profiles) return [];

      const { data: roles } = await supabase
        .from('user_roles')
        .select('*');

      // Site owners verilerini çek
      const { data: siteOwners } = await supabase
        .from('site_owners')
        .select(`
          *,
          betting_sites:site_id (
            id,
            name,
            slug
          )
        `);

      return profiles.map(profile => {
        const role = roles?.find(r => r.user_id === profile.id);
        const siteOwner = siteOwners?.find(so => so.user_id === profile.id);
        
        return {
          id: role?.id || `profile-${profile.id}`,
          user_id: profile.id,
          role: role?.role || null,
          status: role?.status || 'pending',
          created_at: role?.created_at || profile.created_at,
          profile: {
            ...profile,
            email: profile.email || 'Email bilgisi yok'
          },
          site_owner: siteOwner || null
        };
      });
    },
    enabled: isAdmin,
  });

  const verifyMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: true })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSelectedUser(null);
      toast({ title: 'Başarılı', description: 'Kurumsal kullanıcı doğrulandı' });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Önce user_roles'u onayla
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ status: 'approved' })
        .eq('user_id', userId);
      if (roleError) throw roleError;

      // Kurumsal kullanıcı ise profile'ı da doğrulanmış olarak işaretle
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_verified: true })
        .eq('id', userId)
        .eq('user_type', 'corporate');
      if (profileError) throw profileError;

      // site_owners tablosundaki kaydı da onayla
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw new Error('Oturum bilgisi alınamadı');
      
      const { error: siteOwnerError } = await (supabase as any)
        .from('site_owners')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user?.id
        })
        .eq('user_id', userId);
      if (siteOwnerError) throw siteOwnerError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Başarılı', description: 'Kullanıcı onaylandı ve doğrulandı' });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ status: 'rejected' })
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Başarılı', description: 'Kullanıcı reddedildi' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Başarılı', description: 'Kullanıcı silindi' });
    },
  });

  if (!isAdmin) {
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

  // Kullanıcıları user_type'a göre ayır - varsayılan 'individual'
  const individualUsers = users?.filter(u => {
    const userType = u.profile?.user_type || 'individual';
    return userType === 'individual';
  }) || [];
  
  const corporateUsers = users?.filter(u => {
    const userType = u.profile?.user_type;
    return userType === 'corporate';
  }) || [];

  const renderIndividualTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Ad Soyad</TableHead>
          <TableHead>Telefon</TableHead>
          <TableHead>Kullanıcı Adı</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Durum</TableHead>
          <TableHead>Kayıt Tarihi</TableHead>
          <TableHead className="text-right">İşlemler</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {individualUsers.length > 0 ? (
          individualUsers.map((user: any) => (
            <TableRow 
              key={user.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => setSelectedUser(user)}
            >
              <TableCell>{user.profile?.email || '-'}</TableCell>
              <TableCell>
                {user.profile?.first_name && user.profile?.last_name
                  ? `${user.profile.first_name} ${user.profile.last_name}`
                  : '-'}
              </TableCell>
              <TableCell>{user.profile?.phone || '-'}</TableCell>
              <TableCell>{user.profile?.username || '-'}</TableCell>
              <TableCell>
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                  {user.role === 'admin' ? 'Admin' : user.role === 'moderator' ? 'Moderatör' : 'Kullanıcı'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    user.status === 'approved'
                      ? 'default'
                      : user.status === 'rejected'
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {user.status === 'approved'
                    ? 'Onaylandı'
                    : user.status === 'rejected'
                    ? 'Reddedildi'
                    : 'Bekliyor'}
                </Badge>
              </TableCell>
              <TableCell>
                {user.profile?.created_at
                  ? new Date(user.profile.created_at).toLocaleDateString('tr-TR')
                  : '-'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                  {user.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => approveMutation.mutate(user.user_id)}
                        disabled={approveMutation.isPending}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rejectMutation.mutate(user.user_id)}
                        disabled={rejectMutation.isPending}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteMutation.mutate(user.user_id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground">
              Henüz bireysel kullanıcı bulunmuyor
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  const renderCorporateTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Şirket/Site</TableHead>
          <TableHead>Yetkili Kişi</TableHead>
          <TableHead>İletişim</TableHead>
          <TableHead>Sosyal Medya</TableHead>
          <TableHead>Doğrulama</TableHead>
          <TableHead>Durum</TableHead>
          <TableHead>Kayıt</TableHead>
          <TableHead className="text-right">İşlemler</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {corporateUsers.length > 0 ? (
          corporateUsers.map((user: any) => {
            const so = user.site_owner;
            const siteName = so?.betting_sites?.name || so?.new_site_name || '-';
            
            return (
              <TableRow 
                key={user.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setSelectedUser(user)}
              >
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      {user.profile?.company_name || '-'}
                    </div>
                    <div className="text-xs text-muted-foreground">Site: {siteName}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">{so?.contact_person_name || user.profile?.contact_person_name || '-'}</div>
                    <div className="text-xs text-muted-foreground">{so?.contact_email || user.profile?.email || '-'}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {(so?.contact_teams || user.profile?.contact_teams) && (
                      <Badge variant="outline" className="text-xs">Teams</Badge>
                    )}
                    {(so?.contact_telegram || user.profile?.contact_telegram) && (
                      <Badge variant="outline" className="text-xs">Telegram</Badge>
                    )}
                    {(so?.contact_whatsapp || user.profile?.contact_whatsapp) && (
                      <Badge variant="outline" className="text-xs">WhatsApp</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {(so?.social_facebook || user.profile?.social_facebook) && <Badge variant="secondary" className="text-xs">FB</Badge>}
                    {(so?.social_twitter || user.profile?.social_twitter) && <Badge variant="secondary" className="text-xs">X</Badge>}
                    {(so?.social_instagram || user.profile?.social_instagram) && <Badge variant="secondary" className="text-xs">IG</Badge>}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.profile?.is_verified ? 'default' : 'secondary'}>
                    {user.profile?.is_verified ? (
                      <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Doğrulandı
                      </span>
                    ) : (
                      'Doğrulanmadı'
                    )}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      user.status === 'approved'
                        ? 'default'
                        : user.status === 'rejected'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {user.status === 'approved'
                      ? 'Onaylandı'
                      : user.status === 'rejected'
                      ? 'Reddedildi'
                      : 'Bekliyor'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {user.profile?.created_at
                      ? new Date(user.profile.created_at).toLocaleDateString('tr-TR')
                      : '-'}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    {user.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => approveMutation.mutate(user.user_id)}
                          disabled={approveMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectMutation.mutate(user.user_id)}
                          disabled={rejectMutation.isPending}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {!user.profile?.is_verified && user.status === 'approved' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => verifyMutation.mutate(user.user_id)}
                        disabled={verifyMutation.isPending}
                      >
                        <Shield className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMutation.mutate(user.user_id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        ) : (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-muted-foreground">
              Henüz kurumsal kullanıcı bulunmuyor
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <>
      <SEO 
        title="Kullanıcı Yönetimi" 
        description="Sistem kullanıcılarını yönetin"
      />

      <div className="container mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Kullanıcı Yönetimi</h1>
          <p className="text-muted-foreground mt-2">
            Bireysel ve kurumsal kullanıcıları yönetin
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users?.length || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bireysel</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{individualUsers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kurumsal</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{corporateUsers.length}</div>
              <p className="text-xs text-muted-foreground">
                {corporateUsers.filter(u => u.profile && 'is_verified' in u.profile && u.profile.is_verified).length} doğrulandı
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="individual" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Bireysel Kullanıcılar
                    <Badge variant="secondary" className="ml-2">
                      {individualUsers.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="corporate" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Kurumsal Kullanıcılar
                    <Badge variant="secondary" className="ml-2">
                      {corporateUsers.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="individual" className="mt-6">
                  {renderIndividualTable()}
                </TabsContent>

                <TabsContent value="corporate" className="mt-6">
                  {renderCorporateTable()}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Detail Dialog - Enhanced with all information */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedUser?.profile?.user_type === 'corporate' ? (
                <><Building2 className="w-5 h-5" />Kurumsal Kullanıcı Detayları</>
              ) : (
                <><UserCircle className="w-5 h-5" />Kullanıcı Detayları</>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.profile?.company_name || `${selectedUser?.profile?.first_name} ${selectedUser?.profile?.last_name}`}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* Durum Bilgisi */}
              <div className="flex gap-3">
                <Badge
                  variant={
                    selectedUser.status === 'approved'
                      ? 'default'
                      : selectedUser.status === 'rejected'
                      ? 'destructive'
                      : 'secondary'
                  }
                  className="text-sm"
                >
                  {selectedUser.status === 'approved' ? 'Onaylandı' : selectedUser.status === 'rejected' ? 'Reddedildi' : 'Bekliyor'}
                </Badge>
                {selectedUser.profile?.is_verified && (
                  <Badge variant="default" className="text-sm">
                    <Shield className="w-3 h-3 mr-1" />Doğrulanmış
                  </Badge>
                )}
              </div>

              {selectedUser.profile?.user_type === 'corporate' ? (
                /* Kurumsal Kullanıcı Detayları */
                <Tabs defaultValue="company" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="company">Şirket</TabsTrigger>
                    <TabsTrigger value="site">Site</TabsTrigger>
                    <TabsTrigger value="contact">İletişim</TabsTrigger>
                    <TabsTrigger value="social">Sosyal</TabsTrigger>
                  </TabsList>

                  <TabsContent value="company" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Şirket Adı</label>
                        <p className="text-sm text-muted-foreground">{selectedUser.profile?.company_name || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Vergi/TC No</label>
                        <p className="text-sm text-muted-foreground">{selectedUser.profile?.company_tax_number || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Şirket Tipi</label>
                        <p className="text-sm text-muted-foreground">{selectedUser.profile?.company_type || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Yetkili Kişi</label>
                        <p className="text-sm text-muted-foreground">{selectedUser.profile?.company_authorized_person || selectedUser.profile?.contact_person_name || '-'}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-medium">Adres</label>
                        <p className="text-sm text-muted-foreground">{selectedUser.profile?.company_address || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Web Sitesi</label>
                        <p className="text-sm text-muted-foreground">{selectedUser.profile?.company_website || '-'}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-medium">Açıklama</label>
                        <p className="text-sm text-muted-foreground">{selectedUser.profile?.company_description || selectedUser.site_owner?.description || '-'}</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="site" className="space-y-4 mt-4">
                    {selectedUser.site_owner?.logo_url && (
                      <div>
                        <label className="text-sm font-medium">Logo</label>
                        <img src={selectedUser.site_owner.logo_url} alt="Site Logo" className="h-20 object-contain mt-2 rounded border p-2" />
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Site</label>
                        <p className="text-sm text-muted-foreground">
                          {selectedUser.site_owner?.betting_sites?.name || selectedUser.site_owner?.new_site_name || 'Site bilgisi yok'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Durum</label>
                        <p className="text-sm">
                          <Badge variant={selectedUser.site_owner?.status === 'approved' ? 'default' : 'secondary'}>
                            {selectedUser.site_owner?.status === 'approved' ? 'Aktif' : 'Bekliyor'}
                          </Badge>
                        </p>
                      </div>
                      {selectedUser.site_owner?.approved_at && (
                        <div className="col-span-2">
                          <label className="text-sm font-medium">Onay Tarihi</label>
                          <p className="text-sm text-muted-foreground">
                            {new Date(selectedUser.site_owner.approved_at).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="contact" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Mail className="w-4 h-4" />Email
                        </label>
                        <p className="text-sm text-muted-foreground">{selectedUser.site_owner?.contact_email || selectedUser.profile?.contact_email || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />Teams
                        </label>
                        <p className="text-sm text-muted-foreground">{selectedUser.site_owner?.contact_teams || selectedUser.profile?.contact_teams || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Send className="w-4 h-4" />Telegram
                        </label>
                        <p className="text-sm text-muted-foreground">{selectedUser.site_owner?.contact_telegram || selectedUser.profile?.contact_telegram || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Phone className="w-4 h-4" />WhatsApp
                        </label>
                        <p className="text-sm text-muted-foreground">{selectedUser.site_owner?.contact_whatsapp || selectedUser.profile?.contact_whatsapp || '-'}</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="social" className="space-y-4 mt-4">
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Facebook', field: 'social_facebook', icon: 'facebook' },
                        { label: 'Twitter/X', field: 'social_twitter', icon: 'twitter' },
                        { label: 'Instagram', field: 'social_instagram', icon: 'instagram' },
                        { label: 'LinkedIn', field: 'social_linkedin', icon: 'linkedin' },
                        { label: 'YouTube', field: 'social_youtube', icon: 'youtube' },
                        { label: 'Telegram Kanal', field: 'social_telegram_channel', icon: 'telegram' },
                        { label: 'Kick', field: 'social_kick', icon: 'kick' },
                        { label: 'Discord', field: 'social_discord', icon: 'discord' },
                        { label: 'Bio Link', field: 'bio_link', icon: 'link' }
                      ].map(social => {
                        const value = selectedUser.site_owner?.[social.field] || selectedUser.profile?.[social.field];
                        return (
                          <div key={social.field}>
                            <label className="text-sm font-medium">{social.label}</label>
                            <p className="text-sm text-muted-foreground break-all">
                              {value || '-'}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                /* Bireysel Kullanıcı Detayları */
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Ad Soyad</label>
                      <p className="text-sm text-muted-foreground">
                        {selectedUser.profile?.first_name} {selectedUser.profile?.last_name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Kullanıcı Adı</label>
                      <p className="text-sm text-muted-foreground">{selectedUser.profile?.username || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <p className="text-sm text-muted-foreground">{selectedUser.profile?.email || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Telefon</label>
                      <p className="text-sm text-muted-foreground">{selectedUser.profile?.phone || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Şehir</label>
                      <p className="text-sm text-muted-foreground">{selectedUser.profile?.city || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">İlçe</label>
                      <p className="text-sm text-muted-foreground">{selectedUser.profile?.district || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Favori Takım</label>
                      <p className="text-sm text-muted-foreground">{selectedUser.profile?.favorite_team || '-'}</p>
                    </div>
                  </div>
                  
                  {selectedUser.profile?.interests && selectedUser.profile.interests.length > 0 && (
                    <div>
                      <label className="text-sm font-medium">İlgi Alanları</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedUser.profile.interests.map((interest: string) => (
                          <Badge key={interest} variant="secondary">{interest}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedUser.profile?.favorite_game_providers && selectedUser.profile.favorite_game_providers.length > 0 && (
                    <div>
                      <label className="text-sm font-medium">Favori Oyun Sağlayıcıları</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedUser.profile.favorite_game_providers.map((provider: string) => (
                          <Badge key={provider} variant="outline">{provider}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedUser?.profile?.user_type === 'corporate' && !selectedUser?.profile?.is_verified && selectedUser?.status === 'approved' && (
              <Button
                onClick={() => verifyMutation.mutate(selectedUser.user_id)}
                disabled={verifyMutation.isPending}
              >
                {verifyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
                Doğrula
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
                  <label className="text-sm font-medium">Kayıt Tarihi</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.profile?.created_at 
                      ? new Date(selectedUser.profile.created_at).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Doğrulama Durumu</label>
                  <Badge variant={selectedUser.profile?.is_verified ? 'default' : 'secondary'} className="mt-1">
                    {selectedUser.profile?.is_verified ? (
                      <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Doğrulandı
                      </span>
                    ) : (
                      'Doğrulanmadı'
                    )}
                  </Badge>
                </div>
              </div>

              {!selectedUser.profile?.is_verified && (
                <div className="pt-4 border-t">
                  <Button
                    onClick={() => verifyMutation.mutate(selectedUser.user_id)}
                    disabled={verifyMutation.isPending}
                    className="w-full"
                  >
                    {verifyMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Doğrulanıyor...</>
                    ) : (
                      <><Shield className="w-4 h-4 mr-2" /> Kurumsal Kullanıcıyı Doğrula</>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button variant="ghost" onClick={() => setSelectedUser(null)}>
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Users;
