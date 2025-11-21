import { useState, lazy, Suspense } from 'react';
import { SEO } from '@/components/SEO';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { GamblingSEOEnhancer } from '@/components/seo/GamblingSEOEnhancer';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Link } from 'react-router-dom';

// Lazy load heavy components for better initial load
const PixelGrid = lazy(() => import('@/components/PixelGrid').then(module => ({ default: module.PixelGrid })));
const FeaturedSitesSection = lazy(() => import('@/components/FeaturedSitesSection').then(module => ({ default: module.FeaturedSitesSection })));
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // Scroll to results after state update
    setTimeout(() => {
      document.getElementById('sites-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Fetch featured sites for ItemList schema
  const { data: featuredSitesForSchema } = useQuery({
    queryKey: ['featured-sites-schema'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('name, slug, logo_url, bonus')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('rating', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  const breadcrumbItems = [
    { name: 'Ana Sayfa', url: window.location.origin }
  ];

  const faqData = [
    {
      question: "Türkiye'nin en güvenilir casino siteleri hangileri?",
      answer: "CasinoAny.com'da 50'den fazla lisanslı ve güvenilir casino sitesini detaylı olarak inceleyebilirsiniz. Her site yüksek güvenlik standartlarına sahip olup, Curacao, Malta Gaming Authority veya diğer uluslararası lisanslama kurumları tarafından denetlenmektedir. Platformumuzda her sitenin güvenlik sertifikaları, ödeme yöntemleri, para çekme süreleri ve kullanıcı yorumları detaylı şekilde listelenmiştir. En popüler siteler arasında Fenomenbet, BahisFanatik ve CepBahis bulunmaktadır. Tüm siteler düzenli olarak güvenlik denetimleri ile değerlendirilmekte ve kullanıcı geri bildirimlerine göre puanlanmaktadır."
    },
    {
      question: "Casino bonusları nasıl kullanılır ve nelere dikkat edilmeli?",
      answer: "Casino bonusları genellikle ilk üyelik sırasında hoş geldin bonusu olarak verilir ve hesabınıza otomatik olarak tanımlanır. Bonus kullanmadan önce mutlaka çevrim şartlarını okuyun. Çevrim şartı, bonusu nakite çevirmek için yapmanız gereken bahis miktarını belirtir. Örneğin, 1000 TL bonus ile 20x çevrim şartı varsa, 20.000 TL tutarında bahis yapmanız gerekir. Ayrıca bonus geçerlilik süresi, minimum bahis miktarları ve oyun kısıtlamalarına dikkat edin. Bazı oyunlar çevrim şartına %100 katkı sağlarken, bazıları daha düşük oranlarda katkı sağlar. CasinoAny.com'da her sitenin bonus detaylarını ve çevrim şartlarını karşılaştırarak size en uygun bonusu bulabilirsiniz."
    },
    {
      question: "Deneme bonusu veren siteler güvenilir mi?",
      answer: "Evet, CasinoAny.com'da listelenen tüm deneme bonusu veren siteler güvenilir uluslararası lisanslara sahiptir ve düzenli denetimlere tabidir. Deneme bonusu, sitenin oyun kalitesini ve hizmetlerini risk almadan test etmenizi sağlayan özel bir promosyondur. Ancak her deneme bonusu aynı değildir. Bazı siteler çevrim şartı olmayan (çevrimsiz) bonuslar sunarken, diğerleri belirli çevrim şartları ile birlikte gelir. Deneme bonusu alırken sitenin lisans bilgilerini, kullanıcı yorumlarını ve ödeme geçmişini mutlaka kontrol edin. CasinoAny.com'da her site için kapsamlı güvenlik analizi ve kullanıcı değerlendirmeleri bulabilirsiniz. En güvenilir deneme bonusu veren siteler arasında lisanslı ve yıllardır faaliyet gösteren operatörler bulunmaktadır."
    },
    {
      question: "Casino sitelerinde para çekme işlemi ne kadar sürer?",
      answer: "Güvenilir casino sitelerinde para çekme süresi genellikle 24-48 saat arasında değişmektedir, ancak bu süre kullandığınız ödeme yöntemine ve sitenin işlem hızına göre farklılık gösterebilir. Papara ve Cepbank gibi hızlı ödeme yöntemleri ile bazı siteler anlık para çekme imkanı sunmaktadır. Banka havalesi (EFT) ile para çekme işlemleri genellikle 2-3 iş günü sürerken, kredi kartına iade işlemleri 5-7 iş günü arasında tamamlanabilir. Para çekme hızını etkileyen faktörler arasında hesap doğrulama durumu, çekilecek miktar ve sitenin günlük para çekme limitleri bulunur. İlk para çekme işleminizde kimlik doğrulama belgelerini (kimlik, adres belgesi) hazırlamanız işlemi hızlandıracaktır. CasinoAny.com'da her sitenin ortalama para çekme süreleri ve kullanıcı deneyimleri detaylı olarak listelenmiştir."
    },
    {
      question: "Hangi casino oyunları en çok kazandırır ve RTP oranı nedir?",
      answer: "RTP (Return to Player) oranı, bir casino oyununun uzun vadede oyunculara geri ödeme yüzdesidir ve oyun seçiminde en önemli faktörlerden biridir. Genel olarak blackjack %99.5, video poker %99.5, baccarat %98.9 ve belirli slot oyunları %96-98 RTP oranına sahiptir. RTP oranı yüksek olan oyunlar teorik olarak daha fazla kazanç şansı sunar. Ancak RTP uzun vadeli bir istatistiktir ve kısa vadede şans faktörü önemlidir. Slot oyunlarında yüksek RTP'ye sahip popüler oyunlar arasında Blood Suckers (%98), Mega Joker (%99) ve Jackpot 6000 (%98.8) bulunmaktadır. Strateji gerektiren oyunlar (blackjack, poker) doğru oynandiğında daha yüksek kazanç şansı sağlar. CasinoAny.com'da her sitenin oyun çeşitliliğini, RTP oranlarını ve jackpot tutarlarını karşılaştırarak size en uygun oyunları bulabilirsiniz. Sorumlu oyun ilkelerine uygun olarak bütçenizi belirleyin ve kayıplarınızı takip edin."
    }
  ];

  // Create ItemList structured data - REMOVED to prevent duplication
  // Google was detecting multiple ItemList schemas which caused validation errors
  const itemListData = null;

  const faqSchemaData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  const breadcrumbSchemaData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };

  // Combine all structured data
  const allStructuredData = [
    breadcrumbSchemaData,
    faqSchemaData,
    ...(itemListData ? [itemListData] : [])
  ];

  return (
    <div className="min-h-screen bg-gradient-dark pt-16 md:pt-[72px]">
      <SEO
        title="Güvenilir Casino Siteleri 2025 | %500 Bonus"
        description="Türkiye'nin en güvenilir casino sitelerini karşılaştırın. %500'e varan hoş geldin bonusları, hızlı para çekme garantisi. 50+ lisanslı casino incelemesi. Slot, rulet, canlı casino oyunları."
        keywords={[
          'casino siteleri',
          'güvenilir casino',
          'casino bonusları',
          'canlı casino',
          'slot siteleri',
          'bahis siteleri',
          'deneme bonusu',
          'çevrimsiz bonus',
          'hızlı para çeken casino',
          'online casino türkiye',
          'casino incelemeleri'
        ]}
        structuredData={allStructuredData}
      />
      <GamblingSEOEnhancer isMoneyPage={true} />
      <Header />
      
      <main>
        <Hero onSearch={handleSearch} searchTerm={searchTerm} />
        
        <Suspense fallback={
          <div className="container mx-auto px-4 py-12 flex justify-center">
            <LoadingSpinner size="lg" text="Casino siteleri yükleniyor..." />
          </div>
        }>
          <div id="sites-grid" className="container mx-auto px-4 py-6 md:py-12">
            <PixelGrid searchTerm={searchTerm} />
          </div>
        </Suspense>

        {/* Featured Casino Reviews Section */}
        <section className="container mx-auto px-4 py-8 md:py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Öne Çıkan Casino İncelemeleri
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Uzman ekibimiz tarafından hazırlanan kapsamlı casino incelemeleri. 
              Bonus şartları, ödeme süreleri ve kullanıcı deneyimleri.
            </p>
          </div>
        
        <Suspense fallback={
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="İncelemeler yükleniyor..." />
          </div>
        }>
          <FeaturedSitesSection searchTerm={searchTerm} />
        </Suspense>

          {/* Bonus CTA */}
          <div className="text-center mt-8">
            <Link 
              to="/deneme-bonusu"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <span>🎁</span>
              <span>Deneme Bonusu Veren Siteleri Keşfet</span>
              <span>→</span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
