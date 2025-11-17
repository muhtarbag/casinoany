import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

/**
 * Hook for detecting online/offline status
 * ✅ FIX: Graceful recovery without destroying app state
 */
export function useOfflineDetection() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      
      if (wasOffline) {
        // ✅ FIX: Invalidate queries instead of hard reload
        queryClient.invalidateQueries();
        
        toast({
          title: 'İnternet Bağlantısı Yeniden Kuruldu',
          description: 'Veriler güncelleniyor...',
          variant: 'default'
        });
      }
      
      setWasOffline(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      
      toast({
        title: 'İnternet Bağlantısı Kesildi',
        description: 'Lütfen bağlantınızı kontrol edin.',
        variant: 'destructive',
        duration: Infinity
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
}
