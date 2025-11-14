import { SEO } from '@/components/SEO';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PixelGrid } from '@/components/PixelGrid';
import { Hero } from '@/components/Hero';
import { OrganizationSchema, WebSiteSchema, BreadcrumbSchema } from '@/components/StructuredData';
import { GamblingSEOEnhancer } from '@/components/seo/GamblingSEOEnhancer';
import { FeaturedSitesSection } from '@/components/FeaturedSitesSection';
import { SlotBanner } from '@/components/SlotBanner';
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
        title="BahisSiteleri - En İyi Casino ve Bahis Siteleri Karşılaştırma Platformu 2025"
        description="Türkiye'nin en güvenilir casino ve bahis siteleri listesi. Yüksek bonuslar, hızlı ödemeler ve 7/24 destek. 50+ lisanslı casino sitesi karşılaştırması ve detaylı incelemeleri."
        keywords={['casino siteleri', 'bahis siteleri', 'güvenilir casino', 'casino bonusları', 'canlı bahis', 'online casino']}
      />
      <OrganizationSchema />
      <WebSiteSchema />
      <BreadcrumbSchema items={breadcrumbItems} />
      <GamblingSEOEnhancer isMoneyPage={true} />
      <Header />
      
      <main>
        <Hero onSearch={handleSearch} searchTerm="" />
        
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

          {/* Slot Banner Separator */}
          <SlotBanner />

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
        
        <div id="sites-grid" className="container mx-auto px-4 py-6 md:py-12">
          <PixelGrid />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
