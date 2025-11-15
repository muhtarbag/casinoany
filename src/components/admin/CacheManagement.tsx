import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Trash2, 
  RefreshCw, 
  Database, 
  Search, 
  FileText, 
  HardDrive,
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { queryCache, searchCache, userPreferencesCache, invalidateCache } from '@/lib/intelligentCache';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CacheStats {
  name: string;
  icon: any;
  size: number;
  maxSize: number;
  entries: number;
  oldestAge: number;
  color: string;
}

export function CacheManagement() {
  const [stats, setStats] = useState<CacheStats[]>([]);
  const [localStorageSize, setLocalStorageSize] = useState(0);
  const [isClearing, setIsClearing] = useState(false);

  const loadStats = () => {
    const queryStats = queryCache.getStats();
    const searchStats = searchCache.getStats();
    const prefStats = userPreferencesCache.getStats();

    // Calculate localStorage size
    let lsSize = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        lsSize += localStorage[key].length + key.length;
      }
    }
    setLocalStorageSize(lsSize);

    const allStats: CacheStats[] = [
      {
        name: 'Query Cache',
        icon: Database,
        size: queryStats.size,
        maxSize: queryStats.maxSize,
        entries: queryStats.entries.length,
        oldestAge: Math.max(...queryStats.entries.map(e => e.age), 0),
        color: 'text-blue-500',
      },
      {
        name: 'Search Cache',
        icon: Search,
        size: searchStats.size,
        maxSize: searchStats.maxSize,
        entries: searchStats.entries.length,
        oldestAge: Math.max(...searchStats.entries.map(e => e.age), 0),
        color: 'text-green-500',
      },
      {
        name: 'User Preferences',
        icon: FileText,
        size: prefStats.size,
        maxSize: prefStats.maxSize,
        entries: prefStats.entries.length,
        oldestAge: Math.max(...prefStats.entries.map(e => e.age), 0),
        color: 'text-purple-500',
      },
    ];

    setStats(allStats);
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const clearQueryCache = () => {
    queryCache.clear();
    toast.success('Query cache temizlendi');
    loadStats();
  };

  const clearSearchCache = () => {
    searchCache.clear();
    toast.success('Search cache temizlendi');
    loadStats();
  };

  const clearUserPreferences = () => {
    userPreferencesCache.clear();
    toast.success('User preferences temizlendi');
    loadStats();
  };

  const clearExpired = () => {
    queryCache.clearExpired();
    searchCache.clearExpired();
    userPreferencesCache.clearExpired();
    toast.success('Süresi dolmuş cache girişleri temizlendi');
    loadStats();
  };

  const clearLocalStorage = () => {
    const confirm = window.confirm(
      '⚠️ TÜM LocalStorage verisi silinecek!\n\n' +
      '• Kayıtlı filtreler\n' +
      '• Form taslakları\n' +
      '• Kullanıcı tercihleri\n' +
      '• Smart defaults\n\n' +
      'Devam etmek istiyor musunuz?'
    );

    if (confirm) {
      localStorage.clear();
      toast.success('LocalStorage tamamen temizlendi');
      loadStats();
    }
  };

  const clearAllCaches = async () => {
    setIsClearing(true);
    
    try {
      // Clear memory caches
      queryCache.clear();
      searchCache.clear();
      userPreferencesCache.clear();
      
      // Clear specific localStorage patterns
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.startsWith('form-draft-') ||
        key.startsWith('smart-defaults-') ||
        key.startsWith('filter-patterns-') ||
        key.startsWith('sort-frequency-')
      );
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      toast.success('Tüm cache\'ler temizlendi! Sayfa yenileniyor...', {
        duration: 2000,
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      toast.error('Cache temizlenirken hata oluştu');
      console.error(error);
    } finally {
      setIsClearing(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatAge = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  };

  const totalEntries = stats.reduce((sum, s) => sum + s.entries, 0);
  const totalCapacity = stats.reduce((sum, s) => sum + s.size, 0);
  const maxCapacity = stats.reduce((sum, s) => sum + s.maxSize, 0);
  const usagePercent = (totalCapacity / maxCapacity) * 100;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="w-5 h-5" />
                Cache Genel Bakış
              </CardTitle>
              <CardDescription>
                Bellek ve disk kullanımı istatistikleri
              </CardDescription>
            </div>
            <Button
              variant="destructive"
              onClick={clearAllCaches}
              disabled={isClearing}
              className="gap-2"
            >
              {isClearing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Temizleniyor...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Tümünü Temizle
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Toplam Giriş</p>
              <p className="text-2xl font-bold">{totalEntries}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Kapasite Kullanımı</p>
              <p className="text-2xl font-bold">
                {totalCapacity}/{maxCapacity}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">LocalStorage</p>
              <p className="text-2xl font-bold">{formatBytes(localStorageSize)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Cache Doluluk Oranı</span>
              <span className={cn(
                "font-medium",
                usagePercent > 80 ? "text-destructive" : "text-success"
              )}>
                {usagePercent.toFixed(1)}%
              </span>
            </div>
            <Progress value={usagePercent} className="h-2" />
          </div>

          {usagePercent > 80 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Cache kullanımı yüksek! Performans sorunları yaşanabilir. Temizlik önerilir.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Individual Cache Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const usage = (stat.size / stat.maxSize) * 100;
          
          return (
            <Card key={stat.name}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Icon className={cn("w-4 h-4", stat.color)} />
                    {stat.name}
                  </span>
                  <Badge variant={usage > 80 ? "destructive" : "secondary"}>
                    {usage.toFixed(0)}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Entries</span>
                    <span className="font-medium text-foreground">
                      {stat.entries} / {stat.maxSize}
                    </span>
                  </div>
                  <Progress value={usage} className="h-1" />
                </div>

                {stat.oldestAge > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">En eski</span>
                    <span className="font-medium">{formatAge(stat.oldestAge)}</span>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => {
                    if (stat.name === 'Query Cache') clearQueryCache();
                    else if (stat.name === 'Search Cache') clearSearchCache();
                    else if (stat.name === 'User Preferences') clearUserPreferences();
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                  Temizle
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Advanced Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Gelişmiş İşlemler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Button
              variant="outline"
              onClick={clearExpired}
              className="gap-2 justify-start"
            >
              <RefreshCw className="w-4 h-4" />
              Süresi Dolmuş Girişleri Temizle
            </Button>

            <Button
              variant="outline"
              onClick={clearLocalStorage}
              className="gap-2 justify-start text-destructive hover:text-destructive"
            >
              <AlertTriangle className="w-4 h-4" />
              LocalStorage'ı Temizle
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                invalidateCache.sites();
                toast.success('Site cache\'leri invalidate edildi');
                loadStats();
              }}
              className="gap-2 justify-start"
            >
              <Database className="w-4 h-4" />
              Site Cache Invalidate
            </Button>

            <Button
              variant="outline"
              onClick={loadStats}
              className="gap-2 justify-start"
            >
              <RefreshCw className="w-4 h-4" />
              İstatistikleri Yenile
            </Button>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Not:</strong> Cache temizliği geçici performans düşüşüne neden olabilir.
              Sistem otomatik olarak yeni cache'ler oluşturacaktır.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
