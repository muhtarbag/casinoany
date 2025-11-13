import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Eye, Search, Tag, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useState, useMemo } from 'react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category?: string;
  tags?: string[];
  published_at: string;
  read_time?: number;
  view_count: number;
  featured_image?: string;
}

const Blog = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: posts, isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts' as any)
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });
      
      if (error) throw error;
      return (data as unknown) as BlogPost[];
    },
  });

  const categories = useMemo(() => {
    if (!posts) return [];
    const cats = new Set(posts.map(p => p.category).filter(Boolean));
    return Array.from(cats);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    return posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [posts, searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-gradient-dark">
      <SEO
        title="Blog - Bahis Siteleri Haberleri ve İpuçları"
        description="Bahis siteleri hakkında en güncel haberler, bonus kampanyaları, strateji ipuçları ve sektör analizleri. Kazancınızı artırın!"
        keywords={['bahis blog', 'casino haberleri', 'bahis ipuçları', 'bonus kampanyaları', 'bahis stratejileri']}
      />
      
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <Breadcrumb items={[{ label: 'Blog' }]} />
          
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Bahis siteleri hakkında en güncel haberler, ipuçları ve stratejiler
            </p>
          </header>

        <div className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Blog yazılarında ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              <Badge
                variant={selectedCategory === null ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(null)}
              >
                Tümü
              </Badge>
              {categories.map((cat) => (
                <Badge
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(cat as string)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="text-muted-foreground">Yükleniyor...</div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              {searchTerm || selectedCategory
                ? 'Arama kriterlerine uygun blog yazısı bulunamadı.'
                : 'Henüz yayınlanmış blog yazısı bulunmamaktadır.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Card
                key={post.id}
                className="group cursor-pointer hover:border-primary/50 transition-all duration-300 overflow-hidden"
                onClick={() => navigate(`/blog/${post.slug}`)}
              >
                {post.featured_image && (
                  <div className="w-full h-48 overflow-hidden">
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {post.category && (
                      <Badge variant="default">{post.category}</Badge>
                    )}
                  </div>
                  <h2 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(post.published_at), 'd MMM yyyy', { locale: tr })}
                    </div>
                    {post.read_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.read_time} dk
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {post.view_count}
                    </div>
                  </div>

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tag className="w-2 h-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
                  >
                    Devamını Oku
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
