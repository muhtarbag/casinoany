import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, UserCog, Loader2, Info } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '@/lib/toastHelpers';

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  username?: string;
}

const AVAILABLE_ROLES = [
  { value: 'admin', label: 'Admin', description: 'Tüm yetkilere sahip' },
  { value: 'content_editor', label: 'İçerik Editörü', description: 'Blog, haberler, casino içeriği' },
  { value: 'finance', label: 'Finans', description: 'Affiliate ve bonus yönetimi' },
  { value: 'seo_manager', label: 'SEO Yöneticisi', description: 'Analytics, SEO, içerik planlama' },
];

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-destructive/10 text-destructive border-destructive/20',
  content_editor: 'bg-primary/10 text-primary border-primary/20',
  finance: 'bg-accent/10 text-accent border-accent/20',
  seo_manager: 'bg-secondary/10 text-secondary border-secondary/20',
};

export function RoleManagement() {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const queryClient = useQueryClient();

  // Fetch all users with profiles
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username');
      
      return profiles || [];
    },
  });

  // Fetch all user roles
  const { data: userRoles, isLoading: loadingRoles } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch usernames for each user
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(r => r.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);
        
        const profileMap = new Map(profiles?.map(p => [p.id, p.username]));
        
        return data.map(role => ({
          ...role,
          username: profileMap.get(role.user_id) || role.user_id.substring(0, 8),
        }));
      }
      
      return [];
    },
  });

  // Add role mutation
  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: role as any }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      showSuccessToast('Rol başarıyla eklendi');
      setSelectedUserId('');
      setSelectedRole('');
    },
    onError: (error) => {
      showErrorToast(error, 'Rol eklenirken hata oluştu');
    },
  });

  // Remove role mutation
  const removeRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      showSuccessToast('Rol başarıyla kaldırıldı');
    },
    onError: (error) => {
      showErrorToast(error, 'Rol kaldırılırken hata oluştu');
    },
  });

  const handleAddRole = () => {
    if (!selectedUserId || !selectedRole) return;
    addRoleMutation.mutate({ userId: selectedUserId, role: selectedRole });
  };

  const getUserRoles = (userId: string) => {
    return userRoles?.filter(ur => ur.user_id === userId) || [];
  };

  if (loadingUsers || loadingRoles) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Rol Yönetimi</h2>
          <p className="text-sm text-muted-foreground">Kullanıcılara rol atayın ve yönetin</p>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Rol Açıklamaları:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li><strong>Admin:</strong> Tüm yetkilere sahip, her şeye erişebilir</li>
            <li><strong>İçerik Editörü:</strong> Blog, haberler, casino içeriği, yorumlar ve bildirimler</li>
            <li><strong>Finans:</strong> Affiliate ve bonus yönetimi</li>
            <li><strong>SEO Yöneticisi:</strong> Analytics, SEO takibi ve içerik planlama</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Add Role Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="w-5 h-5" />
            Yeni Rol Ekle
          </CardTitle>
          <CardDescription>Bir kullanıcıya yeni rol atayın</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Kullanıcı Seçin" />
              </SelectTrigger>
              <SelectContent>
                {users?.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.username || user.id.substring(0, 8)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Rol Seçin" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div>
                      <div className="font-medium">{role.label}</div>
                      <div className="text-xs text-muted-foreground">{role.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              onClick={handleAddRole} 
              disabled={!selectedUserId || !selectedRole || addRoleMutation.isPending}
              variant="primary-action"
            >
              {addRoleMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Rol Ekle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Roles List */}
      <Card>
        <CardHeader>
          <CardTitle>Mevcut Roller</CardTitle>
          <CardDescription>Kullanıcıların atanmış rolleri</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users?.map((user) => {
              const roles = getUserRoles(user.id);
              if (roles.length === 0) return null;

              return (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{user.username || user.id.substring(0, 8)}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {roles.map((roleData) => (
                        <Badge 
                          key={roleData.id} 
                          variant="outline"
                          className={ROLE_COLORS[roleData.role] || ''}
                        >
                          {AVAILABLE_ROLES.find(r => r.value === roleData.role)?.label || roleData.role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {roles.map((roleData) => (
                      <Button
                        key={roleData.id}
                        variant="danger"
                        size="sm"
                        onClick={() => removeRoleMutation.mutate(roleData.id)}
                        disabled={removeRoleMutation.isPending}
                      >
                        {removeRoleMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Kaldır'
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {users?.every(user => getUserRoles(user.id).length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              Henüz atanmış rol yok
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
