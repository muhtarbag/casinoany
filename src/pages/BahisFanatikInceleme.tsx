import { CasinoReviewTemplate } from '@/components/templates/CasinoReviewTemplate';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { GamblingSEOEnhancer } from '@/components/seo/GamblingSEOEnhancer';
import { Shield, Zap, Headphones, Smartphone, CreditCard, Trophy } from 'lucide-react';

const BahisFanatikInceleme = () => {
  const casino = {
    name: 'BahisFanatik',
    slug: 'bahisfanatik',
    logo: '/logos/fanatik-logo.png',
    rating: 4.7,
    reviewCount: 1876,
    bonus: '12.000 TL Hoşgeldin Bonusu + 150 Free Spin',
    license: 'Curacao Gaming Authority #1668/JAZ',
    established: '2020',
    minDeposit: '50 TL',
    withdrawalTime: '6-12 saat',
    gameCount: 4200,
    liveCasino: true,
    mobileApp: true
  };

  const pros = [
    'Spor bahis ve casino entegrasyonu tek platformda',
    'Canlı bahis yüksek oranlar, 30+ spor dalı',
    'Düşük minimum yatırım (50 TL)',
    'Haftalık cashback bonusu %10',
    'Telegram bot ile anlık bonus bildirimleri',
    'Kombine bahis imkanları ve casino slot entegrasyonu',
    'Türkçe canlı destek 7/24'
  ];

  const cons = [
    'Oyun sayısı rakiplerinden az (4,200)',
    'Bonus çevrim şartı casino için 40x',
    'Bazı ödeme yöntemlerinde işlem ücreti var'
  ];

  const features = [
    {
      title: 'Spor Bahis Merkezi',
      description: 'Futbol, basketbol, tenis, voleybol dahil 30+ spor dalı. Canlı bahis, kombine, sistem bahisleri. Yüksek oranlar.',
      icon: <Trophy className="w-5 h-5 text-primary" />
    },
    {
      title: 'Casino Slot Koleksiyonu',
      description: '3,200+ slot oyunu. Pragmatic Play, NetEnt, Play\'n GO. Sweet Bonanza, Dog House, Book of Dead. RTP %95-97.',
      icon: <Zap className="w-5 h-5 text-primary" />
    },
    {
      title: 'Hızlı Ödemeler',
      description: 'Papara 4-8 saat, Cepbank 6-12 saat. Minimum çekim 100 TL, günlük limit 50.000 TL.',
      icon: <CreditCard className="w-5 h-5 text-primary" />
    },
    {
      title: 'Mobil Platform',
      description: 'Android uygulaması ve responsive mobil site. Spor bahis ve casino tüm mobilde. Push notification.',
      icon: <Smartphone className="w-5 h-5 text-primary" />
    },
    {
      title: 'Destek Ekibi',
      description: 'Canlı chat, WhatsApp, Telegram 7/24. Türkçe operatörler, ortalama yanıt 3 dakika.',
      icon: <Headphones className="w-5 h-5 text-primary" />
    },
    {
      title: 'Güvenlik',
      description: 'Curacao lisanslı, SSL şifreleme, 2FA. KYC doğrulama, responsible gaming araçları.',
      icon: <Shield className="w-5 h-5 text-primary" />
    }
  ];

  const paymentMethods = [
    'Papara',
    'Cepbank',
    'Visa/Mastercard',
    'Havale/EFT',
    'Bitcoin',
    'USDT',
    'Astropay',
    'Payfix'
  ];

  const gameProviders = [
    'Pragmatic Play',
    'NetEnt',
    'Play\'n GO',
    'Evolution Gaming',
    'Microgaming',
    'Yggdrasil',
    'Red Tiger',
    'Push Gaming',
    'Quickspin',
    'Hacksaw Gaming'
  ];

  const expertReview = {
    author: 'Emre Yıldız',
    expertise: 'Sports Betting & Casino Integration Specialist',
    experience: '11 yıl bahis ve casino platform analizi',
    summary: 'BahisFanatik, 2020 yılında kurulmuş, spor bahisleri ve casino oyunlarını tek platformda sunan entegre bir bahis sitesidir. Curacao Gaming Authority lisansı altında faaliyet göstermektedir. 4,200+ oyun portföyü sektör ortalamasının biraz altında olsa da, spor bahisleri entegrasyonu ile bu açığı kapatmaktadır. Hoşgeldin bonusu 12.000 TL + 150 Free Spin ile orta-üst seviyedir, ancak 40x çevrim şartı dikkat edilmesi gereken bir noktadır. Spor bahisleri bölümü oldukça gelişmiş olup, futbol, basketbol, tenis dahil 30+ spor dalında canlı bahis imkanı sunmaktadır. Oranlar piyasa ortalamasının üzerindedir. Casino tarafında Pragmatic Play, NetEnt ve Play\'n GO gibi sağlayıcılar ile çalışmaktadır. Para çekme süreleri Papara için 4-8 saat, diğer yöntemler için 6-12 saat arasındadır. Haftalık %10 cashback programı kayıpları telafi etmek için iyi bir seçenektir. Telegram bot entegrasyonu ile bonus bildirimleri anında kullanıcılara ulaşmaktadır. Mobil platform Android için native uygulama sunmakta, iOS kullanıcıları responsive site üzerinden erişim sağlayabilmektedir. Güvenlik standartları SSL şifreleme ve 2FA ile korunmaktadır. Genel olarak, hem spor bahisleri hem de casino oyunları oynamak isteyen kullanıcılar için uygun bir platformdur.',
    date: '2025-01-15'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <SEO
        title="BahisFanatik İnceleme 2025 - Spor Bahis & Casino"
        description="BahisFanatik detaylı inceleme. 12.000 TL hoşgeldin bonusu, spor bahisleri, casino oyunları. BahisFanatik güvenilir mi? Bonus şartları, ödeme yöntemleri ve kullanıcı yorumları."
        keywords={[
          'bahisfanatik',
          'bahisfanatik inceleme',
          'bahisfanatik güvenilir mi',
          'bahisfanatik bonus',
          'bahisfanatik giriş',
          'bahisfanatik casino',
          'bahisfanatik spor bahisleri'
        ]}
        canonical={`${window.location.origin}/bahisfanatik-inceleme`}
        ogType="article"
        ogImage="/logos/fanatik-logo.png"
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
          affiliateLink="https://bahisfanatik.com"
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default BahisFanatikInceleme;
