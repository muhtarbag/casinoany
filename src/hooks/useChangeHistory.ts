import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ChangeHistory {
  id: string;
  created_at: string;
  user_id: string;
  action_type: 'create' | 'update' | 'delete' | 'bulk_delete' | 'bulk_update';
  table_name: string;
  record_id?: string;
  record_ids?: string[];
  previous_data?: any;
  new_data?: any;
  metadata?: any;
  is_undone: boolean;
  undone_at?: string;
  undone_by?: string;
  batch_id?: string;
}

export function useChangeHistory(options: { limit?: number; tableFilter?: string } = {}) {
  return useQuery({
    queryKey: ['change-history', options],
    queryFn: async () => {
      let query = supabase
        .from('change_history')
        .select('*')
        .eq('is_undone', false)
        .order('created_at', { ascending: false });

      if (options.tableFilter) {
        query = query.eq('table_name', options.tableFilter);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ChangeHistory[];
    },
  });
}

export function useUndoChange() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (changeId: string) => {
      const { data, error } = await supabase.rpc('undo_change', {
        p_change_id: changeId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['change-history'] });
      queryClient.invalidateQueries({ queryKey: ['betting-sites'] });
      toast({
        title: 'Geri Alındı',
        description: 'Değişiklik başarıyla geri alındı',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: error.message || 'Geri alma işlemi başarısız oldu',
      });
    },
  });
}

export function useLogChange() {
  return useMutation({
    mutationFn: async (params: {
      actionType: string;
      tableName: string;
      recordId?: string;
      recordIds?: string[];
      previousData?: any;
      newData?: any;
      metadata?: any;
      batchId?: string;
    }) => {
      const { data, error } = await supabase.rpc('log_change', {
        p_action_type: params.actionType,
        p_table_name: params.tableName,
        p_record_id: params.recordId,
        p_record_ids: params.recordIds,
        p_previous_data: params.previousData,
        p_new_data: params.newData,
        p_metadata: params.metadata || {},
        p_batch_id: params.batchId,
      });

      if (error) throw error;
      return data;
    },
  });
}
