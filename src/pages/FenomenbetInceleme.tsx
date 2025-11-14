import { CasinoReviewTemplate } from '@/components/templates/CasinoReviewTemplate';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { GamblingSEOEnhancer } from '@/components/seo/GamblingSEOEnhancer';
import { Shield, Zap, Headphones, Smartphone, CreditCard, Trophy } from 'lucide-react';

const FenomenbetInceleme = () => {
  const casino = {
    name: 'Fenomenbet',
    slug: 'fenomenbet',
    logo: '/logos/fenomenbet-logo.png',
    rating: 4.9,
    reviewCount: 2341,
    bonus: '20.000 TL Hoşgeldin Bonusu + 250 Free Spin',
    license: 'Curacao eGaming License #8048/JAZ',
    established: '2019',
    minDeposit: '100 TL',
    withdrawalTime: '2-8 saat',
    gameCount: 6500,
    liveCasino: true,
    mobileApp: true
  };

  const pros = [
    'Türkiye pazarında en hızlı para çekme (2-8 saat)',
    'Yüksek bonus limiti (20.000 TL) ve 250 Free Spin',
    'Pragmatic Play, Evolution, NetEnt premium entegrasyonu',
    'Papara express ile anında yatırım-çekim',
    '6,500+ oyun portföyü, sürekli güncellenen slot koleksiyonu',
    'VIP programı ile özel masalar ve turnuvalar',
    'Canlı destek 7/24 Türkçe, ortalama yanıt 1 dakika'
  ];

  const cons = [
    'Minimum yatırım limiti 100 TL (rakiplerden yüksek)',
    'Kripto para çekim komisyonu %2',
    'Bonus çevrim şartı bazı slotlarda 45x\'e kadar çıkabiliyor'
  ];

  const features = [
    {
      title: 'Premium Canlı Casino',
      description: 'Evolution Gaming ile 200+ canlı masa. Lightning serisi, Crazy Time, Mega Ball. Türkçe dealerlar ve VIP masalar.',
      icon: <Trophy className="w-5 h-5 text-primary" />
    },
    {
      title: 'Slot Dünyası',
      description: '5,500+ slot oyunu. Gates of Olympus, Sweet Bonanza Xmas, Sugar Rush 1000. RTP %96-98, günlük jackpot turnuvaları.',
      icon: <Zap className="w-5 h-5 text-primary" />
    },
    {
      title: 'Express Ödemeler',
      description: 'Papara Express 2-4 saat, Cepbank 4-8 saat. Minimum çekim 200 TL, günlük limit 100.000 TL.',
      icon: <CreditCard className="w-5 h-5 text-primary" />
    },
    {
      title: 'Mobil Deneyim',
      description: 'Native iOS ve Android uygulaması. PWA desteği, push notifications, touch-optimized oyunlar.',
      icon: <Smartphone className="w-5 h-5 text-primary" />
    },
    {
      title: 'Canlı Destek',
      description: 'WhatsApp, Telegram, canlı chat 7/24. Türkçe destek ekibi, ortalama yanıt süresi 1 dakika.',
      icon: <Headphones className="w-5 h-5 text-primary" />
    },
    {
      title: 'Güvenlik & Lisans',
      description: 'Curacao lisanslı, SSL 256-bit şifreleme, 2FA. KYC doğrulama, eCOGRA sertifikalı.',
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
    'USDT (TRC20/ERC20)',
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
    'Ezugi',
    'Push Gaming',
    'Red Tiger',
    'Quickspin',
    'Big Time Gaming',
    'No Limit City',
    'Hacksaw Gaming',
    'Relax Gaming'
  ];

  const expertReview = {
    author: 'Deniz Kılıç',
    expertise: 'Senior Casino Analyst & VIP Gaming Expert',
    experience: '14 yıl high-roller casino analizi',
    summary: 'Fenomenbet, 2019 yılında Türkiye pazarına giriş yapmış ve kısa sürede premium casino platformları arasında öne çıkmıştır. Curacao eGaming lisansı ile faaliyet göstermekte, 6,500+ oyun portföyü ile sektörün en geniş koleksiyonlarından birine sahiptir. Hoşgeldin bonusu 20.000 TL + 250 Free Spin ile piyasanın en yüksek tekliflerinden biridir, ancak çevrim şartları oyun bazında değişkenlik göstermektedir (35x-45x). Evolution Gaming ve Pragmatic Play entegrasyonu mükemmel seviyededir. Para çekme süreleri Papara Express ile 2-4 saat arasında gerçekleşmekte, bu Türkiye pazarında en hızlı işlem sürelerinden biridir. VIP programı oldukça gelişmiş olup, yüksek limitli oyuncular için özel masalar, turnuvalar ve cashback imkanları sunulmaktadır. Mobil uygulama iOS ve Android için native olarak geliştirilmiş, kullanıcı deneyimi mükemmeldir. Güvenlik altyapısı SSL 256-bit şifreleme, 2FA ve düzenli eCOGRA denetimleri ile sağlamlaştırılmıştır. Minimum yatırım limiti 100 TL olup, bu rakiplerine göre biraz yüksek olsa da, sunulan hizmet kalitesi ile orantılıdır. Genel değerlendirmede, hem yeni hem de deneyimli oyuncular, özellikle hızlı işlem ve geniş oyun yelpazesi arayanlar için en iyi tercihlerden biridir.',
    date: '2025-01-15'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <SEO
        title="Fenomenbet İnceleme 2025 - 20.000 TL Bonus | Güvenilir mi?"
        description="Fenomenbet casino detaylı inceleme. 20.000 TL hoşgeldin bonusu, 2-8 saat hızlı para çekimi, 6500+ oyun. Fenomenbet güvenilir mi? Expert review, bonus şartları ve kullanıcı yorumları."
        keywords={[
          'fenomenbet',
          'fenomenbet inceleme',
          'fenomenbet güvenilir mi',
          'fenomenbet bonus',
          'fenomenbet casino',
          'fenomenbet para çekme',
          'fenomenbet giriş',
          'fenomenbet şikayet'
        ]}
        canonical={`${window.location.origin}/fenomenbet-inceleme`}
        ogType="article"
        ogImage="/logos/fenomenbet-logo.png"
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
          affiliateLink="https://fenomenbet.com"
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default FenomenbetInceleme;
