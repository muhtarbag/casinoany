import { CasinoReviewTemplate } from '@/components/templates/CasinoReviewTemplate';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { GamblingSEOEnhancer } from '@/components/seo/GamblingSEOEnhancer';
import { Shield, Zap, Headphones, Smartphone, CreditCard, Trophy } from 'lucide-react';

const HovardaInceleme = () => {
  const casino = {
    name: 'Hovarda',
    slug: 'hovarda',
    logo: '/logos/hovarda-logo.png',
    rating: 4.8,
    reviewCount: 2187,
    bonus: '17.000 TL Hoşgeldin Bonusu + 190 Free Spin',
    license: 'Curacao eGaming License #1668/JAZ',
    established: '2019',
    minDeposit: '75 TL',
    withdrawalTime: '4-9 saat',
    gameCount: 5100,
    liveCasino: true,
    mobileApp: true
  };

  const pros = [
    'Eğlence odaklı casino deneyimi',
    'Geniş slot koleksiyonu (4,100+)',
    'Yüksek hoşgeldin bonusu (17.000 TL)',
    'Hızlı para çekme (4-9 saat)',
    'NetEnt ve Yggdrasil eksklüzif oyunlar',
    'Haftalık %12 cashback',
    'Sosyal casino özellikleri'
  ];

  const cons = [
    'Minimum yatırım 75 TL (biraz yüksek)',
    'Bonus çevrim şartı 38x',
    'Spor bahisleri entegrasyonu yok'
  ];

  const features = [
    {
      title: 'Fun Slot Paradise',
      description: '4,100+ slot oyunu. NetEnt, Yggdrasil eksklüzif slotları. Vikings, Reactoonz, Jammin Jars. RTP %96-98.',
      icon: <Zap className="w-5 h-5 text-primary" />
    },
    {
      title: 'Live Casino Fun',
      description: 'Evolution Gaming ile 140+ canlı masa. Crazy Time, Monopoly Live, Mega Ball. Fun dealers, party atmosphere.',
      icon: <Trophy className="w-5 h-5 text-primary" />
    },
    {
      title: 'Express Payments',
      description: 'Papara: 4-7 saat, Cepbank: 6-9 saat. Minimum çekim 150 TL, günlük limit 65.000 TL.',
      icon: <CreditCard className="w-5 h-5 text-primary" />
    },
    {
      title: 'Fun Mobile',
      description: 'iOS ve Android native apps. Gamification features, achievements, social leaderboards.',
      icon: <Smartphone className="w-5 h-5 text-primary" />
    },
    {
      title: 'Fun Support',
      description: 'WhatsApp, Telegram, canlı chat 7/24. Friendly Türkçe ekip, ortalama yanıt 2 dakika.',
      icon: <Headphones className="w-5 h-5 text-primary" />
    },
    {
      title: 'Security',
      description: 'Curacao lisanslı, SSL 256-bit şifreleme, 2FA. Responsible gaming tools, self-exclusion.',
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
    'Astropay',
    'MuchBetter'
  ];

  const gameProviders = [
    'NetEnt',
    'Yggdrasil',
    'Pragmatic Play',
    'Evolution Gaming',
    'Play\'n GO',
    'Red Tiger',
    'Push Gaming',
    'Quickspin',
    'Thunderkick',
    'ELK Studios',
    'No Limit City',
    'Hacksaw Gaming'
  ];

  const expertReview = {
    author: 'Aylin Demir',
    expertise: 'Entertainment Casino & Gamification Expert',
    experience: '9 yıl eğlence odaklı casino platformları uzmanı',
    summary: 'Hovarda, 2019 yılında eğlence ve sosyal etkileşim odaklı bir vizyon ile kurulmuş, Curacao eGaming lisansı ile faaliyet gösteren bir casino platformudur. 5,100+ oyun portföyü ile sektörde üst seviyededir, özellikle slot koleksiyonu 4,100+ oyun ile oldukça geniştir. Hoşgeldin bonusu 17.000 TL + 190 Free Spin ile yüksek bir tekliftir, 38x çevrim şartı kabul edilebilir düzeydedir. NetEnt ve Yggdrasil ile eksklüzif slot anlaşmaları bulunmakta, Vikings, Reactoonz, Jammin Jars gibi popüler oyunlar erişime açıktır. Evolution Gaming entegrasyonu ile 140+ canlı masa sunulmakta, Crazy Time, Monopoly Live, Mega Ball gibi eğlence odaklı oyunlar mevcuttur. Platform adından da anlaşılacağı üzere eğlence ve sosyal casino deneyimine odaklanmıştır. Para çekme süreleri Papara için 4-7 saat, diğer yöntemler için 6-9 saat arasında gerçekleşmekte, bu sektörde hızlı bir performanstır. Haftalık %12 cashback programı mevcuttur. Mobil uygulaması iOS ve Android için native olarak geliştirilmiş, gamification özellikleri (achievements, leaderboards, missions) ile sosyal casino deneyimi sunmaktadır. WhatsApp, Telegram ve canlı chat ile 7/24 Türkçe destek verilmektedir, destek ekibi friendly ve eğlenceli bir ton kullanmaktadır. Güvenlik altyapısı SSL 256-bit şifreleme, 2FA ve responsible gaming araçları ile sağlamlaştırılmıştır. Minimum yatırım limiti 75 TL olup, bu rakiplerine göre biraz yüksektir. Spor bahisleri entegrasyonu bulunmamakta, sadece casino oyunlarına odaklanmıştır. Genel olarak, eğlence odaklı casino deneyimi arayan, slot oyunlarını seven, sosyal etkileşim ve gamification özelliklerini önemseyen oyuncular için mükemmel bir seçenektir.',
    date: '2025-01-15'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <SEO
        title="Hovarda İnceleme 2025 - Eğlence Casino, 4100+ Slot"
        description="Hovarda casino detaylı inceleme. 17.000 TL hoşgeldin bonusu, 4-9 saat hızlı para çekimi, 5100+ oyun. Hovarda güvenilir mi? NetEnt eksklüzif slotlar ve expert analiz."
        keywords={[
          'hovarda',
          'hovarda inceleme',
          'hovarda güvenilir mi',
          'hovarda bonus',
          'hovarda casino',
          'hovarda para çekme',
          'hovarda giriş',
          'hovarda slot'
        ]}
        canonical={`${window.location.origin}/hovarda-inceleme`}
        ogType="article"
        ogImage="/logos/hovarda-logo.png"
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
          affiliateLink="https://hovarda.com"
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default HovardaInceleme;
