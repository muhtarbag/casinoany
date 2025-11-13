import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Calendar, Clock, Eye, Tag } from 'lucide-react';
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
        article={{
          publishedTime: post.published_at || undefined,
          modifiedTime: post.updated_at,
          tags: post.tags || undefined,
        }}
      />
      
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <article className="max-w-4xl mx-auto">
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
