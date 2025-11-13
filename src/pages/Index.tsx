import { SEO } from '@/components/SEO';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PixelGrid } from '@/components/PixelGrid';
import { Hero } from '@/components/Hero';

const Index = () => {
  const handleSearch = (term: string) => {
    document.getElementById('sites-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <SEO
        title="CasinoAny.com - En İyi Casino ve Bahis Siteleri Karşılaştırma Platformu 2025"
        description="Türkiye'nin en güvenilir casino ve bahis siteleri listesi. Yüksek bonuslar, hızlı ödemeler ve 7/24 destek. 50+ lisanslı casino sitesi karşılaştırması ve detaylı incelemeleri."
        keywords={['casino siteleri', 'bahis siteleri', 'güvenilir casino', 'casino bonusları', 'canlı bahis', 'online casino']}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'CasinoAny.com',
          url: window.location.origin,
          potentialAction: {
            '@type': 'SearchAction',
            target: `${window.location.origin}/?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        }}
      />
      <Header />
      
      <main>
        <Hero onSearch={handleSearch} searchTerm="" />
        
        <div id="sites-grid" className="container mx-auto px-4 py-6 md:py-12">
          <PixelGrid />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
