import { CasinoReviewTemplate } from '@/components/templates/CasinoReviewTemplate';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { GamblingSEOEnhancer } from '@/components/seo/GamblingSEOEnhancer';
import { Shield, Zap, Headphones, Smartphone, CreditCard, Trophy } from 'lucide-react';

const BetpasInceleme = () => {
  const casino = {
    name: 'Betpas',
    slug: 'betpas',
    logo: '/logos/betpas-logo.png',
    rating: 4.7,
    reviewCount: 1998,
    bonus: '13.000 TL Hoşgeldin Bonusu + 160 Free Spin',
    license: 'Curacao eGaming License #8048/JAZ',
    established: '2019',
    minDeposit: '75 TL',
    withdrawalTime: '5-10 saat',
    gameCount: 4600,
    liveCasino: true,
    mobileApp: true
  };

  const pros = [
    'Geniş oyun portföyü (4,600+)',
    'Hızlı para çekme işlemleri (5-10 saat)',
    'Yüksek hoşgeldin bonusu (13.000 TL)',
    'Evolution Gaming premium canlı casino',
    'VIP Club avantajları',
    'Haftalık %10 cashback',
    'Spor bahisleri entegrasyonu'
  ];

  const cons = [
    'Minimum yatırım 75 TL (rakiplerden yüksek)',
    'Bonus çevrim şartı 40x',
    'iOS uygulaması henüz yok'
  ];

  const features = [
    {
      title: 'Premium Slot Koleksiyonu',
      description: '3,600+ slot oyunu. Gates of Olympus, Sweet Bonanza, Sugar Rush, Big Bass Bonanza. RTP %96-98.',
      icon: <Zap className="w-5 h-5 text-primary" />
    },
    {
      title: 'Live Casino Elite',
      description: 'Evolution Gaming ile 160+ canlı masa. Lightning serisi, Crazy Time, Monopoly Live. VIP Turkish Tables.',
      icon: <Trophy className="w-5 h-5 text-primary" />
    },
    {
      title: 'Spor Bahisleri',
      description: 'Futbol, basketbol, tenis dahil 30+ spor dalı. Canlı bahis, yüksek oranlar, kombine seçenekleri.',
      icon: <Trophy className="w-5 h-5 text-primary" />
    },
    {
      title: 'Hızlı Ödemeler',
      description: 'Papara Express: 5-8 saat, Cepbank: 7-10 saat. Minimum çekim 150 TL, günlük limit 70.000 TL.',
      icon: <CreditCard className="w-5 h-5 text-primary" />
    },
    {
      title: 'Mobil Platform',
      description: 'Android native app. Responsive site, tüm oyunlar mobilde. Push notifications, touch-optimized.',
      icon: <Smartphone className="w-5 h-5 text-primary" />
    },
    {
      title: 'Destek & Güvenlik',
      description: 'WhatsApp, Telegram, canlı chat 7/24. Curacao lisanslı, SSL 256-bit, 2FA. eCOGRA sertifikalı.',
      icon: <Shield className="w-5 h-5 text-primary" />
    }
  ];

  const paymentMethods = [
    'Papara Express',
    'Cepbank',
    'Visa/Mastercard',
    'Havale/EFT',
    'Bitcoin',
    'Ethereum',
    'USDT',
    'Litecoin',
    'Astropay',
    'MuchBetter'
  ];

  const gameProviders = [
    'Pragmatic Play',
    'Evolution Gaming',
    'NetEnt',
    'Play\'n GO',
    'Microgaming',
    'Yggdrasil',
    'Red Tiger',
    'Push Gaming',
    'Big Time Gaming',
    'No Limit City',
    'Hacksaw Gaming',
    'Relax Gaming'
  ];

  const expertReview = {
    author: 'Onur Kaya',
    expertise: 'Casino Platform & Payment Systems Expert',
    experience: '11 yıl casino platformları ve ödeme sistemleri uzmanı',
    summary: 'Betpas, 2019 yılında kurulmuş, hem casino hem spor bahisleri sunan entegre bir platformdur. Curacao eGaming lisansı ile faaliyet göstermektedir. 4,600+ oyun portföyü ile sektörde üst-orta seviyededir. Hoşgeldin bonusu 13.000 TL + 160 Free Spin ile yüksek bir tekliftir, ancak 40x çevrim şartı dikkat edilmesi gereken bir noktadır. Evolution Gaming entegrasyonu ile 160+ canlı masa sunulmakta, Lightning serisi ve VIP Turkish Tables mevcuttur. Pragmatic Play, NetEnt ve Microgaming ile geniş slot koleksiyonu bulunmaktadır. Spor bahisleri bölümü gelişmiş olup, futbol, basketbol, tenis dahil 30+ spor dalında canlı bahis imkanı sunmaktadır. Para çekme süreleri Papara Express ile 5-8 saat, diğer yöntemler ile 7-10 saat arasında gerçekleşmekte, bu sektörde hızlı bir performanstır. Haftalık %10 cashback programı ile kayıpların bir kısmı geri alınabilmektedir. VIP Club programı gelişmiş olup, özel turnuvalar, yüksek limitler ve kişisel hesap yöneticisi sunulmaktadır. Mobil platform Android için native uygulama sunmakta, iOS kullanıcıları responsive site üzerinden erişim sağlayabilmektedir. WhatsApp, Telegram ve canlı chat ile 7/24 Türkçe destek verilmektedir. Güvenlik altyapısı SSL 256-bit şifreleme, 2FA ve düzenli eCOGRA denetimleri ile sağlamlaştırılmıştır. Minimum yatırım limiti 75 TL olup, bu rakiplerine göre biraz yüksektir. Genel olarak, geniş oyun yelpazesi, hızlı işlemler ve hem casino hem bahis oynamak isteyen oyuncular için uygun bir platformdur.',
    date: '2025-01-15'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <SEO
        title="Betpas İnceleme 2025 - Premium Casino & Bahis"
        description="Betpas casino detaylı inceleme. 13.000 TL hoşgeldin bonusu, 5-10 saat hızlı para çekimi, 4600+ oyun. Betpas güvenilir mi? Spor bahisleri ve expert analiz."
        keywords={[
          'betpas',
          'betpas inceleme',
          'betpas güvenilir mi',
          'betpas bonus',
          'betpas casino',
          'betpas para çekme',
          'betpas giriş',
          'betpas bahis'
        ]}
        canonical={`${window.location.origin}/betpas-inceleme`}
        ogType="article"
        ogImage="/logos/betpas-logo.png"
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
          affiliateLink="https://betpas.com"
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default BetpasInceleme;
