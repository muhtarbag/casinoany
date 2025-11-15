import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { showSuccessToast, showErrorToast } from '@/lib/toastHelpers';
import { Loader2, Database, HardDrive, Globe, FileText, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ClearCacheDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClearCacheDialog({ open, onOpenChange }: ClearCacheDialogProps) {
  const queryClient = useQueryClient();
  const [isClearing, setIsClearing] = useState(false);
  const [selectedCaches, setSelectedCaches] = useState({
    queryCache: true,
    localStorage: false,
    sessionStorage: false,
    serviceWorker: false,
    sitemapCache: false,
  });

  const toggleCache = (cache: keyof typeof selectedCaches) => {
    setSelectedCaches(prev => ({
      ...prev,
      [cache]: !prev[cache]
    }));
  };

  const selectAll = () => {
    setSelectedCaches({
      queryCache: true,
      localStorage: true,
      sessionStorage: true,
      serviceWorker: true,
      sitemapCache: true,
    });
  };

  const clearAll = async () => {
    setIsClearing(true);
    const results: string[] = [];

    try {
      // Clear Query Cache
      if (selectedCaches.queryCache) {
        queryClient.clear();
        results.push('React Query Cache');
      }

      // Clear LocalStorage
      if (selectedCaches.localStorage) {
        localStorage.clear();
        results.push('LocalStorage');
      }

      // Clear SessionStorage
      if (selectedCaches.sessionStorage) {
        sessionStorage.clear();
        results.push('SessionStorage');
      }

      // Clear Service Worker Cache
      if (selectedCaches.serviceWorker && 'serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
        
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
        }
        results.push('Service Worker Cache');
      }

      // Clear Sitemap Cache from Database
      if (selectedCaches.sitemapCache) {
        const { error } = await supabase
          .from('site_settings')
          .delete()
          .eq('setting_key', 'sitemap_xml');

        if (!error) {
          results.push('Sitemap Cache');
        }
      }

      if (results.length > 0) {
        showSuccessToast(`${results.join(', ')} temizlendi! Sayfa yenileniyor...`);
        
        // Reload page after 1.5 seconds to apply changes
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        showErrorToast('Temizlenecek cache seçilmedi');
      }
    } catch (error) {
      console.error('Cache temizleme hatası:', error);
      showErrorToast('Cache temizlenirken bir hata oluştu');
    } finally {
      setIsClearing(false);
      onOpenChange(false);
    }
  };

  const hasSelection = Object.values(selectedCaches).some(v => v);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Cache Temizleme
          </DialogTitle>
          <DialogDescription>
            Temizlemek istediğiniz cache türlerini seçin. Bazı işlemler sayfa yenilenmesini gerektirir.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={selectAll}
            className="w-full"
          >
            Tümünü Seç
          </Button>

          <div className="space-y-3">
            {/* Query Cache */}
            <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
              <Checkbox
                id="queryCache"
                checked={selectedCaches.queryCache}
                onCheckedChange={() => toggleCache('queryCache')}
              />
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor="queryCache"
                  className="flex items-center gap-2 font-medium cursor-pointer"
                >
                  <Database className="w-4 h-4" />
                  React Query Cache
                </Label>
                <p className="text-sm text-muted-foreground">
                  API çağrılarının önbelleği. Sayfa yenilenmeden temizlenir.
                </p>
              </div>
            </div>

            {/* LocalStorage */}
            <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
              <Checkbox
                id="localStorage"
                checked={selectedCaches.localStorage}
                onCheckedChange={() => toggleCache('localStorage')}
              />
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor="localStorage"
                  className="flex items-center gap-2 font-medium cursor-pointer"
                >
                  <HardDrive className="w-4 h-4" />
                  Local Storage
                </Label>
                <p className="text-sm text-muted-foreground">
                  Tarayıcıda kalıcı olarak saklanan veriler. Oturum bilgileri silinir.
                </p>
              </div>
            </div>

            {/* SessionStorage */}
            <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
              <Checkbox
                id="sessionStorage"
                checked={selectedCaches.sessionStorage}
                onCheckedChange={() => toggleCache('sessionStorage')}
              />
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor="sessionStorage"
                  className="flex items-center gap-2 font-medium cursor-pointer"
                >
                  <HardDrive className="w-4 h-4" />
                  Session Storage
                </Label>
                <p className="text-sm text-muted-foreground">
                  Oturum süresince geçerli veriler. Sekme kapandığında zaten silinir.
                </p>
              </div>
            </div>

            {/* Service Worker */}
            <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
              <Checkbox
                id="serviceWorker"
                checked={selectedCaches.serviceWorker}
                onCheckedChange={() => toggleCache('serviceWorker')}
              />
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor="serviceWorker"
                  className="flex items-center gap-2 font-medium cursor-pointer"
                >
                  <Globe className="w-4 h-4" />
                  Service Worker Cache
                </Label>
                <p className="text-sm text-muted-foreground">
                  PWA ve offline cache. Sayfa yenilenmesi gerektirir.
                </p>
              </div>
            </div>

            {/* Sitemap Cache */}
            <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
              <Checkbox
                id="sitemapCache"
                checked={selectedCaches.sitemapCache}
                onCheckedChange={() => toggleCache('sitemapCache')}
              />
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor="sitemapCache"
                  className="flex items-center gap-2 font-medium cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  Sitemap Cache
                </Label>
                <p className="text-sm text-muted-foreground">
                  Veritabanında saklanan sitemap önbelleği. Sonraki ziyarette yeniden oluşturulur.
                </p>
              </div>
            </div>
          </div>

          {(selectedCaches.localStorage || selectedCaches.serviceWorker) && (
            <Alert>
              <AlertDescription className="text-sm">
                ⚠️ Seçtiğiniz cache türleri sayfa yenilenmesi gerektirir. İşlem tamamlandıktan sonra sayfa otomatik yenilenecek.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isClearing}
          >
            İptal
          </Button>
          <Button
            onClick={clearAll}
            disabled={!hasSelection || isClearing}
          >
            {isClearing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Temizleniyor...
              </>
            ) : (
              'Temizle'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
