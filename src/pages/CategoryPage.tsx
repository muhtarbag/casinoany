import { useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Helmet } from 'react-helmet-async';
import { LoadingState } from '@/components/ui/loading-state';
import { useCategory } from '@/hooks/queries/useCategoryQueries';
import { useSites } from '@/hooks/queries/useSiteQueries';
import { BettingSiteCard } from '@/components/BettingSiteCard';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Link } from 'react-router-dom';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: category, isLoading: categoryLoading } = useCategory(slug || '');
  const { data: sites, isLoading: sitesLoading } = useSites();

  if (categoryLoading) return <LoadingState variant="skeleton" rows={8} />;
  if (!category) return <div className="min-h-screen flex items-center justify-center">Kategori bulunamadı</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{category.meta_title || category.name}</title>
        <meta name="description" content={category.meta_description || category.description || ''} />
      </Helmet>
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Ana Sayfa</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{category.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mt-8 space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">{category.name}</h1>
            {category.description && (
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                {category.description}
              </p>
            )}
          </div>

          {category.content && (
            <div 
              className="prose prose-lg max-w-none dark:prose-invert mx-auto"
              dangerouslySetInnerHTML={{ __html: category.content }}
            />
          )}

          {!sitesLoading && sites && sites.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-3xl font-bold text-center">Önerilen Siteler</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sites.slice(0, 6).map((site) => (
                  <BettingSiteCard
                    key={site.id}
                    id={site.id}
                    slug={site.slug}
                    name={site.name}
                    logo={site.logo_url}
                    rating={site.rating}
                    bonus={site.bonus}
                    features={site.features}
                    affiliateUrl={site.affiliate_link}
                    email={site.email}
                    whatsapp={site.whatsapp}
                    telegram={site.telegram}
                    twitter={site.twitter}
                    instagram={site.instagram}
                    facebook={site.facebook}
                    youtube={site.youtube}
                    views={0}
                    clicks={0}
                    reviewCount={site.review_count || 0}
                    avgRating={site.avg_rating || 0}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
