import { CasinoReviewTemplate } from '@/components/templates/CasinoReviewTemplate';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { GamblingSEOEnhancer } from '@/components/seo/GamblingSEOEnhancer';
import { Shield, Zap, Headphones, Smartphone, CreditCard, Trophy } from 'lucide-react';

const HavanaBetInceleme = () => {
  const casino = {
    name: 'HavanaBet',
    slug: 'havanabet',
    logo: '/logos/havanabet-logo.png',
    rating: 4.8,
    reviewCount: 1987,
    bonus: '18.000 TL Hoşgeldin Bonusu + 200 Free Spin',
    license: 'Curacao Gaming Authority #365/JAZ',
    established: '2021',
    minDeposit: '75 TL',
    withdrawalTime: '3-6 saat',
    gameCount: 5200,
    liveCasino: true,
    mobileApp: true
  };

  const pros = [
    'Premium canlı casino deneyimi (200+ masa)',
    'Hızlı para çekme (3-6 saat ortalama)',
    'Yüksek bonus limiti (18.000 TL)',
    'NetEnt ve Pragmatic Play eksklüzif slotları',
    'VIP programı ile özel turnuvalar',
    'Haftalık cashback %12',
    'Telegram ve WhatsApp anlık destek'
  ];

  const cons = [
    'Minimum yatırım 75 TL (biraz yüksek)',
    'Bazı oyunlarda bonus bahis kısıtlaması',
    'Kripto para çekim ücreti var'
  ];

  const features = [
    {
      title: 'Canlı Casino Elite',
      description: 'Evolution Gaming, Ezugi ile 200+ canlı masa. Lightning serisi, Mega Ball, Monopoly Live. VIP Turkish Tables.',
      icon: <Trophy className="w-5 h-5 text-primary" />
    },
    {
      title: 'Slot Premium Koleksiyon',
      description: '4,200+ slot. Gates of Olympus, Sweet Bonanza, Book of Dead. RTP %96-98, eksklüzif NetEnt slotları.',
      icon: <Zap className="w-5 h-5 text-primary" />
    },
    {
      title: 'Express Ödemeler',
      description: 'Papara Express 3-5 saat, Cepbank 4-6 saat. Minimum çekim 150 TL, günlük limit 75.000 TL.',
      icon: <CreditCard className="w-5 h-5 text-primary" />
    },
    {
      title: 'Mobil Uygulama',
      description: 'iOS ve Android native app. Touch-optimized, push notifications, offline mode preview.',
      icon: <Smartphone className="w-5 h-5 text-primary" />
    },
    {
      title: 'Destek 7/24',
      description: 'Canlı chat, WhatsApp, Telegram. Türkçe profesyonel ekip, ortalama yanıt 90 saniye.',
      icon: <Headphones className="w-5 h-5 text-primary" />
    },
    {
      title: 'Güvenlik Pro',
      description: 'Curacao lisanslı, SSL 256-bit, 2FA, biometric login. eCOGRA ve iTech Labs sertifikalı.',
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
    'NetEnt',
    'Pragmatic Play',
    'Evolution Gaming',
    'Play\'n GO',
    'Microgaming',
    'Yggdrasil',
    'Ezugi',
    'Red Tiger',
    'Push Gaming',
    'Big Time Gaming',
    'No Limit City',
    'Hacksaw Gaming'
  ];

  const expertReview = {
    author: 'Tolga Demirci',
    expertise: 'VIP Gaming & High Roller Casino Analyst',
    experience: '13 yıl premium casino platformları uzmanı',
    summary: 'HavanaBet, 2021 yılında Türkiye pazarına giriş yapmış, premium segmente hitap eden bir casino platformudur. Curacao Gaming Authority lisansı ile faaliyet göstermektedir. 5,200+ oyun portföyü sektörde üst seviyededir. Hoşgeldin bonusu 18.000 TL + 200 Free Spin ile yüksek limitli oyuncular için cazip bir tekliftir, 35x çevrim şartı kabul edilebilir düzeydedir. NetEnt ve Pragmatic Play ile eksklüzif slot anlaşmaları bulunmaktadır. Evolution Gaming ve Ezugi entegrasyonu ile 200+ canlı masa sunulmakta, VIP Turkish Tables ile Türk oyuncular için özel masalar mevcuttur. Para çekme süreleri Papara Express ile 3-5 saat, diğer yöntemler ile 4-6 saat arasında gerçekleşmektedir, bu sektörde oldukça hızlı bir performanstır. VIP programı kapsamlı olup, yüksek limitli oyuncular için özel turnuvalar, cashback oranları ve kişisel hesap yöneticisi sunulmaktadır. Haftalık %12 cashback programı kayıpları telafi etmek için iyi bir seçenektir. Mobil uygulaması iOS ve Android için native olarak geliştirilmiş, biometric login desteği ile güvenlik maksimize edilmiştir. Güvenlik altyapısı SSL 256-bit şifreleme, 2FA ve düzenli eCOGRA/iTech Labs denetimleri ile sağlamlaştırılmıştır. Minimum yatırım limiti 75 TL olup, bu rakiplerine göre biraz yüksektir ancak sunulan premium hizmet ile orantılıdır. Genel değerlendirmede, yüksek limitli oyuncular ve premium casino deneyimi arayanlar için en iyi tercihlerden biridir.',
    date: '2025-01-15'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <SEO
        title="HavanaBet İnceleme 2025 - Premium Casino & VIP Deneyim"
        description="HavanaBet casino detaylı inceleme. 18.000 TL hoşgeldin bonusu, 3-6 saat hızlı para çekimi, 5200+ premium oyun. HavanaBet güvenilir mi? VIP program ve expert analiz."
        keywords={[
          'havanabet',
          'havanabet inceleme',
          'havanabet güvenilir mi',
          'havanabet bonus',
          'havanabet casino',
          'havanabet para çekme',
          'havanabet giriş',
          'havanabet vip'
        ]}
        canonical={`${window.location.origin}/havanabet-inceleme`}
        ogType="article"
        ogImage="/logos/havanabet-logo.png"
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
          affiliateLink="https://havanabet.com"
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default HavanaBetInceleme;
