import { CasinoReviewTemplate } from '@/components/templates/CasinoReviewTemplate';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { GamblingSEOEnhancer } from '@/components/seo/GamblingSEOEnhancer';
import { Shield, Zap, Headphones, Smartphone, CreditCard, Trophy } from 'lucide-react';

const LigobetInceleme = () => {
  const casino = {
    name: 'Ligobet',
    slug: 'ligobet',
    logo: '/logos/ligobet-logo.png',
    rating: 4.6,
    reviewCount: 1789,
    bonus: '12.500 TL Hoşgeldin Bonusu + 150 Free Spin',
    license: 'Curacao Gaming Authority #8048/JAZ',
    established: '2020',
    minDeposit: '50 TL',
    withdrawalTime: '5-12 saat',
    gameCount: 4300,
    liveCasino: true,
    mobileApp: true
  };

  const pros = [
    'Spor ligleri odaklı bahis sistemi',
    'Casino ve spor entegre platform',
    'Yüksek hoşgeldin bonusu (12.500 TL)',
    'Canlı lig maçları stream imkanı',
    'Haftalık %10 sport-casino cashback',
    'Pragmatic Play günlük turnuvalar',
    'Düşük minimum yatırım (50 TL)'
  ];

  const cons = [
    'Para çekme süresi değişken (5-12 saat)',
    'Oyun sayısı orta-üst seviye (4,300)',
    'VIP program detayları sınırlı'
  ];

  const features = [
    {
      title: 'Spor Bahisleri Pro',
      description: 'Futbol ligleri özel. La Liga, Premier League, Serie A, Süper Lig. Canlı maç stream, yüksek oranlar.',
      icon: <Trophy className="w-5 h-5 text-primary" />
    },
    {
      title: 'Casino Oyunları',
      description: '3,300+ slot ve casino oyunu. Pragmatic Play, NetEnt, Evolution Gaming. Daily tournaments.',
      icon: <Zap className="w-5 h-5 text-primary" />
    },
    {
      title: 'Canlı Casino',
      description: 'Evolution Gaming ile 120+ canlı masa. Türkçe dealerlar, Lightning serisi, VIP masalar.',
      icon: <Trophy className="w-5 h-5 text-primary" />
    },
    {
      title: 'Ödemeler',
      description: 'Papara: 5-8 saat, Cepbank: 7-12 saat. Minimum çekim 100 TL, günlük limit 55.000 TL.',
      icon: <CreditCard className="w-5 h-5 text-primary" />
    },
    {
      title: 'Mobil Platform',
      description: 'Android ve iOS responsive site. Canlı maç stream mobile. Push notifications, touch-optimized.',
      icon: <Smartphone className="w-5 h-5 text-primary" />
    },
    {
      title: 'Destek & Güvenlik',
      description: 'Canlı chat, WhatsApp, Telegram 7/24. Curacao lisanslı, SSL şifreleme, 2FA güvenlik.',
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
    'Ethereum',
    'Astropay',
    'Payfix'
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
    author: 'Serkan Aydın',
    expertise: 'Sports Betting & Casino Hybrid Platforms Analyst',
    experience: '12 yıl spor-casino entegre platformlar uzmanı',
    summary: 'Ligobet, 2020 yılında futbol ligleri odaklı bir vizyon ile kurulmuş, spor bahisleri ve casino oyunlarını entegre eden bir platformdur. Curacao Gaming Authority lisansı ile faaliyet göstermektedir. 4,300+ oyun portföyü ile orta-üst seviyededir. Hoşgeldin bonusu 12.500 TL + 150 Free Spin ile yüksek bir tekliftir, 35x çevrim şartı kabul edilebilir düzeydedir. Platform adından da anlaşılacağı üzere futbol ligleri üzerine özel bir odak sunmaktadır. La Liga, Premier League, Serie A, Süper Lig gibi büyük liglerde canlı maç stream imkanı mevcuttur, bu özellik spor bahisçileri için büyük avantaj sağlamaktadır. Casino tarafında Pragmatic Play, NetEnt ve Evolution Gaming ile çalışmaktadır. Evolution Gaming ile 120+ canlı masa sunulmakta, Lightning serisi ve VIP masalar mevcuttur. Pragmatic Play ile günlük slot turnuvaları düzenlenmektedir. Para çekme süreleri Papara için 5-8 saat, diğer yöntemler için 7-12 saat arasında değişkenlik göstermektedir. Haftalık %10 cashback programı hem spor bahisleri hem casino kayıplarını kapsamaktadır. Mobil platform responsive tasarım ile çalışmakta, canlı maç stream özelliği mobile cihazlarda da erişilebilmektedir. Canlı chat, WhatsApp ve Telegram ile 7/24 Türkçe destek verilmektedir. Güvenlik standartları SSL şifreleme, 2FA ve KYC doğrulama ile sağlanmaktadır. VIP programı mevcut olmakla birlikte, detayları sınırlıdır. Genel olarak, özellikle futbol liglerine bahis oynamayı seven, canlı maç izleme imkanı arayan, aynı zamanda casino oyunları da oynamak isteyen kullanıcılar için ideal bir platformdur.',
    date: '2025-01-15'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <SEO
        title="Ligobet İnceleme 2025 - Spor Ligleri & Casino"
        description="Ligobet casino detaylı inceleme. 12.500 TL hoşgeldin bonusu, canlı maç stream, spor bahisleri, 4300+ casino oyunu. Ligobet güvenilir mi? Expert analiz."
        keywords={[
          'ligobet',
          'ligobet inceleme',
          'ligobet güvenilir mi',
          'ligobet bonus',
          'ligobet casino',
          'ligobet giriş',
          'ligobet para çekme',
          'ligobet canlı maç'
        ]}
        canonical={`${window.location.origin}/ligobet-inceleme`}
        ogType="article"
        ogImage="/logos/ligobet-logo.png"
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
          affiliateLink="https://ligobet.com"
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default LigobetInceleme;
