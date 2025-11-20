import { useEffect, useRef, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Calendar, Eye, ArrowLeft, ExternalLink } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Helmet } from "react-helmet-async";
import { useNewsArticle, useIncrementNewsView } from "@/hooks/queries/useNewsQueries";
import { BreadcrumbSchema } from "@/components/StructuredData";
import { useInternalLinks, applyInternalLinks, trackLinkClick } from '@/hooks/useInternalLinking';

export default function NewsDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading } = useNewsArticle(slug || "");
  const incrementView = useIncrementNewsView();
  const viewTrackedRef = useRef(false);

  // Fetch AI-suggested internal links
  const { data: internalLinks } = useInternalLinks(
    article?.slug ? `/news/${article.slug}` : '',
    !!article?.slug
  );

  // Enrich content with internal links
  const enrichedContent = useMemo(() => {
    const rawContent = article?.content_html || article?.content || '';
    if (!rawContent) return '';
    if (!internalLinks || internalLinks.length === 0) {
      return rawContent;
    }
    return applyInternalLinks(rawContent, internalLinks);
  }, [article?.content_html, article?.content, internalLinks]);

  useEffect(() => {
    if (article?.id && !viewTrackedRef.current) {
      incrementView.mutate(article.id);
      viewTrackedRef.current = true;
    }
  }, [article?.id, incrementView]);

  // Track internal link clicks
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('internal-link')) {
        const linkId = target.getAttribute('data-link-id');
        if (linkId) {
          trackLinkClick(linkId);
        }
      }
    };
    
    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-[72px] md:pt-[84px]">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-96 mb-8" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-[72px] md:pt-[84px]">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Haber bulunamadı</h1>
          <Link to="/haberler">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Haberlere Dön
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={article.meta_title || article.title}
        description={article.meta_description || article.excerpt || ""}
        keywords={article.tags || []}
        ogType="article"
        ogImageAlt={article.title}
        article={{
          publishedTime: article.published_at,
          modifiedTime: article.updated_at,
          tags: article.tags,
        }}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          headline: article.title,
          description: article.excerpt || article.meta_description,
          datePublished: article.published_at,
          dateModified: article.updated_at,
          author: {
            '@type': 'Organization',
            name: 'CasinoAny.com',
          },
          publisher: {
            '@type': 'Organization',
            name: 'CasinoAny.com',
            logo: {
              '@type': 'ImageObject',
              url: `${window.location.origin}/logo.png`,
            },
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${window.location.origin}/news/${article.slug}`,
          },
        }}
      />
      <Helmet>
        <link rel="canonical" href={`${window.location.origin}/news/${article.slug}`} />
      </Helmet>
      
      {/* Breadcrumb Schema */}
      <BreadcrumbSchema items={[
        { name: 'Ana Sayfa', url: window.location.origin },
        { name: 'Haberler', url: `${window.location.origin}/news` },
        { name: article.title, url: `${window.location.origin}/news/${article.slug}` }
      ]} />

      <article className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-[72px] md:pt-[84px]">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Link to="/haberler">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Haberlere Dön
            </Button>
          </Link>

          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="secondary" className="text-sm">
                {article.category}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Eye className="w-4 h-4" />
                {article.view_count}
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                {article.excerpt}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {format(new Date(article.published_at), "d MMMM yyyy, HH:mm", { locale: tr })}
              </div>
            </div>
          </header>

          <div
            className="prose prose-lg max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: enrichedContent }}
          />

          {article.tags && article.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Etiketler</h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-6">
            <a
              href={article.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Orijinal Kaynak
            </a>
          </div>
        </div>
      </article>
    </>
  );
}