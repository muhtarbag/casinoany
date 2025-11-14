import { CasinoReviewTemplate } from '@/components/templates/CasinoReviewTemplate';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { GamblingSEOEnhancer } from '@/components/seo/GamblingSEOEnhancer';
import { Shield, Zap, Headphones, Smartphone, CreditCard, Trophy } from 'lucide-react';

const YouwinInceleme = () => {
  const casino = {
    name: 'Youwin',
    slug: 'youwin',
    logo: '/logos/youwin-logo.png',
    rating: 4.7,
    reviewCount: 2156,
    bonus: '14.000 TL Hoşgeldin Bonusu + 175 Free Spin',
    license: 'Curacao Gaming Authority #365/JAZ',
    established: '2016',
    minDeposit: '50 TL',
    withdrawalTime: '6-12 saat',
    gameCount: 4800,
    liveCasino: true,
    mobileApp: true
  };

  const pros = [
    'Köklü firma, 8+ yıl sektör deneyimi',
    'Geniş oyun portföyü (4,800+)',
    'Yüksek hoşgeldin bonusu (14.000 TL)',
    'Microgaming ve NetEnt eksklüzif oyunlar',
    'Haftalık %10 cashback',
    'VIP programı gelişmiş',
    'Spor bahisleri entegrasyonu'
  ];

  const cons = [
    'Bonus çevrim şartı yüksek (40x)',
    'Para çekme süresi orta (6-12 saat)',
    'Bazı ödeme yöntemlerinde komisyon'
  ];

  const features = [
    {
      title: 'Slot Koleksiyonu',
      description: '3,800+ slot oyunu. Microgaming jackpot slotları, NetEnt premium serisi, Pragmatic Play hit oyunları.',
      icon: <Zap className="w-5 h-5 text-primary" />
    },
    {
      title: 'Canlı Casino',
      description: 'Evolution Gaming, Ezugi ile 150+ masa. Türkçe dealerlar, VIP masalar, Lightning serisi oyunlar.',
      icon: <Trophy className="w-5 h-5 text-primary" />
    },
    {
      title: 'Spor Bahisleri',
      description: 'Futbol, basketbol, tenis dahil 25+ spor dalı. Canlı bahis, yüksek oranlar, kombine seçenekleri.',
      icon: <Trophy className="w-5 h-5 text-primary" />
    },
    {
      title: 'Ödemeler',
      description: 'Papara: 6-10 saat, Cepbank: 8-12 saat. Minimum çekim 100 TL, günlük limit 60.000 TL.',
      icon: <CreditCard className="w-5 h-5 text-primary" />
    },
    {
      title: 'Mobil Platform',
      description: 'Android ve iOS native uygulamaları. Responsive site, tüm oyunlar mobilde erişilebilir.',
      icon: <Smartphone className="w-5 h-5 text-primary" />
    },
    {
      title: 'Destek & Güvenlik',
      description: 'Canlı chat, WhatsApp 7/24. Curacao lisanslı, SSL 256-bit şifreleme, 2FA güvenlik.',
      icon: <Shield className="w-5 h-5 text-primary" />
    }
  ];

  const paymentMethods = [
    'Papara',
    'Cepbank',
    'Visa/Mastercard',
    'Havale/EFT',
    'Bitcoin',
    'Ethereum',
    'USDT',
    'Litecoin',
    'Ecopayz',
    'MuchBetter'
  ];

  const gameProviders = [
    'Microgaming',
    'NetEnt',
    'Evolution Gaming',
    'Pragmatic Play',
    'Play\'n GO',
    'Yggdrasil',
    'Ezugi',
    'Red Tiger',
    'Quickspin',
    'Thunderkick',
    'ELK Studios',
    'Push Gaming'
  ];

  const expertReview = {
    author: 'Burak Öztürk',
    expertise: 'Veteran Casino Analyst & Gaming Industry Expert',
    experience: '16 yıl online gaming sektörü deneyimi',
    summary: 'Youwin, 2016 yılında kurulmuş, Türkiye pazarında köklü ve güvenilir bir casino platformudur. Curacao Gaming Authority lisansı ile faaliyet göstermektedir. 4,800+ oyun portföyü ile sektörde üst seviyededir. Hoşgeldin bonusu 14.000 TL + 175 Free Spin ile yüksek bir tekliftir, ancak 40x çevrim şartı dikkat edilmesi gereken bir noktadır. Microgaming ve NetEnt ile eksklüzif oyun anlaşmaları bulunmakta, jackpot slotları erişime açıktır. Evolution Gaming ve Ezugi entegrasyonu ile 150+ canlı masa sunulmakta, VIP masalar mevcuttur. Spor bahisleri entegrasyonu ile hem casino hem bahis severlere hitap etmektedir. Para çekme süreleri Papara için 6-10 saat, diğer yöntemler için 8-12 saat arasındadır. Haftalık %10 cashback programı ile kayıpların bir kısmı geri alınabilmektedir. VIP programı gelişmiş olup, yüksek limitli oyuncular için özel avantajlar, turnuvalar ve kişisel hesap yöneticisi sunulmaktadır. Mobil platform iOS ve Android için native uygulamalar sunmakta, kullanıcı deneyimi iyidir. Güvenlik altyapısı SSL 256-bit şifreleme ve 2FA ile korunmaktadır. 8+ yıllık sektör deneyimi ile güvenilirlik konusunda sağlam bir geçmişi vardır. Genel olarak, köklü bir platform arayan, geniş oyun yelpazesi ve hem casino hem bahis oynamak isteyen kullanıcılar için uygun bir seçenektir.',
    date: '2025-01-15'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <SEO
        title="Youwin İnceleme 2025 - Köklü Casino & Bahis Platformu"
        description="Youwin casino detaylı inceleme. 14.000 TL hoşgeldin bonusu, 4800+ oyun, spor bahisleri. Youwin güvenilir mi? 8+ yıl deneyim, bonus şartları ve kullanıcı yorumları."
        keywords={[
          'youwin',
          'youwin inceleme',
          'youwin güvenilir mi',
          'youwin bonus',
          'youwin casino',
          'youwin giriş',
          'youwin para çekme',
          'youwin bahis'
        ]}
        canonical={`${window.location.origin}/youwin-inceleme`}
        ogType="article"
        ogImage="/logos/youwin-logo.png"
      />
      
      <GamblingSEOEnhancer
        isMoneyPage={true}
        authorName={expertReview.author}
        lastReviewed={expertReview.date}
      />
      
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <CasinoReviewTemplate
          casino={casino}
          pros={pros}
          cons={cons}
          features={features}
          paymentMethods={paymentMethods}
          gameProviders={gameProviders}
          expertReview={expertReview}
          affiliateLink="https://youwin.com"
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default YouwinInceleme;
