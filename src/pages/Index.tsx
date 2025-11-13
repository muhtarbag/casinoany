import { useState } from 'react';
import { SEO } from '@/components/SEO';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PixelGrid } from '@/components/PixelGrid';
import { Hero } from '@/components/Hero';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-gradient-dark">
      <SEO
        title="En İyi Bahis Siteleri - Güvenilir ve Lisanslı Bahis Siteleri 2025"
        description="Türkiye'nin en güvenilir bahis siteleri listesi. Yüksek bonuslar, hızlı ödemeler ve 7/24 destek. 50+ lisanslı bahis sitesi karşılaştırması ve detaylı incelemeleri."
        keywords={['bahis siteleri', 'güvenilir bahis siteleri', 'casino siteleri', 'bahis bonusları', 'canlı bahis']}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'BahisSiteleri',
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
        <Hero onSearch={setSearchTerm} searchTerm={searchTerm} />
        
        <div id="sites-grid" className="container mx-auto px-4 py-6 md:py-12">
          <PixelGrid initialSearchTerm={searchTerm} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
