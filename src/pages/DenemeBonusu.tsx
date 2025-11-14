import { BonusPageTemplate } from '@/components/templates/BonusPageTemplate';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { GamblingSEOEnhancer } from '@/components/seo/GamblingSEOEnhancer';

const DenemeBonusu = () => {
  const bonusOffers = [
    {
      id: '1',
      casino: {
        name: 'Betist',
        slug: 'betist',
        logo: '/logos/betist-logo.png',
        rating: 4.8
      },
      bonusType: 'nodeposit' as const,
      title: '100 TL Deneme Bonusu + 50 Free Spin',
      amount: '100 TL + 50 FS',
      wageringRequirement: '35x',
      validUntil: '2025-03-31T23:59:59Z',
      bonusCode: 'DENEME100',
      terms: [
        '18+ yaş sınırı geçerlidir',
        'Sadece yeni üyeler için geçerlidir',
        'Bonus 7 gün içinde kullanılmalıdır',
        'Maksimum çekim 500 TL'
      ],
      eligibility: [
        'Türkiye\'den kayıt olmuş kullanıcılar',
        'İlk üyelik bonusudur',
        'Kişi başına tek hesap',
        'Email veya SMS doğrulaması gereklidir'
      ],
      affiliateLink: 'https://betist.com'
    },
    {
      id: '2',
      casino: {
        name: 'Bets10',
        slug: 'bets10',
        logo: '/logos/bets10-logo.png',
        rating: 4.7
      },
      bonusType: 'nodeposit' as const,
      title: '150 TL Yatırımsız Deneme Bonusu',
      amount: '150 TL',
      wageringRequirement: '40x',
      validUntil: '2025-03-31T23:59:59Z',
      bonusCode: 'FREEBONUS',
      terms: [
        '18+ yaş kontrolü zorunludur',
        'Yeni üyeler için',
        'Bonus 5 gün içinde çevrilmelidir',
        'Maksimum bonus çekim tutarı 750 TL'
      ],
      eligibility: [
        'TR IP adresinden kayıt',
        'Tek hesap kuralı geçerlidir',
        'Telefon doğrulaması gereklidir'
      ],
      affiliateLink: 'https://bets10.com'
    },
    {
      id: '3',
      casino: {
        name: 'Mobilbahis',
        slug: 'mobilbahis',
        logo: '/logos/mobilbahis-logo.png',
        rating: 4.6
      },
      bonusType: 'nodeposit' as const,
      title: '75 TL Deneme Bonusu + 25 Free Spin',
      amount: '75 TL + 25 FS',
      wageringRequirement: '30x',
      validUntil: '2025-03-31T23:59:59Z',
      bonusCode: 'MOBILE75',
      terms: [
        'Minimum yaş: 18',
        'Sadece ilk kayıt için',
        'Free spinler Sweet Bonanza\'da kullanılabilir',
        'Çekim limiti 400 TL'
      ],
      eligibility: [
        'Türkiye\'den erişim',
        'Email doğrulaması zorunlu',
        'Kimlik doğrulaması gerekebilir'
      ],
      affiliateLink: 'https://mobilbahis.com'
    },
    {
      id: '4',
      casino: {
        name: 'Casinometropol',
        slug: 'casinometropol',
        logo: '/logos/casinometropol-logo.png',
        rating: 4.5
      },
      bonusType: 'nodeposit' as const,
      title: '200 TL Yatırımsız Bonus',
      amount: '200 TL',
      wageringRequirement: '45x',
      validUntil: '2025-03-31T23:59:59Z',
      terms: [
        '18+ oyuncular için',
        'İlk üyelik bonusu',
        '10 gün içinde çevrim tamamlanmalı',
        'Maksimum çekim 1.000 TL'
      ],
      eligibility: [
        'TR kullanıcılar için',
        'Telefon doğrulaması',
        'Hesap başına tek bonus'
      ],
      affiliateLink: 'https://casinometropol.com'
    },
    {
      id: '5',
      casino: {
        name: 'Youwin',
        slug: 'youwin',
        logo: '/logos/youwin-logo.png',
        rating: 4.4
      },
      bonusType: 'nodeposit' as const,
      title: '50 TL Deneme + 30 Free Spin',
      amount: '50 TL + 30 FS',
      wageringRequirement: '25x',
      validUntil: '2025-03-31T23:59:59Z',
      bonusCode: 'WIN50',
      terms: [
        'Yasal yaş sınırı: 18+',
        'Yeni üyelere özel',
        'Free spinler Gates of Olympus\'ta',
        'Maksimum kazanç 300 TL'
      ],
      eligibility: [
        'Türkiye\'den kayıt',
        'SMS doğrulama gerekli',
        'İlk hesap olmalı'
      ],
      affiliateLink: 'https://youwin.com'
    }
  ];

  const howToSteps = [
    {
      name: '1. Siteye Üye Olun',
      text: 'İlk olarak deneme bonusu veren casino sitesine kayıt olun. Kayıt formunu eksiksiz doldurun.'
    },
    {
      name: '2. Hesabınızı Doğrulayın',
      text: 'Email veya SMS ile gönderilen doğrulama linkine tıklayarak hesabınızı aktif hale getirin.'
    },
    {
      name: '3. Bonus Kodunu Girin',
      text: 'Eğer bonus kodu gerekliyse (örn: DENEME100), hesap ayarlarından veya bonus bölümünden kodu girin.'
    },
    {
      name: '4. Bonusu Aktif Edin',
      text: 'Bonus otomatik olarak hesabınıza tanımlanacaktır. Bonus & Kampanyalar bölümünden kontrol edin.'
    },
    {
      name: '5. Çevrim Şartını Tamamlayın',
      text: 'Bonusu para çekebilmek için belirlenen çevrim şartını (örn: 35x) slot oyunlarında tamamlayın.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <SEO
        title="Deneme Bonusu Veren Siteler 2025 - Güncel Liste"
        description="2025'in en iyi deneme bonusu veren casino siteleri! 100 TL - 200 TL arası yatırımsız bonuslar. Çevrim şartları, bonus kodları ve detaylı rehber."
        keywords={[
          'deneme bonusu',
          'deneme bonusu veren siteler',
          'yatırımsız bonus',
          'casino deneme bonusu',
          'bedava bonus',
          'free spin bonus',
          '2025 deneme bonusu'
        ]}
        canonical={`${window.location.origin}/denemebonusu`}
        ogType="website"
      />
      
      <GamblingSEOEnhancer
        isMoneyPage={true}
        authorName="Casino Bonus Uzmanları"
        lastReviewed={new Date().toISOString()}
      />
      
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <BonusPageTemplate
          pageTitle="Deneme Bonusu Veren Siteler 2025"
          pageDescription="Yatırım yapmadan casino deneyimi! En güncel deneme bonusu kampanyaları, çevrim şartları ve nasıl alınır rehberi. Tüm bonuslar doğrulanmış ve güncel."
          bonusOffers={bonusOffers}
          howToSteps={howToSteps}
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default DenemeBonusu;
