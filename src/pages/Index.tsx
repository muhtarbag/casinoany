import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PixelGrid } from '@/components/PixelGrid';
import { Hero } from '@/components/Hero';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />
      
      <main>
        <Hero onSearch={setSearchTerm} searchTerm={searchTerm} />
        
        <div id="sites-grid" className="container mx-auto px-4 py-12">
          <PixelGrid initialSearchTerm={searchTerm} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
