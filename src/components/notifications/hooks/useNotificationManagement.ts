/**
 * Notification Management Hook
 * Handles CRUD operations and business logic for notifications
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { QUERY_DEFAULTS } from '@/lib/queryClient';
import type { Notification, NotificationFormData } from '../types';

const DEFAULT_FORM_DATA: NotificationFormData = {
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
  // Advanced styling options
  font_family: 'Inter',
  font_size: 'base',
  border_radius: 'lg',
  max_width: 'md',
  padding: 'normal',
  border_color: '',
  border_width: '0',
  shadow_size: 'lg',
};

export function useNotificationManagement() {
  const queryClient = useQueryClient();
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [formData, setFormData] = useState<NotificationFormData>(DEFAULT_FORM_DATA);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', 'admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_notifications')
        .select('*')
        .order('created_at', { ascending: false});
      
      if (error) throw error;
      return data as unknown as Notification[];
    },
    // Use dynamic pattern for admin panel data
    ...QUERY_DEFAULTS.admin,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: NotificationFormData) => {
      const { error } = await supabase
        .from('site_notifications')
        .insert([data as any]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Bildirim oluşturuldu!');
    },
    onError: (error: any) => {
      toast.error('Hata: ' + error.message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<NotificationFormData> }) => {
      const { error } = await supabase
        .from('site_notifications')
        .update(data as any)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Bildirim güncellendi!');
    },
    onError: (error: any) => {
      toast.error('Hata: ' + error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('site_notifications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Bildirim silindi!');
    },
    onError: (error: any) => {
      toast.error('Hata: ' + error.message);
    },
  });

  // Image upload handler
  const handleImageUpload = useCallback(async (file: File) => {
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('notification-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('notification-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast.success('Görsel yüklendi!');
      return publicUrl;
    } catch (error: any) {
      toast.error('Görsel yüklenemedi: ' + error.message);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  }, []);

  // Form submit handler
  const handleSubmit = useCallback((data: NotificationFormData) => {
    // Sanitize data
    const sanitizedData = {
      ...data,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
    };
    
    if (editingNotification) {
      updateMutation.mutate({ id: editingNotification.id, data: sanitizedData });
    } else {
      createMutation.mutate(sanitizedData as any);
    }
  }, [editingNotification, updateMutation, createMutation]);

  // Edit handler
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
      trigger_type: notification.trigger_type || 'instant',
      trigger_conditions: notification.trigger_conditions || {},
      form_fields: notification.form_fields || DEFAULT_FORM_DATA.form_fields,
      // Advanced styling options
      font_family: notification.font_family || 'Inter',
      font_size: notification.font_size || 'base',
      border_radius: notification.border_radius || 'lg',
      max_width: notification.max_width || 'md',
      padding: notification.padding || 'normal',
      border_color: notification.border_color || '',
      border_width: notification.border_width || '0',
      shadow_size: notification.shadow_size || 'lg',
    });
  }, []);

  // Delete handler
  const handleDelete = useCallback((id: string) => {
    if (window.confirm('Bu bildirimi silmek istediğinizden emin misiniz?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData(DEFAULT_FORM_DATA);
    setEditingNotification(null);
  }, []);

  return {
    notifications,
    isLoading,
    formData,
    setFormData,
    editingNotification,
    uploadingImage,
    handleImageUpload,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
