import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Users, Building2, Bell, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '@/lib/toastHelpers';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface UserNotification {
  id: string;
  title: string;
  message: string;
  notification_type: 'info' | 'success' | 'warning' | 'error' | 'announcement';
  target_audience: 'all' | 'individual' | 'corporate';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  action_url: string | null;
  action_label: string | null;
  icon: string | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  read_count?: { count: number }[];
  unread_count?: number;
}

const defaultFormData = {
  title: '',
  message: '',
  notification_type: 'info' as const,
  target_audience: 'all' as const,
  priority: 'normal' as const,
  action_url: '',
  action_label: '',
  icon: '',
  is_active: true,
  expires_at: '',
};

export function UserNotificationManagement() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<UserNotification | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultFormData);

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['user-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_notifications')
        .select(`
          *,
          read_count:user_notification_reads(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Get statistics
  const { data: stats } = useQuery({
    queryKey: ['user-notification-stats'],
    queryFn: async () => {
      const { data: allNotifications, error } = await supabase
        .from('user_notifications')
        .select('*');

      if (error) throw error;

      const active = allNotifications.filter(n => n.is_active).length;
      const expired = allNotifications.filter(n => n.expires_at && new Date(n.expires_at) < new Date()).length;
      const byAudience = {
        all: allNotifications.filter(n => n.target_audience === 'all').length,
        individual: allNotifications.filter(n => n.target_audience === 'individual').length,
        corporate: allNotifications.filter(n => n.target_audience === 'corporate').length,
      };

      return { total: allNotifications.length, active, expired, byAudience };
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        ...data,
        action_url: data.action_url || null,
        action_label: data.action_label || null,
        icon: data.icon || null,
        expires_at: data.expires_at || null,
      };

      if (editingNotification) {
        const { error } = await supabase
          .from('user_notifications')
          .update(payload)
          .eq('id', editingNotification.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_notifications')
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['user-notification-stats'] });
      showSuccessToast(editingNotification ? 'Bildirim güncellendi' : 'Bildirim oluşturuldu');
      handleCloseDialog();
    },
    onError: (error: any) => {
      showErrorToast('Bir hata oluştu: ' + error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_notifications')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['user-notification-stats'] });
      showSuccessToast('Bildirim silindi');
      setDeleteDialogOpen(false);
      setNotificationToDelete(null);
    },
    onError: (error: any) => {
      showErrorToast('Silme hatası: ' + error.message);
    },
  });

  // Toggle active mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['user-notification-stats'] });
      showSuccessToast('Bildirim durumu güncellendi');
    },
    onError: (error: any) => {
      showErrorToast('Güncelleme hatası: ' + error.message);
    },
  });

  const handleOpenDialog = (notification?: any) => {
    if (notification) {
      setEditingNotification(notification);
      setFormData({
        title: notification.title,
        message: notification.message,
        notification_type: notification.notification_type,
        target_audience: notification.target_audience,
        priority: notification.priority,
        action_url: notification.action_url || '',
        action_label: notification.action_label || '',
        icon: notification.icon || '',
        is_active: notification.is_active,
        expires_at: notification.expires_at ? notification.expires_at.split('T')[0] : '',
      });
    } else {
      setEditingNotification(null);
      setFormData(defaultFormData);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingNotification(null);
    setFormData(defaultFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleDelete = (id: string) => {
    setNotificationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (notificationToDelete) {
      deleteMutation.mutate(notificationToDelete);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      case 'announcement': return <Bell className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      case 'announcement': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getAudienceIcon = (audience: string) => {
    switch (audience) {
      case 'individual': return <Users className="w-4 h-4" />;
      case 'corporate': return <Building2 className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Kullanıcı Bildirimleri</h2>
          <p className="text-muted-foreground">
            Bireysel ve kurumsal kullanıcılara bildirim gönderin
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Bildirim
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bireysel</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.byAudience.individual || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kurumsal</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.byAudience.corporate || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Bildirimler</CardTitle>
          <CardDescription>Tüm kullanıcı bildirimlerini görüntüleyin ve yönetin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Yükleniyor...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Henüz bildirim oluşturulmamış
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={getTypeColor(notification.notification_type)}>
                        {getTypeIcon(notification.notification_type)}
                      </div>
                      <h3 className="font-semibold">{notification.title}</h3>
                      <Badge variant={notification.is_active ? 'default' : 'secondary'}>
                        {notification.is_active ? 'Aktif' : 'Pasif'}
                      </Badge>
                      {notification.priority === 'urgent' && (
                        <Badge variant="destructive">Acil</Badge>
                      )}
                      {notification.priority === 'high' && (
                        <Badge variant="outline" className="border-orange-500 text-orange-500">
                          Yüksek
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {getAudienceIcon(notification.target_audience)}
                        <span>
                          {notification.target_audience === 'all' && 'Tüm Kullanıcılar'}
                          {notification.target_audience === 'individual' && 'Bireysel'}
                          {notification.target_audience === 'corporate' && 'Kurumsal'}
                        </span>
                      </div>
                      <span>•</span>
                      <span>
                        {format(new Date(notification.created_at), 'dd MMM yyyy HH:mm', { locale: tr })}
                      </span>
                      {notification.expires_at && (
                        <>
                          <span>•</span>
                          <span className={new Date(notification.expires_at) < new Date() ? 'text-red-500' : ''}>
                            Son: {format(new Date(notification.expires_at), 'dd MMM yyyy', { locale: tr })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={notification.is_active}
                      onCheckedChange={(checked) =>
                        toggleMutation.mutate({ id: notification.id, is_active: checked })
                      }
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(notification)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(notification.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingNotification ? 'Bildirimi Düzenle' : 'Yeni Bildirim Oluştur'}
            </DialogTitle>
            <DialogDescription>
              Kullanıcılara gösterilecek bildirimi yapılandırın
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Başlık *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notification_type">Tip</Label>
                <Select
                  value={formData.notification_type}
                  onValueChange={(value: any) => setFormData({ ...formData, notification_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Bilgi</SelectItem>
                    <SelectItem value="success">Başarı</SelectItem>
                    <SelectItem value="warning">Uyarı</SelectItem>
                    <SelectItem value="error">Hata</SelectItem>
                    <SelectItem value="announcement">Duyuru</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mesaj *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="target_audience">Hedef Kitle *</Label>
                <Select
                  value={formData.target_audience}
                  onValueChange={(value: any) => setFormData({ ...formData, target_audience: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Kullanıcılar</SelectItem>
                    <SelectItem value="individual">Bireysel Kullanıcılar</SelectItem>
                    <SelectItem value="corporate">Kurumsal Kullanıcılar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Öncelik</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                    <SelectItem value="urgent">Acil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="action_url">Aksiyon URL (isteğe bağlı)</Label>
                <Input
                  id="action_url"
                  type="url"
                  value={formData.action_url}
                  onChange={(e) => setFormData({ ...formData, action_url: e.target.value })}
                  placeholder="/panel/dashboard"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="action_label">Aksiyon Etiketi (isteğe bağlı)</Label>
                <Input
                  id="action_label"
                  value={formData.action_label}
                  onChange={(e) => setFormData({ ...formData, action_label: e.target.value })}
                  placeholder="Görüntüle"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires_at">Son Geçerlilik Tarihi (isteğe bağlı)</Label>
              <Input
                id="expires_at"
                type="date"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Aktif</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                İptal
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bildirimi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu bildirimi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Siliniyor...' : 'Sil'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
