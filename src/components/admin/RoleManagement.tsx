import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, UserCog, Loader2, Info, CheckCircle, XCircle, Clock, 
  Search, Mail, Calendar, UserCheck, UserX, Trash2 
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { showSuccessToast, showErrorToast } from '@/lib/toastHelpers';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface UserWithRole {
  id: string;
  user_id: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  approved_at?: string;
  approved_by?: string;
  email?: string;
  username?: string;
}

const AVAILABLE_ROLES = [
  { value: 'admin', label: 'Admin', description: 'Tüm yetkilere sahip', icon: Shield },
  { value: 'content_editor', label: 'İçerik Editörü', description: 'Blog, haberler, casino içeriği', icon: UserCog },
  { value: 'finance', label: 'Finans', description: 'Affiliate ve bonus yönetimi', icon: UserCog },
  { value: 'seo_manager', label: 'SEO Yöneticisi', description: 'Analytics, SEO, içerik planlama', icon: UserCog },
];

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-destructive/10 text-destructive border-destructive/20',
  content_editor: 'bg-primary/10 text-primary border-primary/20',
  finance: 'bg-accent/10 text-accent border-accent/20',
  seo_manager: 'bg-secondary/10 text-secondary border-secondary/20',
  user: 'bg-muted/50 text-muted-foreground border-muted',
};

const STATUS_CONFIG = {
  pending: { label: 'Beklemede', icon: Clock, color: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20' },
  approved: { label: 'Onaylı', icon: CheckCircle, color: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20' },
  rejected: { label: 'Reddedildi', icon: XCircle, color: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20' },
};

export function RoleManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const queryClient = useQueryClient();

  // Fetch all users with their roles and status
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['users-with-roles-status'],
    queryFn: async () => {
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          role,
          status,
          created_at,
          approved_at,
          approved_by
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (!userRoles || userRoles.length === 0) return [];

      // Fetch profiles for all users
      const userIds = [...new Set(userRoles.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, email')
        .in('id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]));
      
      return userRoles.map(role => ({
        ...role,
        email: profileMap.get(role.user_id)?.email || 'N/A',
        username: profileMap.get(role.user_id)?.username || profileMap.get(role.user_id)?.email?.split('@')[0] || 'Bilinmiyor',
      })) as UserWithRole[];
    },
  });

  // Filter users based on search
  const filteredUsers = users?.filter(user => 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by status
  const pendingUsers = filteredUsers?.filter(u => u.status === 'pending') || [];
  const approvedUsers = filteredUsers?.filter(u => u.status === 'approved') || [];
  const rejectedUsers = filteredUsers?.filter(u => u.status === 'rejected') || [];

  // Approve user mutation
  const approveUserMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw new Error('Oturum bilgisi alınamadı');
      if (!user) throw new Error('Oturum açmanız gerekiyor');
      
      const { error } = await supabase
        .from('user_roles')
        .update({ 
          status: 'approved',
          role: role as any,
          approved_at: new Date().toISOString(),
          approved_by: user.id
        })
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles-status'] });
      showSuccessToast('Kullanıcı onaylandı');
      setSelectedUserId('');
      setSelectedRole('');
    },
    onError: (error) => {
      showErrorToast(error, 'Kullanıcı onaylanırken hata oluştu');
    },
  });

  // Reject user mutation
  const rejectUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw new Error('Oturum bilgisi alınamadı');
      if (!user) throw new Error('Oturum açmanız gerekiyor');
      
      const { error } = await supabase
        .from('user_roles')
        .update({ 
          status: 'rejected',
          approved_at: new Date().toISOString(),
          approved_by: user.id
        })
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles-status'] });
      showSuccessToast('Kullanıcı reddedildi');
    },
    onError: (error) => {
      showErrorToast(error, 'Kullanıcı reddedilirken hata oluştu');
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: role as any })
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles-status'] });
      showSuccessToast('Rol güncellendi');
    },
    onError: (error) => {
      showErrorToast(error, 'Rol güncellenirken hata oluştu');
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles-status'] });
      showSuccessToast('Kullanıcı silindi');
    },
    onError: (error) => {
      showErrorToast(error, 'Kullanıcı silinirken hata oluştu');
    },
  });

  // Remove role from user (moves to pending status)
  const removeRoleMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ 
          status: 'pending',
          approved_at: null,
          approved_by: null
        })
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles-status'] });
      showSuccessToast('Rol geri alındı. Kullanıcı bekleyenler listesine taşındı');
    },
    onError: (error) => {
      showErrorToast(error, 'Rol geri alınırken hata oluştu');
    },
  });

  const UserCard = ({ user }: { user: UserWithRole }) => {
    const StatusIcon = STATUS_CONFIG[user.status].icon;
    const isPending = user.status === 'pending';
    const isApproved = user.status === 'approved';

    return (
      <Card className="hover:border-primary/50 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold truncate">{user.username}</h3>
                <Badge className={STATUS_CONFIG[user.status].color}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {STATUS_CONFIG[user.status].label}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Mail className="w-3 h-3" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>
                  Kayıt: {format(new Date(user.created_at), 'dd MMM yyyy HH:mm', { locale: tr })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">Rol:</span>
            {isPending ? (
              <Select 
                value={selectedUserId === user.user_id ? selectedRole : ''} 
                onValueChange={(value) => {
                  setSelectedUserId(user.user_id);
                  setSelectedRole(value);
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Rol seçin..." />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center gap-2">
                        <role.icon className="w-4 h-4" />
                        <span>{role.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : isApproved ? (
              <Select 
                value={user.role} 
                onValueChange={(value) => updateRoleMutation.mutate({ userId: user.user_id, role: value })}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center gap-2">
                        <role.icon className="w-4 h-4" />
                        <span>{role.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Badge className={ROLE_COLORS[user.role]}>
                {AVAILABLE_ROLES.find(r => r.value === user.role)?.label || user.role}
              </Badge>
            )}
          </div>

          <div className="flex gap-2">
            {isPending && selectedUserId === user.user_id && selectedRole && (
              <>
                <Button
                  size="sm"
                  onClick={() => approveUserMutation.mutate({ userId: user.user_id, role: selectedRole })}
                  disabled={approveUserMutation.isPending}
                  className="flex-1"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Onayla
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => rejectUserMutation.mutate(user.user_id)}
                  disabled={rejectUserMutation.isPending}
                  className="flex-1"
                >
                  <UserX className="w-4 h-4 mr-2" />
                  Reddet
                </Button>
              </>
            )}

            {isApproved && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => removeRoleMutation.mutate(user.user_id)}
                disabled={removeRoleMutation.isPending}
                className="flex-1"
              >
                {removeRoleMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                Rolü Geri Al
              </Button>
            )}
            
            {user.status === 'rejected' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={deleteUserMutation.isPending}
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Sil
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Kullanıcıyı silmek istediğinize emin misiniz?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bu işlem geri alınamaz. Kullanıcı kaydı kalıcı olarak silinecektir.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>İptal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteUserMutation.mutate(user.user_id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Sil
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loadingUsers) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rol Yönetimi</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rol Yönetimi</h1>
        <p className="text-muted-foreground mt-2">
          Kullanıcı kayıtlarını onaylayın ve rolleri yönetin
        </p>
      </div>

      <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Nasıl Çalışır?</strong> Yeni kayıt olan kullanıcılar "Bekleyenler" sekmesinde görünür. 
          Rol atayıp onayladığınızda kullanıcı sisteme giriş yapabilir.
        </AlertDescription>
      </Alert>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Email veya kullanıcı adı ile ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bekleyenler</p>
                <p className="text-2xl font-bold">{pendingUsers.length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Onaylı</p>
                <p className="text-2xl font-bold">{approvedUsers.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reddedilen</p>
                <p className="text-2xl font-bold">{rejectedUsers.length}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Bekleyenler ({pendingUsers.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Onaylı ({approvedUsers.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Reddedilen ({rejectedUsers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingUsers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Bekleyen kullanıcı yok</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingUsers.map(user => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedUsers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Onaylı kullanıcı yok</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {approvedUsers.map(user => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedUsers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <XCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Reddedilen kullanıcı yok</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rejectedUsers.map(user => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
