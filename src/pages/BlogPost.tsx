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
import { ArrowLeft, Calendar, Clock, Eye, Tag, TrendingUp, Share2, Bookmark, Heart, ChevronUp, Award, MessageCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useEffect, useRef, useMemo, useState } from 'react';
import { useBlogPost, useIncrementBlogView, useBlogPostLikeStatus, useToggleBlogPostLike } from '@/hooks/queries/useBlogQueries';
import { useInternalLinks, applyInternalLinks, trackLinkClick } from '@/hooks/useInternalLinking';
import { cn } from '@/lib/utils';
import { AdBanner } from '@/components/advertising/AdBanner';
import { MobileStickyAd } from '@/components/advertising/MobileStickyAd';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [readingProgress, setReadingProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const { data: post, isLoading } = useBlogPost(slug || '');
  const incrementView = useIncrementBlogView();
  const viewTrackedRef = useRef(false);

  // Like functionality
  const { data: likeStatus } = useBlogPostLikeStatus(post?.id || '', user?.id);
  const toggleLike = useToggleBlogPostLike();

  const handleLikeClick = () => {
    if (!user) {
      toast.error('Beğenmek için giriş yapmalısınız');
      return;
    }
    if (!post?.id) return;

    toggleLike.mutate({
      postId: post.id,
      userId: user.id,
      isLiked: likeStatus?.isLiked || false
    });
  };

  // Check if sidebar ad exists
  const { data: hasSidebarAd } = useQuery({
    queryKey: ['sidebar-ad-check'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_active_banner', { 
          p_location: 'sidebar',
          p_limit: 1 
        });
      return !!data?.[0];
    },
    staleTime: 5 * 60 * 1000,
  });

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
      <div className="min-h-screen bg-gradient-dark pt-[72px] md:pt-[84px] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <Header />
        <div className="container mx-auto px-4 py-32 text-center relative">
          <div className="inline-flex items-center gap-3 p-6 rounded-2xl bg-card/30 backdrop-blur-sm border border-border/30">
            <div className="w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-3 h-3 bg-gradient-to-r from-accent to-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-3 h-3 bg-gradient-to-r from-secondary to-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="mt-6 text-muted-foreground font-medium">İçerik yükleniyor...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-dark pt-[72px] md:pt-[84px] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>
        <Header />
        <div className="container mx-auto px-4 py-32 text-center relative">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20 mb-6">
              <FileText className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold">Blog Yazısı Bulunamadı</h1>
            <p className="text-lg text-muted-foreground">
              Aradığınız blog yazısı bulunamadı veya yayından kaldırılmış olabilir.
            </p>
            <Button 
              onClick={() => navigate('/blog')}
              size="lg"
              className="gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Blog'a Dön
            </Button>
          </div>
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
        title={post.meta_title || `${post.title} | CasinoAny Blog`}
        description={post.meta_description || (post.excerpt && post.excerpt.length > 160 ? post.excerpt.substring(0, 157) + '...' : post.excerpt)}
        keywords={post.meta_keywords || post.tags || ['casino', 'bahis', 'bonus']}
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

      {/* Premium Floating Action Bar - Mobile Only */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 md:hidden animate-fade-in">
        <div className="flex items-center gap-2 bg-gradient-to-r from-card/98 to-card/95 backdrop-blur-xl border-2 border-border/50 rounded-full px-5 py-3.5 shadow-2xl shadow-primary/10">
          <Button 
            size="sm" 
            variant="ghost" 
            className="rounded-full w-11 h-11 p-0 hover:bg-primary/10 hover:text-primary transition-all"
            onClick={shareArticle}
          >
            <Share2 className="w-4.5 h-4.5" />
          </Button>
          <div className="w-px h-7 bg-gradient-to-b from-transparent via-border to-transparent" />
          <Button 
            size="sm" 
            variant="ghost" 
            className="rounded-full w-11 h-11 p-0 hover:bg-accent/10 hover:text-accent transition-all"
          >
            <Bookmark className="w-4.5 h-4.5" />
          </Button>
          <div className="w-px h-7 bg-gradient-to-b from-transparent via-border to-transparent" />
          <Button 
            size="sm" 
            variant="ghost" 
            className={cn(
              "rounded-full w-11 h-11 p-0 transition-all",
              likeStatus?.isLiked 
                ? "bg-red-500/10 text-red-500" 
                : "hover:bg-red-500/10 hover:text-red-500"
            )}
            onClick={handleLikeClick}
            disabled={toggleLike.isPending}
          >
            <Heart className={cn(
              "w-4.5 h-4.5 transition-all",
              likeStatus?.isLiked && "fill-current"
            )} />
          </Button>
        </div>
      </div>

      {/* Premium Scroll to Top Button */}
      <Button
        size="icon"
        className={cn(
          "fixed bottom-6 right-6 rounded-full shadow-2xl shadow-primary/20 transition-all duration-300 z-40 hidden md:flex bg-gradient-to-br from-primary to-accent hover:shadow-primary/30 hover:scale-110 border-2 border-border/20",
          showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        )}
        onClick={scrollToTop}
      >
        <ChevronUp className="w-5 h-5 text-white" />
      </Button>
      
      <main className="flex-1 container mx-auto px-4 py-8 overflow-x-hidden relative">
        {/* Enhanced Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-40 right-10 w-[500px] h-[500px] bg-gradient-to-br from-primary/8 to-primary/4 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-40 left-10 w-[500px] h-[500px] bg-gradient-to-br from-accent/8 to-accent/4 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-secondary/5 to-secondary/2 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
        </div>

        {/* Two-column layout: Main content + Sidebar (only if ad exists) */}
        <div className={`grid gap-8 max-w-[1400px] mx-auto ${
          hasSidebarAd ? 'grid-cols-1 lg:grid-cols-[1fr_300px]' : 'grid-cols-1'
        }`}>
          {/* Main Content */}
          <article className="w-full">
            {/* Premium Breadcrumb Navigation */}
            <div className="mb-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card/30 backdrop-blur-sm border border-border/30">
                <Breadcrumb 
                  items={[
                    { label: 'Blog', href: '/blog' },
                    ...(post.category ? [{ label: post.category, href: `/blog?category=${post.category}` }] : []),
                    { label: post.title }
                  ]}
                />
              </div>
            </div>

            {/* Premium Back Button - Desktop */}
            <Button
              variant="ghost"
              onClick={() => navigate('/blog')}
              className="mb-8 hidden md:flex animate-fade-in group hover:bg-card/50 transition-all duration-300"
              style={{ animationDelay: '100ms' }}
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="font-semibold">Blog'a Dön</span>
            </Button>

            {/* Article Header */}
            <header className="mb-12 space-y-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
              {/* Category & Tags */}
              <div className="flex flex-wrap items-center gap-2.5">
                {post.category && (
                  <Badge 
                    variant="default" 
                    className="text-sm font-semibold px-4 py-1.5 bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                  >
                    {post.category}
                  </Badge>
                )}
                {post.tags?.slice(0, 3).map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="text-xs font-medium px-3 py-1.5 border-border/70 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group"
                  >
                    <Tag className="w-3 h-3 mr-1.5 group-hover:text-primary transition-colors" />
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Title with Premium Styling */}
              <div className="space-y-6">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black leading-[1.1] tracking-tight">
                  <span className="bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent drop-shadow-sm">
                    {post.title}
                  </span>
                </h1>

                {/* Decorative Line */}
                <div className="w-24 h-1.5 bg-gradient-to-r from-primary via-accent to-transparent rounded-full" />
              </div>

              {/* Excerpt with Better Typography */}
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-light max-w-4xl">
                {post.excerpt}
              </p>

              {/* Meta Information in Cards */}
              <div className="flex flex-wrap items-center gap-3 pt-6">
                {post.published_at && (
                  <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-border transition-all duration-300 group">
                    <Calendar className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <time dateTime={post.published_at} className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      {format(new Date(post.published_at), 'd MMMM yyyy', { locale: tr })}
                    </time>
                  </div>
                )}
                {post.read_time && (
                  <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-border transition-all duration-300 group">
                    <Clock className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      {post.read_time} dakika okuma
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-border transition-all duration-300 group">
                  <TrendingUp className="w-4 h-4 text-muted-foreground group-hover:text-secondary transition-colors" />
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {post.view_count.toLocaleString('tr-TR')} görüntüleme
                  </span>
                </div>
              </div>

              {/* Premium Share Buttons */}
              <div className="hidden md:flex items-center gap-3 pt-6 border-t border-border/30">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={shareArticle}
                  className="gap-2.5 hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all duration-300 group"
                >
                  <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold">Paylaş</span>
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="gap-2.5 hover:bg-accent/10 hover:border-accent/50 hover:text-accent transition-all duration-300 group"
                >
                  <Bookmark className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold">Kaydet</span>
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleLikeClick}
                  disabled={toggleLike.isPending}
                  className={cn(
                    "gap-2.5 transition-all duration-300 group",
                    likeStatus?.isLiked
                      ? "bg-red-500/10 border-red-500/50 text-red-500"
                      : "hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500"
                  )}
                >
                  <Heart className={cn(
                    "w-4 h-4 group-hover:scale-110 transition-all",
                    likeStatus?.isLiked && "fill-current"
                  )} />
                  <span className="font-semibold">
                    {likeStatus?.isLiked ? 'Beğenildi' : 'Beğen'} 
                    {likeStatus?.likeCount ? ` (${likeStatus.likeCount})` : ''}
                  </span>
                </Button>
              </div>
            </header>

            {/* Featured Image with Premium Effects */}
            {post.featured_image && (
              <div className="mb-14 animate-fade-in" style={{ animationDelay: '300ms' }}>
                <div className="relative rounded-3xl overflow-hidden border-2 border-border/30 shadow-2xl group">
                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10" />
                  
                  {/* Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="relative w-full h-auto group-hover:scale-105 transition-transform duration-700"
                    loading="eager"
                  />
                </div>
              </div>
            )}

            {/* Article Content with Premium Typography */}
            <div 
              ref={contentRef}
              className="animate-fade-in" 
              style={{ animationDelay: '400ms' }}
            >
              <div 
                className="prose prose-lg md:prose-xl prose-invert max-w-none
                  prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-headings:scroll-mt-24
                  prose-h2:text-3xl md:prose-h2:text-4xl prose-h2:mt-16 prose-h2:mb-8 prose-h2:pb-4 prose-h2:border-b prose-h2:border-border/30
                  prose-h3:text-2xl md:prose-h3:text-3xl prose-h3:mt-12 prose-h3:mb-6
                  prose-h4:text-xl md:prose-h4:text-2xl prose-h4:mt-10 prose-h4:mb-4
                  prose-p:text-muted-foreground prose-p:leading-[1.8] prose-p:mb-8 prose-p:text-lg
                  prose-a:text-primary prose-a:no-underline prose-a:font-semibold prose-a:decoration-primary/30 prose-a:decoration-2 prose-a:underline-offset-4
                  hover:prose-a:text-primary/80 hover:prose-a:decoration-primary/50
                  prose-strong:text-foreground prose-strong:font-bold
                  prose-em:text-foreground/90 prose-em:font-medium
                  prose-ul:my-8 prose-ul:space-y-3
                  prose-ol:my-8 prose-ol:space-y-3
                  prose-li:text-muted-foreground prose-li:leading-[1.8] prose-li:text-lg
                  prose-li:marker:text-primary
                  prose-blockquote:border-l-4 prose-blockquote:border-l-primary prose-blockquote:bg-gradient-to-r prose-blockquote:from-primary/10 prose-blockquote:to-transparent
                  prose-blockquote:py-6 prose-blockquote:px-8 prose-blockquote:rounded-r-2xl
                  prose-blockquote:text-foreground prose-blockquote:not-italic prose-blockquote:font-medium prose-blockquote:text-xl
                  prose-blockquote:shadow-lg prose-blockquote:shadow-primary/5
                  prose-code:text-primary prose-code:bg-primary/10 prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:font-mono prose-code:text-base
                  prose-code:before:content-[''] prose-code:after:content-['']
                  prose-pre:bg-card prose-pre:border-2 prose-pre:border-border/50 prose-pre:rounded-2xl prose-pre:shadow-xl
                  prose-pre:p-6 prose-pre:overflow-x-auto
                  prose-img:rounded-2xl prose-img:shadow-2xl prose-img:border-2 prose-img:border-border/30 prose-img:my-10
                  prose-hr:border-border/30 prose-hr:my-12
                  prose-table:border-2 prose-table:border-border/50 prose-table:rounded-2xl prose-table:overflow-hidden
                  prose-th:bg-card prose-th:font-bold prose-th:text-foreground prose-th:p-4
                  prose-td:p-4 prose-td:border-t prose-td:border-border/30
                  first:prose-p:text-xl first:prose-p:md:text-2xl first:prose-p:text-foreground first:prose-p:font-medium first:prose-p:leading-relaxed"
                dangerouslySetInnerHTML={{ __html: enrichedContent }}
              />
            </div>

            {/* Premium Article Footer CTA */}
            <div className="mt-20 relative overflow-hidden rounded-3xl animate-fade-in">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-accent/10 to-secondary/15" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
              
              <div className="relative p-8 md:p-12 text-center space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                  Bu yazıyı beğendiyseniz diğer içeriklerimize de göz atın
                </h3>
                
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  En güncel casino haberleri, bonuslar ve incelemeler için blog sayfamızı keşfedin
                </p>
                
                <div className="flex flex-wrap justify-center gap-4 pt-4">
                  <Button 
                    onClick={() => navigate('/blog')} 
                    size="lg" 
                    className="gap-2.5 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                  >
                    <Award className="w-5 h-5" />
                    Tüm Blog Yazıları
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={shareArticle} 
                    className="gap-2.5 hover:bg-accent/10 hover:border-accent/50 transition-all duration-300"
                  >
                    <Share2 className="w-5 h-5" />
                    Paylaş
                  </Button>
                </div>
              </div>
            </div>

            {/* Premium Related Posts Section */}
            {relatedPosts && relatedPosts.length > 0 && (
              <div className="mt-20 animate-fade-in">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-2xl shadow-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-display font-bold">
                      İlgili Yazılar
                    </h2>
                    <p className="text-muted-foreground mt-1">Sizin için seçtiklerimiz</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost: any, index: number) => (
                    <Card 
                      key={relatedPost.id}
                      className="group cursor-pointer hover:border-primary/50 transition-all duration-500 overflow-hidden bg-card/50 backdrop-blur-sm animate-fade-in hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1"
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => {
                        navigate(`/${relatedPost.slug}`);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      {relatedPost.featured_image && (
                        <div className="relative h-48 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10 opacity-60 group-hover:opacity-80 transition-opacity" />
                          <img 
                            src={relatedPost.featured_image} 
                            alt={relatedPost.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <CardContent className="p-6 space-y-4">
                        <h3 className="font-bold text-xl group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                          {relatedPost.title}
                        </h3>
                        {relatedPost.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                            {relatedPost.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border/30">
                          {relatedPost.read_time && (
                            <span className="flex items-center gap-1.5 hover:text-primary transition-colors">
                              <Clock className="w-3.5 h-3.5" />
                              {relatedPost.read_time} dk
                            </span>
                          )}
                          <span className="flex items-center gap-1.5 hover:text-accent transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                            {relatedPost.view_count || 0}
                          </span>
                          {relatedPost.tags && relatedPost.tags.length > 0 && (
                            <span className="flex items-center gap-1.5 hover:text-secondary transition-colors">
                              <Tag className="w-3.5 h-3.5" />
                              {relatedPost.tags.length}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Related Betting Sites with Premium Styling */}
            <div className="my-20 animate-fade-in">
              <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-2 border-border/30">
                <BlogRelatedSites postId={post.id} />
              </div>
            </div>

            {/* Premium Comments Section */}
            <div className="space-y-10 my-20 animate-fade-in">
              <div className="border-t-2 border-border/30 pt-12">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-gradient-to-br from-accent to-secondary rounded-2xl shadow-lg">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-display font-bold">
                      Yorumlar
                    </h2>
                    <p className="text-muted-foreground mt-1">Düşüncelerinizi paylaşın</p>
                  </div>
                </div>
                
                <div className="space-y-8">
                  <BlogCommentList postId={post.id} />
                  
                  <div className="mt-10 p-6 md:p-8 rounded-2xl bg-card/30 backdrop-blur-sm border-2 border-border/50">
                    <h3 className="text-xl font-display font-bold mb-6">Yorum Yap</h3>
                    <BlogCommentForm postId={post.id} />
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Sidebar - Desktop only (only if ad exists) */}
          {hasSidebarAd && (
            <aside className="hidden lg:block space-y-6 sticky top-24 h-fit">
              <AdBanner location="sidebar" className="w-full" />
            </aside>
          )}
        </div>
      </main>

      <Footer />
      
      {/* Mobile Sticky Ad */}
      <MobileStickyAd />
    </div>
  );
}
