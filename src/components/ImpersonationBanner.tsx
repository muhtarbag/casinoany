import { AlertCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useImpersonation } from '@/hooks/useImpersonation';
import { useEffect, useState } from 'react';

/**
 * ✅ Impersonation durumunu gösteren banner
 * Header'ın altında görünür
 */
export const ImpersonationBanner = () => {
  const { isImpersonating, exitImpersonation, loading, getImpersonationDuration } = useImpersonation();
  const [duration, setDuration] = useState<number | null>(null);

  useEffect(() => {
    if (!isImpersonating) return;

    // Update duration every minute
    const updateDuration = () => {
      setDuration(getImpersonationDuration());
    };

    updateDuration();
    const interval = setInterval(updateDuration, 60000); // Every minute

    return () => clearInterval(interval);
  }, [isImpersonating, getImpersonationDuration]);

  if (!isImpersonating) return null;

  return (
    <Alert className="rounded-none border-x-0 border-t-0 bg-warning/10 border-warning">
      <AlertCircle className="h-4 w-4 text-warning" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-sm font-medium text-warning">
          ⚠️ Admin Modu: Kullanıcı olarak görüntülüyorsunuz
          {duration !== null && ` (${duration} dakika)`}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={exitImpersonation}
          disabled={loading}
          className="border-warning text-warning hover:bg-warning hover:text-warning-foreground"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {loading ? 'Çıkılıyor...' : 'Admin Moduna Dön'}
        </Button>
      </AlertDescription>
    </Alert>
  );
};
