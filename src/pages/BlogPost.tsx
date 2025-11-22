import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Breadcrumb } from '@/components/Breadcrumb';
import { BlogCommentForm } from '@/components/BlogCommentForm';
import { BlogCommentList } from '@/components/BlogCommentList';
import { BlogRelatedSites } from '@/components/BlogRelatedSites';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Calendar, Clock, Eye, Tag, TrendingUp, Share2, Bookmark, Heart, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useEffect, useRef, useMemo, useState } from 'react';
import { useBlogPost, useIncrementBlogView } from '@/hooks/queries/useBlogQueries';
import { useInternalLinks, applyInternalLinks, trackLinkClick } from '@/hooks/useInternalLinking';
import { cn } from '@/lib/utils';
import { AdBanner } from '@/components/advertising/AdBanner';
import { MobileStickyAd } from '@/components/advertising/MobileStickyAd';

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [readingProgress, setReadingProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const { data: post, isLoading } = useBlogPost(slug || '');
  const incrementView = useIncrementBlogView();
  const viewTrackedRef = useRef(false);

  // Fetch AI-suggested internal links
  const { data: internalLinks } = useInternalLinks(
    post?.slug ? `/${post.slug}` : '',
    !!post?.slug
  );

  // Fetch related posts based on tags
  const { data: relatedPosts } = useQuery({
    queryKey: ['related-posts', post?.id, post?.tags],
    queryFn: async () => {
      if (!post?.tags || post.tags.length === 0) return [];
      
      const { data, error } = await supabase
        .from('blog_posts' as any)
        .select('id, title, slug, excerpt, featured_image, tags, read_time, view_count, published_at')
        .eq('is_published', true)
        .neq('id', post.id)
        .limit(20);
      
      if (error) throw error;
      
      const scored = data.map((p: any) => {
        const matchingTags = p.tags?.filter((tag: string) => post.tags.includes(tag)).length || 0;
        return { ...p, score: matchingTags };
      });
      
      return scored
        .sort((a, b) => b.score - a.score)
        .filter(p => p.score > 0)
        .slice(0, 3);
    },
    enabled: !!post?.id && !!post?.tags,
  });

  // Enrich content with internal links
  const enrichedContent = useMemo(() => {
    if (!post?.content) return '';
    if (!internalLinks || internalLinks.length === 0) {
      return post.content.replace(/\n/g, '<br />');
    }
    return applyInternalLinks(post.content, internalLinks);
  }, [post?.content, internalLinks]);

  // Reading progress tracking
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const trackLength = documentHeight - windowHeight;
      const progress = Math.min((scrollTop / trackLength) * 100, 100);
      
      setReadingProgress(progress);
      setShowScrollTop(scrollTop > 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (post?.id && !viewTrackedRef.current) {
      incrementView.mutate(post.id);
      viewTrackedRef.current = true;
    }
  }, [post?.id, incrementView]);

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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const shareArticle = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-dark pt-[72px] md:pt-[84px]">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-dark pt-[72px] md:pt-[84px]">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Blog Yazısı Bulunamadı</h1>
          <p className="text-muted-foreground mb-8">Aradığınız blog yazısı bulunamadı veya yayından kaldırılmış.</p>
          <Button onClick={() => navigate('/blog')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Blog'a Dön
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark pt-[72px] md:pt-[84px]">
      {/* Reading Progress Bar */}
      <div 
        className="fixed top-[72px] md:top-[84px] left-0 h-1 bg-gradient-to-r from-primary via-accent to-secondary transition-all duration-300 z-50"
        style={{ width: `${readingProgress}%` }}
      />

      <SEO
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt}
        keywords={post.meta_keywords || []}
        canonical={`${window.location.origin}/${post.slug}`}
        ogType="article"
        ogImage={post.featured_image || undefined}
        ogImageAlt={post.title}
        article={{
          publishedTime: post.published_at || undefined,
          modifiedTime: post.updated_at,
          tags: post.tags || undefined,
        }}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt,
          image: post.featured_image,
          datePublished: post.published_at || post.created_at,
          dateModified: post.updated_at,
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
            '@id': `${window.location.origin}/${post.slug}`,
          },
          wordCount: post.content?.replace(/<[^>]*>/g, '').split(/\s+/).length,
          keywords: post.tags?.join(', '),
          inLanguage: 'tr-TR',
          articleBody: post.excerpt,
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Ana Sayfa',
                item: window.location.origin,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Blog',
                item: `${window.location.origin}/blog`,
              },
              ...(post.category ? [{
                '@type': 'ListItem',
                position: 3,
                name: post.category,
                item: `${window.location.origin}/blog?category=${post.category}`,
              }] : []),
              {
                '@type': 'ListItem',
                position: post.category ? 4 : 3,
                name: post.title,
                item: `${window.location.origin}/${post.slug}`,
              },
            ],
          },
        }}
      />
      
      <Header />

      {/* Floating Action Bar - Mobile Only */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 md:hidden">
        <div className="flex items-center gap-2 bg-card/95 backdrop-blur-xl border border-border/50 rounded-full px-4 py-3 shadow-2xl">
          <Button 
            size="sm" 
            variant="ghost" 
            className="rounded-full w-10 h-10 p-0"
            onClick={shareArticle}
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-border" />
          <Button 
            size="sm" 
            variant="ghost" 
            className="rounded-full w-10 h-10 p-0"
          >
            <Bookmark className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="rounded-full w-10 h-10 p-0"
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <Button
        size="icon"
        className={cn(
          "fixed bottom-6 right-6 rounded-full shadow-2xl transition-all duration-300 z-40 hidden md:flex",
          showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        )}
        onClick={scrollToTop}
      >
        <ChevronUp className="w-5 h-5" />
      </Button>
      
      <main className="relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-40 right-10 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
          <div className="absolute bottom-40 left-10 w-96 h-96 bg-accent/3 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-8 pb-24 md:pb-12 pt-6 md:pt-8 relative">
          {/* Two-column layout: Main content + Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 max-w-7xl mx-auto items-start">
            {/* Main Content */}
            <article className="w-full max-w-3xl mx-auto">
            {/* Breadcrumb Navigation */}
            <div className="mb-4 animate-fade-in">
              <Breadcrumb 
                items={[
                  { label: 'Blog', href: '/blog' },
                  ...(post.category ? [{ label: post.category, href: `/blog?category=${post.category}` }] : []),
                  { label: post.title }
                ]}
              />
            </div>

            {/* Back Button - Desktop */}
            <Button
              variant="ghost"
              onClick={() => navigate('/blog')}
              className="mb-6 hidden md:flex animate-fade-in"
              style={{ animationDelay: '100ms' }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Blog'a Dön
            </Button>

            {/* Article Header */}
            <header className="mb-8 space-y-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
              {/* Category & Tags */}
              <div className="flex flex-wrap items-center gap-2">
                {post.category && (
                  <Badge variant="default" className="text-sm px-3 py-1">
                    {post.category}
                  </Badge>
                )}
                {post.tags?.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs px-3 py-1">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                {post.title}
              </h1>

              {/* Excerpt */}
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                {post.excerpt}
              </p>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-4 border-t border-border/50">
                {post.published_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <time dateTime={post.published_at}>
                      {format(new Date(post.published_at), 'd MMMM yyyy', { locale: tr })}
                    </time>
                  </div>
                )}
                {post.read_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {post.read_time} dakika okuma
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  {post.view_count.toLocaleString('tr-TR')} görüntüleme
                </div>
              </div>

              {/* Desktop Share Buttons */}
              <div className="hidden md:flex items-center gap-3 pt-4">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={shareArticle}
                  className="gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Paylaş
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="gap-2"
                >
                  <Bookmark className="w-4 h-4" />
                  Kaydet
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="gap-2"
                >
                  <Heart className="w-4 h-4" />
                  Beğen
                </Button>
              </div>
            </header>

            {/* Featured Image */}
            {post.featured_image && (
              <div className="mb-10 animate-fade-in" style={{ animationDelay: '300ms' }}>
                <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl group">
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-auto group-hover:scale-105 transition-transform duration-700"
                    loading="eager"
                  />
                </div>
              </div>
            )}

            {/* Article Content */}
            <div 
              ref={contentRef}
              className="animate-fade-in" 
              style={{ animationDelay: '400ms' }}
            >
              <div 
                className="prose prose-lg md:prose-xl prose-invert max-w-none
                  prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight
                  prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                  prose-h3:text-xl md:prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                  prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6
                  prose-a:text-primary prose-a:no-underline prose-a:font-medium hover:prose-a:text-primary/80
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-ul:my-6 prose-ul:space-y-2
                  prose-ol:my-6 prose-ol:space-y-2
                  prose-li:text-muted-foreground prose-li:leading-relaxed
                  prose-blockquote:border-l-4 prose-blockquote:border-l-primary prose-blockquote:bg-primary/5
                  prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg
                  prose-blockquote:text-foreground prose-blockquote:not-italic
                  prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                  prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-xl
                  prose-img:rounded-xl prose-img:shadow-lg
                  first:prose-p:text-lg first:prose-p:text-foreground first:prose-p:font-medium"
                dangerouslySetInnerHTML={{ __html: enrichedContent }}
              />
            </div>

            {/* Article Footer CTA */}
            <div className="mt-12 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-transparent border border-border/50 animate-fade-in">
              <div className="text-center space-y-4">
                <p className="text-lg text-muted-foreground">
                  Bu yazıyı beğendiyseniz diğer içeriklerimize de göz atın
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button onClick={() => navigate('/blog')} size="lg" className="gap-2">
                    Tüm Blog Yazıları
                  </Button>
                  <Button variant="outline" size="lg" onClick={shareArticle} className="gap-2">
                    <Share2 className="w-4 h-4" />
                    Paylaş
                  </Button>
                </div>
              </div>
            </div>

            {/* Related Posts Section */}
            {relatedPosts && relatedPosts.length > 0 && (
              <div className="mt-16 animate-fade-in">
                <div className="flex items-center gap-3 mb-8">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl md:text-3xl font-display font-bold">
                    İlgili Yazılar
                  </h2>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost: any, index: number) => (
                    <Card 
                      key={relatedPost.id}
                      className="group cursor-pointer hover:border-primary/50 transition-all duration-300 overflow-hidden bg-card/50 backdrop-blur-sm animate-fade-in hover:shadow-xl hover:shadow-primary/10"
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => {
                        navigate(`/${relatedPost.slug}`);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      {relatedPost.featured_image && (
                        <div className="relative h-40 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10" />
                          <img 
                            src={relatedPost.featured_image} 
                            alt={relatedPost.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <CardContent className="p-5 space-y-3">
                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                          {relatedPost.title}
                        </h3>
                        {relatedPost.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {relatedPost.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border/50">
                          {relatedPost.read_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {relatedPost.read_time} dk
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {relatedPost.view_count || 0}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Related Betting Sites */}
            <div className="my-16 animate-fade-in">
              <BlogRelatedSites postId={post.id} />
            </div>

            {/* Comments Section */}
            <div className="space-y-8 my-16 animate-fade-in">
              <div className="border-t border-border/50 pt-8">
                <h2 className="text-2xl md:text-3xl font-display font-bold mb-8">
                  Yorumlar
                </h2>
                <BlogCommentList postId={post.id} />
                <div className="mt-8">
                  <BlogCommentForm postId={post.id} />
                </div>
              </div>
            </div>
          </article>

          {/* Sidebar - Desktop only */}
          <aside className="hidden lg:block space-y-6 sticky top-24 h-fit">
            <AdBanner location="sidebar" className="w-full" />
          </aside>
        </div>
      </div>
      </main>

      <Footer />
      
      {/* Mobile Sticky Ad */}
      <MobileStickyAd />
    </div>
  );
}
