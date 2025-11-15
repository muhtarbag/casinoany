import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { useCategories } from '@/hooks/queries/useCategoryQueries';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { Breadcrumb } from '@/components/Breadcrumb';
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
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Bahis Siteleri Kategorileri
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            İhtiyacınıza uygun bahis sitelerini kategorilere göre keşfedin
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

        {/* Bottom CTA */}
        <div className="mt-16 text-center space-y-4">
          <h2 className="text-2xl font-bold">Tüm Siteleri Görüntüle</h2>
          <p className="text-muted-foreground">
            Kategorilere göre filtrelemek yerine tüm bahis sitelerini görüntülemek ister misiniz?
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Tüm Siteleri Gör
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
