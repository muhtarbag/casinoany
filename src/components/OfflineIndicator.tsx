import { useOfflineDetection } from '@/hooks/useOfflineDetection';
import { AlertTriangle, Wifi } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * Offline mode indicator
 */
export const OfflineIndicator = () => {
  const { isOnline } = useOfflineDetection();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] safe-area-top">
      <Alert variant="destructive" className="rounded-none border-x-0 border-t-0">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>İnternet Bağlantısı Yok</AlertTitle>
        <AlertDescription className="flex items-center gap-2">
          <Wifi className="h-4 w-4" />
          Offline moddasınız. Bazı özellikler kullanılamayabilir.
        </AlertDescription>
      </Alert>
    </div>
  );
};
