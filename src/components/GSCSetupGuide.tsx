import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Copy, ExternalLink, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function GSCSetupGuide() {
  const siteUrl = window.location.origin;
  const sitemapUrl = `https://cpaukwimbfoembwwtqhj.supabase.co/functions/v1/dynamic-sitemap`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} kopyalandı!`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Google Search Console Kurulum Rehberi
          </CardTitle>
          <CardDescription>
            Sitenizi Google Search Console'a ekleyin ve SEO performansınızı takip edin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="verification" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="verification">1. Doğrulama</TabsTrigger>
              <TabsTrigger value="sitemap">2. Sitemap</TabsTrigger>
              <TabsTrigger value="monitoring">3. İzleme</TabsTrigger>
            </TabsList>

            {/* Verification Tab */}
            <TabsContent value="verification" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Site Mülkiyetini Doğrulama</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Google Search Console'da sitenizin sahibi olduğunuzu kanıtlayın
                  </p>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Önemli:</strong> Doğrulama için Google Search Console hesabınıza giriş yapmış olmalısınız.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div className="rounded-lg border bg-card p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Adım 1</Badge>
                    </div>
                    <p className="text-sm">
                      <strong>Google Search Console'a gidin:</strong>
                    </p>
                    <a
                      href="https://search.google.com/search-console"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                    >
                      search.google.com/search-console
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="rounded-lg border bg-card p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Adım 2</Badge>
                    </div>
                    <p className="text-sm">
                      <strong>Property Ekle:</strong> Sol üst köşeden "Mülk ekle" butonuna tıklayın
                    </p>
                  </div>

                  <div className="rounded-lg border bg-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Adım 3</Badge>
                    </div>
                    <p className="text-sm">
                      <strong>URL Ön Eki seçeneğini seçin ve site URL'inizi girin:</strong>
                    </p>
                    <div className="flex items-center gap-2 bg-muted p-3 rounded-md">
                      <code className="text-sm flex-1">{siteUrl}</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(siteUrl, "Site URL")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-lg border bg-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Adım 4</Badge>
                    </div>
                    <p className="text-sm">
                      <strong>Doğrulama Yöntemi Seçin:</strong>
                    </p>
                    <div className="space-y-2 ml-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Önerilen Yöntem: HTML Dosyası</p>
                        <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 ml-4">
                          <li>Google'ın verdiği HTML doğrulama dosyasını indirin</li>
                          <li>Dosyayı sitenizin <code className="bg-muted px-1 rounded">public</code> klasörüne yükleyin</li>
                          <li>Dosyanın erişilebilir olduğunu doğrulayın</li>
                          <li>Google Search Console'da "Doğrula" butonuna tıklayın</li>
                        </ol>
                      </div>
                      <Separator className="my-2" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Alternatif: HTML Meta Tag</p>
                        <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 ml-4">
                          <li>Google'ın verdiği meta tag'i kopyalayın</li>
                          <li>Tag'i sitenizin <code className="bg-muted px-1 rounded">&lt;head&gt;</code> bölümüne ekleyin</li>
                          <li>Değişiklikleri yayınlayın</li>
                          <li>"Doğrula" butonuna tıklayın</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border bg-card p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <Badge variant="outline">Adım 5</Badge>
                    </div>
                    <p className="text-sm">
                      <strong>Doğrulama Tamamlandı!</strong> Artık Search Console'dan sitenizi yönetebilirsiniz.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Sitemap Tab */}
            <TabsContent value="sitemap" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Sitemap Gönderimi</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Google'ın sitenizi daha iyi taraması için sitemap'inizi gönderin
                  </p>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Sitemap'iniz otomatik olarak güncellenip her gün 03:00'da yenilenir. Manuel güncelleme için edge function çağırabilirsiniz.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div className="rounded-lg border bg-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Sitemap URL</Badge>
                      <Badge variant="secondary">Dinamik</Badge>
                    </div>
                    <div className="flex items-center gap-2 bg-muted p-3 rounded-md">
                      <code className="text-sm flex-1 break-all">{sitemapUrl}</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(sitemapUrl, "Sitemap URL")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Bu URL 1 saat cache ile optimize edilmiş dinamik sitemap sunar
                    </p>
                  </div>

                  <div className="rounded-lg border bg-card p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Adım 1</Badge>
                    </div>
                    <p className="text-sm">
                      <strong>Google Search Console'da Sitemap Bölümüne Gidin:</strong>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Sol menüden "Sitemaps" bölümünü seçin
                    </p>
                  </div>

                  <div className="rounded-lg border bg-card p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Adım 2</Badge>
                    </div>
                    <p className="text-sm">
                      <strong>Yeni Sitemap Ekle:</strong>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      "Yeni sitemap ekle" alanına sitemap URL'inizi yapıştırın ve "Gönder" butonuna tıklayın
                    </p>
                  </div>

                  <div className="rounded-lg border bg-card p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <Badge variant="outline">Adım 3</Badge>
                    </div>
                    <p className="text-sm">
                      <strong>İşleme Alındı:</strong> Google sitemap'inizi birkaç saat içinde işlemeye başlayacak
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Durumu "Gönderilen sitemaps" tablosundan takip edebilirsiniz
                    </p>
                  </div>

                  <div className="rounded-lg border bg-card p-4 space-y-2">
                    <p className="text-sm font-medium">Sitemap İçeriği:</p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                      <li>Tüm aktif bahis siteleri</li>
                      <li>Blog yazıları</li>
                      <li>Haber içerikleri</li>
                      <li>Statik sayfalar (Hakkımızda, Gizlilik vb.)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Monitoring Tab */}
            <TabsContent value="monitoring" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">İndex İzleme ve Performans</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Sitenizin Google'da nasıl performans gösterdiğini takip edin
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="rounded-lg border bg-card p-4 space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Badge>Kapsam Raporu</Badge>
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Hangi sayfaların indekslendiğini ve hangi sorunlar olduğunu görün
                    </p>
                    <ul className="text-sm space-y-1 ml-4 list-disc text-muted-foreground">
                      <li>Geçerli sayfalar: İndekslenen sayfalar</li>
                      <li>Hariç tutulan: İndekslenmeyen sayfalar ve nedenleri</li>
                      <li>Hatalı: Düzeltilmesi gereken sorunlar</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border bg-card p-4 space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Badge>Performans Raporu</Badge>
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Sitenizin Google aramalarında nasıl göründüğünü izleyin
                    </p>
                    <ul className="text-sm space-y-1 ml-4 list-disc text-muted-foreground">
                      <li>Toplam tıklama sayısı</li>
                      <li>Gösterim sayısı (kaç kez göründüğünüz)</li>
                      <li>Ortalama CTR (tıklama oranı)</li>
                      <li>Ortalama pozisyon</li>
                      <li>Hangi anahtar kelimelerle bulunduğunuz</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border bg-card p-4 space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Badge>URL Denetleme</Badge>
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Belirli bir sayfanın durumunu kontrol edin
                    </p>
                    <ol className="text-sm space-y-1 ml-4 list-decimal text-muted-foreground">
                      <li>Üst kısımdaki arama çubuğuna URL girin</li>
                      <li>Sayfanın indekslenme durumunu görün</li>
                      <li>Sorun varsa detayları inceleyin</li>
                      <li>"İndeksleme talep et" ile manuel indeksleme isteyin</li>
                    </ol>
                  </div>

                  <div className="rounded-lg border bg-card p-4 space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Badge>Core Web Vitals</Badge>
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Sayfa hızı ve kullanıcı deneyimi metriklerini izleyin
                    </p>
                    <ul className="text-sm space-y-1 ml-4 list-disc text-muted-foreground">
                      <li>LCP (Largest Contentful Paint): Yükleme hızı</li>
                      <li>FID (First Input Delay): Etkileşim zamanı</li>
                      <li>CLS (Cumulative Layout Shift): Görsel kararlılık</li>
                    </ul>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>İpucu:</strong> Performans verilerinin Google Search Console'da görünmesi 2-3 gün sürebilir. Sabırlı olun ve düzenli takip edin.
                    </AlertDescription>
                  </Alert>

                  <div className="rounded-lg border bg-card p-4 space-y-2">
                    <h4 className="font-medium">Önerilen Takip Sıklığı</h4>
                    <ul className="text-sm space-y-1 ml-4 list-disc text-muted-foreground">
                      <li>Haftalık: Performans raporu ve indeksleme durumu</li>
                      <li>Aylık: Detaylı analiz ve sorun tespiti</li>
                      <li>Yeni içerik sonrası: URL denetleme ve manuel indeksleme talebi</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
