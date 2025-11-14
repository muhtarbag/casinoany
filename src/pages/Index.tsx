import { SEO } from '@/components/SEO';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PixelGrid } from '@/components/PixelGrid';
import { Hero } from '@/components/Hero';
import { OrganizationSchema, WebSiteSchema, BreadcrumbSchema } from '@/components/StructuredData';
import { GamblingSEOEnhancer } from '@/components/seo/GamblingSEOEnhancer';

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
              Detaylı Casino İncelemeleri
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Uzman ekibimiz tarafından hazırlanan kapsamlı casino incelemeleri. 
              Bonus şartları, ödeme süreleri ve kullanıcı deneyimleri.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <a 
              href="/betist-inceleme"
              className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-2xl font-bold">B</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                    Betist İnceleme
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    ⭐ 4.8/5.0 • 1,547 değerlendirme
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                10.000 TL hoşgeldin bonusu, hızlı ödemeler ve 5000+ oyun ile Türkiye'nin en popüler casino sitelerinden biri.
              </p>
              <span className="text-primary text-sm font-semibold group-hover:underline">
                Detaylı İncelemeyi Oku →
              </span>
            </a>

            <a 
              href="/bets10-inceleme"
              className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-2xl font-bold">B10</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                    Bets10 İnceleme
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    ⭐ 4.7/5.0 • 2,134 değerlendirme
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                15.000 TL hoşgeldin bonusu ve 200 free spin. Hem casino hem spor bahisleri için ideal platform.
              </p>
              <span className="text-primary text-sm font-semibold group-hover:underline">
                Detaylı İncelemeyi Oku →
              </span>
            </a>

            <a 
              href="/mobilbahis-inceleme"
              className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-2xl font-bold">M</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                    Mobilbahis İnceleme
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    ⭐ 4.6/5.0 • 1,823 değerlendirme
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Mobil-first tasarım, hızlı işlemler ve Telegram desteği ile genç oyunculara hitap eden platform.
              </p>
              <span className="text-primary text-sm font-semibold group-hover:underline">
                Detaylı İncelemeyi Oku →
              </span>
            </a>
          </div>

          {/* Bonus CTA */}
          <div className="text-center">
            <a 
              href="/deneme-bonusu"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <span>🎁</span>
              <span>Deneme Bonusu Veren Siteleri Keşfet</span>
              <span>→</span>
            </a>
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
