import { SEO } from '@/components/SEO';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, Percent, RefreshCw, Crown, CheckCircle2 } from 'lucide-react';
import { BettingSiteCard } from '@/components/BettingSiteCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function BonusCampaigns() {
  const { data: sites } = useQuery({
    queryKey: ['bonus-sites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('*')
        .order('rating', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      <SEO
        title="Casino ve Bahis Bonus Kampanyaları 2025 - %300 Hoş Geldin Bonusu | CasinoAny.com"
        description="En yüksek casino ve bahis bonusları burada! %300 hoş geldin bonusu, kayıp bonusları, freespin kampanyaları ve daha fazlası. Güncel bonus kodları."
        canonical="https://casinoany.com/bonus-kampanyalari"
        keywords={["casino bonusu", "bahis bonusu", "hoş geldin bonusu", "freespin", "kayıp bonusu", "bonus kampanyaları"]}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <Breadcrumb 
            items={[
              { label: 'Ana Sayfa', href: '/' },
              { label: 'Bonus Kampanyaları' }
            ]} 
          />

          <section className="mb-12 mt-8">
            <div className="text-center max-w-4xl mx-auto">
              <Badge className="mb-4" variant="secondary">
                <Gift className="w-3 h-3 mr-1" />
                En Cömert Bonuslar
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                En İyi Bonus Kampanyaları
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                %300'e varan hoş geldin bonusları, haftalık cashback fırsatları ve özel kampanyalarla kazancınızı artırın.
                Düşük çevrim şartları ve kolay bonus kullanımı için uzman önerilerimizi keşfedin.
              </p>
            </div>
          </section>

          <Card className="mb-12 p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Percent className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">%300 Bonus</h3>
                  <p className="text-sm text-muted-foreground">İlk Yatırım</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <RefreshCw className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Cashback</h3>
                  <p className="text-sm text-muted-foreground">Haftalık İade</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Gift className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Freespin</h3>
                  <p className="text-sm text-muted-foreground">Bedava Dönüş</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">VIP Program</h3>
                  <p className="text-sm text-muted-foreground">Özel Avantajlar</p>
                </div>
              </div>
            </div>
          </Card>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">En Yüksek Bonuslu Siteler</h2>
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
              <h2 className="text-2xl font-bold mb-4">Bonus Türleri ve Kullanım Rehberi</h2>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground mb-6">
                  Casino ve bahis bonusları, oyun deneyiminizi zenginleştiren ve bankrollünüzü artıran önemli fırsatlardır.
                  Her bonus türünün kendine özgü avantajları ve kullanım koşulları bulunmaktadır. İşte detaylı rehberimiz.
                </p>

                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Hoş Geldin Bonusu (Welcome Bonus)
                </h3>
                <p className="text-muted-foreground mb-4">
                  Yeni üyelere özel olarak sunulan ilk yatırım bonusudur. Genellikle %100 ile %300 arasında değişir.
                  Örneğin %200 bonusta 1000 TL yatırım yaparsanız, 2000 TL bonus alırsınız ve toplam 3000 TL ile 
                  oynamaya başlarsınız. İlk yatırım bonusları genellikle en cömert bonuslardır ve tek seferlik kullanılır.
                  Çevrim şartları genellikle 20-40x arasındadır.
                </p>

                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Yatırım Bonusları (Reload Bonus)
                </h3>
                <p className="text-muted-foreground mb-4">
                  Mevcut üyelerin sonraki yatırımlarında alabileceği bonuslardır. Genellikle %25-%100 arasında değişir
                  ve haftalık veya günlük olarak sunulabilir. Bu bonuslar düzenli oyuncuları ödüllendirmek için tasarlanmıştır.
                  Bazı siteler belirli günlerde (örneğin Cuma günleri) özel yatırım bonusları sunar.
                </p>

                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Kayıp Bonusu (Cashback)
                </h3>
                <p className="text-muted-foreground mb-4">
                  Kaybettiğiniz tutarın belirli bir yüzdesini geri almanızı sağlar. Genellikle haftalık veya günlük olarak
                  hesaplanır ve %5-%25 arasında değişir. Örneğin haftalık %10 cashback ile 5000 TL kayıp yaşarsanız,
                  500 TL bonus alırsınız. Kayıp bonusları genellikle düşük çevrim şartlarına sahiptir veya çevrim şartsız olabilir.
                  Risk yönetimi açısından çok önemli bir bonustur.
                </p>

                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Freespin Bonusu
                </h3>
                <p className="text-muted-foreground mb-4">
                  Slot oyunlarında kullanabileceğiniz bedava dönüşlerdir. Yeni üyelere hoş geldin paketi olarak 
                  50-200 freespin verilebilir. Belirli slot oyunlarında geçerlidir (genellikle popüler oyunlarda).
                  Freespin kazançları genellikle bonus olarak hesaba eklenir ve çevrim şartı gerektirir. Bazı siteler
                  günlük freespin kampanyaları düzenler.
                </p>

                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Çevrimsiz Bonus (Wager-Free)
                </h3>
                <p className="text-muted-foreground mb-4">
                  Hiçbir çevrim şartı olmayan bonuslardır ve çok nadirdir. Bonus ile kazandığınız parayı hemen 
                  çekebilirsiniz. Genellikle daha düşük oranlarda (%10-%50) sunulur ancak kullanımı çok kolaydır.
                  Bu bonuslar, yüksek çevrim şartlarından kaçınmak isteyen oyuncular için idealdir.
                </p>

                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  VIP ve Sadakat Programları
                </h3>
                <p className="text-muted-foreground mb-4">
                  Düzenli oyuncular için özel avantajlar sunar. Oynadıkça puan kazanır, seviyelerde yükselir ve 
                  özel bonuslar, daha yüksek çekim limitleri, kişisel hesap yöneticisi, özel turnuvalara erişim 
                  ve doğum günü bonusları gibi ayrıcalıklardan yararlanırsınız. VIP seviyeleri genellikle Bronz, 
                  Gümüş, Altın, Platin ve Elmas şeklinde sıralanır.
                </p>

                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Çevrim Şartları Nedir?
                </h3>
                <p className="text-muted-foreground mb-4">
                  Bonus miktarını veya bonus+yatırım toplamını belirli sayıda oynamanız gereken şarttır.
                  Örneğin 30x çevrim şartı ile 1000 TL bonus aldıysanız, 30.000 TL oynamanız gerekir.
                  Çevrim şartı tamamlanmadan para çekimi yapılamaz. Düşük çevrim şartı (15x-25x) tercih edilmelidir.
                  Slot oyunları genellikle %100 katkı sağlarken, canlı casino oyunları %10-%20 katkı sağlar.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Gift className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Bonus Stratejileri</h4>
                    <p className="text-sm text-muted-foreground">
                      Ekibimiz her bonus kampanyasını detaylı analiz eder. Çevrim şartları, maksimum bahis limitleri,
                      katkı oranları ve bonus süreleri incelenir. Amacımız en avantajlı ve gerçekçi bonus fırsatlarını 
                      size sunmaktır. Bonus kullanırken dikkat edilmesi gereken tüm detayları paylaşıyoruz.
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
                  <h3 className="font-semibold text-lg mb-2">Bonus çevrim şartı nasıl tamamlanır?</h3>
                  <p className="text-muted-foreground">
                    Bonus miktarı x çevrim katsayısı kadar bahis yapmanız gerekir. Örneğin 1000 TL bonus ve 30x çevrim 
                    için 30.000 TL bahis oynamalısınız. Slot oyunları genellikle %100 katkı sağlar.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Bonus kullanırken maksimum bahis limiti var mı?</h3>
                  <p className="text-muted-foreground">
                    Evet, çoğu bonus kampanyasında maksimum bahis limiti bulunur (genellikle 20-50 TL). Bu limiti 
                    aşarsanız bonus ve kazançlarınız iptal edilebilir. Bonus kurallarını mutlaka okuyun.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Birden fazla bonus aynı anda kullanılabilir mi?</h3>
                  <p className="text-muted-foreground">
                    Hayır, genellikle aynı anda sadece bir aktif bonus kullanabilirsiniz. Mevcut bonusunuzu tamamlamadan 
                    veya iptal etmeden yeni bonus alamazsınız.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Bonus almak zorunda mıyım?</h3>
                  <p className="text-muted-foreground">
                    Hayır, bonus almak tamamen isteğe bağlıdır. İsterseniz bonussuz para yatırabilir ve çevrim şartı 
                    olmadan oynayabilirsiniz. Bazı oyuncular bu yöntemi tercih eder.
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
