import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";

const Terms = () => {
  return (
    <>
      <SEO 
        title="Kullanım Şartları | CasinoAny.com"
        description="CasinoAny.com kullanım şartları. Web sitemizi kullanarak kabul ettiğiniz şartlar ve koşullar hakkında detaylı bilgi."
        canonical="/terms"
      />
      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90 pt-[72px] md:pt-[84px]">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Breadcrumb 
            items={[
              { label: 'Ana Sayfa', href: '/' },
              { label: 'Kullanım Şartları', href: '/terms' }
            ]}
          />
          
          <div className="max-w-4xl mx-auto mt-8">
            <h1 className="text-4xl font-bold text-foreground mb-6">
              Kullanım Şartları
            </h1>
            
            <Card className="p-8 mb-6 bg-card/80 backdrop-blur-sm border-border/50">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-muted-foreground text-lg mb-6">
                  Son Güncelleme: 13 Ocak 2025
                </p>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">1. Kabul ve Onay</h2>
                  <p className="text-muted-foreground mb-4">
                    CasinoAny.com web sitesini ("Site") ziyaret ederek ve kullanarak, bu Kullanım Şartları'nı 
                    ("Şartlar") okuduğunuzu, anladığınızı ve bunlara uymayı kabul ettiğinizi beyan edersiniz. 
                    Bu şartları kabul etmiyorsanız, lütfen sitemizi kullanmayın.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">2. Hizmet Tanımı</h2>
                  <p className="text-muted-foreground mb-4">
                    CasinoAny.com, online casino ve bahis siteleri hakkında bilgi, inceleme ve karşılaştırma 
                    hizmeti sunan bir bilgi platformudur. Biz bir bahis sitesi değiliz ve bahis hizmeti sunmuyoruz. 
                    Sunduğumuz hizmetler şunları içerir:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>Bahis siteleri hakkında detaylı incelemeler ve analizler</li>
                    <li>Bonus ve promosyon bilgileri</li>
                    <li>Karşılaştırma araçları</li>
                    <li>Kullanıcı yorumları ve değerlendirmeleri</li>
                    <li>Eğitim içerikleri ve rehberler</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">3. Kullanıcı Yükümlülükleri</h2>
                  <p className="text-muted-foreground mb-4">
                    Sitemizi kullanırken aşağıdaki şartlara uymayı kabul edersiniz:
                  </p>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">3.1. Yaş Sınırı</h3>
                  <p className="text-muted-foreground mb-4">
                    Sitemizi kullanabilmek için en az 18 yaşında olmanız gerekmektedir. 18 yaşın altındaki 
                    bireylerin sitemizi kullanması kesinlikle yasaktır.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">3.2. Yasal Uyum</h3>
                  <p className="text-muted-foreground mb-4">
                    Bulunduğunuz ülke veya bölgedeki online bahis ve kumar yasalarına uymak sizin sorumluluğunuzdadır. 
                    Sitemiz aracılığıyla eriştiğiniz üçüncü taraf bahis sitelerinin yasallığını kontrol etmek 
                    kullanıcının sorumluluğundadır.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">3.3. Hesap Güvenliği</h3>
                  <p className="text-muted-foreground mb-4">
                    Hesap oluşturursanız:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>Doğru ve güncel bilgiler sağlamakla yükümlüsünüz</li>
                    <li>Hesap bilgilerinizi gizli tutmalısınız</li>
                    <li>Hesabınızda gerçekleşen tüm faaliyetlerden sorumlusunuz</li>
                    <li>Yetkisiz erişim durumunda derhal bizi bilgilendirmelisiniz</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">3.4. Yasak Faaliyetler</h3>
                  <p className="text-muted-foreground mb-4">
                    Aşağıdaki faaliyetler kesinlikle yasaktır:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>Yasa dışı amaçlarla siteyi kullanmak</li>
                    <li>Başkalarının haklarını ihlal etmek</li>
                    <li>Spam veya istenmeyen içerik paylaşmak</li>
                    <li>Virüs, zararlı yazılım veya diğer zararlı kodlar yüklemek</li>
                    <li>Site güvenliğini tehlikeye atmaya çalışmak</li>
                    <li>Sahte hesaplar oluşturmak</li>
                    <li>Otomatik sistemler (botlar) kullanarak siteye erişmek</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">4. Fikri Mülkiyet Hakları</h2>
                  <p className="text-muted-foreground mb-4">
                    Sitemizde yer alan tüm içerik, tasarım, logo, metin, grafik, yazılım ve diğer materyaller 
                    CasinoAny.com'un veya lisans verenlerin mülkiyetindedir ve telif hakkı, marka ve diğer fikri 
                    mülkiyet yasalarıyla korunmaktadır.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Yazılı izin olmadan içeriğimizi kopyalayamaz, değiştiremez, dağıtamaz veya ticari amaçla kullanamazsınız.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">5. Üçüncü Taraf Bağlantılar</h2>
                  <p className="text-muted-foreground mb-4">
                    Sitemiz, üçüncü taraf bahis sitelerine bağlantılar içerir. Bu bağlantılar yalnızca bilgi 
                    amaçlıdır ve:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>Üçüncü taraf sitelerin içeriğinden, gizlilik uygulamalarından veya hizmetlerinden sorumlu değiliz</li>
                    <li>Bu sitelerde yaşadığınız sorunlardan CasinoAny.com sorumlu tutulamaz</li>
                    <li>Üçüncü taraf sitelerin kullanım şartlarını kabul etmek sizin sorumluluğunuzdadır</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">6. Sorumluluk Reddi</h2>
                  <p className="text-muted-foreground mb-4">
                    CasinoAny.com olarak:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>Sitemiz "olduğu gibi" sunulmaktadır</li>
                    <li>Bilgilerin doğruluğu, güncelliği veya eksiksizliği konusunda garanti vermiyoruz</li>
                    <li>Hizmetin kesintisiz veya hatasız olacağını garanti etmiyoruz</li>
                    <li>Sitemizin kullanımından kaynaklanan doğrudan veya dolaylı zararlardan sorumlu değiliz</li>
                    <li>Üçüncü taraf bahis sitelerinde yaşanan kayıplardan sorumlu değiliz</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">7. Kullanıcı İçeriği</h2>
                  <p className="text-muted-foreground mb-4">
                    Sitemize yorum, inceleme veya başka içerik gönderdiğinizde:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>İçeriğinizin yasal, etik ve doğru olduğunu garanti edersiniz</li>
                    <li>Başkalarının haklarını ihlal etmediğini onaylarsınız</li>
                    <li>CasinoAny.com'a içeriğinizi kullanma, değiştirme ve yayınlama hakkı vermiş olursunuz</li>
                    <li>Uygunsuz içerikleri kaldırma hakkımızı kabul edersiniz</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">8. Hesap Askıya Alma ve Sonlandırma</h2>
                  <p className="text-muted-foreground mb-4">
                    Şu durumlarda hesabınızı askıya alabilir veya sonlandırabiliriz:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>Bu şartları ihlal etmeniz</li>
                    <li>Yasa dışı faaliyetlerde bulunmanız</li>
                    <li>Diğer kullanıcıları rahatsız etmeniz</li>
                    <li>Sahte bilgiler sağlamanız</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">9. Sorumlu Oyun</h2>
                  <p className="text-muted-foreground mb-4">
                    Bahis ve kumar bağımlılık yapıcı olabilir. Sitemiz üzerinden eriştiğiniz bahis siteleri 
                    sadece eğlence amaçlıdır. Sorunlu kumar belirtileri görürseniz, profesyonel yardım alın.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Yardım için: <a href="https://www.yesilhalikanyasi.org.tr/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Yeşil Halı Kanyası</a>
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">10. Değişiklikler</h2>
                  <p className="text-muted-foreground mb-4">
                    Bu Kullanım Şartları'nı istediğimiz zaman değiştirme hakkını saklı tutarız. Değişiklikler 
                    bu sayfada yayınlanacak ve "Son Güncelleme" tarihi güncellenecektir. Önemli değişiklikler 
                    için size bildirim gönderilebilir.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">11. Uygulanacak Hukuk</h2>
                  <p className="text-muted-foreground mb-4">
                    Bu Kullanım Şartları, Türkiye Cumhuriyeti yasalarına tabidir. Şartlardan kaynaklanan 
                    herhangi bir uyuşmazlık, Türkiye mahkemelerinin yetkisindedir.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">12. İletişim</h2>
                  <p className="text-muted-foreground mb-4">
                    Bu Kullanım Şartları hakkında sorularınız varsa, lütfen bizimle iletişime geçin:
                  </p>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-muted-foreground mb-2"><strong>E-posta:</strong> legal@casinoany.com</p>
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

export default Terms;