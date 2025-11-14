import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BonusPageTemplate } from '@/components/templates/BonusPageTemplate';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { GamblingSEOEnhancer } from '@/components/seo/GamblingSEOEnhancer';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const DenemeBonusu = () => {
  // Fetch bonus offers from database
  const { data: bonusData, isLoading } = useQuery({
    queryKey: ['bonus-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bonus_offers')
        .select('*, betting_sites(name, logo_url, slug, rating, affiliate_link)')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const bonusOffers = bonusData?.map((offer: any) => ({
    id: offer.id,
    casino: {
      name: offer.betting_sites.name,
      slug: offer.betting_sites.slug,
      logo: offer.betting_sites.logo_url,
      rating: offer.betting_sites.rating
    },
    bonusType: 'nodeposit' as const,
    title: offer.title,
    amount: offer.bonus_amount,
    wageringRequirement: offer.wagering_requirement || 'Belirtilmemiş',
    validUntil: offer.validity_period || '2025-12-31T23:59:59Z',
    bonusCode: '',
    terms: offer.terms ? offer.terms.split('\n') : [],
    eligibility: offer.eligibility ? offer.eligibility.split(',').map((e: string) => e.trim()) : [],
    affiliateLink: offer.betting_sites.affiliate_link
  })) || [];

  const howToSteps = [
    {
      name: "Casino Sitesini Seçin",
      text: "Yukarıdaki listeden size en uygun casino sitesini belirleyin. Her casino farklı bonus miktarı ve şartlar sunmaktadır."
    },
    {
      name: "Üye Olun",
      text: "Seçtiğiniz casino sitesine giriş yapın ve üye ol butonuna tıklayın. Kişisel bilgilerinizi doğru girdiğinizden emin olun."
    },
    {
      name: "Hesabınızı Doğrulayın",
      text: "Email veya SMS ile gelen doğrulama kodunu girerek hesabınızı aktif edin. Bazı siteler kimlik doğrulaması isteyebilir."
    },
    {
      name: "Bonusu Talep Edin",
      text: "Müşteri hizmetlerine başvurun veya promosyonlar bölümünden deneme bonusunu talep edin. Bonus kodu varsa onu kullanın."
    },
    {
      name: "Çevrim Şartını Tamamlayın",
      text: "Bonusu kullanmaya başlayın ve belirtilen çevrim şartını yerine getirin. Çevrim tamamlandığında kazancınızı çekebilirsiniz."
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Deneme Bonusu Veren Siteler 2025 - Yatırımsız Bedava Bonus Kampanyaları"
        description="2025'in en güncel deneme bonusu veren casino siteleri listesi. Yatırımsız bedava bonus kampanyaları ve free spin fırsatları. Hemen bonus kazan!"
        keywords={[
          'deneme bonusu',
          'yatırımsız bonus',
          'bedava bonus',
          'casino deneme bonusu',
          'free spin',
          'deneme bonusu veren siteler',
          'hoş geldin bonusu'
        ]}
      />
      <GamblingSEOEnhancer />
      <Header />
      <BonusPageTemplate 
        pageTitle="Deneme Bonusu Veren Siteler 2025"
        pageDescription="2025'in en güncel deneme bonusu kampanyaları"
        bonusOffers={bonusOffers}
        howToSteps={howToSteps}
      />
      <Footer />
    </>
  );
};

export default DenemeBonusu;
