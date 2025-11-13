import { SEO } from '@/components/SEO';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Star, Clock, CreditCard, CheckCircle2 } from 'lucide-react';
import { BettingSiteCard } from '@/components/BettingSiteCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function CasinoSites() {
  const { data: sites } = useQuery({
    queryKey: ['casino-sites'],
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
        title="En İyi Casino Siteleri 2025 - Güvenilir Online Casino Rehberi | CasinoAny.com"
        description="Türkiye'nin en güvenilir casino siteleri rehberi. Lisanslı, yüksek bonuslu ve hızlı ödemeli casino sitelerini keşfedin. Detaylı incelemeler ve kullanıcı yorumları."
        canonical="https://casinoany.com/casino-siteleri"
        keywords={["casino siteleri", "online casino", "güvenilir casino", "casino bonusu", "canlı casino"]}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <Breadcrumb 
            items={[
              { label: 'Ana Sayfa', href: '/' },
              { label: 'Casino Siteleri' }
            ]} 
          />

          {/* Hero Section */}
          <section className="mb-12 mt-8">
            <div className="text-center max-w-4xl mx-auto">
              <Badge className="mb-4" variant="secondary">
                <Star className="w-3 h-3 mr-1" />
                2025'in En İyileri
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                En İyi Casino Siteleri
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Uzman ekibimiz tarafından detaylı olarak incelenmiş, lisanslı ve güvenilir casino sitelerini keşfedin. 
                2020'den beri binlerce kullanıcıya en iyi casino deneyimini sunuyoruz.
              </p>
            </div>
          </section>

          {/* Trust Signals */}
          <Card className="mb-12 p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Lisanslı Siteler</h3>
                  <p className="text-sm text-muted-foreground">Curacao & Malta</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">7/24 Destek</h3>
                  <p className="text-sm text-muted-foreground">Canlı Yardım</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Hızlı Ödemeler</h3>
                  <p className="text-sm text-muted-foreground">Anında Transfer</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Yüksek Bonuslar</h3>
                  <p className="text-sm text-muted-foreground">%300'e Varan</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Casino Sites Grid */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Önerilen Casino Siteleri</h2>
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

          {/* Expert Content Section */}
          <article className="mb-12">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4">Casino Sitesi Seçerken Nelere Dikkat Edilmeli?</h2>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground mb-6">
                  Online casino dünyası gün geçtikçe büyürken, güvenilir bir platform seçmek kritik önem taşımaktadır. 
                  2020 yılından bu yana sektörde olan uzman ekibimiz, sizler için en güvenilir casino sitelerini titizlikle incelemektedir.
                </p>

                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Lisans ve Güvenlik
                </h3>
                <p className="text-muted-foreground mb-4">
                  Güvenilir bir casino sitesinin mutlaka Curacao, Malta Gaming Authority veya benzeri saygın bir otoriteden 
                  lisansa sahip olması gerekmektedir. Lisanslı siteler, düzenli denetimlere tabi tutulur ve oyuncuların 
                  haklarını koruma altına alır. SSL şifreleme teknolojisi kullanımı da güvenlik açısından olmazsa olmazdır.
                </p>

                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Oyun Çeşitliliği ve Yazılım Sağlayıcıları
                </h3>
                <p className="text-muted-foreground mb-4">
                  Kaliteli bir casino sitesi, Evolution Gaming, Pragmatic Play, NetEnt gibi dünyaca ünlü yazılım sağlayıcılarıyla 
                  çalışmalıdır. Geniş slot seçenekleri, canlı casino masaları, masa oyunları ve jackpot oyunları sunmalıdır. 
                  Oyun çeşitliliği, kullanıcı deneyimini doğrudan etkileyen en önemli faktörlerden biridir.
                </p>

                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Ödeme Yöntemleri ve Çekim Süreleri
                </h3>
                <p className="text-muted-foreground mb-4">
                  Hızlı ve güvenilir para yatırma ve çekme işlemleri, iyi bir casino sitesinin vazgeçilmez özelliklerindendir. 
                  Papara, Paykasa, kripto para, banka havalesi gibi çeşitli ödeme seçenekleri sunmalı ve çekim talepleri 
                  24-48 saat içinde işleme konulmalıdır. Yüksek çekim limitleri ve düşük komisyon oranları da tercih edilirlik açısından önemlidir.
                </p>

                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Bonus ve Promosyonlar
                </h3>
                <p className="text-muted-foreground mb-4">
                  Cömert hoş geldin bonusları, haftalık cashback teklifleri, kayıp bonusları ve sadakat programları, 
                  oyuncular için büyük avantaj sağlar. Ancak bonus çevrim şartlarının adil ve ulaşılabilir olması çok önemlidir. 
                  Şeffaf bonus politikası sunan siteler her zaman tercih edilmelidir.
                </p>

                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Müşteri Hizmetleri
                </h3>
                <p className="text-muted-foreground mb-4">
                  7/24 canlı destek hizmeti, Türkçe dil desteği ve hızlı yanıt süreleri, kaliteli bir casino sitesinin 
                  olmazsa olmazlarıdır. WhatsApp, Telegram gibi farklı iletişim kanalları sunması da kullanıcı memnuniyetini artırır.
                </p>
              </div>

              {/* Author Expertise */}
              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Uzman Değerlendirme</h4>
                    <p className="text-sm text-muted-foreground">
                      CasinoAny.com uzman ekibi, 2020 yılından beri online bahis ve casino sektöründe faaliyet göstermektedir. 
                      Her site minimum 2 haftalık test sürecinden geçirilir, güvenlik, oyun çeşitliliği, ödeme hızı ve müşteri 
                      hizmetleri gibi kritik faktörler detaylıca incelenir. Amacımız, kullanıcılarımıza en güvenilir ve kaliteli 
                      casino deneyimini sunmaktır.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </article>

          {/* FAQ Section */}
          <section className="mb-12">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">Sıkça Sorulan Sorular</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Türkiye'de online casino legal mi?</h3>
                  <p className="text-muted-foreground">
                    Türkiye'de yerli casino siteleri yasal değildir ancak yurtdışı lisanslı (Curacao, Malta vb.) 
                    sitelere erişim mümkündür. Bu siteler uluslararası lisanslarla çalışmaktadır.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Casino sitelerinde kazanılan paralar ödenirmi?</h3>
                  <p className="text-muted-foreground">
                    Lisanslı ve güvenilir casino siteleri kazançları eksiksiz öder. Sitelerimiz düzenli olarak 
                    test edilir ve ödeme güvenilirliği garanti altındadır.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Hangi ödeme yöntemlerini kullanabilirim?</h3>
                  <p className="text-muted-foreground">
                    Papara, Paykasa, Cepbank, havale, kripto para (Bitcoin, Ethereum) gibi çeşitli yöntemler 
                    kullanılabilir. Her sitenin desteklediği yöntemler farklılık gösterebilir.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Casino bonuslarını nasıl kullanabilirim?</h3>
                  <p className="text-muted-foreground">
                    Bonuslar genellikle ilk para yatırma işleminde otomatik olarak hesabınıza tanımlanır. 
                    Çevrim şartlarını tamamladıktan sonra bonus kazançlarınızı çekebilirsiniz.
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
