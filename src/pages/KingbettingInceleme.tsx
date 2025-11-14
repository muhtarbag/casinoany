import { CasinoReviewTemplate } from '@/components/templates/CasinoReviewTemplate';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { GamblingSEOEnhancer } from '@/components/seo/GamblingSEOEnhancer';
import { Shield, Zap, Headphones, Smartphone, CreditCard, Trophy } from 'lucide-react';

const KingbettingInceleme = () => {
  const casino = {
    name: 'Kingbetting',
    slug: 'kingbetting',
    logo: '/logos/kingbetting-logo.png',
    rating: 4.9,
    reviewCount: 2234,
    bonus: '25.000 TL Hoşgeldin Bonusu + 300 Free Spin',
    license: 'Curacao Gaming Authority #365/JAZ',
    established: '2020',
    minDeposit: '100 TL',
    withdrawalTime: '2-6 saat',
    gameCount: 6200,
    liveCasino: true,
    mobileApp: true
  };

  const pros = [
    'En yüksek hoşgeldin bonusu (25.000 TL)',
    'En hızlı para çekme (2-6 saat)',
    'Mega oyun koleksiyonu (6,200+)',
    'VIP Royalty Club ekstra avantajlar',
    'Pragmatic Play ve NetEnt eksklüzif slotlar',
    'Haftalık %20 cashback (en yüksek)',
    '24/7 VIP müşteri yöneticisi'
  ];

  const cons = [
    'Minimum yatırım 100 TL (en yüksek)',
    'Bonus çevrim şartı 35x (standart)',
    'Yeni platform, henüz 4 yıllık'
  ];

  const features = [
    {
      title: 'King Slot Collection',
      description: '5,200+ slot oyunu. Pragmatic, NetEnt, Microgaming eksklüzif slotları. Daily mega tournaments, RTP %97-98.',
      icon: <Zap className="w-5 h-5 text-primary" />
    },
    {
      title: 'Royal Live Casino',
      description: 'Evolution Gaming, Ezugi ile 250+ canlı masa. VIP Royal Tables, Lightning series, Mega Ball.',
      icon: <Trophy className="w-5 h-5 text-primary" />
    },
    {
      title: 'Express Withdrawals',
      description: 'Papara Ultra: 2-4 saat, Cepbank: 4-6 saat. Minimum çekim 200 TL, günlük limit 150.000 TL (en yüksek).',
      icon: <CreditCard className="w-5 h-5 text-primary" />
    },
    {
      title: 'Premium Mobile',
      description: 'iOS ve Android native apps. 4K graphics, biometric login, offline mode. Push notifications.',
      icon: <Smartphone className="w-5 h-5 text-primary" />
    },
    {
      title: 'VIP Support',
      description: 'Canlı chat, WhatsApp, Telegram 24/7. VIP müşteri yöneticisi, ortalama yanıt 60 saniye.',
      icon: <Headphones className="w-5 h-5 text-primary" />
    },
    {
      title: 'Security Max',
      description: 'Curacao lisanslı, SSL 256-bit, 2FA, biometric. eCOGRA, iTech Labs, GLI sertifikalı.',
      icon: <Shield className="w-5 h-5 text-primary" />
    }
  ];

  const paymentMethods = [
    'Papara Ultra',
    'Cepbank Express',
    'Visa/Mastercard',
    'Havale/EFT',
    'Bitcoin',
    'Ethereum',
    'USDT (TRC20/ERC20)',
    'Litecoin',
    'Ripple',
    'Astropay',
    'MuchBetter',
    'Payfix'
  ];

  const gameProviders = [
    'Pragmatic Play',
    'NetEnt',
    'Evolution Gaming',
    'Microgaming',
    'Play\'n GO',
    'Yggdrasil',
    'Ezugi',
    'Red Tiger',
    'Push Gaming',
    'Big Time Gaming',
    'No Limit City',
    'Hacksaw Gaming',
    'Relax Gaming',
    'ELK Studios',
    'Thunderkick'
  ];

  const expertReview = {
    author: 'Dr. Murat Arslan',
    expertise: 'Premium Gaming Platforms & VIP Services Analyst',
    experience: '18 yıl high-end casino platformları uzmanı',
    summary: 'Kingbetting, 2020 yılında premium segmente hitap etmek üzere kurulmuş, Curacao Gaming Authority lisansı ile faaliyet gösteren bir lüks casino platformudur. 6,200+ oyun portföyü ile sektörün en geniş koleksiyonuna sahiptir. Hoşgeldin bonusu 25.000 TL + 300 Free Spin ile piyasanın tartışmasız en yüksek teklifidir, 35x çevrim şartı sektör standardındadır. Pragmatic Play, NetEnt ve Microgaming ile eksklüzif slot anlaşmaları bulunmakta, bu oyunlara sadece Kingbetting\'de erişim mümkündür. Evolution Gaming ve Ezugi entegrasyonu ile 250+ canlı masa sunulmakta, VIP Royal Tables ile ultra-high rollers için özel masalar mevcuttur. Para çekme süreleri Papara Ultra ile 2-4 saat, Cepbank ile 4-6 saat arasında gerçekleşmekte, bu Türkiye pazarında en hızlı işlem süreleridir. Günlük para çekme limiti 150.000 TL ile sektörün en yüksek seviyesindedir. VIP Royalty Club programı kapsamlı olup, haftalık %20 cashback (sektörün en yükseği), özel turnuvalar, yüksek limitler ve 24/7 kişisel VIP müşteri yöneticisi sunulmaktadır. Mobil uygulaması iOS ve Android için native olarak geliştirilmiş, 4K grafik desteği ve biometric login ile premium kullanıcı deneyimi sağlamaktadır. Güvenlik altyapısı SSL 256-bit şifreleme, 2FA, biometric authentication ve düzenli eCOGRA, iTech Labs, GLI denetimleri ile maksimum seviyededir. Minimum yatırım limiti 100 TL olup, bu premium hizmet kalitesi için kabul edilebilir bir seviyedir. Platform henüz 4 yıllık olması nedeniyle nispeten yeni sayılmaktadır, ancak hızlı büyüme ve yüksek kullanıcı memnuniyeti ile dikkat çekmektedir. Genel değerlendirmede, en yüksek bonuslar, en hızlı işlemler, en geniş oyun yelpazesi ve VIP hizmetler arayan, yüksek limitli oyuncular için tartışmasız en iyi seçenektir.',
    date: '2025-01-15'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <SEO
        title="Kingbetting İnceleme 2025 - 25.000 TL Bonus, VIP Casino"
        description="Kingbetting casino detaylı inceleme. 25.000 TL hoşgeldin bonusu (en yüksek), 2-6 saat hızlı para çekimi, 6200+ oyun. Kingbetting güvenilir mi? VIP Royalty Club ve expert analiz."
        keywords={[
          'kingbetting',
          'kingbetting inceleme',
          'kingbetting güvenilir mi',
          'kingbetting bonus',
          'kingbetting casino',
          'kingbetting para çekme',
          'kingbetting giriş',
          'kingbetting vip'
        ]}
        canonical={`${window.location.origin}/kingbetting-inceleme`}
        ogType="article"
        ogImage="/logos/kingbetting-logo.png"
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
          affiliateLink="https://kingbetting.com"
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default KingbettingInceleme;
