import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { useCategoryWithRelations } from '@/hooks/queries/useCategoryQueries';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Breadcrumb } from '@/components/Breadcrumb';
import { CategoryHero } from '@/components/categories/CategoryHero';
import { CategorySiteGrid } from '@/components/categories/CategorySiteGrid';
import { CategoryBlogSection } from '@/components/categories/CategoryBlogSection';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import NotFound from './NotFound';

export default function CategoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: category, isLoading, error } = useCategoryWithRelations(slug || '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !category) {
    return <NotFound />;
  }

  const seoTitle = category.meta_title || `${category.name} | En İyi Bahis Siteleri`;
  const seoDescription =
    category.meta_description ||
    category.description ||
    `${category.name} kategorisindeki en iyi bahis sitelerini keşfedin.`;

  return (
    <div className="min-h-screen bg-gradient-dark flex flex-col">
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonical={`/kategori/${category.slug}`}
      />

      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { label: 'Ana Sayfa', href: '/' },
            { label: 'Kategoriler', href: '/kategoriler' },
            { label: category.name },
          ]}
        />

        {/* Hero Section */}
        <CategoryHero category={category} />

        {/* Sites Grid */}
        {category.sites && category.sites.length > 0 && (
          <CategorySiteGrid
            sites={category.sites}
            categoryName={category.name}
          />
        )}

        {/* Blog Section */}
        {category.blogs && category.blogs.length > 0 && (
          <CategoryBlogSection
            blogs={category.blogs}
            categoryName={category.name}
            categorySlug={category.slug}
          />
        )}

        {/* Empty State - İyileştirilmiş */}
        {(!category.sites || category.sites.length === 0) &&
          (!category.blogs || category.blogs.length === 0) && (
            <div className="text-center py-20 animate-fade-in">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                  <LucideIcons.FolderOpen className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold">Henüz İçerik Yok</h3>
                <p className="text-muted-foreground">
                  Bu kategoride henüz site veya blog içeriği bulunmamaktadır.
                </p>
                <Link to="/kategoriler">
                  <Button className="mt-4">
                    Diğer Kategorilere Göz At
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
      </main>

      <Footer />
    </div>
  );
}
