import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { showSuccessToast, showErrorToast } from '@/lib/toastHelpers';
import { SEO } from '@/components/SEO';
import { CheckCircle, XCircle, Trash2, Loader2, Building2, User, Shield, UserCircle, Mail, MessageSquare, Send, Phone, X, UserCog } from 'lucide-react';
import { EnhancedTableToolbar } from '@/components/table/EnhancedTableToolbar';
import { EnhancedTablePagination } from '@/components/table/EnhancedTablePagination';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { UserBulkActionsToolbar } from '@/components/admin/UserBulkActionsToolbar';
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
  const { isAdmin, impersonateUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('individual');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Pagination & Filtering States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  
  // Bulk Actions States
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [showBulkApproveDialog, setShowBulkApproveDialog] = useState(false);
  const [showBulkRejectDialog, setShowBulkRejectDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showBulkVerifyDialog, setShowBulkVerifyDialog] = useState(false);

  // Fetch total count for pagination
  const { data: totalCount } = useQuery({
    queryKey: ['admin-users-count', activeTab, searchQuery, roleFilter, statusFilter, verificationFilter],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });

      // User type filter based on active tab
      if (activeTab === 'individual') {
        query = query.eq('user_type', 'individual');
      } else {
        query = query.eq('user_type', 'corporate');
      }

      // Search filter
      if (searchQuery) {
        query = query.or(`email.ilike.%${searchQuery}%,first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,company_name.ilike.%${searchQuery}%`);
      }

      // Verification filter (only for corporate)
      if (activeTab === 'corporate' && verificationFilter !== 'all') {
        query = query.eq('is_verified', verificationFilter === 'verified');
      }

      const { count } = await query;
      return count || 0;
    },
    enabled: isAdmin,
  });

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', currentPage, pageSize, activeTab, searchQuery, roleFilter, statusFilter, verificationFilter],
    queryFn: async () => {
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      let profileQuery = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      // User type filter based on active tab
      if (activeTab === 'individual') {
        profileQuery = profileQuery.eq('user_type', 'individual');
      } else {
        profileQuery = profileQuery.eq('user_type', 'corporate');
      }

      // Search filter
      if (searchQuery) {
        profileQuery = profileQuery.or(`email.ilike.%${searchQuery}%,first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,company_name.ilike.%${searchQuery}%`);
      }

      // Verification filter (only for corporate)
      if (activeTab === 'corporate' && verificationFilter !== 'all') {
        profileQuery = profileQuery.eq('is_verified', verificationFilter === 'verified');
      }

      const { data: profiles, error: profilesError } = await profileQuery;
      
      if (profilesError) throw profilesError;
      if (!profiles) return [];

      const profileIds = profiles.map(p => p.id);

      // Fetch roles for these profiles
      const { data: roles } = await supabase
        .from('user_roles')
        .select('*')
        .in('user_id', profileIds);

      // Fetch site owners
      const { data: siteOwners } = await supabase
        .from('site_owners')
        .select(`
          *,
          betting_sites:site_id (
            id,
            name,
            slug
          )
        `)
        .in('user_id', profileIds);

      let filteredProfiles = profiles.map(profile => {
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

      // Role filter (client-side for now since role is in different table)
      if (roleFilter !== 'all') {
        filteredProfiles = filteredProfiles.filter(u => u.role === roleFilter);
      }

      // Status filter (client-side)
      if (statusFilter !== 'all') {
        filteredProfiles = filteredProfiles.filter(u => u.status === statusFilter);
      }

      return filteredProfiles;
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
      // 1. Delete from profiles (will cascade user_roles due to foreign keys)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (profileError) {
        console.error('Profile deletion error:', profileError);
        throw profileError;
      }

      // 2. Delete from auth.users using admin API
      // Note: This requires service role key, regular users can't delete auth.users
      // So we'll only delete from profiles and user_roles tables
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (roleError) {
        console.error('User roles deletion error:', roleError);
        throw roleError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users-count'] });
      showSuccessToast('Kullanıcı başarıyla silindi');
    },
    onError: (error: any) => {
      console.error('Delete mutation error:', error);
      showErrorToast(error, 'Kullanıcı silinirken bir hata oluştu');
    },
  });

  // Bulk Operations
  const handleBulkApprove = async () => {
    setIsBulkProcessing(true);
    setBulkProgress(0);
    let completed = 0;
    
    for (const userId of selectedUserIds) {
      await approveMutation.mutateAsync(userId);
      completed++;
      setBulkProgress((completed / selectedUserIds.length) * 100);
    }
    
    setIsBulkProcessing(false);
    setSelectedUserIds([]);
    setShowBulkApproveDialog(false);
    toast({ title: 'Tamamlandı', description: `${selectedUserIds.length} kullanıcı onaylandı` });
  };

  const handleBulkReject = async () => {
    setIsBulkProcessing(true);
    setBulkProgress(0);
    let completed = 0;
    
    for (const userId of selectedUserIds) {
      await rejectMutation.mutateAsync(userId);
      completed++;
      setBulkProgress((completed / selectedUserIds.length) * 100);
    }
    
    setIsBulkProcessing(false);
    setSelectedUserIds([]);
    setShowBulkRejectDialog(false);
    toast({ title: 'Tamamlandı', description: `${selectedUserIds.length} kullanıcı reddedildi` });
  };

  const handleBulkDelete = async () => {
    if (selectedUserIds.length === 0) return;
    
    setIsBulkProcessing(true);
    setBulkProgress(0);
    
    try {
      const total = selectedUserIds.length;
      let completed = 0;
      const errors: string[] = [];

      for (const userId of selectedUserIds) {
        try {
          await deleteMutation.mutateAsync(userId);
          completed++;
          setBulkProgress((completed / total) * 100);
        } catch (error: any) {
          console.error(`Failed to delete user ${userId}:`, error);
          errors.push(`Kullanıcı ${userId}: ${error.message || 'Bilinmeyen hata'}`);
          completed++;
          setBulkProgress((completed / total) * 100);
        }
      }

      if (errors.length > 0) {
        showErrorToast(
          new Error(`${errors.length} kullanıcı silinemedi`),
          `${completed - errors.length}/${total} kullanıcı silindi`
        );
      } else {
        showSuccessToast(`${completed} kullanıcı başarıyla silindi`);
      }

      setSelectedUserIds([]);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users-count'] });
    } catch (error: any) {
      console.error('Toplu silme hatası:', error);
      showErrorToast(error, 'Toplu silme sırasında bir hata oluştu');
    } finally {
      setIsBulkProcessing(false);
      setBulkProgress(0);
      setShowBulkDeleteDialog(false);
    }
  };

  const handleBulkVerify = async () => {
    setIsBulkProcessing(true);
    setBulkProgress(0);
    let completed = 0;
    
    for (const userId of selectedUserIds) {
      await verifyMutation.mutateAsync(userId);
      completed++;
      setBulkProgress((completed / selectedUserIds.length) * 100);
    }
    
    setIsBulkProcessing(false);
    setSelectedUserIds([]);
    setShowBulkVerifyDialog(false);
    toast({ title: 'Tamamlandı', description: `${selectedUserIds.length} kullanıcı doğrulandı` });
  };

  const handleImpersonate = async (userId: string, userName: string) => {
    impersonateUser(userId);
    
    // Impersonate edilen kullanıcının profilini çek ve tipine göre yönlendir
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', userId)
      .single();
    
    toast({ title: 'Başarılı', description: `${userName} olarak görüntüleniyorsunuz` });
    
    // Kullanıcı tipine göre doğru panele yönlendir
    if (profile?.user_type === 'corporate') {
      navigate('/panel/site-management');
    } else {
      navigate('/profile/dashboard');
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUserIds.length === currentUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(currentUsers.map(u => u.user_id));
    }
  };

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

  const totalPages = Math.ceil((totalCount || 0) / pageSize);
  const currentUsers = users || [];

  const handleClearFilters = () => {
    setSearchQuery('');
    setRoleFilter('all');
    setStatusFilter('all');
    setVerificationFilter('all');
    setCurrentPage(1);
  };


  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
    setSearchQuery('');
    setRoleFilter('all');
    setStatusFilter('all');
    setVerificationFilter('all');
    setSelectedUserIds([]);
  };

  // Stats
  const individualCount = activeTab === 'individual' ? (totalCount || 0) : 0;
  const corporateCount = activeTab === 'corporate' ? (totalCount || 0) : 0;

  const renderIndividualTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={selectedUserIds.length === currentUsers.length && currentUsers.length > 0}
              onCheckedChange={toggleSelectAll}
            />
          </TableHead>
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
        {currentUsers.length > 0 ? (
          currentUsers.map((user: any) => (
            <TableRow key={user.id} className="hover:bg-muted/50">
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedUserIds.includes(user.user_id)}
                  onCheckedChange={() => toggleUserSelection(user.user_id)}
                />
              </TableCell>
              <TableCell onClick={() => setSelectedUser(user)} className="cursor-pointer">{user.profile?.email || '-'}</TableCell>
              <TableCell onClick={() => setSelectedUser(user)} className="cursor-pointer">
                {user.profile?.first_name && user.profile?.last_name
                  ? `${user.profile.first_name} ${user.profile.last_name}`
                  : '-'}
              </TableCell>
              <TableCell onClick={() => setSelectedUser(user)} className="cursor-pointer">{user.profile?.phone || '-'}</TableCell>
              <TableCell onClick={() => setSelectedUser(user)} className="cursor-pointer">{user.profile?.username || '-'}</TableCell>
              <TableCell onClick={() => setSelectedUser(user)} className="cursor-pointer">
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                  {user.role === 'admin' ? 'Admin' : user.role === 'moderator' ? 'Moderatör' : 'Kullanıcı'}
                </Badge>
              </TableCell>
              <TableCell onClick={() => setSelectedUser(user)} className="cursor-pointer">
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
              <TableCell onClick={() => setSelectedUser(user)} className="cursor-pointer">
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
                    variant="ghost"
                    onClick={() => handleImpersonate(
                      user.user_id, 
                      user.profile?.first_name && user.profile?.last_name
                        ? `${user.profile.first_name} ${user.profile.last_name}`
                        : user.profile?.email || 'User'
                    )}
                    title="Üye Gibi Davran"
                  >
                    <UserCog className="w-4 h-4" />
                  </Button>
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
          <TableHead className="w-12">
            <Checkbox
              checked={selectedUserIds.length === currentUsers.length && currentUsers.length > 0}
              onCheckedChange={toggleSelectAll}
            />
          </TableHead>
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
        {currentUsers.length > 0 ? (
          currentUsers.map((user: any) => {
            const so = user.site_owner;
            const siteName = so?.betting_sites?.name || so?.new_site_name || '-';
            
            return (
              <TableRow key={user.id} className="hover:bg-muted/50">
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedUserIds.includes(user.user_id)}
                    onCheckedChange={() => toggleUserSelection(user.user_id)}
                  />
                </TableCell>
                <TableCell onClick={() => setSelectedUser(user)} className="cursor-pointer">
                  <div className="space-y-1">
                    <div className="font-medium flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      {user.profile?.company_name || '-'}
                    </div>
                    <div className="text-xs text-muted-foreground">Site: {siteName}</div>
                  </div>
                </TableCell>
                <TableCell onClick={() => setSelectedUser(user)} className="cursor-pointer">
                  <div className="space-y-1">
                    <div className="text-sm">{so?.contact_person_name || user.profile?.contact_person_name || '-'}</div>
                    <div className="text-xs text-muted-foreground">{so?.contact_email || user.profile?.email || '-'}</div>
                  </div>
                </TableCell>
                <TableCell onClick={() => setSelectedUser(user)} className="cursor-pointer">
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
                <TableCell onClick={() => setSelectedUser(user)} className="cursor-pointer">
                  <div className="flex gap-1">
                    {(so?.social_facebook || user.profile?.social_facebook) && <Badge variant="secondary" className="text-xs">FB</Badge>}
                    {(so?.social_twitter || user.profile?.social_twitter) && <Badge variant="secondary" className="text-xs">X</Badge>}
                    {(so?.social_instagram || user.profile?.social_instagram) && <Badge variant="secondary" className="text-xs">IG</Badge>}
                  </div>
                </TableCell>
                <TableCell onClick={() => setSelectedUser(user)} className="cursor-pointer">
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
                <TableCell onClick={() => setSelectedUser(user)} className="cursor-pointer">
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
                <TableCell onClick={() => setSelectedUser(user)} className="cursor-pointer">
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
                      variant="ghost"
                      onClick={() => handleImpersonate(
                        user.user_id,
                        user.profile?.company_name || user.profile?.email || 'User'
                      )}
                      title="Üye Gibi Davran"
                    >
                      <UserCog className="w-4 h-4" />
                    </Button>
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
            <TableCell colSpan={10} className="text-center text-muted-foreground">
              {searchQuery || roleFilter !== 'all' || statusFilter !== 'all' || verificationFilter !== 'all'
                ? 'Filtrelere uygun kullanıcı bulunamadı' 
                : 'Henüz kurumsal kullanıcı bulunmuyor'}
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
              <div className="text-2xl font-bold">{totalCount || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bireysel</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeTab === 'individual' ? (totalCount || 0) : '-'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kurumsal</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeTab === 'corporate' ? (totalCount || 0) : '-'}</div>
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
              <>
                <EnhancedTableToolbar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                  ratingFilter={roleFilter}
                  onRatingFilterChange={setRoleFilter}
                  totalItems={totalCount || 0}
                  filteredItems={currentUsers.length}
                  onClearFilters={handleClearFilters}
                  searchPlaceholder="Email, ad, soyad veya şirket adı ile ara..."
                  statusOptions={[
                    { value: 'all', label: 'Tüm Durumlar' },
                    { value: 'approved', label: 'Onaylı' },
                    { value: 'pending', label: 'Beklemede' },
                    { value: 'rejected', label: 'Reddedildi' },
                  ]}
                  ratingOptions={[
                    { value: 'all', label: 'Tüm Roller' },
                    { value: 'admin', label: 'Admin' },
                    { value: 'user', label: 'Kullanıcı' },
                    { value: 'site_owner', label: 'Site Sahibi' },
                  ]}
                />

                <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="individual" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Bireysel Kullanıcılar
                    </TabsTrigger>
                    <TabsTrigger value="corporate" className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Kurumsal Kullanıcılar
                      {activeTab === 'corporate' && verificationFilter !== 'all' && (
                        <Badge variant="secondary" className="ml-2">
                          {verificationFilter === 'verified' ? 'Doğrulanmış' : 'Doğrulanmamış'}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="individual" className="mt-6 space-y-4">
                    {selectedUserIds.length > 0 && (
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="text-sm">
                              {selectedUserIds.length} seçildi
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedUserIds([])}
                              className="h-8"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Temizle
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => setShowBulkApproveDialog(true)}
                              className="h-8"
                              disabled={isBulkProcessing}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Onayla
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowBulkRejectDialog(true)}
                              className="h-8"
                              disabled={isBulkProcessing}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reddet
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setShowBulkDeleteDialog(true)}
                              className="h-8"
                              disabled={isBulkProcessing}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Sil
                            </Button>
                          </div>
                        </div>
                        {isBulkProcessing && (
                          <div className="mt-3">
                            <Progress value={bulkProgress} className="h-2" />
                            <p className="text-sm text-muted-foreground mt-1">İşleniyor... %{Math.round(bulkProgress)}</p>
                          </div>
                        )}
                      </div>
                    )}
                    {renderIndividualTable()}
                  </TabsContent>

                  <TabsContent value="corporate" className="mt-6 space-y-4">
                    {selectedUserIds.length > 0 && (
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="text-sm">
                              {selectedUserIds.length} seçildi
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedUserIds([])}
                              className="h-8"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Temizle
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => setShowBulkApproveDialog(true)}
                              className="h-8"
                              disabled={isBulkProcessing}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Onayla
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowBulkRejectDialog(true)}
                              className="h-8"
                              disabled={isBulkProcessing}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reddet
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowBulkVerifyDialog(true)}
                              className="h-8"
                              disabled={isBulkProcessing}
                            >
                              <Shield className="w-4 h-4 mr-1" />
                              Doğrula
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setShowBulkDeleteDialog(true)}
                              className="h-8"
                              disabled={isBulkProcessing}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Sil
                            </Button>
                          </div>
                        </div>
                        {isBulkProcessing && (
                          <div className="mt-3">
                            <Progress value={bulkProgress} className="h-2" />
                            <p className="text-sm text-muted-foreground mt-1">İşleniyor... %{Math.round(bulkProgress)}</p>
                          </div>
                        )}
                      </div>
                    )}
                    {activeTab === 'corporate' && (
                      <div className="flex gap-2">
                        <Button
                          variant={verificationFilter === 'all' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setVerificationFilter('all')}
                        >
                          Tümü
                        </Button>
                        <Button
                          variant={verificationFilter === 'verified' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setVerificationFilter('verified')}
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Doğrulanmış
                        </Button>
                        <Button
                          variant={verificationFilter === 'unverified' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setVerificationFilter('unverified')}
                        >
                          Doğrulanmamış
                        </Button>
                      </div>
                    )}
                    {renderCorporateTable()}
                  </TabsContent>
                </Tabs>

                {totalPages > 1 && (
                  <EnhancedTablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={totalCount || 0}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                  />
                )}
              </>
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
                        <label className="text-sm font-medium">Yetkili Kişi</label>
                        <p className="text-sm text-muted-foreground">{selectedUser.profile?.company_authorized_person || selectedUser.profile?.contact_person_name || '-'}</p>
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

      {/* Bulk Action Dialogs */}
      <AlertDialog open={showBulkApproveDialog} onOpenChange={setShowBulkApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Toplu Onay</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUserIds.length} kullanıcıyı onaylamak istediğinizden emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkProcessing}>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkApprove} disabled={isBulkProcessing}>
              {isBulkProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Onayla
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showBulkRejectDialog} onOpenChange={setShowBulkRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Toplu Reddetme</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUserIds.length} kullanıcıyı reddetmek istediğinizden emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkProcessing}>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkReject} disabled={isBulkProcessing}>
              {isBulkProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Reddet
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Toplu Silme</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUserIds.length} kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkProcessing}>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} disabled={isBulkProcessing} className="bg-destructive hover:bg-destructive/90">
              {isBulkProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showBulkVerifyDialog} onOpenChange={setShowBulkVerifyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Toplu Doğrulama</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUserIds.length} kullanıcıyı doğrulamak istediğinizden emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkProcessing}>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkVerify} disabled={isBulkProcessing}>
              {isBulkProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Doğrula
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Users;
