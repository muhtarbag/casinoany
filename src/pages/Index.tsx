import { SEO } from '@/components/SEO';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PixelGrid } from '@/components/PixelGrid';
import { Hero } from '@/components/Hero';
import { OrganizationSchema, WebSiteSchema, BreadcrumbSchema, FAQSchema } from '@/components/StructuredData';
import { GamblingSEOEnhancer } from '@/components/seo/GamblingSEOEnhancer';
import { FeaturedSitesSection } from '@/components/FeaturedSitesSection';
import { Link } from 'react-router-dom';

const Index = () => {
  const handleSearch = (term: string) => {
    document.getElementById('sites-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const breadcrumbItems = [
    { name: 'Ana Sayfa', url: window.location.origin }
  ];

  const faqData = [
    {
      question: "Türkiye'nin en güvenilir casino siteleri hangileri?",
      answer: "CasinoAny.com'da lisanslı, yüksek güvenlik standartlarına sahip ve hızlı ödeme yapan 50+ casino sitesini inceleyebilirsiniz. Tüm siteler detaylı analizlerle değerlendirilmiştir."
    },
    {
      question: "Casino bonusları nasıl kullanılır?",
      answer: "Casino bonusları genellikle ilk üyelikte hoş geldin bonusu olarak verilir. Bonus kullanmadan önce çevrim şartlarını mutlaka okuyun. %500'e varan bonuslarımızı karşılaştırabilirsiniz."
    },
    {
      question: "Deneme bonusu veren siteler güvenilir mi?",
      answer: "Evet, CasinoAny.com'da listelenen tüm deneme bonusu veren siteler güvenilir lisanslara sahiptir. Her sitenin detaylı incelemesini yaparak kullanıcılarımıza sunuyoruz."
    },
    {
      question: "Casino sitelerinde para çekme ne kadar sürer?",
      answer: "Güvenilir casino sitelerinde para çekme süresi ortalama 24-48 saat arasındadır. Bazı siteler anlık ödeme de yapabilmektedir. Her sitenin ödeme süresini incelemelerimizde bulabilirsiniz."
    },
    {
      question: "Hangi casino oyunları en çok kazandırır?",
      answer: "RTP (Return to Player) oranı yüksek olan slot oyunları, blackjack ve poker genellikle daha yüksek kazanç şansı sunar. Her sitenin oyun çeşitliliğini ve RTP oranlarını karşılaştırabilirsiniz."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-dark">
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
      />
      <OrganizationSchema />
      <WebSiteSchema />
      <BreadcrumbSchema items={breadcrumbItems} />
      <FAQSchema faqs={faqData} />
      <GamblingSEOEnhancer isMoneyPage={true} />
      <Header />
      
      <main>
        <Hero onSearch={handleSearch} searchTerm="" />
        
        <div id="sites-grid" className="container mx-auto px-4 py-6 md:py-12">
          <PixelGrid />
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
          
          <FeaturedSitesSection />

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
