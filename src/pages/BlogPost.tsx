import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
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
import { ArrowLeft, Calendar, Clock, Eye, Tag, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useEffect } from 'react';

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { data: post, isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts' as any)
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();
      
      if (error) throw error;
      return data as any;
    },
    enabled: !!slug,
  });

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
      
      // Score posts by matching tags
      const scored = data.map((p: any) => {
        const matchingTags = p.tags?.filter((tag: string) => post.tags.includes(tag)).length || 0;
        return { ...p, score: matchingTags };
      });
      
      // Sort by score and take top 4
      return scored
        .sort((a, b) => b.score - a.score)
        .filter(p => p.score > 0)
        .slice(0, 4);
    },
    enabled: !!post?.id && !!post?.tags,
  });

  const incrementViewMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.rpc('increment_blog_view_count' as any, { post_id: postId });
      if (error) throw error;
    },
  });

  useEffect(() => {
    if (post?.id) {
      incrementViewMutation.mutate(post.id);
    }
  }, [post?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-dark">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-muted-foreground">Yükleniyor...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-dark">
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
    <div className="min-h-screen bg-gradient-dark">
      <SEO
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt}
        keywords={post.meta_keywords || []}
        canonical={`${window.location.origin}/blog/${post.slug}`}
        ogType="article"
        ogImage={post.featured_image || undefined}
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
            name: 'BahisSiteleri',
          },
          publisher: {
            '@type': 'Organization',
            name: 'BahisSiteleri',
            logo: {
              '@type': 'ImageObject',
              url: `${window.location.origin}/logo.png`,
            },
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${window.location.origin}/blog/${post.slug}`,
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
                item: `${window.location.origin}/blog/${post.slug}`,
              },
            ],
          },
        }}
      />
      
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <article className="max-w-4xl mx-auto">
          {/* Breadcrumb Navigation */}
          <Breadcrumb 
            items={[
              { label: 'Blog', href: '/blog' },
              ...(post.category ? [{ label: post.category, href: `/blog?category=${post.category}` }] : []),
              { label: post.title }
            ]}
          />

          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/blog')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Blog'a Dön
          </Button>

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {post.category && (
                <Badge variant="default">{post.category}</Badge>
              )}
              {post.tags?.map((tag) => (
                <Badge key={tag} variant="outline">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              {post.title}
            </h1>

            <p className="text-xl text-muted-foreground mb-6">
              {post.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {post.published_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(post.published_at), 'd MMMM yyyy', { locale: tr })}
                </div>
              )}
              {post.read_time && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.read_time} dk okuma
                </div>
              )}
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {post.view_count} görüntüleme
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.featured_image && (
            <div className="mb-8 rounded-lg overflow-hidden border border-border">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Article Content */}
          <Card className="p-8 mb-8">
            <div 
              className="prose prose-invert max-w-none
                prose-headings:text-foreground
                prose-p:text-muted-foreground
                prose-a:text-primary hover:prose-a:text-primary/80
                prose-strong:text-foreground
                prose-code:text-foreground
                prose-pre:bg-muted
                prose-blockquote:border-l-primary
                prose-blockquote:text-muted-foreground
                prose-li:text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
            />
          </Card>

          {/* Related Posts Section */}
          {relatedPosts && relatedPosts.length > 0 && (
            <Card className="p-6 mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                İlgili Yazılar
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {relatedPosts.map((relatedPost: any) => (
                  <Card 
                    key={relatedPost.id}
                    className="group cursor-pointer hover:border-primary transition-all overflow-hidden"
                    onClick={() => {
                      navigate(`/blog/${relatedPost.slug}`);
                      window.scrollTo(0, 0);
                    }}
                  >
                    {relatedPost.featured_image && (
                      <div className="relative h-32 overflow-hidden">
                        <img 
                          src={relatedPost.featured_image} 
                          alt={relatedPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      {relatedPost.excerpt && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
                        {relatedPost.tags && relatedPost.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {relatedPost.tags.slice(0, 2).map((tag: string) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Card>
          )}

          {/* Related Betting Sites */}
          <div className="my-8">
            <BlogRelatedSites postId={post.id} />
          </div>

          {/* Comments Section */}
          <div className="space-y-8 my-8">
            <BlogCommentList postId={post.id} />
            <BlogCommentForm postId={post.id} />
          </div>

          {/* Share Section */}
          <Card className="p-6 text-center">
            <p className="text-muted-foreground mb-4">
              Bu yazıyı beğendiyseniz diğer blog yazılarımıza da göz atın!
            </p>
            <Button onClick={() => navigate('/blog')}>
              Tüm Blog Yazıları
            </Button>
          </Card>
        </article>
      </main>

      <Footer />
    </div>
  );
}
