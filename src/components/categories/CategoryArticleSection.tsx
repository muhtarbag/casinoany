import { Card } from "@/components/ui/card";
import { GamblingSEOEnhancer } from "@/components/seo/GamblingSEOEnhancer";
import { StructuredData } from "@/components/StructuredData";
import { Link } from "react-router-dom";
import { Calendar, User } from "lucide-react";

interface CategoryArticleSectionProps {
  categoryName: string;
  categorySlug: string;
  content?: string;
  updatedAt?: string;
}

export const CategoryArticleSection = ({
  categoryName,
  categorySlug,
  content,
  updatedAt,
}: CategoryArticleSectionProps) => {
  if (!content) return null;

  const currentDate = updatedAt || new Date().toISOString();
  const formattedDate = new Date(currentDate).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Article structured data
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${categoryName} Rehberi - Detaylı İnceleme ve Öneriler`,
    description: `${categoryName} kategorisinde en iyi bahis siteleri hakkında uzman görüşleri ve detaylı bilgiler.`,
    author: {
      "@type": "Organization",
      name: "CasinoAny Uzman Ekibi",
      url: window.location.origin,
    },
    publisher: {
      "@type": "Organization",
      name: "CasinoAny",
      logo: {
        "@type": "ImageObject",
        url: `${window.location.origin}/logos/fanatik-logo.png`,
      },
    },
    datePublished: currentDate,
    dateModified: currentDate,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${window.location.origin}/kategori/${categorySlug}`,
    },
  };

  return (
    <>
      <StructuredData data={articleSchema} />
      <GamblingSEOEnhancer
        isMoneyPage={true}
        authorName="CasinoAny Uzman Ekibi"
        lastReviewed={currentDate}
      />

      <section className="mt-12 animate-fade-in">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <article className="p-6 sm:p-8">
            {/* Article Header */}
            <header className="mb-6 pb-6 border-b border-border/50">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                {categoryName} Hakkında Detaylı Bilgiler
              </h2>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>CasinoAny Uzman Ekibi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={currentDate}>Güncelleme: {formattedDate}</time>
                </div>
              </div>
            </header>

            {/* Article Content */}
            <div 
              className="prose prose-sm sm:prose-base max-w-none dark:prose-invert
                prose-headings:text-foreground prose-headings:font-bold
                prose-p:text-foreground/90 prose-p:leading-relaxed
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground prose-strong:font-semibold
                prose-ul:text-foreground/90 prose-ol:text-foreground/90
                prose-li:marker:text-primary"
              dangerouslySetInnerHTML={{ __html: content }}
            />

            {/* Internal Links Section */}
            <div className="mt-8 pt-6 border-t border-border/50">
              <h3 className="text-lg font-semibold mb-4">İlgili Sayfalar</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link 
                  to="/" 
                  className="text-primary hover:text-primary/80 transition-colors text-sm flex items-center gap-2"
                >
                  <span>→</span>
                  <span>Ana Sayfa - Tüm Bahis Siteleri</span>
                </Link>
                <Link 
                  to="/kategoriler" 
                  className="text-primary hover:text-primary/80 transition-colors text-sm flex items-center gap-2"
                >
                  <span>→</span>
                  <span>Tüm Kategoriler</span>
                </Link>
                <Link 
                  to="/blog" 
                  className="text-primary hover:text-primary/80 transition-colors text-sm flex items-center gap-2"
                >
                  <span>→</span>
                  <span>Blog - Bahis Rehberleri</span>
                </Link>
                <Link 
                  to="/hakkimizda" 
                  className="text-primary hover:text-primary/80 transition-colors text-sm flex items-center gap-2"
                >
                  <span>→</span>
                  <span>Hakkımızda</span>
                </Link>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                Bu içerik, deneyimli bahis uzmanları tarafından hazırlanmış ve düzenli olarak güncellenmektedir.
                Sorumlu oyun kurallarına uygun hareket etmenizi öneririz.
              </p>
            </div>
          </article>
        </Card>
      </section>
    </>
  );
};
