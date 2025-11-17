/**
 * Connection Status Indicator
 * Shows Supabase connection health to users
 */

import { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { connectionMonitor, ConnectionStatus as Status } from '@/lib/supabaseConnectionMonitor';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export const ConnectionStatus = () => {
  const [status, setStatus] = useState<Status>('connected');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Subscribe to connection status changes
    const handleStatusChange = (newStatus: Status) => {
      setStatus(newStatus);
      // Only show indicator when not connected
      setIsVisible(newStatus !== 'connected');
    };

    connectionMonitor.addListener(handleStatusChange);

    return () => {
      connectionMonitor.removeListener(handleStatusChange);
    };
  }, []);

  if (!isVisible) return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'reconnecting':
        return {
          icon: RefreshCw,
          message: 'Bağlantı kuruluyor...',
          variant: 'default' as const,
          animate: true,
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          message: 'Bağlantı kesildi',
          variant: 'destructive' as const,
          animate: false,
        };
      case 'error':
        return {
          icon: AlertCircle,
          message: 'Bağlantı hatası - Lütfen sayfayı yenileyin',
          variant: 'destructive' as const,
          animate: false,
        };
      default:
        return {
          icon: Wifi,
          message: 'Bağlantı sağlandı',
          variant: 'default' as const,
          animate: false,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Alert variant={config.variant} className="shadow-lg">
        <Icon className={`h-4 w-4 ${config.animate ? 'animate-spin' : ''}`} />
        <AlertDescription className="flex items-center justify-between gap-4">
          <span>{config.message}</span>
          {status === 'error' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => connectionMonitor.forceReconnect()}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Tekrar Dene
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};
