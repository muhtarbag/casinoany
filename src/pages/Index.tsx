import { SEO } from '@/components/SEO';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PixelGrid } from '@/components/PixelGrid';
import { Hero } from '@/components/Hero';
import { OrganizationSchema, WebSiteSchema, BreadcrumbSchema } from '@/components/StructuredData';
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
