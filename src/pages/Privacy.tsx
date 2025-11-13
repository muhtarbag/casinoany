import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";

const Privacy = () => {
  return (
    <>
      <SEO 
        title="Gizlilik Politikası | CasinoAny.com"
        description="CasinoAny.com gizlilik politikası. Kişisel verilerinizin nasıl toplandığı, kullanıldığı ve korunduğu hakkında detaylı bilgi edinin."
        canonical="/privacy"
      />
      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Breadcrumb 
            items={[
              { label: 'Ana Sayfa', href: '/' },
              { label: 'Gizlilik Politikası', href: '/privacy' }
            ]}
          />
          
          <div className="max-w-4xl mx-auto mt-8">
            <h1 className="text-4xl font-bold text-foreground mb-6">
              Gizlilik Politikası
            </h1>
            
            <Card className="p-8 mb-6 bg-card/80 backdrop-blur-sm border-border/50">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-muted-foreground text-lg mb-6">
                  Son Güncelleme: 13 Ocak 2025
                </p>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">1. Giriş</h2>
                  <p className="text-muted-foreground mb-4">
                    CasinoAny.com olarak, gizliliğinize ve kişisel verilerinizin korunmasına büyük önem veriyoruz. 
                    Bu Gizlilik Politikası, web sitemizi ziyaret ettiğinizde ve hizmetlerimizi kullandığınızda 
                    kişisel bilgilerinizi nasıl topladığımızı, kullandığımızı, sakladığımızı ve koruduğumuzu açıklar.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">2. Topladığımız Bilgiler</h2>
                  <p className="text-muted-foreground mb-4">
                    Sizden aşağıdaki türde bilgileri toplayabiliriz:
                  </p>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">2.1. Doğrudan Sağladığınız Bilgiler</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>Ad ve soyad</li>
                    <li>E-posta adresi</li>
                    <li>Telefon numarası (isteğe bağlı)</li>
                    <li>Kullanıcı adı ve şifre</li>
                    <li>Profil bilgileri</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">2.2. Otomatik Olarak Toplanan Bilgiler</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>IP adresi</li>
                    <li>Tarayıcı türü ve versiyonu</li>
                    <li>İşletim sistemi</li>
                    <li>Ziyaret edilen sayfalar ve harcanan süre</li>
                    <li>Tıklama verileri</li>
                    <li>Çerez bilgileri</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">3. Bilgilerinizi Nasıl Kullanıyoruz</h2>
                  <p className="text-muted-foreground mb-4">
                    Topladığımız bilgileri şu amaçlarla kullanıyoruz:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>Hesabınızı oluşturmak ve yönetmek</li>
                    <li>Hizmetlerimizi sağlamak ve geliştirmek</li>
                    <li>Sizinle iletişim kurmak (bildiriler, güncellemeler, pazarlama)</li>
                    <li>Kişiselleştirilmiş içerik ve öneriler sunmak</li>
                    <li>Güvenlik ve dolandırıcılık önleme</li>
                    <li>Web sitesi performansını analiz etmek</li>
                    <li>Yasal yükümlülükleri yerine getirmek</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">4. Bilgi Paylaşımı ve Aktarımı</h2>
                  <p className="text-muted-foreground mb-4">
                    Kişisel bilgilerinizi üçüncü taraflarla yalnızca aşağıdaki durumlarda paylaşırız:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li><strong>Hizmet Sağlayıcılar:</strong> Web hosting, e-posta servisleri, analitik araçlar</li>
                    <li><strong>İş Ortakları:</strong> Reklam ve pazarlama ortakları (anonim veriler)</li>
                    <li><strong>Yasal Gereklilikler:</strong> Mahkeme kararları, yasal süreçler</li>
                    <li><strong>Şirket Birleşmeleri:</strong> Satış, birleşme veya devralma durumlarında</li>
                  </ul>
                  <p className="text-muted-foreground mb-4">
                    Bilgilerinizi üçüncü taraflara satmıyoruz veya kiralamıyoruz.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">5. Çerezler ve Takip Teknolojileri</h2>
                  <p className="text-muted-foreground mb-4">
                    Web sitemiz, deneyiminizi geliştirmek için çerezler kullanır. Çerezler hakkında detaylı bilgi için 
                    <a href="/cookies" className="text-primary hover:underline ml-1">Çerez Politikamızı</a> inceleyebilirsiniz.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Çoğu tarayıcı çerezleri otomatik olarak kabul eder, ancak tarayıcı ayarlarınızdan çerezleri 
                    reddedebilir veya silebilirsiniz.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">6. Veri Güvenliği</h2>
                  <p className="text-muted-foreground mb-4">
                    Kişisel bilgilerinizi korumak için endüstri standardı güvenlik önlemleri uyguluyoruz:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>SSL/TLS şifreleme</li>
                    <li>Güvenli sunucu altyapısı</li>
                    <li>Düzenli güvenlik denetimleri</li>
                    <li>Erişim kontrolü ve yetkilendirme</li>
                    <li>Veri yedekleme ve kurtarma sistemleri</li>
                  </ul>
                  <p className="text-muted-foreground mb-4">
                    Ancak, internet üzerinden veri iletiminin %100 güvenli olmadığını unutmayın. 
                    Güvenliğiniz için güçlü şifreler kullanmanızı ve şifrenizi kimseyle paylaşmamanızı öneririz.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">7. Veri Saklama Süresi</h2>
                  <p className="text-muted-foreground mb-4">
                    Kişisel verilerinizi yalnızca gerekli olduğu sürece saklarız:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>Aktif hesaplar: Hesap kapatılana kadar</li>
                    <li>Kapatılan hesaplar: Yasal yükümlülükler için gerekli süre (genellikle 2-5 yıl)</li>
                    <li>İletişim kayıtları: 3 yıl</li>
                    <li>Analitik veriler: 26 ay (anonim)</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">8. Haklarınız</h2>
                  <p className="text-muted-foreground mb-4">
                    Kişisel verilerinizle ilgili aşağıdaki haklara sahipsiniz:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li><strong>Erişim Hakkı:</strong> Hakkınızda hangi verileri işlediğimizi öğrenme</li>
                    <li><strong>Düzeltme Hakkı:</strong> Yanlış veya eksik bilgileri düzeltme</li>
                    <li><strong>Silme Hakkı:</strong> Verilerinizin silinmesini talep etme ("unutulma hakkı")</li>
                    <li><strong>İtiraz Hakkı:</strong> Belirli işleme faaliyetlerine itiraz etme</li>
                    <li><strong>Taşınabilirlik Hakkı:</strong> Verilerinizi yapılandırılmış bir formatta alma</li>
                    <li><strong>İzin Geri Çekme:</strong> Verdiğiniz izni istediğiniz zaman geri çekme</li>
                  </ul>
                  <p className="text-muted-foreground mb-4">
                    Bu haklarınızı kullanmak için <a href="mailto:privacy@casinoany.com" className="text-primary hover:underline">privacy@casinoany.com</a> adresinden bize ulaşabilirsiniz.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">9. Çocukların Gizliliği</h2>
                  <p className="text-muted-foreground mb-4">
                    Hizmetlerimiz 18 yaşın altındaki bireyler için tasarlanmamıştır. Bilerek 18 yaşın altındaki 
                    çocuklardan kişisel bilgi toplamıyoruz. Bir ebeveyn veya vasi iseniz ve çocuğunuzun bize kişisel 
                    bilgi sağladığını düşünüyorsanız, lütfen bizimle iletişime geçin.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">10. Üçüncü Taraf Bağlantılar</h2>
                  <p className="text-muted-foreground mb-4">
                    Web sitemiz, üçüncü taraf web sitelerine bağlantılar içerebilir. Bu sitelerin gizlilik 
                    uygulamalarından sorumlu değiliz. Bu siteleri ziyaret ettiğinizde, gizlilik politikalarını 
                    okumanızı öneririz.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">11. Politika Değişiklikleri</h2>
                  <p className="text-muted-foreground mb-4">
                    Bu Gizlilik Politikası'nı zaman zaman güncelleyebiliriz. Önemli değişiklikleri size e-posta 
                    veya web sitemizde bir bildirim yoluyla ileteceğiz. Güncellemeleri düzenli olarak kontrol etmenizi öneririz.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">12. İletişim</h2>
                  <p className="text-muted-foreground mb-4">
                    Bu Gizlilik Politikası hakkında sorularınız veya endişeleriniz varsa, lütfen bizimle iletişime geçin:
                  </p>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-muted-foreground mb-2"><strong>E-posta:</strong> privacy@casinoany.com</p>
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

export default Privacy;