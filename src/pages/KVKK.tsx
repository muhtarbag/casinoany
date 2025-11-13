import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";

const KVKK = () => {
  return (
    <>
      <SEO 
        title="KVKK - Kişisel Verilerin Korunması | CasinoAny.com"
        description="CasinoAny.com KVKK kapsamında kişisel verilerinizin işlenmesi, korunması ve haklarınız hakkında detaylı bilgi edinin."
        canonical="/kvkk"
      />
      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Breadcrumb 
            items={[
              { label: 'Ana Sayfa', href: '/' },
              { label: 'KVKK', href: '/kvkk' }
            ]}
          />
          
          <div className="max-w-4xl mx-auto mt-8">
            <h1 className="text-4xl font-bold text-foreground mb-6">
              Kişisel Verilerin Korunması Kanunu (KVKK)
            </h1>
            
            <Card className="p-8 mb-6 bg-card/80 backdrop-blur-sm border-border/50">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-muted-foreground text-lg mb-6">
                  Son Güncelleme: 13 Ocak 2025
                </p>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">1. Veri Sorumlusu</h2>
                  <p className="text-muted-foreground mb-4">
                    CasinoAny.com olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu sıfatıyla hareket etmekteyiz. 
                    Kişisel verilerinizin işlenmesi ve korunması konusunda size şeffaf bilgi sunmayı taahhüt ediyoruz.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">2. İşlenen Kişisel Veriler</h2>
                  <p className="text-muted-foreground mb-4">
                    Platformumuz üzerinden aşağıdaki kişisel verilerinizi işlemekteyiz:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>Kimlik Bilgileri: Ad, soyad, doğum tarihi</li>
                    <li>İletişim Bilgileri: E-posta adresi, telefon numarası</li>
                    <li>Müşteri İşlem Bilgileri: Site kullanım geçmişi, tercihler</li>
                    <li>İşlem Güvenliği Bilgileri: IP adresi, çerez kayıtları, cihaz bilgileri</li>
                    <li>Görsel ve İşitsel Kayıtlar: Profil fotoğrafı (isteğe bağlı)</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">3. Kişisel Verilerin İşlenme Amaçları</h2>
                  <p className="text-muted-foreground mb-4">
                    Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>Üyelik işlemlerinin yürütülmesi ve kullanıcı hesabı yönetimi</li>
                    <li>Platform hizmetlerinin sunulması ve geliştirilmesi</li>
                    <li>İçerik önerilerinin kişiselleştirilmesi</li>
                    <li>İletişim faaliyetlerinin gerçekleştirilmesi</li>
                    <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                    <li>Platform güvenliğinin sağlanması</li>
                    <li>Müşteri memnuniyeti analizleri</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">4. Kişisel Verilerin Aktarılması</h2>
                  <p className="text-muted-foreground mb-4">
                    Kişisel verileriniz, KVKK'nın 8. ve 9. maddelerinde belirtilen şartlara uygun olarak:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>Hizmet sağlayıcılarımıza (sunucu, e-posta hizmetleri)</li>
                    <li>İş ortaklarımıza (analiz ve pazarlama araçları)</li>
                    <li>Yasal zorunluluk halinde yetkili kamu kurum ve kuruluşlarına</li>
                  </ul>
                  <p className="text-muted-foreground mb-4">
                    aktarılabilmektedir. Yurt dışına veri aktarımı yapılması durumunda, KVKK'nın 9. maddesine uygun olarak gerekli güvenlik önlemleri alınmaktadır.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">5. Kişisel Veri Toplamanın Yöntemi ve Hukuki Sebebi</h2>
                  <p className="text-muted-foreground mb-4">
                    Kişisel verileriniz, elektronik ortamda otomatik yöntemlerle toplanmaktadır. Hukuki sebepler:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>Açık rızanız</li>
                    <li>Sözleşmenin kurulması ve ifası</li>
                    <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                    <li>Meşru menfaatlerimiz (güvenlik, hizmet geliştirme)</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">6. KVKK Kapsamındaki Haklarınız</h2>
                  <p className="text-muted-foreground mb-4">
                    KVKK'nın 11. maddesi uyarınca, kişisel verilerinizle ilgili olarak aşağıdaki haklara sahipsiniz:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                    <li>İşlenmişse bilgi talep etme</li>
                    <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                    <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
                    <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
                    <li>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme</li>
                    <li>Düzeltme, silme veya yok edilme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
                    <li>Münhasıran otomatik sistemler ile analiz edilmesi nedeniyle aleyhinize bir sonuç doğmasına itiraz etme</li>
                    <li>Kanuna aykırı işleme nedeniyle zarara uğramanız halinde zararın giderilmesini talep etme</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">7. Başvuru Yöntemi</h2>
                  <p className="text-muted-foreground mb-4">
                    KVKK kapsamındaki haklarınızı kullanmak için aşağıdaki yöntemlerle başvurabilirsiniz:
                  </p>
                  <div className="bg-muted/30 p-4 rounded-lg mb-4">
                    <p className="text-muted-foreground mb-2"><strong>E-posta:</strong> kvkk@casinoany.com</p>
                    <p className="text-muted-foreground mb-2"><strong>Posta:</strong> [Adres bilgisi]</p>
                    <p className="text-muted-foreground"><strong>Başvuru Formu:</strong> Websitemizde bulunan KVKK başvuru formu</p>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Başvurularınız, talebinizin niteliğine göre en kısa sürede ve en geç 30 gün içinde yanıtlanacaktır.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">8. Veri Güvenliği</h2>
                  <p className="text-muted-foreground mb-4">
                    CasinoAny.com olarak, kişisel verilerinizin güvenliğini sağlamak için:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>SSL sertifikası ile şifreli bağlantı</li>
                    <li>Güncel güvenlik yazılımları</li>
                    <li>Erişim yetkilendirme sistemleri</li>
                    <li>Düzenli güvenlik denetimleri</li>
                    <li>Veri yedekleme protokolleri</li>
                  </ul>
                  <p className="text-muted-foreground mb-4">
                    gibi teknik ve idari tedbirleri uygulamaktayız.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">9. Kişisel Verilerin Saklanma Süresi</h2>
                  <p className="text-muted-foreground mb-4">
                    Kişisel verileriniz, işlenme amaçlarının gerektirdiği süre boyunca ve ilgili mevzuatta öngörülen sürelerde saklanmaktadır. 
                    Bu sürelerin sonunda verileriniz silinir, yok edilir veya anonim hale getirilir.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">10. Değişiklikler</h2>
                  <p className="text-muted-foreground mb-4">
                    Bu KVKK Aydınlatma Metni, yasal düzenlemelerdeki değişiklikler veya şirket politikalarımızdaki güncellemeler doğrultusunda revize edilebilir. 
                    Değişiklikler bu sayfada yayınlanacak ve önemli değişiklikler için size bildirim gönderilecektir.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">11. İletişim</h2>
                  <p className="text-muted-foreground mb-4">
                    KVKK ile ilgili sorularınız için bizimle iletişime geçebilirsiniz:
                  </p>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-muted-foreground mb-2"><strong>E-posta:</strong> kvkk@casinoany.com</p>
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

export default KVKK;