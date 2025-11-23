import { useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Eye, ExternalLink, Search, Filter, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useNewsArticles } from "@/hooks/queries/useNewsQueries";
import { BreadcrumbSchema, ItemListSchema } from "@/components/StructuredData";
import { SuperLigStandings } from "@/components/SuperLigStandings";
import { SuperLigFixtures } from "@/components/SuperLigFixtures";
import { NewsRssSyncButton } from "@/components/NewsRssSyncButton";
import { useAuth } from "@/contexts/AuthContext";
import { calculateReadingTime, formatReadingTime } from '@/lib/readingTime';
import { NewsFAQSchema } from '@/components/news/NewsFAQSchema';

const categories = [
  "Tümü",
  "Spor Haberleri",
  "Slot Haberleri",
  "Regülasyon",
  "Kripto Casino",
  "Bonus Haberleri",
  "iGaming Genel"
];

const ITEMS_PER_PAGE = 12;

export default function News() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [currentPage, setCurrentPage] = useState(1);
  const { isAdmin } = useAuth();

  const { data: articles, isLoading } = useNewsArticles({ isPublished: true, limit: 50 });

  const filteredArticles = articles?.filter((article: any) => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Tümü" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil((filteredArticles?.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedArticles = filteredArticles?.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-[72px] md:pt-[84px]">
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="iGaming & Spor Haberleri - Casino, Bahis ve Futbol Dünyası"
        description="Online casino, bahis siteleri, slot oyunları, Süper Lig ve iGaming sektöründen güncel haberler, analizler ve gelişmeler."
        keywords={["casino haberleri", "bahis haberleri", "igaming", "slot haberleri", "süper lig", "futbol haberleri"]}
      />
      <Helmet>
        <link rel="canonical" href="https://casinoany.com/haberler" />
        
        {/* Pagination Meta Tags */}
        {currentPage > 1 && (
          <link 
            rel="prev" 
            href={`https://casinoany.com/haberler${currentPage > 2 ? `?page=${currentPage - 1}` : ''}`} 
          />
        )}
        {currentPage < totalPages && (
          <link 
            rel="next" 
            href={`https://casinoany.com/haberler?page=${currentPage + 1}`} 
          />
        )}
        
        {/* Language/Region */}
        <link rel="alternate" hrefLang="tr" href="https://casinoany.com/haberler" />
        <link rel="alternate" hrefLang="x-default" href="https://casinoany.com/haberler" />
      </Helmet>
      
      {/* Breadcrumb Schema */}
      <BreadcrumbSchema items={[
        { name: 'Ana Sayfa', url: window.location.origin },
        { name: 'Haberler', url: `${window.location.origin}/haberler` }
      ]} />
      
      {/* News ItemList Schema */}
      {paginatedArticles && paginatedArticles.length > 0 && (
        <ItemListSchema
          title="iGaming ve Casino Haberleri"
          items={paginatedArticles.map((article: any) => ({
            name: article.title,
            url: `${window.location.origin}/haber/${article.slug}`,
            image: article.featured_image
          }))}
        />
      )}
      
      {/* FAQ Schema */}
      <NewsFAQSchema category={selectedCategory !== 'Tümü' ? selectedCategory : undefined} />

      <Header />

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-[72px] md:pt-[84px]">
        <div className="container mx-auto px-4 py-12">
          <Tabs defaultValue="news" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="news">Haberler</TabsTrigger>
              <TabsTrigger value="standings">Puan Durumu</TabsTrigger>
              <TabsTrigger value="fixtures">Fikstür</TabsTrigger>
            </TabsList>

            <TabsContent value="news">
              <div className="mb-12 text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    iGaming & Spor Haberleri
                  </h1>
                  {isAdmin && <NewsRssSyncButton />}
                </div>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Casino, bahis ve spor dünyasından en güncel haberler, analizler ve gelişmeler
                </p>
              </div>

              <div className="mb-8 flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    placeholder="Haber ara..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {paginatedArticles && paginatedArticles.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {paginatedArticles.map((article: any) => {
                      const readTime = calculateReadingTime(article.content || article.content_html || '');
                      
                      return (
                      <Link key={article.id} to={`/haber/${article.slug}`}>
                        <Card className="h-full hover:shadow-lg transition-all duration-300 hover:border-primary/50 overflow-hidden">
                          {article.featured_image && (
                            <div className="aspect-video w-full overflow-hidden">
                              <img
                                src={article.featured_image}
                                alt={article.featured_image_alt || article.title}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <CardHeader>
                            <div className="flex items-center justify-between mb-3">
                              {article.category && (
                                <Badge variant="secondary">{article.category}</Badge>
                              )}
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatReadingTime(readTime)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  <span>{article.view_count || 0}</span>
                                </div>
                              </div>
                            </div>
                            <CardTitle className="text-xl line-clamp-2 hover:text-primary transition-colors">
                              {article.title}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(article.published_at), 'dd MMMM yyyy', { locale: tr })}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            {article.excerpt && (
                              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                {article.excerpt}
                              </p>
                            )}
                            {article.tags && article.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {article.tags.slice(0, 3).map((tag: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                      );
                    })}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Önceki
                      </Button>
                      <div className="flex gap-2">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let page;
                          if (totalPages <= 5) {
                            page = i + 1;
                          } else if (currentPage <= 3) {
                            page = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            page = totalPages - 4 + i;
                          } else {
                            page = currentPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className="min-w-[40px]"
                            >
                              {page}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Sonraki
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <Card className="p-12 text-center">
                  <div className="space-y-4">
                    <Search className="w-16 h-16 mx-auto text-muted-foreground" />
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Haber Bulunamadı</h3>
                      <p className="text-muted-foreground">
                        {searchTerm || selectedCategory !== "Tümü" 
                          ? "Arama kriterlerinize uygun haber bulunamadı. Lütfen farklı bir arama yapın."
                          : "Henüz haber bulunmamaktadır."}
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="standings">
              <SuperLigStandings />
            </TabsContent>

            <TabsContent value="fixtures">
              <SuperLigFixtures />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </>
  );
}
