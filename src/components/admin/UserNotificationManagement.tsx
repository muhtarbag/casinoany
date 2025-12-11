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
    <div className="space-y-8">
      {/* Modern Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-muted/30 border border-border/50 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Kullanıcı Bildirimleri
              </h2>
              <p className="text-muted-foreground text-lg">
                Bireysel ve kurumsal kullanıcılara özel bildirimler oluşturun
              </p>
            </div>
            <Button 
              onClick={() => handleOpenDialog()}
              size="lg"
              className="shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/80"
            >
              <Plus className="w-5 h-5 mr-2" />
              Yeni Bildirim
            </Button>
          </div>
        </div>
      </div>

      {/* Modern Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-muted/20 hover:shadow-xl transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Bildirim</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Bell className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Tüm bildirimler</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-muted/20 hover:shadow-xl transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aktif</CardTitle>
            <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold">{stats?.active || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Yayında</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-muted/20 hover:shadow-xl transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bireysel</CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold">{stats?.byAudience.individual || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Bireysel kullanıcılar</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-muted/20 hover:shadow-xl transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Kurumsal</CardTitle>
            <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
              <Building2 className="h-5 w-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold">{stats?.byAudience.corporate || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Kurumsal hesaplar</p>
          </CardContent>
        </Card>
      </div>

      {/* Modern Notifications List */}
      <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card via-card to-muted/10">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-50" />
        <CardHeader className="relative border-b border-border/50 bg-card/50 backdrop-blur-sm">
          <CardTitle className="text-2xl">Bildirimler</CardTitle>
          <CardDescription className="text-base">
            Tüm kullanıcı bildirimlerini görüntüleyin ve yönetin
          </CardDescription>
        </CardHeader>
        <CardContent className="relative p-6">
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center gap-3 text-muted-foreground">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-lg">Yükleniyor...</span>
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex flex-col items-center gap-4">
                  <div className="p-4 rounded-2xl bg-muted/50">
                    <Bell className="w-12 h-12 text-muted-foreground/50" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-muted-foreground">Henüz bildirim yok</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">İlk bildiriminizi oluşturun</p>
                  </div>
                </div>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="group relative flex items-start justify-between p-6 border border-border/50 rounded-xl hover:shadow-lg hover:border-primary/20 bg-card/50 backdrop-blur-sm transition-all duration-300"
                >
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className={`p-2 rounded-lg ${getTypeColor(notification.notification_type)} bg-opacity-10`}>
                        {getTypeIcon(notification.notification_type)}
                      </div>
                      <h3 className="font-bold text-lg">{notification.title}</h3>
                      <Badge 
                        variant={notification.is_active ? 'default' : 'secondary'}
                        className="text-xs px-3 py-1"
                      >
                        {notification.is_active ? 'Aktif' : 'Pasif'}
                      </Badge>
                      {notification.priority === 'urgent' && (
                        <Badge variant="destructive" className="text-xs px-3 py-1 animate-pulse">
                          Acil
                        </Badge>
                      )}
                      {notification.priority === 'high' && (
                        <Badge variant="outline" className="text-xs px-3 py-1 border-orange-500 text-orange-500">
                          Yüksek
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed">{notification.message}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/30">
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50">
                        {getAudienceIcon(notification.target_audience)}
                        <span className="font-medium">
                          {notification.target_audience === 'all' && 'Tüm Kullanıcılar'}
                          {notification.target_audience === 'individual' && 'Bireysel'}
                          {notification.target_audience === 'corporate' && 'Kurumsal'}
                        </span>
                      </div>
                      <span className="text-border">•</span>
                      <span className="font-medium">
                        {format(new Date(notification.created_at), 'dd MMM yyyy HH:mm', { locale: tr })}
                      </span>
                      {notification.expires_at && (
                        <>
                          <span className="text-border">•</span>
                          <span className={`font-medium px-3 py-1 rounded-full ${new Date(notification.expires_at) < new Date() ? 'text-red-500 bg-red-500/10' : 'bg-muted/50'}`}>
                            Son: {format(new Date(notification.expires_at), 'dd MMM yyyy', { locale: tr })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Switch
                      checked={notification.is_active}
                      onCheckedChange={(checked) =>
                        toggleMutation.mutate({ id: notification.id, is_active: checked })
                      }
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary data-[state=checked]:to-primary/80"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(notification)}
                      className="hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(notification.id)}
                      className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
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
