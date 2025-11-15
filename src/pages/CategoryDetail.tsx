import { useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { useCategoryWithRelations } from '@/hooks/queries/useCategoryQueries';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Breadcrumb } from '@/components/Breadcrumb';
import { CategoryHero } from '@/components/categories/CategoryHero';
import { CategorySiteGrid } from '@/components/categories/CategorySiteGrid';
import { CategoryBlogSection } from '@/components/categories/CategoryBlogSection';
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

        {/* Empty State */}
        {(!category.sites || category.sites.length === 0) &&
          (!category.blogs || category.blogs.length === 0) && (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">
                Bu kategoride henüz içerik bulunmamaktadır.
              </p>
              <a
                href="/kategoriler"
                className="inline-block mt-4 text-primary hover:underline"
              >
                Diğer kategorilere göz atın
              </a>
            </div>
          )}
      </main>

      <Footer />
    </div>
  );
}
