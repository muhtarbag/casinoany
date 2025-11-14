import { CasinoReviewTemplate } from '@/components/templates/CasinoReviewTemplate';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { GamblingSEOEnhancer } from '@/components/seo/GamblingSEOEnhancer';
import { Shield, Zap, Headphones, Smartphone, CreditCard, Trophy } from 'lucide-react';

const Bets10Inceleme = () => {
  const casino = {
    name: 'Bets10',
    slug: 'bets10',
    logo: '/logos/bets10-logo.png',
    rating: 4.7,
    reviewCount: 2134,
    bonus: '15.000 TL Hoşgeldin Bonusu + 200 Free Spin',
    license: 'Curacao Gaming Authority #365/JAZ',
    established: '2015',
    minDeposit: '50 TL',
    withdrawalTime: '12-24 saat',
    gameCount: 4500,
    liveCasino: true,
    mobileApp: true
  };

  const pros = [
    'Sektörün en yüksek hoşgeldin bonusu (15.000 TL)',
    '200 Free Spin ile slot deneyimi',
    'Kurumsal altyapı ve 10 yıllık tecrübe',
    'NetEnt ve Microgaming gibi dünya devleri',
    'Spor bahisleri entegrasyonu',
    'Haftalık ve aylık düzenli promosyonlar',
    'VIP programı avantajları'
  ];

  const cons = [
    'Bonus çevrim şartı yüksek (40x)',
    'Bazı ödeme yöntemlerinde komisyon',
    'Mobil uygulama iOS için sınırlı'
  ];

  const features = [
    {
      title: 'Slot Koleksiyonu',
      description: '3,800+ slot oyunu. Mega Moolah, Starburst, Book of Dead gibi jackpot slotlar. Günlük turnuvalar ve yarışmalar.',
      icon: <Zap className="w-5 h-5 text-primary" />
    },
    {
      title: 'Canlı Casino',
      description: 'NetEnt Live, Evolution Gaming ve Ezugi ile 120+ canlı masa. Türkçe masalar, Lightning serisi, Crazy Time.',
      icon: <Trophy className="w-5 h-5 text-primary" />
    },
    {
      title: 'Spor Bahisleri',
      description: 'Futbol, basketbol, tenis ve 30+ spor dalında bahis. Canlı bahis, yüksek oranlar, kombine bahis seçenekleri.',
      icon: <Trophy className="w-5 h-5 text-primary" />
    },
    {
      title: 'Ödeme Hızı',
      description: 'Cepbank ile 2-6 saat, Papara ile 4-12 saat para çekimi. Günlük limit 25.000 TL, haftalık 100.000 TL.',
      icon: <CreditCard className="w-5 h-5 text-primary" />
    },
    {
      title: 'Mobil Platform',
      description: 'Android uygulaması ve mobil site. Tüm oyunlar mobilde erişilebilir. Push notification ile bonus bildirimleri.',
      icon: <Smartphone className="w-5 h-5 text-primary" />
    },
    {
      title: 'Destek Ekibi',
      description: 'Canlı chat, WhatsApp, email desteği. Türkçe operatörler 7/24 hizmet. Ortalama yanıt süresi 3 dakika.',
      icon: <Headphones className="w-5 h-5 text-primary" />
    }
  ];

  const paymentMethods = [
    'Papara',
    'Cepbank',
    'Visa/Mastercard',
    'Havale/EFT',
    'Bitcoin',
    'Litecoin',
    'Ripple',
    'Ecopayz',
    'MuchBetter'
  ];

  const gameProviders = [
    'NetEnt',
    'Microgaming',
    'Evolution Gaming',
    'Pragmatic Play',
    'Play\'n GO',
    'Yggdrasil',
    'Quickspin',
    'Red Tiger',
    'Thunderkick',
    'ELK Studios',
    'Hacksaw Gaming',
    'Relax Gaming'
  ];

  const expertReview = {
    author: 'Ayşe Demir',
    expertise: 'Casino Lisans & Regülasyon Uzmanı',
    experience: '15 yıl online gaming sektöründe',
    summary: 'Bets10, 2015 yılından bu yana Türkiye pazarında hizmet veren köklü bir casino platformudur. Curacao Gaming Authority lisansı altında faaliyet göstermektedir. 4,500+ oyun portföyü ile geniş bir yelpaze sunmaktadır. Hoşgeldin bonusu 15.000 TL + 200 Free Spin ile sektörde en yüksek seviyededir, ancak 40x çevrim şartı dikkat edilmesi gereken bir noktadır. NetEnt, Microgaming ve Evolution Gaming gibi dünya çapında tanınan sağlayıcılarla çalışmaktadır. Para çekme süreleri Papara için 4-12 saat, diğer yöntemler için 12-24 saat arasındadır. Spor bahisleri entegrasyonu ile hem casino hem bahis severlere hitap etmektedir. Mobil platform Android için optimize edilmiş, iOS kullanıcıları mobil site üzerinden erişim sağlamaktadır. Güvenlik protokolleri SSL şifreleme ve 2FA ile sağlamlaştırılmıştır. VIP programı ile sadık oyunculara özel avantajlar sunulmaktadır. Genel olarak, deneyimli oyuncular ve yüksek limitli oyun arayanlar için uygun bir platformdur.',
    date: '2025-01-14'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <SEO
        title="Bets10 İnceleme 2025 - Güvenilir Casino & Bahis Sitesi"
        description="Bets10 detaylı inceleme ve kullanıcı yorumları. 15.000 TL hoşgeldin bonusu, 4500+ oyun, spor bahisleri. Bets10 güvenilir mi? Bonus çevrim şartları ve para çekme süreleri."
        keywords={[
          'bets10',
          'bets10 inceleme',
          'bets10 güvenilir mi',
          'bets10 bonus',
          'bets10 casino',
          'bets10 giriş',
          'bets10 para çekme',
          'bets10 bahis'
        ]}
        canonical={`${window.location.origin}/bets10-inceleme`}
        ogType="article"
        ogImage="/logos/bets10-logo.png"
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
          affiliateLink="https://bets10.com"
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default Bets10Inceleme;
