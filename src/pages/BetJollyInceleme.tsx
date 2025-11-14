import { CasinoReviewTemplate } from '@/components/templates/CasinoReviewTemplate';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { GamblingSEOEnhancer } from '@/components/seo/GamblingSEOEnhancer';
import { Shield, Zap, Headphones, Smartphone, CreditCard, Trophy } from 'lucide-react';

const BetJollyInceleme = () => {
  const casino = {
    name: 'BetJolly',
    slug: 'betjolly',
    logo: '/logos/betjolly-logo.png',
    rating: 4.5,
    reviewCount: 1432,
    bonus: '10.000 TL Hoşgeldin Bonusu + 125 Free Spin',
    license: 'Curacao eGaming License #1668/JAZ',
    established: '2019',
    minDeposit: '50 TL',
    withdrawalTime: '8-16 saat',
    gameCount: 3500,
    liveCasino: true,
    mobileApp: true
  };

  const pros = [
    'Kullanıcı dostu arayüz, kolay navigasyon',
    'Düşük minimum yatırım (50 TL)',
    'Pragmatic Play günlük turnuvalar',
    'Haftalık %8 cashback bonusu',
    'Yeni oyun ekleme sıklığı yüksek',
    'Türkçe canlı destek 7/24',
    'Hızlı kayıt ve KYC süreci'
  ];

  const cons = [
    'Para çekme süresi uzun (8-16 saat)',
    'Oyun sayısı orta seviye (3,500)',
    'VIP program avantajları sınırlı'
  ];

  const features = [
    {
      title: 'Slot Oyunları',
      description: '2,600+ slot koleksiyonu. Sweet Bonanza, Gates of Olympus, Dog House. Pragmatic Play günlük turnuvalar.',
      icon: <Zap className="w-5 h-5 text-primary" />
    },
    {
      title: 'Canlı Casino',
      description: 'Evolution Gaming ile 90+ canlı masa. Türkçe dealerlar, Blackjack, Rulet, Baccarat masaları.',
      icon: <Trophy className="w-5 h-5 text-primary" />
    },
    {
      title: 'Ödemeler',
      description: 'Papara: 8-12 saat, Cepbank: 10-16 saat. Minimum çekim 100 TL, günlük limit 35.000 TL.',
      icon: <CreditCard className="w-5 h-5 text-primary" />
    },
    {
      title: 'Mobil Site',
      description: 'Responsive tasarım, tüm cihazlarda uyumlu. Android için APK indirme, iOS için PWA desteği.',
      icon: <Smartphone className="w-5 h-5 text-primary" />
    },
    {
      title: 'Canlı Destek',
      description: 'WhatsApp, canlı chat 7/24. Türkçe destek ekibi, ortalama yanıt süresi 4 dakika.',
      icon: <Headphones className="w-5 h-5 text-primary" />
    },
    {
      title: 'Güvenlik',
      description: 'Curacao lisanslı, SSL şifreleme, KYC doğrulama. Adil oyun sertifikaları mevcut.',
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
    'Evolution Gaming',
    'Play\'n GO',
    'NetEnt',
    'Red Tiger',
    'Push Gaming',
    'Yggdrasil',
    'Quickspin',
    'Hacksaw Gaming',
    'Relax Gaming'
  ];

  const expertReview = {
    author: 'Selin Yılmaz',
    expertise: 'User Experience & Casino Platform Analyst',
    experience: '10 yıl casino UX ve platform analizi',
    summary: 'BetJolly, 2019 yılında kullanıcı dostu arayüz vizyonuyla kurulmuş, Curacao lisansı ile faaliyet gösteren bir casino platformudur. 3,500+ oyun portföyü sektör ortalamasında olup, sürekli güncellenmektedir. Hoşgeldin bonusu 10.000 TL + 125 Free Spin ile orta seviyedir, 35x çevrim şartı makuldür. Platform arayüzü basit ve kullanıcı dostu tasarlanmış, yeni başlayanlar için idealdir. Pragmatic Play ile günlük turnuvalar düzenlenmekte, katılım kolaylığı sağlanmaktadır. Evolution Gaming entegrasyonu ile 90+ canlı masa sunulmaktadır. Para çekme süreleri Papara için 8-12 saat, diğer yöntemler için 10-16 saat arasında olup, bu rakiplerinden daha uzundur. Haftalık %8 cashback programı mevcuttur. Mobil platform responsive tasarım ile tüm cihazlarda sorunsuz çalışmaktadır, Android için APK indirme imkanı vardır. Kayıt ve KYC süreçleri hızlı ve pratik şekilde tamamlanmaktadır. Canlı destek WhatsApp ve chat üzerinden 7/24 Türkçe hizmet vermektedir. Güvenlik standartları SSL şifreleme ve KYC doğrulama ile sağlanmaktadır. VIP programı mevcut olmakla birlikte, avantajları rakiplerine göre daha sınırlıdır. Genel olarak, kullanıcı dostu bir platform arayan, yeni başlayan oyuncular için uygun bir seçenektir.',
    date: '2025-01-15'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <SEO
        title="BetJolly İnceleme 2025 - Kullanıcı Dostu Casino"
        description="BetJolly casino detaylı inceleme. 10.000 TL hoşgeldin bonusu, 3500+ oyun, kolay arayüz. BetJolly güvenilir mi? Bonus şartları, ödeme yöntemleri ve kullanıcı yorumları."
        keywords={[
          'betjolly',
          'betjolly inceleme',
          'betjolly güvenilir mi',
          'betjolly bonus',
          'betjolly casino',
          'betjolly giriş',
          'betjolly para çekme'
        ]}
        canonical={`${window.location.origin}/betjolly-inceleme`}
        ogType="article"
        ogImage="/logos/betjolly-logo.png"
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
          affiliateLink="https://betjolly.com"
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default BetJollyInceleme;
