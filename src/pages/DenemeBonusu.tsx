import { BonusPageTemplate } from '@/components/templates/BonusPageTemplate';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { GamblingSEOEnhancer } from '@/components/seo/GamblingSEOEnhancer';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const DenemeBonusu = () => {
  // Fetch bonus offers from database
  const { data: bonusOffers, isLoading } = useQuery({
    queryKey: ['bonus-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bonus_offers')
        .select('*, betting_sites!inner(name, logo_url, slug, rating, affiliate_link)')
        .eq('is_active', true)
        .eq('bonus_type', 'no_deposit')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      
      // Transform data to match BonusPageTemplate interface
      return data.map((bonus: any) => ({
        id: bonus.id,
        casino: {
          name: bonus.betting_sites.name,
          slug: bonus.betting_sites.slug,
          logo: bonus.betting_sites.logo_url,
          rating: bonus.betting_sites.rating || 4.5
        },
        bonusType: 'nodeposit' as const,
        title: bonus.title,
        amount: bonus.bonus_amount,
        wageringRequirement: bonus.wagering_requirement || 'Belirtilmemiş',
        validUntil: bonus.validity_period || '2025-12-31T23:59:59Z',
        bonusCode: bonus.bonus_code,
        terms: bonus.terms ? bonus.terms.split('\n').filter((t: string) => t.trim()) : [],
        eligibility: bonus.eligibility ? bonus.eligibility.split(',').map((e: string) => e.trim()) : [],
        affiliateLink: bonus.betting_sites.affiliate_link
      }));
    },
  });

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center pt-[72px] md:pt-[84px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </>
    );
  }

  const howToSteps = [
    {
      name: 'Siteye Kayıt Ol',
      text: 'Bonus veren sitelerden birine giderek yeni üyelik oluşturun. Kişisel bilgilerinizi doğru ve eksiksiz doldurun.',
      image: '/images/kayit-ol.jpg'
    },
    {
      name: 'Bonus Kodunu Kullan',
      text: 'Kayıt formunda veya hesap ayarlarında bonus kodu bölümüne ilgili kodu girin.',
      image: '/images/bonus-kodu.jpg'
    },
    {
      name: 'Hesabını Doğrula',
      text: 'Email veya SMS ile gelen doğrulama linkine tıklayarak hesabınızı aktif edin.',
      image: '/images/dogrulama.jpg'
    },
    {
      name: 'Bonusu Al ve Oyna',
      text: 'Bonus hesabınıza otomatik yüklenecektir. Artık bonusunuzla oyunlara başlayabilirsiniz!',
      image: '/images/bonus-al.jpg'
    }
  ];

  return (
    <>
      <SEO
        title="Deneme Bonusu Veren Siteler 2025 - Yatırımsız Bedava Bonus Kampanyaları"
        description="2025'in en güncel deneme bonusu veren siteler listesi. Yatırımsız bedava bonus kampanyaları, çevrim şartları ve bonus kodları. %100 güvenilir siteler."
        keywords={[
          'deneme bonusu',
          'deneme bonusu veren siteler',
          'yatırımsız bonus',
          'bedava bonus',
          'deneme bonusu 2025',
          'çevrimsiz bonus',
          'bonus kampanyaları',
          'casino bonusları'
        ]}
        ogImage="/og-deneme-bonusu.jpg"
        canonical="https://casinoany.com/deneme-bonusu"
      />

      <Header />
      <main className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background pt-16 md:pt-[72px]">
        <BonusPageTemplate
          pageTitle="🎁 Deneme Bonusu Veren Siteler 2025"
          pageDescription="En yüksek deneme bonusu kampanyalarını karşılaştırın. Yatırım yapmadan bedava bonus kazanın! Güncel bonus kodları ve çevrim şartları ile."
          bonusOffers={bonusOffers || []}
          howToSteps={howToSteps}
        />
      </main>
      <Footer />
    </>
  );
};

export default DenemeBonusu;
