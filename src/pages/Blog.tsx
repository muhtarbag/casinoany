import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ItemListSchema, BreadcrumbSchema } from '@/components/StructuredData';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Eye, Search, Tag, ArrowRight, FileText, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useState, useMemo } from 'react';
import { useBlogPosts } from '@/hooks/queries/useBlogQueries';

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

  const { data: posts, isLoading } = useBlogPosts({ isPublished: true });

  const categories = useMemo(() => {
    if (!posts) return [];
    const cats = new Set(posts.map(p => p.category).filter(Boolean) as string[]);
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

  const featuredPost = filteredPosts[0];
  const regularPosts = filteredPosts.slice(1);

  return (
    <div className="min-h-screen bg-gradient-dark pt-[72px] md:pt-[84px]">
      <SEO
        title="Blog - Bahis Siteleri Haberleri ve İpuçları"
        description="Bahis siteleri hakkında en güncel haberler, bonus kampanyaları, strateji ipuçları ve sektör analizleri. Kazancınızı artırın!"
        keywords={['bahis blog', 'casino haberleri', 'bahis ipuçları', 'bonus kampanyaları', 'bahis stratejileri']}
      />
      
      {/* Breadcrumb Schema */}
      <BreadcrumbSchema items={[
        { name: 'Ana Sayfa', url: window.location.origin },
        { name: 'Blog', url: `${window.location.origin}/blog` }
      ]} />
      
      {filteredPosts && filteredPosts.length > 0 && (
        <ItemListSchema
          title="Bahis Siteleri Blog Yazıları"
          items={filteredPosts.map(post => ({
            name: post.title,
            url: `${window.location.origin}/blog/${post.slug}`,
            image: post.featured_image
          }))}
        />
      )}
      
      <Header />
      
      <main className="relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-12 pb-24 md:pb-12 relative">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <Breadcrumb items={[{ label: 'Blog' }]} />
            
            {/* Hero Section */}
            <header className="text-center mb-16 space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">İçgörüler & Stratejiler</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                Blog
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Bahis dünyasında başarılı olmak için ihtiyacınız olan
                <span className="text-primary font-semibold"> güncel haberler</span>,
                <span className="text-accent font-semibold"> ipuçları</span> ve
                <span className="text-secondary font-semibold"> stratejiler</span>
              </p>

              {/* Search Bar - Premium Design */}
              <div className="max-w-2xl mx-auto mt-10">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent opacity-20 group-hover:opacity-30 blur rounded-2xl transition-opacity" />
                  <div className="relative flex items-center">
                    <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 peer-focus:text-primary transition-colors pointer-events-none" />
                    <Input
                      type="text"
                      placeholder="Aradığınız konuyu yazın..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="peer w-full h-16 pl-14 pr-6 text-lg bg-card/80 backdrop-blur-xl border-border/50 rounded-2xl focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Category Filters */}
              {categories.length > 0 && (
                <div className="flex flex-wrap justify-center gap-3 mt-8">
                  <Badge
                    variant={selectedCategory === null ? 'default' : 'outline'}
                    className="cursor-pointer px-6 py-2 text-sm font-medium hover:scale-105 transition-transform"
                    onClick={() => setSelectedCategory(null)}
                  >
                    Tümü
                  </Badge>
                  {categories.map((cat) => (
                    <Badge
                      key={cat}
                      variant={selectedCategory === cat ? 'default' : 'outline'}
                      className="cursor-pointer px-6 py-2 text-sm font-medium hover:scale-105 transition-transform"
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              )}
            </header>

            {isLoading ? (
              <LoadingSpinner size="lg" text="Blog yazıları yükleniyor..." className="py-20" />
            ) : filteredPosts.length === 0 ? (
              <EmptyState
                icon={FileText}
                title={searchTerm || selectedCategory ? 'Sonuç Bulunamadı' : 'Henüz Blog Yazısı Yok'}
                description={
                  searchTerm || selectedCategory
                    ? 'Arama kriterlerine uygun blog yazısı bulunamadı. Farklı bir arama deneyin.'
                    : 'Henüz yayınlanmış blog yazısı bulunmamaktadır. Yakında yeni içerikler eklenecek.'
                }
                action={
                  searchTerm || selectedCategory
                    ? {
                        label: 'Filtreleri Temizle',
                        onClick: () => {
                          setSearchTerm('');
                          setSelectedCategory(null);
                        },
                      }
                    : undefined
                }
              />
            ) : (
              <div className="space-y-12">
                {/* Featured Post - Hero Treatment */}
                {featuredPost && (
                  <Card
                    className="group relative overflow-hidden cursor-pointer border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-500 animate-fade-in"
                    onClick={() => navigate(`/blog/${featuredPost.slug}`)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="grid md:grid-cols-2 gap-0">
                      {featuredPost.featured_image && (
                        <div className="relative h-64 md:h-full overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10 md:hidden" />
                          <img
                            src={featuredPost.featured_image}
                            alt={featuredPost.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="eager"
                          />
                          <div className="absolute top-4 left-4 z-20">
                            <Badge className="bg-primary/90 backdrop-blur-sm text-primary-foreground border-0 px-4 py-1.5 font-semibold">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Öne Çıkan
                            </Badge>
                          </div>
                        </div>
                      )}
                      
                      <div className="p-8 md:p-12 flex flex-col justify-center relative">
                        <div className="space-y-6">
                          {featuredPost.category && (
                            <Badge variant="outline" className="w-fit border-primary/30 text-primary">
                              {featuredPost.category}
                            </Badge>
                          )}
                          
                          <h2 className="text-3xl md:text-4xl font-display font-bold group-hover:text-primary transition-colors leading-tight">
                            {featuredPost.title}
                          </h2>
                          
                          <p className="text-lg text-muted-foreground line-clamp-3 leading-relaxed">
                            {featuredPost.excerpt}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(featuredPost.published_at), 'd MMMM yyyy', { locale: tr })}
                            </div>
                            {featuredPost.read_time && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {featuredPost.read_time} dakika
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              {featuredPost.view_count} görüntülenme
                            </div>
                          </div>

                          <Button 
                            size="lg"
                            className="w-fit group-hover:shadow-lg group-hover:shadow-primary/20 transition-all"
                          >
                            Okumaya Başla
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Regular Posts Grid */}
                {regularPosts.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {regularPosts.map((post, index) => (
                      <Card
                        key={post.id}
                        className="group cursor-pointer hover:border-primary/50 transition-all duration-300 overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-xl hover:shadow-primary/10 animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                        onClick={() => navigate(`/blog/${post.slug}`)}
                      >
                        {post.featured_image && (
                          <div className="relative w-full h-56 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent z-10" />
                            <img
                              src={post.featured_image}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              loading="lazy"
                            />
                          </div>
                        )}
                        
                        <CardHeader className="space-y-4">
                          {post.category && (
                            <Badge variant="default" className="w-fit">
                              {post.category}
                            </Badge>
                          )}
                          
                          <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                            {post.title}
                          </h3>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                            {post.excerpt}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border/50">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {format(new Date(post.published_at), 'd MMM yyyy', { locale: tr })}
                            </div>
                            {post.read_time && (
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {post.read_time} dk
                              </div>
                            )}
                            <div className="flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5" />
                              {post.view_count}
                            </div>
                          </div>

                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                              {post.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs font-normal border-border/50">
                                  <Tag className="w-2.5 h-2.5 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <Button
                            variant="ghost"
                            className="w-full group-hover:bg-primary/10 group-hover:text-primary transition-all mt-4"
                          >
                            Devamını Oku
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
