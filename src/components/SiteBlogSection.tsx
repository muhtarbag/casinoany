import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SiteBlogSectionProps {
  siteId: string;
  siteName: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image?: string;
  published_at: string;
  read_time?: number;
  category?: string;
  tags?: string[];
}

export const SiteBlogSection = ({ siteId, siteName }: SiteBlogSectionProps) => {
  const navigate = useNavigate();

  const { data: blogPosts, isLoading } = useQuery({
    queryKey: ['site-blog-posts', siteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts' as any)
        .select('*')
        .eq('primary_site_id', siteId)
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data as unknown as BlogPost[];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📰 {siteName} Hakkında Yazılar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!blogPosts || blogPosts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            📰 {siteName} Hakkında Yazılar
          </CardTitle>
          <Badge variant="secondary">{blogPosts.length} yazı</Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {siteName} ile ilgili en güncel haberler, incelemeler ve rehberler
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {blogPosts.map((post) => (
          <Card
            key={post.id}
            className="cursor-pointer hover:border-primary/50 transition-all group"
            onClick={() => navigate(`/${post.slug}`)}
          >
            <CardContent className="p-4">
              <div className="flex gap-4">
                {post.featured_image && (
                  <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {post.category && (
                      <Badge variant="outline" className="text-xs">
                        {post.category}
                      </Badge>
                    )}
                    {post.tags && post.tags.slice(0, 2).map((tag, idx) => (
                      <Badge key={idx} variant="accent" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="font-semibold text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors mb-2">
                    {post.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.published_at).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                    {post.read_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.read_time} dk
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 self-center">
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {blogPosts.length >= 3 && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate('/blog')}
          >
            Tüm Yazıları Görüntüle
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
