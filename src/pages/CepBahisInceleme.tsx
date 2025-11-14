import { CasinoReviewTemplate } from '@/components/templates/CasinoReviewTemplate';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { GamblingSEOEnhancer } from '@/components/seo/GamblingSEOEnhancer';
import { Shield, Zap, Headphones, Smartphone, CreditCard, Trophy } from 'lucide-react';

const CepBahisInceleme = () => {
  const casino = {
    name: 'CepBahis',
    slug: 'cepbahis',
    logo: '/logos/cepbahis-logo.png',
    rating: 4.6,
    reviewCount: 1543,
    bonus: '8.000 TL Hoşgeldin Bonusu + 100 Free Spin',
    license: 'Curacao eGaming License #8048/JAZ',
    established: '2018',
    minDeposit: '50 TL',
    withdrawalTime: '4-10 saat',
    gameCount: 3800,
    liveCasino: true,
    mobileApp: true
  };

  const pros = [
    'Mobil-first tasarım, mükemmel telefon deneyimi',
    'Cepbank ile anında yatırım-çekim (4-6 saat)',
    'Düşük minimum yatırım limiti (50 TL)',
    'Pragmatic Play günlük turnuvalar',
    'Haftalık %15 kayıp bonusu',
    'iOS ve Android native uygulaması',
    'Türkçe canlı destek 7/24'
  ];

  const cons = [
    'Oyun sayısı orta seviye (3,800)',
    'VIP program detayları sınırlı',
    'Kripto para seçenekleri az'
  ];

  const features = [
    {
      title: 'Mobil Casino',
      description: 'Native iOS ve Android uygulaması. Touch-optimized slot oyunları, hızlı yükleme, PWA desteği.',
      icon: <Smartphone className="w-5 h-5 text-primary" />
    },
    {
      title: 'Slot Oyunları',
      description: '2,800+ slot koleksiyonu. Sweet Bonanza, Gates of Olympus, Sugar Rush. Pragmatic Play günlük turnuvalar.',
      icon: <Zap className="w-5 h-5 text-primary" />
    },
    {
      title: 'Canlı Casino',
      description: 'Evolution Gaming ile 100+ masa. Türkçe dealerlar, Lightning Roulette, Speed Baccarat.',
      icon: <Trophy className="w-5 h-5 text-primary" />
    },
    {
      title: 'Hızlı Ödemeler',
      description: 'Cepbank express: 4-6 saat, Papara: 6-10 saat. Minimum çekim 100 TL, maksimum günlük 40.000 TL.',
      icon: <CreditCard className="w-5 h-5 text-primary" />
    },
    {
      title: 'Canlı Destek',
      description: 'WhatsApp, canlı chat 7/24. Türkçe destek ekibi, ortalama yanıt süresi 2 dakika.',
      icon: <Headphones className="w-5 h-5 text-primary" />
    },
    {
      title: 'Güvenlik',
      description: 'Curacao lisanslı, SSL 128-bit şifreleme, 2FA. KYC doğrulama, adil oyun sertifikaları.',
      icon: <Shield className="w-5 h-5 text-primary" />
    }
  ];

  const paymentMethods = [
    'Cepbank Express',
    'Papara',
    'Visa/Mastercard',
    'Havale/EFT',
    'Bitcoin',
    'USDT',
    'CMT Cüzdan',
    'Payfix'
  ];

  const gameProviders = [
    'Pragmatic Play',
    'Evolution Gaming',
    'Play\'n GO',
    'Push Gaming',
    'Hacksaw Gaming',
    'Red Tiger',
    'Yggdrasil',
    'Relax Gaming',
    'Quickspin',
    'ELK Studios'
  ];

  const expertReview = {
    author: 'Zeynep Arslan',
    expertise: 'Mobile Gaming & User Experience Analyst',
    experience: '9 yıl mobil casino platformları uzmanı',
    summary: 'CepBahis, 2018 yılında mobil-first vizyonuyla kurulmuş, Curacao lisansı ile faaliyet gösteren bir casino platformudur. 3,800+ oyun portföyü rakiplerine göre daha kompakt olmakla birlikte, mobil deneyim odaklı seçilmiş kaliteli içeriklerden oluşmaktadır. Hoşgeldin bonusu 8.000 TL + 100 Free Spin ile orta seviyedir, 35x çevrim şartı kabul edilebilir düzeydedir. Mobil uygulaması iOS ve Android için native olarak geliştirilmiş, kullanıcı deneyimi mükemmel seviyededir. Cepbank ile para yatırma-çekme işlemleri 4-6 saat gibi oldukça hızlı bir sürede gerçekleşmektedir. Haftalık %15 kayıp bonusu ile kullanıcıların kayıpları telafi edilmektedir. Pragmatic Play ile günlük turnuvalar düzenlenmekte, ödül havuzları cazip seviyelerdedir. Evolution Gaming entegrasyonu ile canlı casino deneyimi kaliteli seviyededir. WhatsApp ve canlı chat üzerinden 7/24 Türkçe destek verilmektedir. Güvenlik açısından SSL şifreleme ve 2FA ile korunmaktadır. VIP programı mevcut olmakla birlikte detayları sınırlıdır. Kripto para seçenekleri Bitcoin ve USDT ile kısıtlıdır. Genel olarak, mobil cihazlardan oyun oynamayı tercih eden, hızlı işlem arayan kullanıcılar için ideal bir platformdur.',
    date: '2025-01-15'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <SEO
        title="CepBahis İnceleme 2025 - Mobil Casino Deneyimi"
        description="CepBahis casino detaylı inceleme. 8.000 TL hoşgeldin bonusu, Cepbank express ödemeler, mobil uygulama. CepBahis güvenilir mi? Bonus şartları ve kullanıcı yorumları."
        keywords={[
          'cepbahis',
          'cepbahis inceleme',
          'cepbahis güvenilir mi',
          'cepbahis bonus',
          'cepbahis giriş',
          'cepbahis mobil',
          'cepbahis para çekme'
        ]}
        canonical={`${window.location.origin}/cepbahis-inceleme`}
        ogType="article"
        ogImage="/logos/cepbahis-logo.png"
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
          affiliateLink="https://cepbahis.com"
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default CepBahisInceleme;
