import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SEOHealthDashboard() {
  const sitemapChecks = [
    { name: "sitemap.xml", status: "active", url: "https://casinoany.com/sitemap.xml" },
    { name: "sitemap-sites.xml", status: "active", url: "https://casinoany.com/sitemap-sites.xml" },
    { name: "sitemap-categories.xml", status: "active", url: "https://casinoany.com/sitemap-categories.xml" },
    { name: "sitemap-pages.xml", status: "active", url: "https://casinoany.com/sitemap-pages.xml" },
    { name: "sitemap-blogs.xml", status: "active", url: "https://casinoany.com/sitemap-blogs.xml" },
    { name: "sitemap-news.xml", status: "active", url: "https://casinoany.com/sitemap-news.xml" },
    { name: "sitemap-bonuses.xml", status: "active", url: "https://casinoany.com/sitemap-bonuses.xml" },
    { name: "sitemap-static.xml", status: "active", url: "https://casinoany.com/sitemap-static.xml" },
    { name: "sitemap-images.xml", status: "active", url: "https://casinoany.com/sitemap-images.xml" },
    { name: "sitemap-complaints.xml", status: "active", url: "https://casinoany.com/sitemap-complaints.xml" },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">📊 Search Console Teknik Sağlık Kontrolü</h1>
        <p className="text-muted-foreground">
          Google Search Console'dan manuel olarak kontrol edilmesi gereken SEO metrikleri
        </p>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 Hızlı Erişim</CardTitle>
          <CardDescription>Search Console kontrolleri için direkt linkler</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-between" asChild>
            <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">
              Google Search Console Aç
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="outline" className="w-full justify-between" asChild>
            <a href="https://search.google.com/search-console/coverage" target="_blank" rel="noopener noreferrer">
              Coverage Raporu
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="outline" className="w-full justify-between" asChild>
            <a href="https://search.google.com/search-console/sitemaps" target="_blank" rel="noopener noreferrer">
              Sitemap Durumu
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Sitemap Fetch Status */}
      <Card>
        <CardHeader>
          <CardTitle>📄 Sitemap Fetch Durumu</CardTitle>
          <CardDescription>Tüm sitemap dosyalarının durumu</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Manuel Kontrol Gerekli:</strong> Search Console'da her sitemap için "Fetch as Google" yapın ve durumu kontrol edin.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            {sitemapChecks.map((sitemap) => (
              <div key={sitemap.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{sitemap.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Manuel Kontrol</Badge>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={sitemap.url} target="_blank" rel="noopener noreferrer">
                      Test Et
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Coverage Report */}
      <Card>
        <CardHeader>
          <CardTitle>📈 Coverage Raporu</CardTitle>
          <CardDescription>İndexlenme durumu kontrolü</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Search Console → Coverage bölümünden kontrol edilmesi gerekenler:
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">✅ Valid Pages (İndexlenen Sayfalar)</span>
                <Badge variant="secondary">Manuel Kontrol</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Toplam kaç sayfa Google'da indexlendi?
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">⚠️ Valid with Warnings</span>
                <Badge variant="outline">Kontrol Et</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                İndexli ama uyarısı olan sayfalar var mı?
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">❌ Error Pages</span>
                <Badge variant="destructive">Kritik</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                İndexlenemeyen sayfalar (404, 500 hataları)
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">🔗 Alternate Page with Canonical Tag</span>
                <Badge variant="outline">İncelenmeli</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Canonical tag kullanımı doğru mu? Duplicate content var mı?
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Crawl Stats */}
      <Card>
        <CardHeader>
          <CardTitle>🕷️ Crawl İstatistikleri</CardTitle>
          <CardDescription>Googlebot tarama davranışı</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Search Console → Settings → Crawl Stats'dan kontrol edilmesi gerekenler:
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <div className="text-sm font-medium mb-1">📊 Crawl Requests</div>
              <p className="text-xs text-muted-foreground">Günlük ortalama tarama sayısı normal mi?</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="text-sm font-medium mb-1">⚡ Crawl Anomaly</div>
              <p className="text-xs text-muted-foreground">Anormal tarama aktivitesi var mı? (İdeal: 0)</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="text-sm font-medium mb-1">📱 Host Status</div>
              <p className="text-xs text-muted-foreground">Server cevap süreleri normal mi?</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="text-sm font-medium mb-1">🔄 Crawl Rate</div>
              <p className="text-xs text-muted-foreground">Tarama hızı optimize edilmiş mi?</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Index Checks */}
      <Card>
        <CardHeader>
          <CardTitle>📱 Mobile Index Kontrolleri</CardTitle>
          <CardDescription>Mobile-first indexing durumu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Search Console → Mobile Usability bölümünden kontrol edilmesi gerekenler:
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">📲 Mobile-Friendly Test</span>
                <Badge variant="secondary">Test Et</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Tüm sayfalar mobile-friendly mi?
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href="https://search.google.com/test/mobile-friendly" target="_blank" rel="noopener noreferrer">
                  Mobile Test Aracı
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">⚡ Mobile Page Speed</span>
                <Badge variant="outline">Ölç</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Mobil performans skorları yeterli mi? (Hedef: 90+)
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href="https://pagespeed.web.dev/" target="_blank" rel="noopener noreferrer">
                  PageSpeed Insights
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">🖼️ Viewport Configuration</span>
                <Badge variant="outline">Kontrol</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Meta viewport tag doğru tanımlı mı?
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Page Experience */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Page Experience Raporu</CardTitle>
          <CardDescription>Core Web Vitals ve kullanıcı deneyimi metrikleri</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Search Console → Experience → Page Experience bölümünden kontrol edilmesi gerekenler:
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">🎯 Core Web Vitals</span>
                <Badge variant="secondary">Manuel Kontrol</Badge>
              </div>
              <div className="space-y-2 mt-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">LCP (Largest Contentful Paint)</span>
                  <span className="font-medium">{'< 2.5s (İyi)'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">FID (First Input Delay)</span>
                  <span className="font-medium">{'< 100ms (İyi)'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">CLS (Cumulative Layout Shift)</span>
                  <span className="font-medium">{'< 0.1 (İyi)'}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">🔒 HTTPS Usage</span>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-sm text-muted-foreground">
                Tüm sayfalar HTTPS üzerinden mi sunuluyor?
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">📱 Mobile Usability</span>
                <Badge variant="outline">Kontrol Et</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Mobile usability hatası var mı?
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">🚫 Intrusive Interstitials</span>
                <Badge variant="outline">İncelenmeli</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Mobilde rahatsız edici popup'lar var mı?
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Soft 404 Errors */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Soft 404 ve Diğer Hatalar</CardTitle>
          <CardDescription>Silinmiş veya eksik içerik kontrolleri</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Search Console → Coverage → Excluded bölümünden kontrol edilmesi gerekenler:
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">⚠️ Soft 404 Errors</span>
                <Badge variant="destructive">Kritik</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                200 status kodu veren ama içeriği olmayan sayfalar. Bu sayfalar düzeltilmeli veya 404 dönmeli.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">🔗 Redirect Chains</span>
                <Badge variant="outline">Optimize Et</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Çoklu redirect'ler var mı? (301 → 301 → 200 yerine direkt 301 → 200)
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">⛔ 404 Errors</span>
                <Badge variant="outline">Düzenli Kontrol</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Kırık linkler temizlenmeli veya 301 redirect ile yönlendirilmeli.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">🚫 Blocked by robots.txt</span>
                <Badge variant="outline">Gözden Geçir</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                İstemeden engellenmiş önemli sayfalar var mı?
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle>✅ Yapılacaklar Listesi</CardTitle>
          <CardDescription>Hemen kontrol edilmesi gereken konular</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 list-decimal list-inside">
            <li className="text-sm">
              <strong>Search Console'a sitemap gönder:</strong> Ana sitemap'i (https://casinoany.com/sitemap.xml) Google'a bildir
            </li>
            <li className="text-sm">
              <strong>Coverage raporunu incele:</strong> İndexlenen sayfa sayısını ve hataları kontrol et
            </li>
            <li className="text-sm">
              <strong>Crawl stats anomalilerini ara:</strong> Tarama hatalarını tespit et
            </li>
            <li className="text-sm">
              <strong>Mobile usability test et:</strong> Tüm önemli sayfalar için mobil uyumluluk kontrol et
            </li>
            <li className="text-sm">
              <strong>Core Web Vitals'ı ölç:</strong> PageSpeed Insights ile performans skorunu gör
            </li>
            <li className="text-sm">
              <strong>Soft 404'leri düzelt:</strong> Sahte 404 sayfalarını tespit edip onar
            </li>
            <li className="text-sm">
              <strong>Canonical tag'leri kontrol et:</strong> Duplicate content var mı?
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
