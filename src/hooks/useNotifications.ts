import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QUERY_DEFAULTS, queryKeys } from '@/lib/queryClient';

export interface SystemNotification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  action?: {
    label: string;
    url: string;
  };
  read: boolean;
  createdAt: string;
  metadata?: any;
}

export function useNotifications() {
  const { data: changeHistory } = useQuery({
    queryKey: ['admin', 'notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('change_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;

      // Transform change history to notifications
      return (data || []).map(change => {
        const metadata = (change.metadata as any) || {};
        const isRead = metadata.read === true;
        
        // Determine notification type and message
        let type: 'info' | 'warning' | 'success' | 'error' = 'info';
        let title = 'Sistem Bildirimi';
        let message = '';
        
        switch (change.action_type) {
          case 'delete':
            type = 'warning';
            title = 'Silme İşlemi';
            message = `${change.table_name} tablosundan kayıt silindi`;
            break;
          case 'update':
            type = 'info';
            title = 'Güncelleme İşlemi';
            message = `${change.table_name} tablosunda kayıt güncellendi`;
            break;
          case 'insert':
            type = 'success';
            title = 'Yeni Kayıt';
            message = `${change.table_name} tablosuna yeni kayıt eklendi`;
            break;
          case 'bulk_update':
            type = 'info';
            title = 'Toplu Güncelleme';
            message = `${change.table_name} tablosunda ${change.record_ids?.length || 0} kayıt güncellendi`;
            break;
          case 'bulk_delete':
            type = 'warning';
            title = 'Toplu Silme';
            message = `${change.table_name} tablosundan ${change.record_ids?.length || 0} kayıt silindi`;
            break;
          default:
            message = metadata.description || `${change.table_name} tablosunda değişiklik`;
        }

        return {
          id: change.id,
          type,
          title,
          message,
          read: isRead,
          createdAt: change.created_at,
          metadata,
        };
      }) as SystemNotification[];
    },
    // STANDARDIZED: Admin data pattern (2 dakika refetch interval)
    ...QUERY_DEFAULTS.admin,
  });

  const unreadCount = changeHistory?.filter(n => !n.read).length || 0;

  return {
    notifications: changeHistory || [],
    unreadCount,
  };
}
