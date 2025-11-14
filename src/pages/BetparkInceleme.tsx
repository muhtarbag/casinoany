import { CasinoReviewTemplate } from '@/components/templates/CasinoReviewTemplate';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { GamblingSEOEnhancer } from '@/components/seo/GamblingSEOEnhancer';
import { Shield, Zap, Headphones, Smartphone, CreditCard, Trophy } from 'lucide-react';

const BetparkInceleme = () => {
  const casino = {
    name: 'Betpark',
    slug: 'betpark',
    logo: '/logos/betpark-logo.png',
    rating: 4.7,
    reviewCount: 2098,
    bonus: '15.000 TL Hoşgeldin Bonusu + 175 Free Spin',
    license: 'Curacao Gaming Authority #365/JAZ',
    established: '2018',
    minDeposit: '50 TL',
    withdrawalTime: '5-10 saat',
    gameCount: 4900,
    liveCasino: true,
    mobileApp: true
  };

  const pros = [
    'All-in-one: spor, casino, canlı casino',
    'Geniş oyun yelpazesi (4,900+)',
    'Yüksek hoşgeldin bonusu (15.000 TL)',
    'Hızlı para çekme (5-10 saat)',
    'VIP Park programı gelişmiş',
    'Haftalık %15 mega cashback',
    'Telegram ve WhatsApp destek'
  ];

  const cons = [
    'Bonus çevrim şartı 40x',
    'Bazı ödeme yöntemlerinde komisyon',
    'Mobil uygulama iOS için beta'
  ];

  const features = [
    {
      title: 'All-in-One Platform',
      description: 'Spor bahisleri (30+ spor), casino (4,900+ oyun), canlı casino (150+ masa) tek platformda.',
      icon: <Trophy className="w-5 h-5 text-primary" />
    },
    {
      title: 'Mega Slot Park',
      description: '3,900+ slot oyunu. Pragmatic Play, NetEnt, Microgaming. Daily mega tournaments, jackpot pools.',
      icon: <Zap className="w-5 h-5 text-primary" />
    },
    {
      title: 'Live Casino Park',
      description: 'Evolution Gaming, Ezugi ile 150+ canlı masa. VIP Park Tables, Lightning series, Turkish dealers.',
      icon: <Trophy className="w-5 h-5 text-primary" />
    },
    {
      title: 'Fast Payments',
      description: 'Papara: 5-8 saat, Cepbank: 7-10 saat. Minimum çekim 100 TL, günlük limit 70.000 TL.',
      icon: <CreditCard className="w-5 h-5 text-primary" />
    },
    {
      title: 'Mobile Park',
      description: 'Android native app, iOS beta. Responsive site, all games mobile-ready. Push notifications.',
      icon: <Smartphone className="w-5 h-5 text-primary" />
    },
    {
      title: 'Support & Security',
      description: 'WhatsApp, Telegram, canlı chat 7/24. Curacao lisanslı, SSL 256-bit, 2FA. eCOGRA certified.',
      icon: <Shield className="w-5 h-5 text-primary" />
    }
  ];

  const paymentMethods = [
    'Papara',
    'Cepbank',
    'Visa/Mastercard',
    'Havale/EFT',
    'Bitcoin',
    'Ethereum',
    'USDT',
    'Litecoin',
    'Ripple',
    'Astropay',
    'MuchBetter',
    'Payfix'
  ];

  const gameProviders = [
    'Pragmatic Play',
    'NetEnt',
    'Microgaming',
    'Evolution Gaming',
    'Play\'n GO',
    'Yggdrasil',
    'Ezugi',
    'Red Tiger',
    'Push Gaming',
    'Big Time Gaming',
    'No Limit City',
    'Hacksaw Gaming',
    'Relax Gaming'
  ];

  const expertReview = {
    author: 'Kemal Şahin',
    expertise: 'Integrated Gaming Platforms & VIP Services Expert',
    experience: '13 yıl entegre gaming platformları uzmanı',
    summary: 'Betpark, 2018 yılında all-in-one vizyon ile kurulmuş, spor bahisleri, casino ve canlı casino oyunlarını tek platformda sunan kapsamlı bir sitedir. Curacao Gaming Authority lisansı ile faaliyet göstermektedir. 4,900+ oyun portföyü ile sektörde üst seviyededir. Hoşgeldin bonusu 15.000 TL + 175 Free Spin ile yüksek bir tekliftir, 40x çevrim şartı dikkat edilmesi gereken bir noktadır. Platform adından da anlaşılacağı üzere bir "park" konsepti ile tasarlanmış, kullanıcıların spor bahisleri, slot oyunları ve canlı casino arasında kolayca geçiş yapabilmesini sağlamaktadır. Spor bahisleri bölümü futbol, basketbol, tenis dahil 30+ spor dalını kapsamakta, canlı bahis ve yüksek oranlar sunmaktadır. Slot koleksiyonu 3,900+ oyun ile oldukça geniş olup, Pragmatic Play, NetEnt ve Microgaming ile çalışmaktadır. Günlük mega turnuvalar ve jackpot havuzları mevcuttur. Evolution Gaming ve Ezugi entegrasyonu ile 150+ canlı masa sunulmakta, VIP Park Tables ile yüksek limitli oyuncular için özel masalar mevcuttur. Para çekme süreleri Papara için 5-8 saat, diğer yöntemler için 7-10 saat arasında gerçekleşmekte, bu sektörde hızlı bir performanstır. Haftalık %15 mega cashback programı ile kayıpların önemli bir kısmı geri alınabilmektedir. VIP Park programı gelişmiş olup, özel turnuvalar, yüksek cashback oranları, kişisel hesap yöneticisi ve özel etkinlikler sunulmaktadır. Mobil platform Android için native uygulama sunmakta, iOS uygulaması beta aşamasındadır. WhatsApp, Telegram ve canlı chat ile 7/24 Türkçe destek verilmektedir. Güvenlik altyapısı SSL 256-bit şifreleme, 2FA ve düzenli eCOGRA denetimleri ile sağlamlaştırılmıştır. Bazı ödeme yöntemlerinde işlem komisyonu bulunmaktadır. Genel olarak, spor bahisleri, casino ve canlı casino oyunlarını tek platformda oynamak isteyen, all-in-one deneyim arayan kullanıcılar için mükemmel bir seçenektir.',
    date: '2025-01-15'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <SEO
        title="Betpark İnceleme 2025 - All-in-One Casino & Bahis"
        description="Betpark casino detaylı inceleme. 15.000 TL hoşgeldin bonusu, 4900+ oyun, spor-casino-live tek platformda. Betpark güvenilir mi? VIP Park program ve expert analiz."
        keywords={[
          'betpark',
          'betpark inceleme',
          'betpark güvenilir mi',
          'betpark bonus',
          'betpark casino',
          'betpark para çekme',
          'betpark giriş',
          'betpark bahis'
        ]}
        canonical={`${window.location.origin}/betpark-inceleme`}
        ogType="article"
        ogImage="/logos/betpark-logo.png"
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
          affiliateLink="https://betpark.com"
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default BetparkInceleme;
