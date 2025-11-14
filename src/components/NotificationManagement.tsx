import { useState, useMemo, useCallback, memo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Eye, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { VirtualList } from '@/components/VirtualList';

interface Notification {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  notification_type: string;
  target_url: string | null;
  button_text: string | null;
  button_url: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  display_pages: string[];
  user_segments: string[];
  display_frequency: string;
  priority: number;
  background_color: string | null;
  text_color: string | null;
  created_at: string;
  form_fields?: {
    email_label: string;
    phone_label: string;
    submit_text: string;
    success_message: string;
    privacy_text: string;
  } | null;
}

export const NotificationManagement = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    notification_type: 'popup',
    target_url: '',
    button_text: 'Detayları Gör',
    button_url: '',
    is_active: false,
    start_date: '',
    end_date: '',
    display_pages: ['all'],
    user_segments: ['all'],
    display_frequency: 'once',
    priority: 0,
    background_color: '#3b82f6',
    text_color: '#ffffff',
    trigger_type: 'instant',
    trigger_conditions: {},
    form_fields: {
      email_label: 'E-posta Adresiniz',
      phone_label: 'Telefon Numaranız',
      submit_text: 'Bonus Kodumu Gönder',
      success_message: '✅ Teşekkürler! Bonus kodunuz e-posta adresinize gönderildi.',
      privacy_text: '🔒 Bilgileriniz tamamen güvendedir. KVKK uyumlu olarak saklanır ve hiçbir şekilde üçüncü kişilerle paylaşılmaz.',
    },
  });

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications-admin'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('site_notifications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Notification[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await (supabase as any)
        .from('site_notifications')
        .insert([data]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-admin'] });
      toast.success('Bildirim oluşturuldu!');
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Hata: ' + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const { error } = await (supabase as any)
        .from('site_notifications')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-admin'] });
      toast.success('Bildirim güncellendi!');
      resetForm();
      setIsDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('site_notifications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-admin'] });
      toast.success('Bildirim silindi!');
    },
  });

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('notification-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('notification-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast.success('Görsel yüklendi!');
    } catch (error: any) {
      toast.error('Görsel yüklenemedi: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert empty strings to null for date fields
    const sanitizedData = {
      ...formData,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
    };
    
    if (editingNotification) {
      updateMutation.mutate({ id: editingNotification.id, data: sanitizedData });
    } else {
      createMutation.mutate(sanitizedData);
    }
  }, [editingNotification, formData, updateMutation, createMutation]);

  const handleEdit = useCallback((notification: Notification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title,
      content: notification.content || '',
      image_url: notification.image_url || '',
      notification_type: notification.notification_type,
      target_url: notification.target_url || '',
      button_text: notification.button_text || 'Detayları Gör',
      button_url: notification.button_url || '',
      is_active: notification.is_active,
      start_date: notification.start_date || '',
      end_date: notification.end_date || '',
      display_pages: notification.display_pages,
      user_segments: notification.user_segments || ['all'],
      display_frequency: notification.display_frequency,
      priority: notification.priority,
      background_color: notification.background_color || '#3b82f6',
      text_color: notification.text_color || '#ffffff',
      trigger_type: (notification as any).trigger_type || 'instant',
      trigger_conditions: (notification as any).trigger_conditions || {},
      form_fields: notification.form_fields || {
        email_label: 'E-posta Adresiniz',
        phone_label: 'Telefon Numaranız',
        submit_text: 'Bonus Kodumu Gönder',
        success_message: '✅ Teşekkürler! Bonus kodunuz e-posta adresinize gönderildi.',
        privacy_text: '🔒 Bilgileriniz tamamen güvendedir. KVKK uyumlu olarak saklanır ve hiçbir şekilde üçüncü kişilerle paylaşılmaz.',
      },
    });
    setIsDialogOpen(true);
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      content: '',
      image_url: '',
      notification_type: 'popup',
      target_url: '',
      button_text: 'Detayları Gör',
      button_url: '',
      is_active: false,
      start_date: '',
      end_date: '',
      display_pages: ['all'],
      user_segments: ['all'],
      display_frequency: 'once',
      priority: 0,
      background_color: '#3b82f6',
      text_color: '#ffffff',
      trigger_type: 'instant',
      trigger_conditions: {},
      form_fields: {
        email_label: 'E-posta Adresiniz',
        phone_label: 'Telefon Numaranız',
        submit_text: 'Bonus Kodumu Gönder',
        success_message: '✅ Teşekkürler! Bonus kodunuz e-posta adresinize gönderildi.',
        privacy_text: '🔒 Bilgileriniz tamamen güvendedir. KVKK uyumlu olarak saklanır ve hiçbir şekilde üçüncü kişilerle paylaşılmaz.',
      },
    });
    setEditingNotification(null);
  }, []);

  const toggleActive = useCallback((id: string, currentStatus: boolean) => {
    updateMutation.mutate({ id, data: { is_active: !currentStatus } });
  }, [updateMutation]);

  const renderNotificationItem = useCallback((notification: Notification) => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle>{notification.title}</CardTitle>
              <Badge variant={notification.is_active ? 'default' : 'secondary'}>
                {notification.is_active ? 'Aktif' : 'Pasif'}
              </Badge>
              <Badge variant="outline">{notification.notification_type}</Badge>
              {notification.user_segments && notification.user_segments.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  🎯 {notification.user_segments.includes('all') ? 'Tüm Kullanıcılar' : 
                     notification.user_segments.length === 1 ? 
                     (notification.user_segments[0] === 'new_visitor' ? 'Yeni Ziyaretçiler' : 
                      notification.user_segments[0] === 'returning_visitor' ? 'Tekrar Gelenler' :
                      notification.user_segments[0] === 'registered' ? 'Kayıtlı Üyeler' : 
                      'Anonim') :
                     `${notification.user_segments.length} Segment`}
                </Badge>
              )}
            </div>
            <CardDescription>{notification.content}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleActive(notification.id, notification.is_active)}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(notification)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (confirm('Bu bildirimi silmek istediğinizden emin misiniz?')) {
                  deleteMutation.mutate(notification.id);
                }
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {notification.image_url && (
        <CardContent>
          <img
            src={notification.image_url}
            alt={notification.title}
            className="w-full h-48 object-cover rounded-lg"
          />
        </CardContent>
      )}
    </Card>
  ), [toggleActive, handleEdit, deleteMutation]);

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bildirim Yönetimi</h2>
          <p className="text-muted-foreground">Popup ve banner bildirimleri oluşturun</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Bildirim
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingNotification ? 'Bildirimi Düzenle' : 'Yeni Bildirim Oluştur'}</DialogTitle>
              <DialogDescription>
                Site içi popup veya banner bildirimi oluşturun
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Başlık *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Bu Ayın En İyi Sitesi"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notification_type">Bildirim Tipi</Label>
                  <Select
                    value={formData.notification_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, notification_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popup">Popup (Merkez)</SelectItem>
                      <SelectItem value="banner">Banner (Üst)</SelectItem>
                      <SelectItem value="toast">Toast (Köşe)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">İçerik</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Harika bonuslar ve kazançlar sizi bekliyor!"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Görsel</Label>
                {formData.image_url && (
                  <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="button_text">Buton Metni</Label>
                  <Input
                    id="button_text"
                    value={formData.button_text}
                    onChange={(e) => setFormData(prev => ({ ...prev, button_text: e.target.value }))}
                    placeholder="Detayları Gör"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="button_url">Buton URL</Label>
                  <Input
                    id="button_url"
                    value={formData.button_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, button_url: e.target.value }))}
                    placeholder="/havanabet"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Başlangıç Tarihi</Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">Bitiş Tarihi</Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="display_frequency">Gösterim Sıklığı</Label>
                  <Select
                    value={formData.display_frequency}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, display_frequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Bir Kez</SelectItem>
                      <SelectItem value="daily">Günlük</SelectItem>
                      <SelectItem value="session">Oturum Başına</SelectItem>
                      <SelectItem value="always">Her Zaman</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Öncelik (0-10)</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              {/* Hedef Kitle Segmentleri */}
              <div className="space-y-3 border-t pt-4">
                <div>
                  <Label className="text-base font-semibold">🎯 Hedef Kitle Segmentleri</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Bu bildirimi hangi kullanıcı gruplarına göstermek istiyorsunuz?
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'all', label: 'Tüm Kullanıcılar', desc: 'Herkese göster' },
                    { value: 'new_visitor', label: 'Yeni Ziyaretçi', desc: 'İlk kez gelenlere' },
                    { value: 'returning_visitor', label: 'Tekrar Gelen', desc: 'Daha önce ziyaret etmiş' },
                    { value: 'registered', label: 'Kayıtlı Üye', desc: 'Giriş yapmış kullanıcılar' },
                    { value: 'anonymous', label: 'Anonim', desc: 'Giriş yapmamış kullanıcılar' },
                  ].map((segment) => (
                    <div
                      key={segment.value}
                      className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.user_segments.includes(segment.value)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          user_segments: prev.user_segments.includes(segment.value)
                            ? prev.user_segments.filter(s => s !== segment.value)
                            : [...prev.user_segments.filter(s => s !== 'all'), segment.value]
                        }));
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.user_segments.includes(segment.value)}
                        onChange={() => {}}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{segment.label}</div>
                        <div className="text-xs text-muted-foreground">{segment.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Görünürlük Sayfaları */}
              <div className="space-y-3 border-t pt-4">
                <div>
                  <Label className="text-base font-semibold">📍 Görünürlük Sayfaları</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Bu bildirimi hangi sayfalarda göstermek istiyorsunuz?
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'all', label: 'Tüm Sayfalar', desc: 'Her yerde göster' },
                    { value: 'home', label: 'Ana Sayfa', desc: 'Sadece ana sayfada' },
                    { value: 'deneme-bonusu', label: 'Deneme Bonusu', desc: 'Bonus sayfaları' },
                    { value: 'casino-siteleri', label: 'Casino Siteleri', desc: 'Site listesi' },
                  ].map((page) => (
                    <div
                      key={page.value}
                      className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.display_pages.includes(page.value)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          display_pages: prev.display_pages.includes(page.value)
                            ? prev.display_pages.filter(p => p !== page.value)
                            : [...prev.display_pages.filter(p => p !== 'all'), page.value]
                        }));
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.display_pages.includes(page.value)}
                        onChange={() => {}}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{page.label}</div>
                        <div className="text-xs text-muted-foreground">{page.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="background_color">Arkaplan Rengi</Label>
                  <Input
                    id="background_color"
                    type="color"
                    value={formData.background_color}
                    onChange={(e) => setFormData(prev => ({ ...prev, background_color: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="text_color">Metin Rengi</Label>
                  <Input
                    id="text_color"
                    type="color"
                    value={formData.text_color}
                    onChange={(e) => setFormData(prev => ({ ...prev, text_color: e.target.value }))}
                  />
                </div>
              </div>

              {/* Form Alanları (Bonus Kampanyaları için) */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold">📧 Form Alanları (Lead Capture / Bonus Kampanyaları)</h3>
                <p className="text-sm text-muted-foreground">
                  Kullanıcıdan e-posta ve telefon toplamak için form alanlarını özelleştirin
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email_label">E-posta Label</Label>
                    <Input
                      id="email_label"
                      value={formData.form_fields.email_label}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        form_fields: { ...prev.form_fields, email_label: e.target.value }
                      }))}
                      placeholder="E-posta Adresiniz"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_label">Telefon Label</Label>
                    <Input
                      id="phone_label"
                      value={formData.form_fields.phone_label}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        form_fields: { ...prev.form_fields, phone_label: e.target.value }
                      }))}
                      placeholder="Telefon Numaranız"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="submit_text">Submit Butonu Metni</Label>
                  <Input
                    id="submit_text"
                    value={formData.form_fields.submit_text}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      form_fields: { ...prev.form_fields, submit_text: e.target.value }
                    }))}
                    placeholder="Bonus Kodumu Gönder"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="success_message">Başarı Mesajı</Label>
                  <Textarea
                    id="success_message"
                    value={formData.form_fields.success_message}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      form_fields: { ...prev.form_fields, success_message: e.target.value }
                    }))}
                    placeholder="✅ Teşekkürler! Bonus kodunuz e-posta adresinize gönderildi."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="privacy_text">Gizlilik/KVKK Metni</Label>
                  <Textarea
                    id="privacy_text"
                    value={formData.form_fields.privacy_text}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      form_fields: { ...prev.form_fields, privacy_text: e.target.value }
                    }))}
                    placeholder="🔒 Bilgileriniz tamamen güvendedir..."
                    rows={2}
                  />
                </div>
              </div>

              {/* Tetikleyici Ayarları */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold">Tetikleyici Ayarları</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="trigger_type">Tetikleyici Tipi</Label>
                  <Select
                    value={formData.trigger_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, trigger_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instant">Anında Göster</SelectItem>
                      <SelectItem value="time_on_page">Sayfada Geçirilen Süre</SelectItem>
                      <SelectItem value="scroll_depth">Scroll Derinliği</SelectItem>
                      <SelectItem value="exit_intent">Çıkış Niyeti</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.trigger_type === 'time_on_page' && (
                  <div className="space-y-2">
                    <Label htmlFor="trigger_seconds">Saniye</Label>
                    <Input
                      id="trigger_seconds"
                      type="number"
                      min="1"
                      value={(formData.trigger_conditions as any)?.seconds || 10}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        trigger_conditions: { seconds: parseInt(e.target.value) }
                      }))}
                      placeholder="10"
                    />
                  </div>
                )}

                {formData.trigger_type === 'scroll_depth' && (
                  <div className="space-y-2">
                    <Label htmlFor="trigger_scroll">Scroll Yüzdesi</Label>
                    <Input
                      id="trigger_scroll"
                      type="number"
                      min="1"
                      max="100"
                      value={(formData.trigger_conditions as any)?.percentage || 50}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        trigger_conditions: { percentage: parseInt(e.target.value) }
                      }))}
                      placeholder="50"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Aktif</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  İptal
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingNotification ? 'Güncelle' : 'Oluştur'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {notifications && notifications.length > 0 ? (
        <VirtualList
          items={notifications}
          height={800}
          estimateSize={200}
          renderItem={renderNotificationItem}
          className="rounded-lg"
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Henüz bildirim bulunmamaktadır.</p>
        </div>
      )}
    </div>
  );
};