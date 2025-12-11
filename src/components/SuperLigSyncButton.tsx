import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function SuperLigSyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-super-lig');
      
      if (error) throw error;

      toast.success(`Süper Lig verileri güncellendi! ${data.stats.teams} takım, ${data.stats.standings} puan, ${data.stats.fixtures} maç`);
      
      // Sayfayı yenile
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error('Sync error:', error);
      toast.error('Veri güncellenirken hata oluştu: ' + error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={isSyncing}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
      {isSyncing ? 'Güncelleniyor...' : 'Verileri Güncelle'}
    </Button>
  );
}
