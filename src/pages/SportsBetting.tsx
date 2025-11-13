import { SEO } from '@/components/SEO';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Trophy, Zap, TrendingUp, CheckCircle2 } from 'lucide-react';
import { BettingSiteCard } from '@/components/BettingSiteCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function SportsBetting() {
  const { data: sites } = useQuery({
    queryKey: ['sports-betting-sites'],
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
        title="Spor Bahis Siteleri 2025 - Yüksek Oranlar & Canlı Bahis | CasinoAny.com"
        description="En yüksek bahis oranları, canlı maç izleme ve hızlı ödeme garantili spor bahis siteleri. Futbol, basketbol ve daha fazlası için uzman önerileri."
        canonical="https://casinoany.com/spor-bahisleri"
        keywords={["spor bahisleri", "canlı bahis", "yüksek oranlar", "iddaa siteleri", "bahis oranları"]}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <Breadcrumb 
            items={[
              { label: 'Ana Sayfa', href: '/' },
              { label: 'Spor Bahisleri' }
            ]} 
          />

          <section className="mb-12 mt-8">
            <div className="text-center max-w-4xl mx-auto">
              <Badge className="mb-4" variant="secondary">
                <Trophy className="w-3 h-3 mr-1" />
                En Yüksek Oranlar
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                En İyi Spor Bahis Siteleri
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Yüksek oranlar, canlı bahis seçenekleri ve geniş spor dalları ile en güvenilir bahis sitelerini keşfedin.
                Futbol, basketbol, tenis ve 30+ spor dalında binlerce bahis seçeneği.
              </p>
            </div>
          </section>

          <Card className="mb-12 p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Yüksek Oranlar</h3>
                  <p className="text-sm text-muted-foreground">%98 Oran</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Canlı Bahis</h3>
                  <p className="text-sm text-muted-foreground">Anlık Oynama</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">30+ Spor Dalı</h3>
                  <p className="text-sm text-muted-foreground">Geniş Seçenek</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Hızlı Ödeme</h3>
                  <p className="text-sm text-muted-foreground">Garantili</p>
                </div>
              </div>
            </div>
          </Card>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Önerilen Bahis Siteleri</h2>
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
              <h2 className="text-2xl font-bold mb-4">Spor Bahis Sitesi Nasıl Seçilir?</h2>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground mb-6">
                  Spor bahisleri, dünya çapında milyonlarca kişinin ilgi duyduğu heyecan verici bir eğlence alanıdır.
                  Doğru bahis sitesini seçmek, kazanç şansınızı artırır ve güvenli bir deneyim yaşamanızı sağlar.
                </p>

                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Bahis Oranları ve Marjlar
                </h3>
                <p className="text-muted-foreground mb-4">
                  Bahis oranları, sitenin size ne kadar kazanç sağlayacağını belirler. Kaliteli bahis siteleri %95-98 
                  arası oran sunar. Düşük marj oranı, oyuncular için daha fazla kazanç anlamına gelir. Özellikle futbol 
                  ve basketbol gibi popüler spor dallarında yüksek oranlar sunan siteleri tercih etmelisiniz.
                </p>

                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Canlı Bahis ve Maç İzleme
                </h3>
                <p className="text-muted-foreground mb-4">
                  Modern bahis deneyimi için canlı bahis özellikleri çok önemlidir. Maç devam ederken anlık bahis yapabilme, 
                  canlı maç izleme (live streaming) ve güncel istatistikler sunmalıdır. Özellikle futbol, tenis ve basketbol 
                  maçlarında canlı bahis seçeneklerinin zengin olması tercih sebebidir.
                </p>

                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Spor Çeşitliliği
                </h3>
                <p className="text-muted-foreground mb-4">
                  İyi bir bahis sitesi sadece futbol değil, basketbol, tenis, voleybol, hentbol, Amerikan futbolu, 
                  buz hokeyi, e-spor ve daha birçok spor dalında bahis imkanı sunmalıdır. Türkiye liglerinden dünya 
                  ligLerine kadar geniş bir karşılaşma yelpazesi olmalıdır.
                </p>

                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Bahis Türleri ve Pazar Çeşitliliği
                </h3>
                <p className="text-muted-foreground mb-4">
                  Maç sonucu, alt-üst, handikap, ilk yarı sonucu, gol atan oyuncu, korner sayısı gibi çeşitli bahis 
                  türleri sunmalıdır. Kombin bahis, sistem bahsi ve özel bahis seçenekleri deneyiminizi zenginleştirir.
                  Her maç için 100+ bahis seçeneği sunan siteler tercih edilmelidir.
                </p>

                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Bahis Bonusları ve Promosyonlar
                </h3>
                <p className="text-muted-foreground mb-4">
                  Hoş geldin bonusu, ilk yatırım bonusu, kayıp bonusu, kombine bonusu ve sadakat programları, 
                  bankrollünüzü artırır. Ancak çevrim şartlarının makul olması kritik önem taşır. Bonus şartlarının 
                  şeffaf ve ulaşılabilir olduğundan emin olun.
                </p>

                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Mobil Uyumluluk
                </h3>
                <p className="text-muted-foreground mb-4">
                  Günümüzde bahis severlerin büyük çoğunluğu mobil cihazlardan bahis yapar. Responsive tasarım, 
                  mobil uygulama desteği ve hızlı yükleme süreleri çok önemlidir. iOS ve Android uygulamaları 
                  kesintisiz bahis deneyimi sağlamalıdır.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Uzman Analizleri</h4>
                    <p className="text-sm text-muted-foreground">
                      Spor bahisleri konusunda 5 yıllık deneyime sahip ekibimiz, her siteyi minimum 100 bahis üzerinden 
                      test eder. Oran karşılaştırmaları, ödeme süreleri, müşteri hizmetleri kalitesi ve platform 
                      performansı detaylı şekilde incelenir. Verdiğimiz puanlar, gerçek kullanıcı deneyimlerine dayanır.
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
                  <h3 className="font-semibold text-lg mb-2">En yüksek oranları hangi siteler sunuyor?</h3>
                  <p className="text-muted-foreground">
                    Sayfamızda listelediğimiz siteler %95-98 arası oranlar sunmaktadır. Futbol maçlarında genellikle 
                    3-5% marj oranı ile çalışırlar. Oran karşılaştırması yaparak en iyi fırsatları bulabilirsiniz.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Canlı bahis nasıl yapılır?</h3>
                  <p className="text-muted-foreground">
                    Canlı bahis bölümüne girip devam eden maçları seçebilirsiniz. Maç sırasında değişen oranlara 
                    göre bahis yapabilir, anlık gelişmeleri takip ederek stratejinizi belirleyebilirsiniz.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Minimum bahis tutarı ne kadardır?</h3>
                  <p className="text-muted-foreground">
                    Çoğu sitede minimum bahis tutarı 10-20 TL arasındadır. Maximum bahis limitleri ise spor dalı 
                    ve lig seviyesine göre değişir, genellikle 10.000-50.000 TL arasındadır.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Kombine bahis nedir ve nasıl yapılır?</h3>
                  <p className="text-muted-foreground">
                    Kombine bahis, birden fazla maçı tek bir kupona ekleyerek oynamanızdır. Her doğru tahmin 
                    oranları çarpar ve potansiyel kazancınızı artırır. En az 2, en fazla 20-30 maç kombine edilebilir.
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
