import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";

const Cookies = () => {
  return (
    <>
      <SEO 
        title="Çerez Politikası | CasinoAny.com"
        description="CasinoAny.com çerez politikası. Web sitemizde kullanılan çerezler, türleri ve amaçları hakkında detaylı bilgi."
        canonical="/cookies"
      />
      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Breadcrumb 
            items={[
              { label: 'Ana Sayfa', href: '/' },
              { label: 'Çerez Politikası', href: '/cookies' }
            ]}
          />
          
          <div className="max-w-4xl mx-auto mt-8">
            <h1 className="text-4xl font-bold text-foreground mb-6">
              Çerez Politikası
            </h1>
            
            <Card className="p-8 mb-6 bg-card/80 backdrop-blur-sm border-border/50">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-muted-foreground text-lg mb-6">
                  Son Güncelleme: 13 Ocak 2025
                </p>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">1. Çerez Nedir?</h2>
                  <p className="text-muted-foreground mb-4">
                    Çerezler, bir web sitesini ziyaret ettiğinizde cihazınıza (bilgisayar, tablet veya mobil cihaz) 
                    kaydedilen küçük metin dosyalarıdır. Çerezler, web sitelerinin daha verimli çalışmasını sağlar 
                    ve site sahiplerine bilgi sağlar. Web sitemizi ziyaret ettiğinizde, çeşitli amaçlarla çerezler 
                    kullanılmaktadır.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">2. Çerezleri Neden Kullanıyoruz?</h2>
                  <p className="text-muted-foreground mb-4">
                    CasinoAny.com olarak çerezleri şu amaçlarla kullanıyoruz:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>Web sitemizin düzgün çalışmasını sağlamak</li>
                    <li>Kullanıcı deneyimini kişiselleştirmek</li>
                    <li>Tercihlerinizi hatırlamak</li>
                    <li>Site performansını ve kullanımını analiz etmek</li>
                    <li>Güvenliği artırmak</li>
                    <li>İçerik ve reklamları optimize etmek</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">3. Kullandığımız Çerez Türleri</h2>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">3.1. Zorunlu Çerezler</h3>
                  <p className="text-muted-foreground mb-4">
                    Bu çerezler web sitemizin temel işlevlerini yerine getirmesi için gereklidir ve devre dışı 
                    bırakılamazlar. Genellikle yalnızca gizlilik tercihleri, oturum açma veya form doldurma gibi 
                    bir hizmet talebi oluşturan eylemlerinize yanıt olarak ayarlanırlar.
                  </p>
                  <div className="bg-muted/30 p-4 rounded-lg mb-4">
                    <p className="text-muted-foreground mb-2"><strong>Örnekler:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                      <li>Oturum kimliği çerezleri</li>
                      <li>Güvenlik çerezleri</li>
                      <li>Yük dengeleme çerezleri</li>
                    </ul>
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">3.2. Fonksiyonel Çerezler</h3>
                  <p className="text-muted-foreground mb-4">
                    Bu çerezler web sitemizin gelişmiş işlevlerini ve kişiselleştirmeyi sağlar. Tercihlerinizi 
                    (dil, bölge) hatırlar ve gelişmiş özellikler sunar.
                  </p>
                  <div className="bg-muted/30 p-4 rounded-lg mb-4">
                    <p className="text-muted-foreground mb-2"><strong>Örnekler:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                      <li>Dil seçimi çerezleri</li>
                      <li>Kullanıcı tercihleri çerezleri</li>
                      <li>Kayıtlı hesap bilgileri</li>
                    </ul>
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">3.3. Performans Çerezleri</h3>
                  <p className="text-muted-foreground mb-4">
                    Bu çerezler ziyaretçilerin web sitemizi nasıl kullandığına dair bilgi toplar. Hangi sayfaların 
                    en çok ziyaret edildiğini ve kullanıcıların hata mesajları alıp almadığını anlamamıza yardımcı olur.
                  </p>
                  <div className="bg-muted/30 p-4 rounded-lg mb-4">
                    <p className="text-muted-foreground mb-2"><strong>Kullandığımız Araçlar:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                      <li>Google Analytics</li>
                      <li>Hotjar (heatmap ve kullanıcı davranışı analizi)</li>
                      <li>Site hız testi araçları</li>
                    </ul>
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">3.4. Hedefleme/Reklam Çerezleri</h3>
                  <p className="text-muted-foreground mb-4">
                    Bu çerezler, sizin ve ilgi alanlarınızla daha alakalı reklamlar sunmak için kullanılır. 
                    Aynı reklamın sürekli gösterilmesini önlemek ve reklamverenlerin kampanya etkinliğini 
                    ölçmesine yardımcı olmak için kullanılır.
                  </p>
                  <div className="bg-muted/30 p-4 rounded-lg mb-4">
                    <p className="text-muted-foreground mb-2"><strong>Ortaklarımız:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                      <li>Google Ads</li>
                      <li>Facebook Pixel</li>
                      <li>Affiliate ağları</li>
                    </ul>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">4. Birinci ve Üçüncü Taraf Çerezler</h2>
                  <p className="text-muted-foreground mb-4">
                    <strong>Birinci Taraf Çerezler:</strong> Doğrudan CasinoAny.com tarafından oluşturulan ve 
                    yalnızca bizim tarafımızdan erişilebilen çerezlerdir.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    <strong>Üçüncü Taraf Çerezler:</strong> Google Analytics, reklam ağları gibi üçüncü taraf 
                    hizmet sağlayıcılar tarafından oluşturulan çerezlerdir. Bu çerezler, söz konusu şirketlerin 
                    gizlilik politikalarına tabidir.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">5. Çerez Süresi</h2>
                  <p className="text-muted-foreground mb-4">
                    Çerezler, ne kadar süre saklandıklarına göre ikiye ayrılır:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li><strong>Oturum Çerezleri (Session Cookies):</strong> Geçicidir ve tarayıcınızı kapattığınızda silinir.</li>
                    <li><strong>Kalıcı Çerezler (Persistent Cookies):</strong> Belirli bir süre cihazınızda kalır (genellikle 1-24 ay arası).</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">6. Çerez Yönetimi</h2>
                  <p className="text-muted-foreground mb-4">
                    Çerezleri kontrol etme ve yönetme hakkına sahipsiniz:
                  </p>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">6.1. Tarayıcı Ayarları</h3>
                  <p className="text-muted-foreground mb-4">
                    Çoğu web tarayıcısı çerezleri otomatik olarak kabul eder, ancak tarayıcı ayarlarınızdan:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>Tüm çerezleri engelleyebilir</li>
                    <li>Yalnızca üçüncü taraf çerezleri engelleyebilir</li>
                    <li>Mevcut çerezleri silebilir</li>
                    <li>Çerez eklenmeden önce bildirim alabilirsiniz</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">6.2. Popüler Tarayıcılarda Çerez Ayarları</h3>
                  <div className="space-y-2 text-muted-foreground mb-4">
                    <p><strong>Chrome:</strong> Ayarlar → Gizlilik ve güvenlik → Çerezler ve diğer site verileri</p>
                    <p><strong>Firefox:</strong> Ayarlar → Gizlilik ve Güvenlik → Çerezler ve Site Verileri</p>
                    <p><strong>Safari:</strong> Tercihler → Gizlilik → Çerezleri engelle</p>
                    <p><strong>Edge:</strong> Ayarlar → Çerezler ve site izinleri</p>
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">6.3. Çerezleri Reddetmenin Sonuçları</h3>
                  <p className="text-muted-foreground mb-4">
                    Çerezleri engellerseniz veya silerseniz:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>Bazı web sitesi özellikleri düzgün çalışmayabilir</li>
                    <li>Tercihleriniz hatırlanmayabilir</li>
                    <li>Kişiselleştirilmiş içerik göremeyebilirsiniz</li>
                    <li>Her ziyarette yeniden giriş yapmanız gerekebilir</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">7. Üçüncü Taraf Çerezleri</h2>
                  <p className="text-muted-foreground mb-4">
                    Web sitemizde kullandığımız bazı üçüncü taraf hizmetler:
                  </p>
                  <div className="bg-muted/30 p-4 rounded-lg mb-4">
                    <p className="text-muted-foreground mb-2"><strong>Google Analytics:</strong></p>
                    <p className="text-muted-foreground text-sm mb-1">
                      Site kullanımını analiz etmek için. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Gizlilik Politikası</a>
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Vazgeçmek için: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Analytics Opt-out</a>
                    </p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg mb-4">
                    <p className="text-muted-foreground mb-2"><strong>Facebook Pixel:</strong></p>
                    <p className="text-muted-foreground text-sm mb-1">
                      Reklam kampanyaları için. <a href="https://www.facebook.com/privacy/explanation" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Gizlilik Politikası</a>
                    </p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">8. Do Not Track (DNT)</h2>
                  <p className="text-muted-foreground mb-4">
                    Bazı tarayıcılar "Do Not Track" (DNT) özelliğine sahiptir. Şu anda DNT sinyallerine yanıt 
                    vermek için evrensel bir standart olmadığından, web sitemiz DNT sinyallerini otomatik olarak 
                    tanımamaktadır. Ancak çerez tercihlerinizi yukarıda açıklandığı gibi yönetebilirsiniz.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">9. Çocukların Gizliliği</h2>
                  <p className="text-muted-foreground mb-4">
                    Web sitemiz 18 yaş altı bireyler için tasarlanmamıştır ve bilerek 18 yaş altı çocuklardan 
                    çerez yoluyla bilgi toplamıyoruz.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">10. Politika Güncellemeleri</h2>
                  <p className="text-muted-foreground mb-4">
                    Bu Çerez Politikası'nı zaman zaman güncelleyebiliriz. Değişiklikler bu sayfada yayınlanacak 
                    ve "Son Güncelleme" tarihi revize edilecektir. Önemli değişiklikler için size bildirim gönderilebilir.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">11. İletişim</h2>
                  <p className="text-muted-foreground mb-4">
                    Çerez kullanımımız hakkında sorularınız varsa, lütfen bizimle iletişime geçin:
                  </p>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-muted-foreground mb-2"><strong>E-posta:</strong> cookies@casinoany.com</p>
                    <p className="text-muted-foreground mb-2"><strong>Telefon:</strong> +90 (212) 555 0123</p>
                    <p className="text-muted-foreground"><strong>Adres:</strong> [Adres bilgisi]</p>
                  </div>
                </section>
              </div>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Cookies;