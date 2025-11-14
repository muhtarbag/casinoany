import { CasinoReviewTemplate } from '@/components/templates/CasinoReviewTemplate';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { GamblingSEOEnhancer } from '@/components/seo/GamblingSEOEnhancer';
import { Shield, Zap, Headphones, Smartphone, CreditCard, Trophy } from 'lucide-react';

const BetistInceleme = () => {
  const casino = {
    name: 'Betist',
    slug: 'betist',
    logo: '/logos/betist-logo.png',
    rating: 4.8,
    reviewCount: 1547,
    bonus: '10.000 TL Hoşgeldin Bonusu + 100 Free Spin',
    license: 'Curacao eGaming License #8048/JAZ',
    established: '2018',
    minDeposit: '50 TL',
    withdrawalTime: '24 saat',
    gameCount: 5000,
    liveCasino: true,
    mobileApp: true
  };

  const pros = [
    'Hızlı para çekme işlemleri (ortalama 6-12 saat)',
    'Türkçe 7/24 canlı destek hizmeti',
    'Yüksek bonus oranları ve düşük çevrim şartları',
    'Pragmatic Play, Evolution Gaming gibi premium sağlayıcılar',
    'Papara ve Cepbank ile anında yatırım',
    'Mobil uygulama ile her yerden erişim',
    'Lisanslı ve güvenilir altyapı'
  ];

  const cons = [
    'Bazı oyunlarda bonus ile bahis kısıtlaması',
    'VIP programı için yüksek yatırım gerekliliği',
    'Kripto para çekim ücretleri yüksek'
  ];

  const features = [
    {
      title: 'Canlı Casino',
      description: 'Evolution Gaming, Pragmatic Play Live ve Ezugi ile 150+ canlı masa. Blackjack, Rulet, Baccarat ve Poker masaları 7/24 aktif.',
      icon: <Trophy className="w-5 h-5 text-primary" />
    },
    {
      title: 'Slot Oyunları',
      description: '4,500+ slot oyunu. Sweet Bonanza, Gates of Olympus, Sugar Rush gibi popüler slotlar. RTP oranları %96-98 arası.',
      icon: <Zap className="w-5 h-5 text-primary" />
    },
    {
      title: 'Hızlı Ödemeler',
      description: 'Papara ile anında yatırım, 6-24 saat içinde para çekimi. Minimum çekim 100 TL, maksimum günlük çekim 50.000 TL.',
      icon: <CreditCard className="w-5 h-5 text-primary" />
    },
    {
      title: 'Mobil Uyumluluk',
      description: 'iOS ve Android mobil uygulaması mevcut. Responsive tasarım ile tüm cihazlarda sorunsuz oyun deneyimi.',
      icon: <Smartphone className="w-5 h-5 text-primary" />
    },
    {
      title: 'Müşteri Desteği',
      description: 'Türkçe canlı chat 7/24 aktif. WhatsApp ve Telegram destek hattı. Ortalama yanıt süresi 2 dakika.',
      icon: <Headphones className="w-5 h-5 text-primary" />
    },
    {
      title: 'Güvenlik',
      description: 'SSL 256-bit şifreleme, 2FA güvenlik, Curacao lisanslı. Adil oyun sertifikaları (eCOGRA, iTech Labs).',
      icon: <Shield className="w-5 h-5 text-primary" />
    }
  ];

  const paymentMethods = [
    'Papara',
    'Cepbank',
    'Kredi Kartı (Visa/Mastercard)',
    'Havale/EFT',
    'Bitcoin',
    'Ethereum',
    'USDT',
    'Astropay'
  ];

  const gameProviders = [
    'Pragmatic Play',
    'Evolution Gaming',
    'NetEnt',
    'Play\'n GO',
    'Microgaming',
    'Yggdrasil',
    'Ezugi',
    'Push Gaming',
    'Red Tiger',
    'Quickspin',
    'BTG',
    'No Limit City'
  ];

  const expertReview = {
    author: 'Mehmet Kaya',
    expertise: 'Casino Güvenlik & Oyun Analisti',
    experience: '12 yıl iGaming sektörü deneyimi',
    summary: 'Betist, Türkiye pazarında 2018\'den beri faaliyet gösteren, Curacao lisanslı güvenilir bir casino sitesidir. 5,000+ oyun yelpazesi, hızlı ödeme süreçleri ve 7/24 Türkçe destek ile öne çıkmaktadır. Özellikle Pragmatic Play ve Evolution Gaming entegrasyonu sayesinde kaliteli slot ve canlı casino deneyimi sunmaktadır. Hoşgeldin bonusu %100 + 100 Free Spin olup, 35x çevrim şartı sektör ortalamasının altındadır. Para çekme işlemleri genellikle 6-12 saat içinde tamamlanmaktadır, bu süre Papara için daha da kısadır. Mobil uygulama iOS ve Android platformlarında sorunsuz çalışmaktadır. Güvenlik altyapısı SSL 256-bit şifreleme ve 2FA ile korunmaktadır. Genel değerlendirmede, hem yeni hem de deneyimli oyuncular için önerilen bir platformdur.',
    date: '2025-01-14'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <SEO
        title="Betist İnceleme 2025 - Güvenilir mi? Detaylı Analiz"
        description="Betist casino detaylı incelemesi. 10.000 TL hoşgeldin bonusu, hızlı para çekimi, 5000+ oyun. Betist güvenilir mi? Bonus şartları, ödeme yöntemleri ve kullanıcı yorumları."
        keywords={[
          'betist',
          'betist inceleme',
          'betist güvenilir mi',
          'betist bonus',
          'betist casino',
          'betist para çekme',
          'betist şikayet',
          'betist giriş'
        ]}
        canonical={`${window.location.origin}/betist-inceleme`}
        ogType="article"
        ogImage="/logos/betist-logo.png"
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
          affiliateLink="https://betist.com"
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default BetistInceleme;
