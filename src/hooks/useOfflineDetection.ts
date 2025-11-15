import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

/**
 * Hook for detecting online/offline status
 */
export function useOfflineDetection() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      
      if (wasOffline) {
        toast({
          title: 'İnternet Bağlantısı Yeniden Kuruldu',
          description: 'Sayfa güncellenecek...',
          variant: 'default'
        });
        
        // Reload after 2 seconds to sync data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
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
