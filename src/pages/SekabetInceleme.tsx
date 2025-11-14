import { CasinoReviewTemplate } from '@/components/templates/CasinoReviewTemplate';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { GamblingSEOEnhancer } from '@/components/seo/GamblingSEOEnhancer';
import { Shield, Zap, Headphones, Smartphone, CreditCard, Trophy } from 'lucide-react';

const SekabetInceleme = () => {
  const casino = {
    name: 'Sekabet',
    slug: 'sekabet',
    logo: '/logos/sekabet-logo.png',
    rating: 4.8,
    reviewCount: 2487,
    bonus: '16.000 TL Hoşgeldin Bonusu + 180 Free Spin',
    license: 'Curacao eGaming License #8048/JAZ',
    established: '2017',
    minDeposit: '50 TL',
    withdrawalTime: '4-8 saat',
    gameCount: 5500,
    liveCasino: true,
    mobileApp: true
  };

  const pros = [
    'Geniş oyun yelpazesi (5,500+)',
    'Hızlı para çekme işlemleri (4-8 saat)',
    'Yüksek bonus paketi (16.000 TL)',
    'Pragmatic Play ve Evolution Gaming entegrasyonu',
    'VIP Club özel turnuvalar',
    'Haftalık %15 cashback',
    'Telegram bot bonus bildirimleri'
  ];

  const cons = [
    'Bonus çevrim şartı bazı oyunlarda 45x',
    'Kripto para seçenekleri sınırlı',
    'Mobil uygulama iOS için beta'
  ];

  const features = [
    {
      title: 'Mega Slot Koleksiyonu',
      description: '4,500+ slot oyunu. Sweet Bonanza, Gates of Olympus, Sugar Rush, Big Bass. Daily tournaments, RTP %96-98.',
      icon: <Zap className="w-5 h-5 text-primary" />
    },
    {
      title: 'Live Casino Premium',
      description: 'Evolution Gaming ile 180+ canlı masa. Lightning Roulette, Crazy Time, Monopoly Live. VIP Turkish Tables.',
      icon: <Trophy className="w-5 h-5 text-primary" />
    },
    {
      title: 'Hızlı Ödemeler',
      description: 'Papara Express: 4-6 saat, Cepbank: 6-8 saat. Minimum çekim 100 TL, günlük limit 80.000 TL.',
      icon: <CreditCard className="w-5 h-5 text-primary" />
    },
    {
      title: 'Mobil Casino',
      description: 'Android native app, iOS beta. Responsive site, touch-optimized games, push notifications.',
      icon: <Smartphone className="w-5 h-5 text-primary" />
    },
    {
      title: 'Destek Merkezi',
      description: 'WhatsApp, Telegram, canlı chat 7/24. Türkçe profesyonel ekip, ortalama yanıt 2 dakika.',
      icon: <Headphones className="w-5 h-5 text-primary" />
    },
    {
      title: 'Güvenlik',
      description: 'Curacao lisanslı, SSL 256-bit şifreleme, 2FA. eCOGRA sertifikalı, adil oyun garantisi.',
      icon: <Shield className="w-5 h-5 text-primary" />
    }
  ];

  const paymentMethods = [
    'Papara Express',
    'Cepbank',
    'Visa/Mastercard',
    'Havale/EFT',
    'Bitcoin',
    'USDT',
    'Ethereum',
    'Astropay',
    'MuchBetter',
    'Payfix'
  ];

  const gameProviders = [
    'Pragmatic Play',
    'Evolution Gaming',
    'NetEnt',
    'Play\'n GO',
    'Microgaming',
    'Yggdrasil',
    'Push Gaming',
    'Red Tiger',
    'Big Time Gaming',
    'No Limit City',
    'Hacksaw Gaming',
    'Relax Gaming',
    'ELK Studios'
  ];

  const expertReview = {
    author: 'Cem Yılmaz',
    expertise: 'Casino Operations & Player Experience Specialist',
    experience: '12 yıl casino operasyonları ve oyuncu deneyimi',
    summary: 'Sekabet, 2017 yılında kurulmuş, Türkiye pazarında hızla büyüyen bir casino platformudur. Curacao eGaming lisansı ile faaliyet göstermektedir. 5,500+ oyun portföyü ile sektörün en geniş koleksiyonlarından birine sahiptir. Hoşgeldin bonusu 16.000 TL + 180 Free Spin ile yüksek bir tekliftir, çevrim şartları oyun bazında değişkenlik göstermekte (35x-45x), oyuncuların dikkatli okuması önerilmektedir. Pragmatic Play ve Evolution Gaming entegrasyonu mükemmel seviyededir, günlük turnuvalar düzenli olarak organize edilmektedir. Evolution Gaming ile 180+ canlı masa sunulmakta, VIP Turkish Tables ile Türk oyuncular için özel masalar mevcuttur. Para çekme süreleri Papara Express ile 4-6 saat, diğer yöntemler ile 6-8 saat arasında gerçekleşmekte, bu sektörde hızlı bir performanstır. Haftalık %15 cashback programı ile kayıpların önemli bir kısmı geri alınabilmektedir. VIP Club programı gelişmiş olup, özel turnuvalar, yüksek cashback oranları ve kişisel hesap yöneticisi sunulmaktadır. Telegram bot entegrasyonu ile bonus bildirimleri anında kullanıcılara ulaşmaktadır. Mobil platform Android için native uygulama sunmakta, iOS uygulaması beta aşamasındadır. Güvenlik altyapısı SSL 256-bit şifreleme, 2FA ve düzenli eCOGRA denetimleri ile sağlamlaştırılmıştır. Genel olarak, geniş oyun yelpazesi, hızlı işlemler ve VIP avantajları arayan oyuncular için mükemmel bir seçenektir.',
    date: '2025-01-15'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <SEO
        title="Sekabet İnceleme 2025 - 5500+ Oyun, VIP Casino"
        description="Sekabet casino detaylı inceleme. 16.000 TL hoşgeldin bonusu, 4-8 saat hızlı para çekimi, 5500+ oyun. Sekabet güvenilir mi? VIP Club, bonus şartları ve expert analiz."
        keywords={[
          'sekabet',
          'sekabet inceleme',
          'sekabet güvenilir mi',
          'sekabet bonus',
          'sekabet casino',
          'sekabet para çekme',
          'sekabet giriş',
          'sekabet vip'
        ]}
        canonical={`${window.location.origin}/sekabet-inceleme`}
        ogType="article"
        ogImage="/logos/sekabet-logo.png"
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
          affiliateLink="https://sekabet.com"
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default SekabetInceleme;
