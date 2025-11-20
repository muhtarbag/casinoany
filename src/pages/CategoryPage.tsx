import { useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Helmet } from 'react-helmet-async';
import { LoadingState } from '@/components/ui/loading-state';
import { useCategory } from '@/hooks/queries/useCategoryQueries';
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
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import SiteDetail from './SiteDetail';

interface CategorySite {
  id: string;
  site_id: string;
  display_order: number;
  betting_sites: any;
}

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  
  // First check if this slug belongs to a site
  const { data: site, isLoading: siteLoading } = useQuery({
    queryKey: ['site-check', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('id, slug, is_active, owner_id')
        .eq('slug', slug)
        .maybeSingle();
      
      if (error) throw error;
      
      // If site exists but not active, check if current user is owner
      if (data && !data.is_active) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.id !== data.owner_id) {
          return null; // Hide inactive site from non-owners
        }
      }
      
      return data;
    },
    enabled: !!slug,
  });

  const { data: category, isLoading: categoryLoading } = useCategory(slug || '');

  // Fetch category-specific sites
  const { data: categorySites, isLoading: sitesLoading } = useQuery({
    queryKey: ['category-sites-frontend', category?.id],
    queryFn: async () => {
      if (!category?.id) return [];
      const { data, error } = await supabase
        .from('site_categories')
        .select(`
          id,
          site_id,
          display_order,
          betting_sites:site_id (*)
        `)
        .eq('category_id', category.id)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as CategorySite[];
    },
    enabled: !!category?.id,
  });

  // If it's a site, render SiteDetail
  if (site) {
    return <SiteDetail />;
  }

  if (siteLoading || categoryLoading) return <LoadingState variant="skeleton" rows={8} />;
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

          {!sitesLoading && categorySites && categorySites.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-3xl font-bold text-center">Önerilen Siteler</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {categorySites.map((item) => {
                  const site = item.betting_sites;
                  return (
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
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
