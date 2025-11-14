import { CasinoReviewTemplate } from '@/components/templates/CasinoReviewTemplate';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { GamblingSEOEnhancer } from '@/components/seo/GamblingSEOEnhancer';
import { Shield, Zap, Headphones, Smartphone, CreditCard, Trophy } from 'lucide-react';

const BetbooInceleme = () => {
  const casino = {
    name: 'Betboo',
    slug: 'betboo',
    logo: '/logos/betboo-logo.png',
    rating: 4.5,
    reviewCount: 1654,
    bonus: '9.000 TL Hoşgeldin Bonusu + 120 Free Spin',
    license: 'Curacao eGaming License #1668/JAZ',
    established: '2016',
    minDeposit: '50 TL',
    withdrawalTime: '8-14 saat',
    gameCount: 3600,
    liveCasino: true,
    mobileApp: true
  };

  const pros = [
    'Köklü firma, 8+ yıl deneyim',
    'Düşük minimum yatırım (50 TL)',
    'Spor bahisleri güçlü entegrasyon',
    'Haftalık %8 cashback',
    'NetEnt ve Play\'n GO slot seçkisi',
    'Türkçe canlı destek 7/24',
    'Basit arayüz, kolay kullanım'
  ];

  const cons = [
    'Para çekme süresi uzun (8-14 saat)',
    'Oyun sayısı orta seviye (3,600)',
    'Bonus çevrim şartı 40x'
  ];

  const features = [
    {
      title: 'Spor Bahisleri',
      description: 'Futbol, basketbol, tenis dahil 25+ spor dalı. Canlı bahis, yüksek oranlar, kombine seçenekleri.',
      icon: <Trophy className="w-5 h-5 text-primary" />
    },
    {
      title: 'Slot Oyunları',
      description: '2,700+ slot koleksiyonu. NetEnt, Play\'n GO seçkisi. Book of Dead, Starburst, Reactoonz.',
      icon: <Zap className="w-5 h-5 text-primary" />
    },
    {
      title: 'Canlı Casino',
      description: 'Evolution Gaming ile 100+ canlı masa. Türkçe dealerlar, Blackjack, Rulet, Baccarat.',
      icon: <Trophy className="w-5 h-5 text-primary" />
    },
    {
      title: 'Ödemeler',
      description: 'Papara: 8-12 saat, Cepbank: 10-14 saat. Minimum çekim 100 TL, günlük limit 40.000 TL.',
      icon: <CreditCard className="w-5 h-5 text-primary" />
    },
    {
      title: 'Mobil Site',
      description: 'Responsive tasarım, tüm cihazlarda uyumlu. Android APK, iOS PWA desteği.',
      icon: <Smartphone className="w-5 h-5 text-primary" />
    },
    {
      title: 'Destek & Güvenlik',
      description: 'Canlı chat, WhatsApp 7/24. Curacao lisanslı, SSL şifreleme, KYC doğrulama.',
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
    'NetEnt',
    'Play\'n GO',
    'Evolution Gaming',
    'Pragmatic Play',
    'Yggdrasil',
    'Red Tiger',
    'Quickspin',
    'Thunderkick',
    'Relax Gaming',
    'Push Gaming'
  ];

  const expertReview = {
    author: 'Ahmet Çelik',
    expertise: 'Long-term Casino Platform & Betting Analyst',
    experience: '14 yıl köklü casino platformları analizi',
    summary: 'Betboo, 2016 yılında kurulmuş, Türkiye pazarında köklü ve güvenilir bir bahis ve casino platformudur. Curacao eGaming lisansı ile faaliyet göstermektedir. 3,600+ oyun portföyü orta seviyede olup, spor bahisleri entegrasyonu platformun güçlü yönüdür. Hoşgeldin bonusu 9.000 TL + 120 Free Spin ile orta-alt seviyedir, 40x çevrim şartı dikkat edilmesi gereken bir noktadır. Spor bahisleri bölümü oldukça gelişmiş olup, futbol, basketbol, tenis dahil 25+ spor dalında canlı bahis imkanı sunmaktadır. Casino tarafında NetEnt ve Play\'n GO seçkisi bulunmaktadır. Evolution Gaming ile 100+ canlı masa mevcuttur. Para çekme süreleri Papara için 8-12 saat, diğer yöntemler için 10-14 saat arasında olup, bu rakiplere göre daha uzundur. Haftalık %8 cashback programı mevcuttur. Platform arayüzü basit ve kullanıcı dostu tasarlanmış, özellikle yeni başlayanlar için uygundur. Mobil platform responsive tasarım ile çalışmakta, Android APK ve iOS PWA desteği sunmaktadır. Canlı chat ve WhatsApp ile 7/24 Türkçe destek verilmektedir. Güvenlik standartları SSL şifreleme ve KYC doğrulama ile sağlanmaktadır. 8+ yıllık sektör deneyimi ile güvenilirlik açısından sağlam bir geçmişi vardır. Genel olarak, köklü bir platform arayan, özellikle spor bahisleri oynamak isteyen kullanıcılar için uygun bir seçenektir.',
    date: '2025-01-15'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <SEO
        title="Betboo İnceleme 2025 - Köklü Bahis & Casino Platformu"
        description="Betboo casino detaylı inceleme. 9.000 TL hoşgeldin bonusu, spor bahisleri, 3600+ oyun. Betboo güvenilir mi? 8+ yıl deneyim, bonus şartları ve kullanıcı yorumları."
        keywords={[
          'betboo',
          'betboo inceleme',
          'betboo güvenilir mi',
          'betboo bonus',
          'betboo casino',
          'betboo giriş',
          'betboo para çekme',
          'betboo bahis'
        ]}
        canonical={`${window.location.origin}/betboo-inceleme`}
        ogType="article"
        ogImage="/logos/betboo-logo.png"
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
          affiliateLink="https://betboo.com"
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default BetbooInceleme;
