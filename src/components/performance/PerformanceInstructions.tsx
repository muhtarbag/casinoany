import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, TrendingUp, Zap, Target } from 'lucide-react';

export function PerformanceInstructions() {
  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Performance Dashboard Nasıl Çalışır?</AlertTitle>
        <AlertDescription>
          Bu dashboard, uygulamanızın gerçek kullanıcı deneyimlerinden toplanan Core Web Vitals metriklerini gösterir.
          Veriler otomatik olarak toplanır ve her 30 saniyede bir güncellenir.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              PageSpeed Skoru
            </CardTitle>
            <CardDescription>Google'ın performans algoritması</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm space-y-1">
              <p><strong>90-100:</strong> Mükemmel - Hızlı</p>
              <p><strong>50-89:</strong> Orta - İyileştirilebilir</p>
              <p><strong>0-49:</strong> Zayıf - Acil iyileştirme gerekli</p>
            </div>
            <div className="text-xs text-muted-foreground mt-4">
              Skor, tüm Core Web Vitals metriklerinin ağırlıklı ortalamasıdır:
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>FCP: %10</li>
                <li>LCP: %25 (en önemli)</li>
                <li>CLS: %15</li>
                <li>INP: %30 (en önemli)</li>
                <li>TTFB: %20</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Metrikleri İyileştirme
            </CardTitle>
            <CardDescription>Performans optimizasyon ipuçları</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <strong>LCP İyileştirme:</strong>
              <ul className="list-disc list-inside text-xs text-muted-foreground mt-1 space-y-1">
                <li>Görselleri optimize edin (WebP, lazy loading)</li>
                <li>CDN kullanın</li>
                <li>Kritik CSS'i inline yapın</li>
              </ul>
            </div>
            <div>
              <strong>INP İyileştirme:</strong>
              <ul className="list-disc list-inside text-xs text-muted-foreground mt-1 space-y-1">
                <li>JavaScript execution süresini azaltın</li>
                <li>Event handler'ları optimize edin</li>
                <li>Long tasks'ları bölün</li>
              </ul>
            </div>
            <div>
              <strong>CLS İyileştirme:</strong>
              <ul className="list-disc list-inside text-xs text-muted-foreground mt-1 space-y-1">
                <li>Görseller için boyut belirtin</li>
                <li>Font loading'i optimize edin</li>
                <li>Dinamik içerik için yer ayırın</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Yapılan Optimizasyonlar
          </CardTitle>
          <CardDescription>Son güncellemeyle eklenen iyileştirmeler</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
              <div>
                <strong>Code Splitting:</strong> Vendor kodları ayrıştırıldı, initial bundle size küçüldü
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
              <div>
                <strong>Resource Preloading:</strong> Kritik kaynaklar preload, DNS prefetch eklendi
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
              <div>
                <strong>Component Memoization:</strong> Gereksiz re-render'lar önlendi
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
              <div>
                <strong>Image Lazy Loading:</strong> Görseller viewport'a yaklaşınca yükleniyor
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
              <div>
                <strong>Browser Caching:</strong> Static asset'ler 1 yıl cache'leniyor
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
              <div>
                <strong>Tracking Optimization:</strong> Web vitals batch halinde gönderiliyor
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
