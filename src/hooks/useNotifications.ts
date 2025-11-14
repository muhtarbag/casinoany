import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
}

export function useNotifications() {
  const { data: changeHistory } = useQuery({
    queryKey: ['system-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('change_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Transform change history to notifications
      return (data || []).map(change => {
        const metadata = change.metadata as any;
        return {
          id: change.id,
          type: change.action_type === 'delete' ? 'warning' as const : 'info' as const,
          title: `${change.action_type === 'delete' ? 'Silme' : 'Güncelleme'} İşlemi`,
          message: metadata?.description || `${change.table_name} tablosunda değişiklik`,
          read: change.is_undone || false,
          createdAt: change.created_at,
        };
      }) as SystemNotification[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const unreadCount = changeHistory?.filter(n => !n.read).length || 0;

  return {
    notifications: changeHistory || [],
    unreadCount,
  };
}
