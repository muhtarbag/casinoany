import { useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Eye, ExternalLink, Search, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useNewsArticles } from "@/hooks/queries/useNewsQueries";
import { BreadcrumbSchema, ItemListSchema } from "@/components/StructuredData";

const categories = [
  "Tümü",
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
        title="iGaming Haberleri - Casino ve Bahis Dünyasından Son Gelişmeler"
        description="Online casino, bahis siteleri, slot oyunları ve iGaming sektöründen güncel haberler, analizler ve gelişmeler."
        keywords={["casino haberleri", "bahis haberleri", "igaming", "slot haberleri", "casino güncel"]}
      />
      <Helmet>
        <link rel="canonical" href="https://casinoany.com/haberler" />
      </Helmet>
      
      {/* Breadcrumb Schema */}
      <BreadcrumbSchema items={[
        { name: 'Ana Sayfa', url: window.location.origin },
        { name: 'Haberler', url: `${window.location.origin}/news` }
      ]} />
      
      {/* News ItemList Schema */}
      {paginatedArticles && paginatedArticles.length > 0 && (
        <ItemListSchema
          title="iGaming ve Casino Haberleri"
          items={paginatedArticles.map((article: any) => ({
            name: article.title,
            url: `${window.location.origin}/news/${article.slug}`,
            image: undefined
          }))}
        />
      )}

      <Header />

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-[72px] md:pt-[84px]">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              iGaming Haberleri
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Casino ve bahis dünyasından en güncel haberler, analizler ve gelişmeler
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
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedArticles?.map((article) => (
              <Link key={article.id} to={`/haber/${article.slug}`}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary">{article.category}</Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Eye className="w-4 h-4" />
                        {article.view_count}
                      </div>
                    </div>
                    <CardTitle className="line-clamp-2 text-xl">
                      {article.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-xs">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(article.published_at), "d MMMM yyyy", { locale: tr })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-3 mb-4">
                      {article.excerpt}
                    </p>
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {article.tags.slice(0, 3).map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {(!filteredArticles || filteredArticles.length === 0) && !isLoading && (
            <div className="text-center py-12 col-span-full">
              <ExternalLink className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl text-muted-foreground">
                {searchTerm || selectedCategory !== "Tümü" 
                  ? "Arama kriterlerine uygun haber bulunamadı."
                  : "Henüz haber bulunmamaktadır."}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredArticles && filteredArticles.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Önceki
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="min-w-[40px]"
                >
                  {page}
                </Button>
              ))}
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
      </div>

      <Footer />
    </>
  );
}