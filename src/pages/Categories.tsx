import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { useCategories } from '@/hooks/queries/useCategoryQueries';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

export default function Categories() {
  const { data: categories, isLoading } = useCategories({ isActive: true });

  return (
    <div className="min-h-screen bg-gradient-dark flex flex-col">
      <SEO
        title="Kategoriler | En İyi Bahis Siteleri"
        description="Bahis sitelerini kategorilere göre keşfedin. Deneme bonusu, free spin, spor bahisleri, kripto siteler ve daha fazlası."
        canonical="/kategoriler"
      />

      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { label: 'Ana Sayfa', href: '/' },
            { label: 'Kategoriler' },
          ]}
        />

        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <LucideIcons.Sparkles className="w-4 h-4" />
            <span>Kategoriler</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent leading-tight">
            Bahis Siteleri Kategorileri
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            İhtiyacınıza uygun bahis sitelerini kategorilere göre keşfedin. 
            Deneme bonusu, canlı casino, spor bahisleri ve daha fazlası.
          </p>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner />
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
            {categories.map((category, index) => (
              <div 
                key={category.id}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
                className="animate-scale-in"
              >
                <CategoryCard category={category} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Henüz kategori bulunmamaktadır.</p>
          </div>
        )}

        {/* Bottom CTA - İyileştirilmiş */}
        <div className="mt-20 text-center space-y-6 p-8 md:p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium mb-2">
            <LucideIcons.TrendingUp className="w-4 h-4" />
            <span>Tüm Siteler</span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold">Tüm Siteleri Keşfet</h2>
          
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Kategorilere göre filtrelemek yerine tüm bahis sitelerini tek bir yerde görüntüleyin.
          </p>
          
          <a href="/">
            <Button size="lg" className="shadow-xl hover:shadow-2xl transition-all">
              Tüm Siteleri Görüntüle
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
