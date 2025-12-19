
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useInternalLinks, applyInternalLinks, trackLinkClick } from '@/hooks/useInternalLinking';
import { useSiteBanners } from '@/hooks/queries/useBettingSitesQueries';
import { usePageLoadPerformance } from '@/hooks/usePerformanceMonitor';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, FileText, Gift, MessageCircle, Star, ExternalLink } from "lucide-react";
import { SiteDetailHeader } from '@/components/site-detail/SiteDetailHeader';
import { SiteDetailContact } from '@/components/site-detail/SiteDetailContact';
import { SiteDetailReviews } from '@/components/site-detail/SiteDetailReviews';
import { SEO } from '@/components/SEO';
import { CasinoReviewCoreContent } from '@/components/casino/CasinoReviewCoreContent';
import { BreadcrumbSchema, FAQSchema, ReviewSchema, CasinoProductSchema } from '@/components/StructuredData';
import { CasinoReviewSchema, ExpertReviewSchema } from '@/components/seo/GamblingSEOSchemas';
import { GamblingSEOEnhancer } from '@/components/seo/GamblingSEOEnhancer';
import { ScrollProgress } from '@/components/site-detail/ScrollProgress';
import { CollapsibleFeatures } from '@/components/site-detail/CollapsibleFeatures';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSiteDetail } from "@/hooks/useSiteDetail";
import { SiteBonuses } from "@/components/site-detail/SiteBonuses";
import { SiteBlogSection } from '@/components/SiteBlogSection';
import RecommendedSites from "@/components/RecommendedSites";
import { AdBanner } from '@/components/advertising/AdBanner';
import { MobileStickyAd } from '@/components/advertising/MobileStickyAd';
import { useAuth } from "@/contexts/AuthContext";

export default function SiteDetail() {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const lastScrollYRef = useRef(0);

  // Use custom hook
  const {
    site,
    siteLoading,
    bonusOffers,
    reviews,
    complaints,
    logoUrl,
    averageRating,
    isFavorite,
    isTogglingFavorite,
    handleToggleFavorite,
    handleAffiliateClick
  } = useSiteDetail(slug, id);

  // ⚡ Performance monitoring
  usePageLoadPerformance(`site-detail-${slug || id}`);

  // Fetch sidebar ads
  const { data: sidebarAds } = useSiteBanners('sidebar');
  const hasSidebarAd = !!sidebarAds?.[0];

  // Internal Links
  const { data: internalLinks } = useInternalLinks(
    site?.slug ? `/site/${site.slug}` : '',
    !!site?.slug
  );

  // Enrich content
  const enrichedExpertReview = useMemo(() => {
    if (!site?.expert_review || !internalLinks?.length) return site?.expert_review;
    return applyInternalLinks(site.expert_review, internalLinks);
  }, [site?.expert_review, internalLinks]);

  const enrichedVerdict = useMemo(() => {
    if (!site?.verdict || !internalLinks?.length) return site?.verdict;
    return applyInternalLinks(site.verdict, internalLinks);
  }, [site?.verdict, internalLinks]);

  const enrichedLoginGuide = useMemo(() => {
    if (!site?.login_guide || !internalLinks?.length) return site?.login_guide;
    return applyInternalLinks(site.login_guide, internalLinks);
  }, [site?.login_guide, internalLinks]);

  const enrichedWithdrawalGuide = useMemo(() => {
    if (!site?.withdrawal_guide || !internalLinks?.length) return site?.withdrawal_guide;
    return applyInternalLinks(site.withdrawal_guide, internalLinks);
  }, [site?.withdrawal_guide, internalLinks]);

  // Track scroll for sticky CTA
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      lastScrollYRef.current = scrollPosition;
      setShowStickyCTA(scrollPosition > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track link clicks
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('internal-link')) {
        const linkId = target.getAttribute('data-link-id');
        if (linkId) trackLinkClick(linkId);
      }
    };
    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);

  if (siteLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full mb-8" />
          <Skeleton className="h-96 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted pt-[72px] md:pt-[84px]">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Site bulunamadı</h1>
          <Button onClick={() => navigate("/")}>Ana Sayfaya Dön</Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted pt-[72px] md:pt-[84px]">
      <ScrollProgress />
      <SEO
        title={`${site.name} İnceleme ve Bonus 2025 | CasinoAny`}
        description={`${site.name} detaylı inceleme. ${site.bonus || 'Hoş geldin bonusu'}, ödeme yöntemleri, ${averageRating} puan kullanıcı değerlendirmesi. Güvenilir mi? Tüm detaylar.`}
        keywords={[
          site.name,
          `${site.name} bonus`,
          `${site.name} inceleme`,
          'casino sitesi',
          'bahis sitesi',
          'güvenilir casino',
          ...(site.features || []).slice(0, 5)
        ]}
        canonical={`${window.location.origin}/site/${site.slug}`}
        amphtml={`${window.location.origin}/amp/${site.slug}`}
        ogImage={logoUrl || undefined}
        ogImageAlt={`${site.name} Logo`}
      />

      <GamblingSEOEnhancer
        isMoneyPage={true}
        authorName="CasinoAny Experts Team"
        lastReviewed={site.updated_at || new Date().toISOString()}
      />

      <CasinoReviewSchema
        name={site.name}
        url={`${window.location.origin}/site/${site.slug}`}
        logo={logoUrl || ''}
        rating={parseFloat(averageRating)}
        reviewCount={reviews?.length || 0}
        bonus={site.bonus || ''}
        features={site.features || []}
        license="Curacao eGaming"
        paymentMethods={site.features?.filter((f: string) => ['Papara', 'Cepbank', 'Havale', 'EFT', 'Kredi Kartı', 'Kripto', 'Bitcoin', 'Mefete', 'Payfix', 'Pep'].some(pm => f.includes(pm))) || ['Papara', 'Kripto', 'Havale']}
        gameProviders={site.features?.filter((f: string) => ['Pragmatic Play', 'Evolution', 'NetEnt', 'EGT', 'Amusnet', 'Playson', 'Spribe'].some(gp => f.includes(gp))) || ['Pragmatic Play', 'Evolution Gaming']}
      />

      <CasinoProductSchema
        site={site}
        logoUrl={logoUrl || undefined}
        reviews={reviews || []}
      />

      <ExpertReviewSchema
        articleTitle={`${site.name} İnceleme 2025 - Detaylı Analiz`}
        articleBody={`${site.name} detaylı incelemesi. ${site.bonus}. Rating: ${averageRating}/5.0`}
        author={{
          name: 'Ahmet Yılmaz',
          expertise: 'iGaming & Casino Güvenlik Uzmanı',
          experience: '10+ yıl sektör deneyimi'
        }}
        datePublished={site.created_at}
        dateModified={site.updated_at || new Date().toISOString()}
        rating={parseFloat(averageRating)}
        casinoName={site.name}
      />

      <BreadcrumbSchema items={[
        { name: 'Ana Sayfa', url: window.location.origin },
        { name: site.name, url: `${window.location.origin}/site/${site.slug}` }
      ]} />

      {site.faq && site.faq.length > 0 && (
        <FAQSchema faqs={site.faq.map((f: any) => ({
          question: f.question,
          answer: f.answer
        }))} />
      )}

      {reviews && reviews.length > 0 && (
        <ReviewSchema
          reviews={reviews.map((r: any) => ({
            author: r.profiles?.username || r.name || 'Anonim',
            rating: r.rating,
            text: r.comment,
            date: r.created_at
          }))}
          itemName={site.name}
          itemType="Product"
        />
      )}

      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 overflow-x-hidden">
        {/* Two-column layout: Main content + Sidebar (only if ad exists) */}
        <div className={`grid gap-8 max-w-[1400px] mx-auto ${hasSidebarAd ? 'grid-cols-1 lg:grid-cols-[1fr_300px]' : 'grid-cols-1'}`}>
          {/* Main Content */}
          <div>
            {/* Site Header */}
            <div className="mb-2">
              <SiteDetailHeader
                site={site}
                logoUrl={logoUrl}
                averageRating={averageRating}
                reviewCount={reviews?.length || 0}
                onAffiliateClick={handleAffiliateClick}
                isFavorite={isFavorite}
                onToggleFavorite={handleToggleFavorite}
                favoriteLoading={isTogglingFavorite}
              />
            </div>

            {/* Site Info Card */}
            <Card className="shadow-xl border-primary/20 mb-2">
              <CardContent className="p-6 md:p-8">
                {/* Features */}
                {site.features && site.features.length > 0 && (
                  <CollapsibleFeatures features={site.features} />
                )}

                {/* Contact Info */}
                <SiteDetailContact site={site} />
              </CardContent>
            </Card>

            {/* Content Tabs */}
            <Tabs defaultValue="review" className="mb-8">
              <div className="bg-card border border-border rounded-lg p-1 shadow-sm">
                <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-transparent gap-1">
                  <TabsTrigger value="review" className="flex items-center gap-2 whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Award className="w-5 h-5 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Casino İncelemesi</span>
                    <span className="sm:hidden">İnceleme</span>
                  </TabsTrigger>
                  <TabsTrigger value="bonus" className="flex items-center gap-2 whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Gift className="w-5 h-5 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Bonuslar & Kampanyalar</span>
                    <span className="sm:hidden">Bonuslar</span>
                  </TabsTrigger>
                  <TabsTrigger value="comments" className="flex items-center gap-2 whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <MessageCircle className="w-5 h-5 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Yorumlar & Şikayetler</span>
                    <span className="sm:hidden">Yorumlar</span>
                    {reviews && complaints && (reviews.length + complaints.length) > 0 && (
                      <Badge variant="secondary" className="ml-1 data-[state=active]:bg-primary-foreground data-[state=active]:text-primary">
                        {reviews.length + complaints.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="blog" className="flex items-center gap-2 whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <FileText className="w-5 h-5 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">İlgili Blog Yazıları</span>
                    <span className="sm:hidden">Blog</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Casino Review Tab */}
              <TabsContent value="review">
                <CasinoReviewCoreContent
                  siteName={site.name}
                  pros={site.pros}
                  cons={site.cons}
                  verdict={enrichedVerdict}
                  expertReview={enrichedExpertReview}
                  gameCategories={site.game_categories}
                  loginGuide={enrichedLoginGuide}
                  withdrawalGuide={enrichedWithdrawalGuide}
                  faq={site.faq}
                />
              </TabsContent>

              {/* Bonus Tab */}
              <TabsContent value="bonus" className="space-y-6">
                <SiteBonuses bonusOffers={bonusOffers} onAffiliateClick={handleAffiliateClick} />
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="comments">
                <SiteDetailReviews
                  site={site}
                  reviews={reviews || []}
                  complaints={complaints || []}
                  user={user}
                  averageRating={averageRating}
                />
              </TabsContent>

              {/* Blog Tab */}
              <TabsContent value="blog">
                <SiteBlogSection siteId={site.id} siteName={site.name} />
              </TabsContent>
            </Tabs>

            {/* Recommended Sites */}
            <RecommendedSites currentSiteId={site.id} currentSiteFeatures={site.features || []} />
          </div>

          {/* Sidebar - Desktop only, only show if ad exists */}
          {hasSidebarAd && (
            <aside className="hidden lg:block space-y-6 sticky top-24 h-fit max-w-[300px] overflow-hidden">
              <AdBanner location="sidebar" className="w-full max-w-full" />
            </aside>
          )}
        </div>
      </main>

      {/* Sticky Floating CTA */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 md:z-50 transition-all duration-500 pb-20 md:pb-0 ${showStickyCTA ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
        <div className="bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur-sm border-t border-border/50 shadow-2xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto">
              {/* Site Info */}
              <div className="flex items-center gap-3 min-w-0">
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt={site.name}
                    className="w-12 h-12 object-contain rounded-lg bg-card border border-border/50 p-1 flex-shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <h3 className="font-bold truncate">{site.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-gold text-gold" />
                    <span className="text-sm font-semibold text-muted-foreground">{site.rating}/5</span>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <Button
                size="lg"
                onClick={handleAffiliateClick}
                className="relative font-bold overflow-hidden group/cta transition-all duration-300 bg-gradient-secondary hover:scale-105 hover:shadow-2xl text-white border-0 flex-shrink-0"
                style={{ boxShadow: '0 0 40px rgba(234, 179, 8, 0.3)' }}
              >
                <span className="relative z-10 flex items-center gap-2 whitespace-nowrap">
                  Bonusu Al
                  <ExternalLink className="w-4 h-4 group-hover/cta:translate-x-1 transition-all duration-300" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Mobile Sticky Ad */}
      <MobileStickyAd />
    </div>
  );
}
