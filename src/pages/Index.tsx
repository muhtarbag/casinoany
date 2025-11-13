import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PixelGrid } from '@/components/PixelGrid';
import { Trophy } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-12 h-12 text-secondary" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              En İyi Bahis Siteleri
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Türkiye'nin en güvenilir ve kazançlı bahis sitelerini keşfedin. 
            Güncel bonuslar ve kampanyalardan yararlanın.
          </p>
        </div>

        <PixelGrid />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
