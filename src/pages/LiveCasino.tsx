import { SEO } from '@/components/SEO';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, Users, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { BettingSiteCard } from '@/components/BettingSiteCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function LiveCasino() {
  const { data: sites } = useQuery({
    queryKey: ['live-casino-sites'],
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
        title="Canlı Casino Siteleri 2025 - Gerçek Krupiyelerle Oyna | CasinoAny.com"
        description="En kaliteli canlı casino siteleri ve gerçek krupiyelerle oyun deneyimi. Canlı rulet, blackjack, poker ve bakara için en iyi platformlar."
        canonical="https://casinoany.com/canli-casino"
        keywords={["canlı casino", "live casino", "canlı rulet", "canlı blackjack", "gerçek krupiye", "evolution gaming"]}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background pt-[72px] md:pt-[84px]">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <Breadcrumb 
            items={[
              { label: 'Ana Sayfa', href: '/' },
              { label: 'Canlı Casino' }
            ]} 
          />

          <section className="mb-12 mt-8">
            <div className="text-center max-w-4xl mx-auto">
              <Badge className="mb-4" variant="secondary">
                <Video className="w-3 h-3 mr-1" />
                Gerçek Casino Deneyimi
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                En İyi Canlı Casino Siteleri
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                HD kalitede video yayını, profesyonel krupiyeler ve gerçek casino atmosferiyle evinizin konforunda 
                Las Vegas deneyimi yaşayın. Evolution Gaming, Pragmatic Play ve Ezugi sağlayıcılarıyla en kaliteli masa oyunları.
              </p>
            </div>
          </section>

          <Card className="mb-12 p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Video className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">HD Yayın</h3>
                  <p className="text-sm text-muted-foreground">4K Kalite</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Profesyonel</h3>
                  <p className="text-sm text-muted-foreground">Türkçe Krupiye</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">7/24 Aktif</h3>
                  <p className="text-sm text-muted-foreground">Kesintisiz</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">VIP Masalar</h3>
                  <p className="text-sm text-muted-foreground">Yüksek Limit</p>
                </div>
              </div>
            </div>
          </Card>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">En Popüler Canlı Casino Siteleri</h2>
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
              <h2 className="text-2xl font-bold mb-4">Canlı Casino Rehberi</h2>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground mb-6">
                  Canlı casino, gerçek krupiyelerin yönettiği masa oyunlarının HD kalite video yayınıyla oynanmasıdır.
                  Fiziksel casinoların heyecanını evinizin konforunda yaşayabilirsiniz. İşte bilmeniz gereken her şey.
                </p>

                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Canlı Casino Nasıl Çalışır?
                </h3>
                <p className="text-muted-foreground mb-4">
                  Canlı casino stüdyolarında profesyonel krupiyeler gerçek masa oyunlarını yönetir. Çoklu kamera sistemiyle 
                  her açıdan HD kalitede yayın yapılır. Siz ekranınızdan bahis yaparsınız, krupiye gerçek kartları dağıtır,
                  rulet çarkını çevirir veya zarları atar. Tüm oyun mekaniklerini görerek adil oyun garantisi altında 
                  oynarken, chat özelliğiyle krupiye ve diğer oyuncularla etkileşime geçebilirsiniz. Oyunlar 24/7 kesintisiz 
                  devam eder ve binlerce masa seçeneği sunar.
                </p>

                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Popüler Canlı Casino Oyunları
                </h3>
                <p className="text-muted-foreground mb-4">
                  <strong>Canlı Rulet:</strong> En popüler masa oyunu. Avrupa, Amerikan, Fransız ruleti çeşitleri. 
                  Speed Rulet, Lightning Rulet, Immersive Rulet gibi özel versiyonlar. Minimum bahis 5-10 TL, VIP 
                  masalarda 10.000+ TL limitleri.<br/><br/>
                  
                  <strong>Canlı Blackjack:</strong> 21 oyunu olarak bilinen klasik kart oyunu. Klasik, Speed, Free Bet, 
                  Infinite Blackjack varyasyonları. Strateji gerektiren, oran olarak en adil oyun (%99.5 RTP).<br/><br/>
                  
                  <strong>Canlı Poker:</strong> Casino Hold'em, Texas Hold'em Bonus, Three Card Poker, Caribbean Stud. 
                  Turnuva atmosferi ve büyük kazanç potansiyeli.<br/><br/>
                  
                  <strong>Canlı Bakara:</strong> Asya kökenli popüler kart oyunu. Player-Banker bahisleri, yüksek limitler. 
                  Speed Bakara ve No Commission versiyonları.<br/><br/>
                  
                  <strong>Game Show Oyunları:</strong> Dream Catcher, Monopoly Live, Deal or No Deal, Mega Ball. 
                  TV show formatında eğlenceli ve kazançlı oyunlar. 20.000x kazanç çarpanları!
                </p>

                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Canlı Casino Yazılım Sağlayıcıları
                </h3>
                <p className="text-muted-foreground mb-4">
                  <strong>Evolution Gaming:</strong> Sektörün lideri ve en kaliteli sağlayıcı. 100+ canlı masa, 
                  profesyonel krupiyeler, 4K kalite yayın. Lightning serisi ve özel game showlar.<br/><br/>
                  
                  <strong>Pragmatic Play Live:</strong> Türkçe krupiye desteği, geniş oyun yelpazesi. Sweet Bonanza 
                  Candyland ve Mega Wheel gibi popüler oyunlar.<br/><br/>
                  
                  <strong>Ezugi:</strong> Türk oyuncular için özel masalar, 7/24 Türkçe hizmet. Ultimate Rulet ve 
                  Turkish Blackjack gibi yerel oyunlar.<br/><br/>
                  
                  <strong>NetEnt Live:</strong> İskandinav kalitesi, minimalist tasarım. Auto-Roulette ve Blackjack Party 
                  gibi inovatif oyunlar.
                </p>

                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  VIP ve Yüksek Limitli Masalar
                </h3>
                <p className="text-muted-foreground mb-4">
                  Yüksek bahis oynamak isteyen oyuncular için VIP masalar mevcuttur. Bu masalarda minimum bahis 
                  500-1000 TL'den başlar, maksimum limitler 50.000-100.000 TL'ye kadar çıkabilir. VIP masalarda 
                  özel krupiyeler, daha lüks stüdyo ortamı, kişisel masa yöneticisi ve daha hızlı oyun temposu bulunur.
                  Ayrıca VIP oyuncular için özel bonuslar, cashback oranları ve sadakat ödülleri sunulur.
                </p>

                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Mobil Canlı Casino Deneyimi
                </h3>
                <p className="text-muted-foreground mb-4">
                  Modern canlı casino platformları mobil cihazlarda mükemmel çalışır. iOS ve Android'de tam özellikli 
                  deneyim, dikey ve yatay mod desteği, dokunmatik kontroller ve optimize edilmiş video akışı sağlanır.
                  4G/5G bağlantıda kesintisiz HD yayın, 3G'de standart kalite izlenebilir. Mobil canlı casino uygulamaları 
                  genellikle daha az veri tüketir ve pil dostu çalışır. Tablet cihazlarda masaüstü deneyimine yakın 
                  görüntü kalitesi elde edilir.
                </p>

                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Canlı Casino Stratejileri ve İpuçları
                </h3>
                <p className="text-muted-foreground mb-4">
                  <strong>Oyun Seçimi:</strong> Blackjack en yüksek RTP'ye (%99.5) sahiptir, temel stratejiyle ev avantajı 
                  minimuma iner. Bakara %98.9 RTP sunar ve basittir. Rulet %97.3 RTP, eğlenceli ancak stratejik değil.<br/><br/>
                  
                  <strong>Bankroll Yönetimi:</strong> Her oturum için bütçe belirleyin, kayıpları kovalamayın. 
                  Bahislerinizi bankrollünüzün %1-2'sinde tutun. Kazandığınızda kar al stratejisi uygulayın.<br/><br/>
                  
                  <strong>Masa Seçimi:</strong> Düşük minimumlu masalarda başlayın, deneyim kazandıkça limitlerinizi artırın.
                  Kalabalık masalarda oyun temposu yavaştır, hızlı masalar daha fazla el oynatır.<br/><br/>
                  
                  <strong>Bonusları Akıllıca Kullanın:</strong> Canlı casino bonusları genellikle slot bonuslarından 
                  düşük katkı oranına sahiptir (%10-20). Bonus şartlarını mutlaka okuyun, uygun oyunları tercih edin.
                </p>

                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Güvenlik ve Adil Oyun
                </h3>
                <p className="text-muted-foreground mb-4">
                  Canlı casino oyunları %100 adil ve şeffaftır. Tüm işlemler kamera kayıtlarıyla belgelenir, kartlar 
                  gerçek deck'lerden dağıtılır, rulet çarkı fizikseldir. Oyun sonuçları manipüle edilemez.
                  Lisanslı sağlayıcılar düzenli olarak bağımsız denetimlerden geçer. İtirazlarınızı video kayıtlarıyla 
                  kanıtlayabilirsiniz. RNG (Random Number Generator) yerine gerçek fiziksel mekanikler kullanılır.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Video className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Canlı Casino Uzmanları</h4>
                    <p className="text-sm text-muted-foreground">
                      Ekibimiz canlı casino platformlarını gerçek para ile test eder. Video kalitesi, krupiye profesyonelliği,
                      masa çeşitliliği, oyun hızı ve genel deneyim değerlendirilir. Her platformda minimum 50 saat oyun 
                      oynayarak detaylı analiz yapılır. Amacımız en kaliteli canlı casino deneyimini sunmaktır.
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
                  <h3 className="font-semibold text-lg mb-2">Canlı casino oyunları hileli mi?</h3>
                  <p className="text-muted-foreground">
                    Hayır, lisanslı canlı casino sağlayıcıları %100 adil oyun garantisi verir. Tüm işlemler canlı yayında 
                    gerçekleşir ve kayıt altına alınır. Fiziksel kartlar ve gerçek rulet çarkı kullanılır.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Minimum ne kadar bahis yapabilirim?</h3>
                  <p className="text-muted-foreground">
                    Çoğu canlı casino masasında minimum bahis 5-10 TL'den başlar. Yüksek limitli VIP masalarda 
                    minimum 500-1000 TL olabilir. Her masanın limitleri farklıdır.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Krupiyelerle konuşabilir miyim?</h3>
                  <p className="text-muted-foreground">
                    Evet, chat özelliği ile krupiyelerle yazışabilirsiniz. Krupiyeler sorularınızı yanıtlar ve 
                    sohbet ederler. Ancak sesli iletişim bulunmaz, sadece yazılı chat vardır.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Canlı casino oyunları mobilde oynanır mı?</h3>
                  <p className="text-muted-foreground">
                    Evet, tüm modern canlı casino platformları mobil uyumludur. iOS ve Android cihazlarda tarayıcı 
                    veya uygulama üzerinden sorunsuz oynanabilir. HD kalite video desteği bulunur.
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
