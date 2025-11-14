import { CasinoReviewTemplate } from '@/components/templates/CasinoReviewTemplate';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { GamblingSEOEnhancer } from '@/components/seo/GamblingSEOEnhancer';
import { Shield, Zap, Headphones, Smartphone, CreditCard, Trophy } from 'lucide-react';

const BetebetInceleme = () => {
  const casino = {
    name: 'Betebet',
    slug: 'betebet',
    logo: '/logos/betebet-logo.png',
    rating: 4.6,
    reviewCount: 1765,
    bonus: '11.000 TL Hoşgeldin Bonusu + 140 Free Spin',
    license: 'Curacao Gaming Authority #1668/JAZ',
    established: '2018',
    minDeposit: '50 TL',
    withdrawalTime: '6-14 saat',
    gameCount: 4100,
    liveCasino: true,
    mobileApp: true
  };

  const pros = [
    'Spor bahisleri ve casino entegre platform',
    'Düşük minimum yatırım limiti (50 TL)',
    'Haftalık %12 kayıp bonusu',
    'Pragmatic Play slot turnuvaları',
    'Yeni kullanıcı dostu arayüz',
    'Canlı bahis yüksek oranlar',
    'Telegram destek hattı aktif'
  ];

  const cons = [
    'Para çekme süresi orta-uzun (6-14 saat)',
    'Bonus çevrim şartı 38x',
    'VIP programı detayları az'
  ];

  const features = [
    {
      title: 'Spor & Casino',
      description: 'Futbol, basketbol, tenis dahil 28+ spor dalı. Canlı bahis. 4,100+ casino oyunu tek platformda.',
      icon: <Trophy className="w-5 h-5 text-primary" />
    },
    {
      title: 'Slot Oyunları',
      description: '3,100+ slot koleksiyonu. Sweet Bonanza, Dog House, Big Bass. Pragmatic Play günlük turnuvalar.',
      icon: <Zap className="w-5 h-5 text-primary" />
    },
    {
      title: 'Canlı Casino',
      description: 'Evolution Gaming ile 110+ canlı masa. Türkçe dealerlar, Blackjack, Rulet, Baccarat masaları.',
      icon: <Trophy className="w-5 h-5 text-primary" />
    },
    {
      title: 'Ödemeler',
      description: 'Papara: 6-10 saat, Cepbank: 8-14 saat. Minimum çekim 100 TL, günlük limit 45.000 TL.',
      icon: <CreditCard className="w-5 h-5 text-primary" />
    },
    {
      title: 'Mobil Platform',
      description: 'Android APK, iOS PWA. Responsive tasarım, tüm oyunlar ve bahisler mobilde erişilebilir.',
      icon: <Smartphone className="w-5 h-5 text-primary" />
    },
    {
      title: 'Destek & Güvenlik',
      description: 'Canlı chat, WhatsApp, Telegram 7/24. Curacao lisanslı, SSL şifreleme, KYC doğrulama.',
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
    'Payfix',
    'CMT Cüzdan'
  ];

  const gameProviders = [
    'Pragmatic Play',
    'Evolution Gaming',
    'NetEnt',
    'Play\'n GO',
    'Red Tiger',
    'Push Gaming',
    'Yggdrasil',
    'Hacksaw Gaming',
    'Relax Gaming',
    'Quickspin'
  ];

  const expertReview = {
    author: 'Gökhan Tekin',
    expertise: 'Sports Betting & Casino Hybrid Platform Analyst',
    experience: '10 yıl bahis ve casino entegre platform analizi',
    summary: 'Betebet, 2018 yılında kurulmuş, spor bahisleri ve casino oyunlarını tek platformda sunan entegre bir sitedir. Curacao Gaming Authority lisansı ile faaliyet göstermektedir. 4,100+ oyun portföyü ile orta-üst seviyededir, spor bahisleri entegrasyonu platformun güçlü yönüdür. Hoşgeldin bonusu 11.000 TL + 140 Free Spin ile orta seviyedir, 38x çevrim şartı kabul edilebilir düzeydedir. Spor bahisleri bölümü gelişmiş olup, futbol, basketbol, tenis dahil 28+ spor dalında canlı bahis imkanı sunmaktadır, oranlar piyasa ortalamasında veya üzerindedir. Casino tarafında Pragmatic Play, Evolution Gaming ve NetEnt ile çalışmaktadır, günlük slot turnuvaları düzenlenmektedir. Evolution Gaming ile 110+ canlı masa mevcuttur. Para çekme süreleri Papara için 6-10 saat, diğer yöntemler için 8-14 saat arasında olup, rakiplere göre biraz daha uzundur. Haftalık %12 kayıp bonusu ile kullanıcıların kayıpları kısmen telafi edilmektedir. Telegram destek hattı aktif olup, canlı chat ve WhatsApp ile 7/24 Türkçe destek verilmektedir. Mobil platform Android için APK indirme, iOS için PWA desteği sunmaktadır. Arayüz yeni tasarlanmış, kullanıcı dostu ve temiz bir görünüme sahiptir. Güvenlik standartları SSL şifreleme ve KYC doğrulama ile sağlanmaktadır. VIP programı mevcut olmakla birlikte, detayları sınırlıdır. Genel olarak, hem spor bahisleri hem de casino oynamak isteyen, entegre bir platform arayan kullanıcılar için uygun bir seçenektir.',
    date: '2025-01-15'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <SEO
        title="Betebet İnceleme 2025 - Spor Bahis & Casino Entegre"
        description="Betebet casino detaylı inceleme. 11.000 TL hoşgeldin bonusu, spor bahisleri, 4100+ casino oyunu. Betebet güvenilir mi? Bonus şartları ve kullanıcı yorumları."
        keywords={[
          'betebet',
          'betebet inceleme',
          'betebet güvenilir mi',
          'betebet bonus',
          'betebet casino',
          'betebet giriş',
          'betebet para çekme',
          'betebet bahis'
        ]}
        canonical={`${window.location.origin}/betebet-inceleme`}
        ogType="article"
        ogImage="/logos/betebet-logo.png"
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
          affiliateLink="https://betebet.com"
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default BetebetInceleme;
