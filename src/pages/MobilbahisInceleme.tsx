import { CasinoReviewTemplate } from '@/components/templates/CasinoReviewTemplate';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { GamblingSEOEnhancer } from '@/components/seo/GamblingSEOEnhancer';
import { Shield, Zap, Headphones, Smartphone, CreditCard, Trophy } from 'lucide-react';

const MobilbahisInceleme = () => {
  const casino = {
    name: 'Mobilbahis',
    slug: 'mobilbahis',
    logo: '/logos/mobilbahis-logo.png',
    rating: 4.6,
    reviewCount: 1823,
    bonus: '5.000 TL Hoşgeldin Bonusu + 50 Free Spin',
    license: 'Curacao eGaming License #1668/JAZ',
    established: '2017',
    minDeposit: '50 TL',
    withdrawalTime: '6-18 saat',
    gameCount: 3500,
    liveCasino: true,
    mobileApp: true
  };

  const pros = [
    'Mobil-first tasarım, akıllı telefonda mükemmel UX',
    'Hızlı kayıt ve anında oyun başlatma',
    'Düşük minimum yatırım limiti (50 TL)',
    'Pragmatic Play slot turnuvaları',
    'Telegram ve WhatsApp üzerinden anlık destek',
    'Haftalık cashback bonusları',
    'Türk oyuncular için optimize edilmiş'
  ];

  const cons = [
    'Oyun sayısı rakiplerine göre daha az',
    'VIP programı detayları sınırlı',
    'Kripto para seçenekleri kısıtlı'
  ];

  const features = [
    {
      title: 'Mobil Deneyim',
      description: 'Native iOS ve Android uygulamaları. PWA desteği ile tarayıcıdan kurulum. Mobil-optimized oyunlar, hızlı yükleme.',
      icon: <Smartphone className="w-5 h-5 text-primary" />
    },
    {
      title: 'Slot Oyunları',
      description: '2,500+ slot oyunu. Pragmatic Play, Play\'n GO, Push Gaming. Sweet Bonanza, Dog House, Big Bass serileri.',
      icon: <Zap className="w-5 h-5 text-primary" />
    },
    {
      title: 'Canlı Casino',
      description: 'Evolution Gaming ile 80+ masa. Türkçe dealerlar, Lightning Roulette, Mega Ball, Monopoly Live.',
      icon: <Trophy className="w-5 h-5 text-primary" />
    },
    {
      title: 'Hızlı Ödemeler',
      description: 'Papara express: 2-6 saat, Cepbank: 4-12 saat. Minimum çekim 100 TL, maksimum günlük 30.000 TL.',
      icon: <CreditCard className="w-5 h-5 text-primary" />
    },
    {
      title: 'Anlık Destek',
      description: 'Telegram botu ile 7/24 destek. WhatsApp hattı, canlı chat. Türkçe destek ekibi, ortalama yanıt 5 dakika.',
      icon: <Headphones className="w-5 h-5 text-primary" />
    },
    {
      title: 'Güvenlik',
      description: 'SSL 128-bit şifreleme, Curacao lisanslı. KYC doğrulama, anti-fraud sistemler. Adil oyun sertifikaları.',
      icon: <Shield className="w-5 h-5 text-primary" />
    }
  ];

  const paymentMethods = [
    'Papara Express',
    'Cepbank',
    'Visa/Mastercard',
    'Havale/EFT',
    'Bitcoin',
    'USDT (TRC20)',
    'CMT Cüzdan',
    'Payfix'
  ];

  const gameProviders = [
    'Pragmatic Play',
    'Play\'n GO',
    'Evolution Gaming',
    'Push Gaming',
    'Hacksaw Gaming',
    'Nolimit City',
    'Relax Gaming',
    'Red Tiger',
    'Yggdrasil',
    'Spinomenal'
  ];

  const expertReview = {
    author: 'Can Öztürk',
    expertise: 'Mobil Gaming & UX Uzmanı',
    experience: '8 yıl mobil casino platformları analizi',
    summary: 'Mobilbahis, adından da anlaşılacağı üzere mobil deneyim odaklı bir casino platformudur. 2017 yılında kurulmuş olup Curacao lisansı ile faaliyet göstermektedir. 3,500+ oyun portföyü rakiplerine göre daha kompakt olmakla birlikte, kaliteli sağlayıcılar ile çalışmaktadır. Mobil uygulaması iOS ve Android için optimize edilmiş, kullanıcı deneyimi mükemmel seviyededir. Hoşgeldin bonusu 5.000 TL + 50 Free Spin ile orta seviye bir tekliftir, 35x çevrim şartı kabul edilebilir düzeydedir. Para çekme işlemleri Papara Express ile 2-6 saat gibi oldukça hızlı bir sürede gerçekleşmektedir. Telegram ve WhatsApp üzerinden anlık destek imkanı genç kullanıcılar için büyük avantaj sağlamaktadır. Haftalık cashback programı ile kayıpların bir kısmı geri alınabilmektedir. Pragmatic Play slot turnuvaları düzenli olarak organize edilmekte, ödül havuzları cazip seviyelerdedir. Güvenlik açısından SSL şifreleme ve KYC doğrulama süreçleri standartlara uygundur. Özellikle mobil cihazlardan oyun oynamayı tercih eden, hızlı işlem arayan genç oyuncular için ideal bir seçenektir.',
    date: '2025-01-14'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <SEO
        title="Mobilbahis İnceleme 2025 - Mobil Casino Deneyimi"
        description="Mobilbahis casino detaylı inceleme. 5.000 TL hoşgeldin bonusu, mobil uygulama, hızlı para çekimi. Mobilbahis güvenilir mi? Telegram destek, bonus şartları ve kullanıcı yorumları."
        keywords={[
          'mobilbahis',
          'mobilbahis inceleme',
          'mobilbahis güvenilir mi',
          'mobilbahis bonus',
          'mobilbahis giriş',
          'mobilbahis mobil',
          'mobilbahis para çekme',
          'mobilbahis şikayet'
        ]}
        canonical={`${window.location.origin}/mobilbahis-inceleme`}
        ogType="article"
        ogImage="/logos/mobilbahis-logo.png"
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
          affiliateLink="https://mobilbahis.com"
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default MobilbahisInceleme;
