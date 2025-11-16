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
import { CheckCircle, XCircle, Trash2, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const Users = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('individual');

  const { data: users, isLoading, error: queryError } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Get all user_roles with proper ordering
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (rolesError) {
        console.error('Error fetching user_roles:', rolesError);
        throw rolesError;
      }
      
      if (!roles || roles.length === 0) {
        console.log('No user roles found');
        return [];
      }

      console.log('Found roles:', roles.length);

      // Get corresponding profiles
      const userIds = roles.map(r => r.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Found profiles:', profiles?.length || 0);

      // Merge data
      const merged = roles.map(role => {
        const profile = profiles?.find(p => p.id === role.user_id);
        return {
          ...role,
          profiles: profile || {
            email: 'Bilinmiyor',
            first_name: null,
            last_name: null,
            username: null,
            created_at: role.created_at
          }
        };
      });

      console.log('Merged users:', merged);
      return merged;
    },
    enabled: isAdmin,
    retry: 1,
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
      toast({
        title: 'Başarılı',
        description: 'Kullanıcı onaylandı',
      });
    },
    onError: () => {
      toast({
        title: 'Hata',
        description: 'İşlem sırasında bir hata oluştu',
        variant: 'destructive',
      });
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
      toast({
        title: 'Başarılı',
        description: 'Kullanıcı reddedildi',
      });
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
      toast({
        title: 'Başarılı',
        description: 'Kullanıcı silindi',
      });
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

  const individualUsers = users?.filter(u => u.role === 'user') || [];
  const corporateUsers = users?.filter(u => u.role !== 'user' && u.role !== 'admin') || [];

  const renderUserTable = (userList: typeof users) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Ad Soyad</TableHead>
          <TableHead>Kullanıcı Adı</TableHead>
          <TableHead>Durum</TableHead>
          <TableHead>Kayıt Tarihi</TableHead>
          <TableHead className="text-right">İşlemler</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {userList && userList.length > 0 ? (
          userList.map((user: any) => (
            <TableRow key={user.id}>
              <TableCell>{user.profiles?.email || '-'}</TableCell>
              <TableCell>
                {user.profiles?.first_name && user.profiles?.last_name
                  ? `${user.profiles.first_name} ${user.profiles.last_name}`
                  : '-'}
              </TableCell>
              <TableCell>{user.profiles?.username || '-'}</TableCell>
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
                {user.profiles?.created_at
                  ? new Date(user.profiles.created_at).toLocaleDateString('tr-TR')
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
            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
              Henüz kullanıcı bulunmuyor
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
        description="Bireysel ve kurumsal kullanıcıları yönetin"
      />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Kullanıcı Yönetimi</h1>
          <p className="text-muted-foreground">
            Bireysel ve kurumsal kullanıcıları yönetin
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : queryError ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-destructive">Hata: {(queryError as Error).message}</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="individual">
                Bireysel Kullanıcılar ({individualUsers.length})
              </TabsTrigger>
              <TabsTrigger value="corporate">
                Kurumsal Kullanıcılar ({corporateUsers.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="individual" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bireysel Kullanıcılar</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderUserTable(individualUsers)}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="corporate" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Kurumsal Kullanıcılar (Site Sahipleri)</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderUserTable(corporateUsers)}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </>
  );
};

export default Users;
