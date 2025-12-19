
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SEO } from '@/components/SEO';
import { User, Building2, Loader2, X, CheckCircle, XCircle, Trash2, Shield } from 'lucide-react';
import { EnhancedTableToolbar } from '@/components/table/EnhancedTableToolbar';
import { EnhancedTablePagination } from '@/components/table/EnhancedTablePagination';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useUsers } from '@/hooks/admin/useUsers';
import { IndividualUserTable } from '@/components/admin/users/IndividualUserTable';
import { CorporateUserTable } from '@/components/admin/users/CorporateUserTable';
import { UserDetailsDialog } from '@/components/admin/users/UserDetailsDialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Users = () => {
  const { isAdmin, impersonateUser, stopImpersonation } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Bulk Action Dialog States
  const [showBulkApproveDialog, setShowBulkApproveDialog] = useState(false);
  const [showBulkRejectDialog, setShowBulkRejectDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showBulkVerifyDialog, setShowBulkVerifyDialog] = useState(false);

  const {
    // State
    activeTab, setActiveTab,
    currentPage, setCurrentPage,
    pageSize, setPageSize,
    searchQuery, setSearchQuery,
    roleFilter, setRoleFilter,
    statusFilter, setStatusFilter,
    verificationFilter, setVerificationFilter,
    selectedUserIds, setSelectedUserIds,
    isBulkProcessing, bulkProgress,

    // Data
    users,
    totalCount,
    isLoading,

    // Actions
    verifyMutation,
    approveMutation,
    rejectMutation,
    deleteMutation,
    handleBulkApprove,
    handleBulkReject,
    handleBulkDelete,
    handleBulkVerify
  } = useUsers();

  const handleImpersonate = async (user: any) => {
    try {
      stopImpersonation();
      await new Promise(resolve => setTimeout(resolve, 100));

      const userId = user.user_id;
      const userName = user.profile?.company_name || user.profile?.first_name || user.profile?.email || 'User';

      impersonateUser(userId);

      await new Promise(resolve => setTimeout(resolve, 300));

      const targetPath = user.profile?.user_type === 'corporate'
        ? '/panel/dashboard'
        : '/profile/dashboard';

      toast({
        title: 'Başarılı',
        description: `${userName} olarak görüntüleniyorsunuz`
      });

      navigate(targetPath);
    } catch (error) {
      console.error('Impersonation error:', error);
      toast({
        title: 'Hata',
        description: 'Kullanıcı taklit edilirken hata oluştu',
        variant: 'destructive'
      });
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setRoleFilter('all');
    setStatusFilter('all');
    setVerificationFilter('all');
    setCurrentPage(1);
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (users && selectedUserIds.length === users.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users?.map(u => u.user_id) || []);
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

  const BulkActionsBar = () => (
    selectedUserIds.length > 0 ? (
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
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
            {activeTab === 'corporate' && (
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
            )}
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
    ) : null
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
                  filteredItems={users?.length || 0}
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

                <Tabs value={activeTab} onValueChange={(val) => {
                  setActiveTab(val);
                  handleClearFilters();
                  setSelectedUserIds([]);
                }} className="mt-6">
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
                    <BulkActionsBar />
                    <IndividualUserTable
                      users={users || []}
                      selectedUserIds={selectedUserIds}
                      onToggleSelectAll={toggleSelectAll}
                      onToggleUserSelection={toggleUserSelection}
                      onSelectUser={setSelectedUser}
                      onApprove={(id) => approveMutation.mutate(id)}
                      onReject={(id) => rejectMutation.mutate(id)}
                      onDelete={(id) => deleteMutation.mutate(id)}
                      onImpersonate={handleImpersonate}
                      approvePending={approveMutation.isPending}
                      rejectPending={rejectMutation.isPending}
                      deletePending={deleteMutation.isPending}
                    />
                  </TabsContent>

                  <TabsContent value="corporate" className="mt-6 space-y-4">
                    <BulkActionsBar />
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
                    <CorporateUserTable
                      users={users || []}
                      selectedUserIds={selectedUserIds}
                      onToggleSelectAll={toggleSelectAll}
                      onToggleUserSelection={toggleUserSelection}
                      onSelectUser={setSelectedUser}
                      onApprove={(id) => approveMutation.mutate(id)}
                      onReject={(id) => rejectMutation.mutate(id)}
                      onDelete={(id) => deleteMutation.mutate(id)}
                      onVerify={(id) => verifyMutation.mutate(id)}
                      onImpersonate={handleImpersonate}
                      approvePending={approveMutation.isPending}
                      rejectPending={rejectMutation.isPending}
                      deletePending={deleteMutation.isPending}
                      verifyPending={verifyMutation.isPending}
                    />
                  </TabsContent>
                </Tabs>

                {totalPages > 1 && (
                  <EnhancedTablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={totalCount || 0}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => {
                      setPageSize(size);
                      setCurrentPage(1);
                    }}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <UserDetailsDialog
        user={selectedUser}
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
        onVerify={(id) => verifyMutation.mutate(id)}
        verifyPending={verifyMutation.isPending}
      />

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
