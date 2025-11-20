import { SEO } from '@/components/SEO';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Zap, Download, Wifi, CheckCircle2 } from 'lucide-react';
import { BettingSiteCard } from '@/components/BettingSiteCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function MobileBetting() {
  const { data: sites } = useQuery({
    queryKey: ['mobile-betting-sites'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('betting_sites')
        .select('id, name, logo_url, slug, rating, bonus, features, affiliate_link, email, whatsapp, telegram, twitter, instagram, facebook, youtube')
        .order('rating', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      <SEO
        title="Mobil Bahis Siteleri 2025 - iOS & Android Uygulamaları | CasinoAny.com"
        description="En iyi mobil bahis uygulamaları ve mobil uyumlu casino siteleri. iOS ve Android için optimize edilmiş, hızlı ve güvenli mobil bahis deneyimi."
        canonical="https://casinoany.com/mobil-bahis"
        keywords={["mobil bahis", "mobil casino", "ios bahis uygulaması", "android casino", "mobil ödeme bahis"]}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background pt-[72px] md:pt-[84px]">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <Breadcrumb 
            items={[
              { label: 'Ana Sayfa', href: '/' },
              { label: 'Mobil Bahis' }
            ]} 
          />

          <section className="mb-12 mt-8">
            <div className="text-center max-w-4xl mx-auto">
              <Badge className="mb-4" variant="secondary">
                <Smartphone className="w-3 h-3 mr-1" />
                Kesintisiz Mobil Deneyim
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                En İyi Mobil Bahis Siteleri
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Dilediğiniz her yerden, her zaman erişim. iOS ve Android uygulamaları ile cebinizde casino ve bahis deneyimi.
                Hızlı, güvenli ve kullanıcı dostu mobil platformlar.
              </p>
            </div>
          </section>

          <Card className="mb-12 p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Smartphone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">iOS & Android</h3>
                  <p className="text-sm text-muted-foreground">Tam Uyumlu</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Hızlı Yükleme</h3>
                  <p className="text-sm text-muted-foreground">Optimize Edilmiş</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Download className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Kolay Kurulum</h3>
                  <p className="text-sm text-muted-foreground">1 Dakika</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Wifi className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Düşük Veri</h3>
                  <p className="text-sm text-muted-foreground">Tasarruflu</p>
                </div>
              </div>
            </div>
          </Card>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">En İyi Mobil Bahis Platformları</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sites?.map((site) => (
                <BettingSiteCard 
                  key={site.id} 
                  id={site.id}
                  name={site.name}
                  logo={site.logo_url}
                  rating={site.rating}
                  bonus={site.bonus}
                  features={site.features}
                  affiliateUrl={site.affiliate_link}
                  email={site.email}
                  whatsapp={site.whatsapp}
                  telegram={site.telegram}
                  twitter={site.twitter}
                  instagram={site.instagram}
                  facebook={site.facebook}
                  youtube={site.youtube}
                />
              ))}
            </div>
          </section>

          <article className="mb-12">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4">Mobil Bahis Rehberi</h2>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground mb-6">
                  Mobil teknolojinin gelişmesiyle birlikte bahis ve casino deneyimi artık cebinizde. Günümüzde bahis 
                  severlerin %75'inden fazlası mobil cihazlardan oyun oynamaktadır. İşte mobil bahis dünyası hakkında 
                  bilmeniz gereken her şey.
                </p>

                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Mobil Uygulama vs Mobil Site
                </h3>
                <p className="text-muted-foreground mb-4">
                  Mobil bahis için iki seçenek bulunur: <strong>Mobil Uygulama</strong> ve <strong>Mobil Site (Responsive Web)</strong>.
                  Mobil uygulamalar cihazınıza indirilir, daha hızlı çalışır ve push bildirimleri gönderebilir. Daha akıcı 
                  bir deneyim sunar ve offline bazı özelliklere erişim sağlar. Mobil siteler ise tarayıcı üzerinden çalışır,
                  indirme gerektirmez ve depolama alanı kaplamaz. Her iki seçenek de tam özellikleri sunar.
                </p>

                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  iOS (iPhone/iPad) için Mobil Bahis
                </h3>
                <p className="text-muted-foreground mb-4">
                  iOS cihazlar için uygulamalar App Store'da bulunmayabilir (Apple'ın kumar uygulamaları politikası nedeniyle).
                  Bunun yerine çoğu site <strong>PWA (Progressive Web App)</strong> teknolojisi kullanır. Safari'den siteye 
                  giriş yapıp "Ana Ekrana Ekle" seçeneğini kullanarak uygulama gibi çalışan bir kısayol oluşturabilirsiniz.
                  Bu yöntem tam uygulama deneyimi sunar, bildirimler alabilir ve tam ekran çalışır. iOS 14 ve üzeri tüm 
                  özellikleri destekler.
                </p>

                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Android için Mobil Bahis Uygulaması
                </h3>
                <p className="text-muted-foreground mb-4">
                  Android cihazlarda bahis uygulamaları <strong>APK dosyası</strong> olarak sitenin mobil versiyonundan 
                  indirilebilir. APK indirmeden önce "Bilinmeyen Kaynaklar" seçeneğini Ayarlar {'->'} Güvenlik'ten aktif etmelisiniz.
                  Uygulama kurulumu 1-2 dakika sürer ve otomatik güncelleme özelliği bulunur. Android uygulamaları genellikle 
                  15-30 MB boyutundadır ve minimum Android 5.0 gerektirir. Google Play Store'da olmayan uygulamalar için 
                  sadece resmi siteden indirin.
                </p>

                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Mobil Bahis Avantajları
                </h3>
                <p className="text-muted-foreground mb-4">
                  <strong>Her Yerden Erişim:</strong> Evde, işte, yolda, kafede - internet olduğu her yerde bahis yapabilirsiniz.
                  <strong>Canlı Bahis İmkanı:</strong> Maçları takip ederken anlık bahis yapma fırsatı. 
                  <strong>Push Bildirimleri:</strong> Bonus fırsatları, maç sonuçları ve özel kampanyalardan anında haberdar olun.
                  <strong>Parmak İzi/Face ID:</strong> Güvenli ve hızlı giriş. 
                  <strong>Mobil Ödeme:</strong> Telefon faturasına yansıyan hızlı para yatırma seçenekleri.
                  <strong>Optimize Edilmiş Arayüz:</strong> Dokunmatik ekran için özel tasarlanmış kullanıcı dostu ara yüz.
                </p>

                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Mobil Veri Kullanımı ve Performans
                </h3>
                <p className="text-muted-foreground mb-4">
                  Modern mobil bahis uygulamaları veri tasarruflu çalışır. Ortalama bir saat oyun 20-50 MB veri tüketir.
                  Canlı casino ve video streaming daha fazla veri kullanır (saat başı 200-500 MB). Düşük veri modu 
                  seçenekleriyle tüketimi %50 azaltabilirsiniz. 4G/5G bağlantıda kesintisiz deneyim, 3G'de slot oyunları 
                  sorunsuz çalışır ancak canlı casino için yeterli olmayabilir. WiFi bağlantısı her zaman en iyi performansı sağlar.
                </p>

                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Mobil Güvenlik İpuçları
                </h3>
                <p className="text-muted-foreground mb-4">
                  <strong>Sadece Resmi Kaynaklar:</strong> Uygulamaları sadece sitenin resmi mobil sayfasından indirin.
                  <strong>Güncel Tutun:</strong> İşletim sisteminizi ve uygulamaları her zaman güncel tutun.
                  <strong>Güvenli Ağlar:</strong> Açık WiFi ağlarında değil, mobil veri veya güvenilir WiFi kullanın.
                  <strong>İki Faktörlü Doğrulama:</strong> Hesabınıza ekstra güvenlik katmanı ekleyin.
                  <strong>Otomatik Oturum Kapatma:</strong> Cihazınızı başkalarıyla paylaşıyorsanız otomatik çıkış ayarlayın.
                </p>

                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Tablet için Bahis Deneyimi
                </h3>
                <p className="text-muted-foreground mb-4">
                  iPad ve Android tabletler, mobil ile masaüstü arasında mükemmel bir denge sunar. Büyük ekran avantajıyla 
                  canlı casino masalarını rahatlıkla görebilir, aynı anda birden fazla bahis ekranını takip edebilirsiniz.
                  Tablet uygulamaları genellikle split-screen özelliği sunar, böylece hem maç izleyip hem bahis yapabilirsiniz.
                  10 inç ve üzeri tabletler neredeyse masaüstü deneyimi sunar.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Mobil Platform Testleri</h4>
                    <p className="text-sm text-muted-foreground">
                      Uzman ekibimiz her mobil platformu farklı cihazlarda (iPhone, Samsung, Huawei vb.) test eder.
                      Uygulama performansı, hız, kullanıcı arayüzü, özellik tam­lığı ve stabilite detaylı şekilde incelenir.
                      Hem WiFi hem mobil veri bağlantılarında testler yapılır. Amacımız size en iyi mobil deneyimi sunan 
                      platformları önermektir.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </article>

          <section className="mb-12">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">Sıkça Sorulan Sorular</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Mobil uygulama güvenli mi?</h3>
                  <p className="text-muted-foreground">
                    Evet, lisanslı sitelerin resmi uygulamaları SSL şifreleme ve güvenlik protokolleri ile korunmaktadır.
                    Sadece sitenin resmi kaynağından indirin ve güncel tutun.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Mobilde bonuslar geçerli mi?</h3>
                  <p className="text-muted-foreground">
                    Evet, tüm bonuslar ve promosyonlar mobil cihazlarda da geçerlidir. Hatta bazı siteler özel mobil 
                    bonusları bile sunmaktadır.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Mobil uygulama çok yer kaplar mı?</h3>
                  <p className="text-muted-foreground">
                    Hayır, çoğu bahis uygulaması 15-40 MB arasındadır. Cache temizliği ile boyut kontrol altında tutulabilir.
                    PWA uygulamaları ise neredeyse hiç yer kaplamaz.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">İnternetsiz bahis yapabilir miyim?</h3>
                  <p className="text-muted-foreground">
                    Hayır, bahis işlemleri için sürekli internet bağlantısı gereklidir. Ancak bazı uygulamalar geçmiş 
                    bahislerinizi ve hesap bilgilerinizi offline görüntülemenizi sağlar.
                  </p>
                </div>
              </div>
            </Card>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
