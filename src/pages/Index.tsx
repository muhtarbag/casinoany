import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { PixelGrid } from '@/components/PixelGrid';
import { GamblingSEOEnhancer } from '@/components/seo/GamblingSEOEnhancer';
import { FeaturedSitesSection } from '@/components/FeaturedSitesSection';
import { ComplaintsShowcase } from '@/components/ComplaintsShowcase';
import { Link } from 'react-router-dom';
import { MobileStickyAd } from '@/components/advertising/MobileStickyAd';
import { useFeaturedSites } from '@/hooks/queries/useBettingSitesQueries';
import { usePageLoadPerformance } from '@/hooks/usePerformanceMonitor';



const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // ⚡ Performance monitoring - dev only
  // usePageLoadPerformance('homepage');

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // Scroll to results after state update
    setTimeout(() => {
      document.getElementById('sites-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // --- CENTRALIZED DATA FETCHING START (Parallel Queries) ---

  // 1. Fetch Featured Sites (Used by Hero & FeaturedSitesSection)
  const { data: featuredSites, isLoading: isFeaturedLoading } = useFeaturedSites(10); // Fetch more to cover both components if needed, or stick to 3-10

  // 2. Fetch CMS Content for Hero
  const { data: cmsContent } = useQuery({
    queryKey: ['hero-cms-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['hero_title', 'hero_description']);

      if (error) {
        return {
          hero_title: 'Türkiye\'nin En Güvenilir Casino ve Bahis Siteleri Karşılaştırma Platformu',
          hero_description: 'Deneme bonusu veren siteler, yüksek oranlar ve güvenilir ödeme yöntemleri ile casino ve bahis sitelerini inceleyin. Uzman değerlendirmelerimiz ile en iyi seçimi yapın.'
        };
      }

      const contentMap: Record<string, string> = {};
      data?.forEach(item => {
        contentMap[item.setting_key] = item.setting_value;
      });

      return {
        hero_title: contentMap['hero_title'] || 'Türkiye\'nin En Güvenilir Casino ve Bahis Siteleri Karşılaştırma Platformu',
        hero_description: contentMap['hero_description'] || 'Deneme bonusu veren siteler, yüksek oranlar ve güvenilir ödeme yöntemleri ile casino ve bahis sitelerini inceleyin. Uzman değerlendirmelerimiz ile en iyi seçimi yapın.'
      };
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  // 3. Fetch Carousel Settings
  const { data: carouselSettings } = useQuery({
    queryKey: ['carousel-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['carousel_animation_type', 'carousel_auto_scroll_duration']);

      if (error) return { animation: 'slide', duration: 2500 };

      const settings = data?.reduce((acc: any, item: any) => {
        if (item.setting_key === 'carousel_animation_type') acc.animation = item.setting_value;
        if (item.setting_key === 'carousel_auto_scroll_duration') acc.duration = parseInt(item.setting_value);
        return acc;
      }, { animation: 'slide', duration: 2500 });

      return settings;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  // 4. Fetch Site Stats (Dependent on featuredSites)
  const featuredIds = featuredSites?.map((site: any) => site.id) || [];
  const { data: siteStats } = useQuery({
    queryKey: ['site-stats', ...featuredIds.sort()],
    queryFn: async () => {
      if (!featuredSites || featuredSites.length === 0) return [];

      const { data: conversions, error } = await supabase
        .from('conversions')
        .select('site_id, conversion_type')
        .in('site_id', featuredIds);

      if (error) throw error;

      const statsMap = new Map();
      featuredIds.forEach((siteId: string) => {
        statsMap.set(siteId, { site_id: siteId, views: 0, clicks: 0 });
      });

      conversions?.forEach(conv => {
        if (!conv.site_id) return;
        const stats = statsMap.get(conv.site_id);
        if (!stats) return;

        if (conv.conversion_type === 'page_view') stats.views++;
        else if (conv.conversion_type === 'affiliate_click') stats.clicks++;
      });

      return Array.from(statsMap.values());
    },
    enabled: !!featuredSites && featuredSites.length > 0,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // --- CENTRALIZED DATA FETCHING END ---

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

  const allStructuredData = [
    breadcrumbSchemaData,
    faqSchemaData
  ];

  return (
    <div className="min-h-screen bg-gradient-dark" style={{ paddingTop: 'calc(4rem + max(env(safe-area-inset-top), 35px))' }}>
      <SEO
        title="En Güvenilir Casino Siteleri 2025 | %500 Bonus | CasinoAny"
        description="2025'in en güvenilir casino sitelerini inceleyin. Topluluk değerlendirmeleri, şikayet ve yorumlar, %500 hoş geldin bonusu. 50+ detaylı casino incelemesi."
        keywords={[
          'casino siteleri',
          'güvenilir casino',
          'casino bonusları',
          'bahis siteleri',
          'deneme bonusu',
          'online casino',
          'canlı casino',
          'slot siteleri',
          'hızlı para çeken casino',
          'çevrimsiz bonus',
          'casino incelemeleri',
          'türkiye casino siteleri',
          'casino siteleri inceleme',
          'casino şikayet',
          'casino yorum',
          'topluluk değerlendirmeleri'
        ]}
        structuredData={allStructuredData}
      />
      <GamblingSEOEnhancer isMoneyPage={true} />
      <Header />

      <main>
        <Hero
          onSearch={handleSearch}
          searchTerm={searchTerm}
          cmsContent={cmsContent}
          carouselSettings={carouselSettings}
          featuredSites={featuredSites?.slice(0, 3)} // Ensure only top 3 go to Hero carousel
          siteStats={siteStats}
        />

        <div id="sites-grid" className="container mx-auto px-4 py-6 md:py-12">
          <PixelGrid searchTerm={searchTerm} />
        </div>

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

          <FeaturedSitesSection
            searchTerm={searchTerm}
            featuredSites={featuredSites?.slice(0, 3)} // Reuse same data, same cache
            isLoading={isFeaturedLoading}
          />

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

        {/* Complaints Showcase Section */}
        <ComplaintsShowcase />
      </main>

      <Footer />

      {/* Mobile Sticky Ad */}
      <MobileStickyAd />
    </div>
  );
};

export default Index;
