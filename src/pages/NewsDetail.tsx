import { useEffect, useRef, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Calendar, Eye, ArrowLeft, ExternalLink, Clock } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Helmet } from "react-helmet-async";
import { useNewsArticle, useIncrementNewsView } from "@/hooks/queries/useNewsQueries";
import { BreadcrumbSchema } from "@/components/StructuredData";
import { useInternalLinks, applyInternalLinks, trackLinkClick } from '@/hooks/useInternalLinking';
import { calculateReadingTime, formatReadingTime } from '@/lib/readingTime';
import { RelatedNews } from '@/components/news/RelatedNews';
import { NewsImageSchema } from '@/components/news/NewsImageSchema';
import DOMPurify from 'dompurify';

export default function NewsDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading } = useNewsArticle(slug || "");
  const incrementView = useIncrementNewsView();
  const viewTrackedRef = useRef(false);

  // Fetch AI-suggested internal links
  const { data: internalLinks } = useInternalLinks(
    article?.slug ? `/haber/${article.slug}` : '',
    !!article?.slug
  );

  // Enrich content with internal links and sanitize
  const enrichedContent = useMemo(() => {
    const rawContent = article?.content_html || article?.content || '';
    if (!rawContent) return '';
    
    // First apply internal links
    const contentWithLinks = (internalLinks && internalLinks.length > 0) 
      ? applyInternalLinks(rawContent, internalLinks)
      : rawContent;
    
    // 🛡️ XSS Protection: Sanitize HTML content
    return DOMPurify.sanitize(contentWithLinks, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'blockquote', 'img'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'src', 'alt', 'data-link-id']
    });
  }, [article?.content_html, article?.content, internalLinks]);

  // Calculate reading time
  const readingTime = useMemo(() => {
    const content = article?.content || article?.content_html || '';
    return calculateReadingTime(content);
  }, [article?.content, article?.content_html]);

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
        ogImage={article.featured_image || article.og_image}
        ogImageAlt={article.featured_image_alt || article.title}
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
          image: article.featured_image || `${window.location.origin}/og-default.jpg`,
          datePublished: article.published_at,
          dateModified: article.updated_at,
          author: {
            '@type': 'Organization',
            name: 'CasinoAny.com',
            url: window.location.origin,
          },
          publisher: {
            '@type': 'Organization',
            name: 'CasinoAny.com',
            url: window.location.origin,
            logo: {
              '@type': 'ImageObject',
              url: `${window.location.origin}/logo.png`,
              width: '600',
              height: '60',
            },
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${window.location.origin}/haber/${article.slug}`,
          },
        }}
      />
      <Helmet>
        <link rel="canonical" href={`${window.location.origin}/haber/${article.slug}`} />
        
        {/* Language/Region */}
        <link rel="alternate" hrefLang="tr" href={`${window.location.origin}/haber/${article.slug}`} />
        <link rel="alternate" hrefLang="x-default" href={`${window.location.origin}/haber/${article.slug}`} />
      </Helmet>
      
      {/* Breadcrumb Schema */}
      <BreadcrumbSchema items={[
        { name: 'Ana Sayfa', url: window.location.origin },
        { name: 'Haberler', url: `${window.location.origin}/haberler` },
        { name: article.title, url: `${window.location.origin}/haber/${article.slug}` }
      ]} />
      
      {/* Image Schema */}
      {article.featured_image && (
        <NewsImageSchema
          images={[{
            url: article.featured_image,
            alt: article.featured_image_alt || article.title,
            caption: article.excerpt || article.title,
          }]}
          articleTitle={article.title}
          articleUrl={`${window.location.origin}/haber/${article.slug}`}
        />
      )}

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

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={article.published_at}>
                  {format(new Date(article.published_at), "d MMMM yyyy", { locale: tr })}
                </time>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{formatReadingTime(readingTime)}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">CasinoAny.com</span>
              </div>
            </div>

            {article.featured_image && (
              <div className="rounded-xl overflow-hidden mb-8">
                <img
                  src={article.featured_image}
                  alt={article.featured_image_alt || article.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}
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

          {/* Related News Section */}
          <RelatedNews
            currentArticleId={article.id}
            category={article.category}
            tags={article.tags}
            limit={4}
          />

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