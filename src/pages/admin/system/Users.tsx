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
import { CheckCircle, XCircle, Trash2, Loader2, Building2, User, Shield } from 'lucide-react';
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
      // Önce tüm profilleri çek (email artık profiles'da)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) throw profilesError;
      if (!profiles) return [];

      // Tüm rolleri çek
      const { data: roles } = await supabase
        .from('user_roles')
        .select('*');

      // Her profile için role bilgisini ekle
      return profiles.map(profile => {
        const role = roles?.find(r => r.user_id === profile.id);
        
        return {
          id: role?.id || `profile-${profile.id}`,
          user_id: profile.id,
          role: role?.role || null,
          status: role?.status || 'pending',
          created_at: role?.created_at || profile.created_at,
          profile: {
            ...profile,
            email: profile.email || 'Email bilgisi yok'
          }
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
      const { error } = await supabase
        .from('user_roles')
        .update({ status: 'approved' })
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Başarılı', description: 'Kullanıcı onaylandı' });
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

  const individualUsers = users?.filter(u => u.profile && u.profile.user_type === 'individual') || [];
  const corporateUsers = users?.filter(u => u.profile && u.profile.user_type === 'corporate') || [];

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
            <TableRow key={user.id}>
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
                <div className="flex justify-end gap-2">
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
          <TableHead>Şirket Adı</TableHead>
          <TableHead>Vergi No</TableHead>
          <TableHead>Yetkili Kişi</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Telefon</TableHead>
          <TableHead>Doğrulama</TableHead>
          <TableHead>Durum</TableHead>
          <TableHead className="text-right">İşlemler</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {corporateUsers.length > 0 ? (
          corporateUsers.map((user: any) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.profile?.company_name || '-'}</TableCell>
              <TableCell>{user.profile?.company_tax_number || '-'}</TableCell>
              <TableCell>{user.profile?.company_authorized_person || '-'}</TableCell>
              <TableCell>{user.profile?.company_email || user.profile?.email || '-'}</TableCell>
              <TableCell>{user.profile?.company_phone || '-'}</TableCell>
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
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedUser(user)}
                  >
                    Detay
                  </Button>
                  {!user.profile?.is_verified && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => verifyMutation.mutate(user.user_id)}
                      disabled={verifyMutation.isPending}
                      title="Kurumsal Kullanıcıyı Doğrula"
                    >
                      <Shield className="w-4 h-4" />
                    </Button>
                  )}
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

      {/* Corporate User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Kurumsal Kullanıcı Detayları</DialogTitle>
            <DialogDescription>
              {selectedUser?.profile?.company_name}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Şirket Adı</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.profile?.company_name || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Vergi Numarası</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.profile?.company_tax_number || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Şirket Tipi</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.profile?.company_type || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Yetkili Kişi</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.profile?.company_authorized_person || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.profile?.company_email || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Telefon</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.profile?.company_phone || '-'}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Adres</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.profile?.company_address || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Website</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.profile?.company_website || '-'}
                  </p>
                </div>
                <div>
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Users;
