import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-dark">
      <SEO
        title="Sayfa Bulunamadı - 404 | CasinoAny.com"
        description="Aradığınız sayfa bulunamadı. Ana sayfaya dönün veya casino ve bahis siteleri arasında arama yapın."
        keywords={['404', 'sayfa bulunamadı', 'casino siteleri', 'bahis siteleri']}
      />
      
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center max-w-2xl">
            <div className="mb-8">
              <h1 className="text-9xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
                404
              </h1>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Sayfa Bulunamadı</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gap-2">
                <a href="/">
                  <Home className="w-5 h-5" />
                  Ana Sayfaya Dön
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <a href="/casino-siteleri">
                  <Search className="w-5 h-5" />
                  Casino Siteleri
                </a>
              </Button>
            </div>
            
            <div className="mt-12 pt-8 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-4">
                Popüler Sayfalar:
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <a href="/spor-bahisleri" className="text-sm text-primary hover:underline">
                  Spor Bahisleri
                </a>
                <span className="text-muted-foreground">•</span>
                <a href="/canli-casino" className="text-sm text-primary hover:underline">
                  Canlı Casino
                </a>
                <span className="text-muted-foreground">•</span>
                <a href="/mobil-bahis" className="text-sm text-primary hover:underline">
                  Mobil Bahis
                </a>
                <span className="text-muted-foreground">•</span>
                <a href="/bonus-kampanyalari" className="text-sm text-primary hover:underline">
                  Bonus Kampanyaları
                </a>
                <span className="text-muted-foreground">•</span>
                <a href="/blog" className="text-sm text-primary hover:underline">
                  Blog
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
