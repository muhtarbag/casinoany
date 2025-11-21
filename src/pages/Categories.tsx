import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { useCategories } from '@/hooks/queries/useCategoryQueries';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, TrendingUp, Grid3x3 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Categories() {
  const { data: categories, isLoading } = useCategories({ isActive: true });

  return (
    <div className="min-h-screen bg-gradient-dark flex flex-col pt-[72px] md:pt-[84px]">
      <SEO
        title="Kategoriler | En İyi Bahis Siteleri"
        description="Bahis sitelerini kategorilere göre keşfedin. Deneme bonusu, free spin, spor bahisleri, kripto siteler ve daha fazlası."
        canonical="/kategoriler"
      />

      <Header />

      <main className="flex-1">
        {/* Hero Section - World Class Design */}
        <div className="relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          
          {/* Decorative Grid */}
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
          
          {/* Content */}
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="py-12 sm:py-16 lg:py-20">
              <Breadcrumb
                items={[
                  { label: 'Ana Sayfa', href: '/' },
                  { label: 'Kategoriler' },
                ]}
              />

              {/* Hero Content */}
              <div className="text-center space-y-6 max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm text-primary text-sm font-medium mb-6">
                    <Grid3x3 className="w-4 h-4" />
                    <span>Kategorilere Göre Keşfet</span>
                  </div>
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-4xl sm:text-5xl lg:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent leading-[1.1] tracking-tight"
                >
                  Bahis Siteleri
                  <br />
                  <span className="text-foreground">Kategorileri</span>
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                >
                  İhtiyacınıza özel bahis sitelerini kategorilere göre keşfedin. 
                  En iyi bonuslar, canlı casino deneyimleri ve spor bahisleri bir arada.
                </motion.p>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-wrap items-center justify-center gap-6 pt-4"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">{categories?.length || 0}</span> Kategori
                    </span>
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Güncel İçerik</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12 sm:py-16 lg:py-20">

          {/* Categories Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[500px]">
              <LoadingSpinner />
            </div>
          ) : categories && categories.length > 0 ? (
            <>
              {/* Section Header */}
              <div className="flex items-center justify-between mb-8 sm:mb-12">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                    Tüm Kategoriler
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Size en uygun kategoriyi seçin ve keşfetmeye başlayın
                  </p>
                </div>
              </div>

              {/* Grid */}
              <div className="grid gap-5 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.4,
                      delay: index * 0.05,
                      ease: [0.21, 0.45, 0.27, 0.9]
                    }}
                  >
                    <CategoryCard category={category} />
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Grid3x3 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Kategori Bulunamadı</h3>
              <p className="text-muted-foreground">Henüz kategori bulunmamaktadır.</p>
            </div>
          )}

          {/* Bottom CTA - World Class Design */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 sm:mt-20 lg:mt-24 relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 backdrop-blur-sm"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]" />
            
            {/* Content */}
            <div className="relative text-center space-y-6 p-8 sm:p-12 lg:p-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-medium backdrop-blur-sm">
                <Sparkles className="w-4 h-4" />
                <span>Tüm Siteler</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
                Tüm Siteleri Keşfet
              </h2>
              
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Kategorilere göre filtrelemek yerine tüm bahis sitelerini tek bir yerde görüntüleyin ve karşılaştırın.
              </p>
              
              <div className="pt-4">
                <a href="/">
                  <Button 
                    size="lg" 
                    className="h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all hover:scale-105 group"
                  >
                    Tüm Siteleri Görüntüle
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
