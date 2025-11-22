import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TypedRPC } from '@/lib/supabase-extended';
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from '@/hooks/useFavorites';
import { analytics } from "@/lib/analytics";
import { useInternalLinks, applyInternalLinks, trackLinkClick } from '@/hooks/useInternalLinking';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, ExternalLink, Mail, MessageCircle, Send, ChevronRight, Heart, Award, FileText, Gift } from "lucide-react";
import { FaTwitter, FaInstagram, FaFacebook, FaYoutube } from 'react-icons/fa';
import { toast } from "sonner";
import RecommendedSites from "@/components/RecommendedSites";
import { SiteDetailHeader } from '@/components/site-detail/SiteDetailHeader';
import { SiteDetailContact } from '@/components/site-detail/SiteDetailContact';
import { SiteDetailReviews } from '@/components/site-detail/SiteDetailReviews';
import { AdBanner } from '@/components/advertising/AdBanner';
import { MobileStickyAd } from '@/components/advertising/MobileStickyAd';

interface Profile {
  username: string;
  avatar_url: string | null;
}

interface Review {
  id: string;
  site_id: string;
  user_id: string;
  rating: number;
  title: string;
  comment: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

import { SEO } from '@/components/SEO';
import { SiteBlogSection } from '@/components/SiteBlogSection';
import { CasinoReviewCoreContent } from '@/components/casino/CasinoReviewCoreContent';
import { BreadcrumbSchema, FAQSchema, ReviewSchema, CasinoProductSchema } from '@/components/StructuredData';
import { CasinoReviewSchema, ExpertReviewSchema } from '@/components/seo/GamblingSEOSchemas';
import { GamblingSEOEnhancer } from '@/components/seo/GamblingSEOEnhancer';

import { ScrollProgress } from '@/components/site-detail/ScrollProgress';

import { CollapsibleFeatures } from '@/components/site-detail/CollapsibleFeatures';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SiteDetail() {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { isFavorite: checkFavorite, toggleFavorite, isToggling } = useFavorites();
  const [viewTracked, setViewTracked] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const [lastScrollY, setLastScrollY] = useState(0);

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

  // Fetch bonus offers for this site
  const { data: bonusOffers } = useQuery({
    queryKey: ['site-bonus-offers', slug || id],
    queryFn: async () => {
      if (!slug && !id) return [];
      
      const { data: siteData } = await supabase
        .from("betting_sites")
        .select("id")
        .or(slug ? `slug.eq.${slug}` : `id.eq.${id}`)
        .single();
      
      if (!siteData) return [];
      
      const { data, error } = await supabase
        .from('bonus_offers')
        .select('*')
        .eq('site_id', siteData.id)
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!(slug || id),
  });

  // Fetch site data by slug or id
  const { data: site, isLoading: siteLoading, error: siteError } = useQuery({
    queryKey: ["betting-site", slug || id],
    queryFn: async (): Promise<any> => {
      if (slug) {
        const { data, error } = await supabase
          .from("betting_sites")
          .select("*")
          .eq("is_active", true)
          .eq("slug", slug)
          .maybeSingle();
        
        if (error) throw error;
        if (!data) {
          throw new Error("Site not found");
        }
        return data;
      } else if (id) {
        const { data, error } = await supabase
          .from("betting_sites")
          .select("*")
          .eq("is_active", true)
          .eq("id", id)
          .maybeSingle();
        
        if (error) throw error;
        if (!data) {
          throw new Error("Site not found");
        }
        return data;
      }
      throw new Error("No slug or id provided");
    },
    retry: false,
  });

  // Fetch AI-suggested internal links for casino pages
  const { data: internalLinks } = useInternalLinks(
    site?.slug ? `/site/${site.slug}` : '',
    !!site?.slug
  );

  // ✅ OPTIMIZE EDİLDİ: O(1) lookup
  const isFavorite = checkFavorite(site?.id);

  // Enrich casino content with internal links
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

  // Track internal link clicks
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

  // ✅ OPTIMIZE EDİLDİ: Global favorites hook kullanıyor
  const handleToggleFavorite = () => {
    if (!user) {
      toast.error("Favorilere eklemek için giriş yapmalısınız");
      navigate("/login");
      return;
    }
    if (!site?.id) return;

    toggleFavorite({ siteId: site.id, isFavorite });
  };

  // Load logo from storage or use direct URL
  useEffect(() => {
    if (site?.logo_url) {
      // If logo_url is already a full URL, use it directly
      if (site.logo_url.startsWith('http')) {
        setLogoUrl(site.logo_url);
      } else {
        // Otherwise, get the public URL from storage
        const { data } = supabase.storage.from('site-logos').getPublicUrl(site.logo_url);
        // Ensure absolute URL for Open Graph
        const absoluteUrl = data.publicUrl.startsWith('http') 
          ? data.publicUrl 
          : `${window.location.origin}${data.publicUrl}`;
        setLogoUrl(absoluteUrl);
      }
    }
  }, [site?.logo_url]);

  // Fetch site stats with staleTime
  const { data: stats } = useQuery({
    queryKey: ["site-stats", site?.id],
    queryFn: async () => {
      if (!site?.id) return null;
      const { data, error } = await supabase
        .from("site_stats")
        .select("*")
        .eq("site_id", site.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!site?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes cache
  });

  // Fetch reviews with profiles - optimized with staleTime
  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ["site-reviews", site?.id],
    queryFn: async () => {
      if (!site?.id) return [];
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("site_reviews")
        .select("*")
        .eq("site_id", site.id)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (reviewsError) throw reviewsError;

      // Fetch profiles separately (only for reviews with user_id)
      const userIds = reviewsData
        .map((r: any) => r.user_id)
        .filter((id: string | null) => id !== null);
      
      let profilesData = [];
      if (userIds.length > 0) {
        const { data, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", userIds);

        if (profilesError) throw profilesError;
        profilesData = data || [];
      }

      // Combine reviews with profiles
      const reviewsWithProfiles = reviewsData.map((review: any) => {
        const profile = profilesData?.find((p: any) => p.id === review.user_id);
        return {
          ...review,
          type: 'review',
          profiles: profile ? { username: profile.username || "Anonim", avatar_url: profile.avatar_url } : undefined,
        };
      });

      return reviewsWithProfiles;
    },
    enabled: !!site?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes - reviews don't change frequently
  });

  // Fetch complaints with profiles
  const { data: complaints, isLoading: complaintsLoading } = useQuery({
    queryKey: ["site-complaints", site?.id],
    queryFn: async () => {
      if (!site?.id) return [];
      const { data: complaintsData, error: complaintsError } = await supabase
        .from("site_complaints")
        .select("*")
        .eq("site_id", site.id)
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (complaintsError) throw complaintsError;

      // Fetch profiles separately
      const userIds = complaintsData
        .map((c: any) => c.user_id)
        .filter((id: string | null) => id !== null);
      
      let profilesData = [];
      if (userIds.length > 0) {
        const { data, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", userIds);

        if (profilesError) throw profilesError;
        profilesData = data || [];
      }

      // Combine complaints with profiles
      const complaintsWithProfiles = complaintsData.map((complaint: any) => {
        const profile = profilesData?.find((p: any) => p.id === complaint.user_id);
        return {
          ...complaint,
          type: 'complaint',
          profiles: profile ? { username: profile.username || "Anonim", avatar_url: profile.avatar_url } : undefined,
        };
      });

      return complaintsWithProfiles;
    },
    enabled: !!site?.id,
    staleTime: 5 * 60 * 1000,
  });

  // ✅ DÜZELTILDI: Thread-safe view tracking
  useEffect(() => {
    if (!site?.id || viewTracked) return;

    const trackView = async () => {
      // Atomic UPSERT - race condition yok
      const { error } = await supabase.rpc('increment_site_stats', {
        p_site_id: site.id,
        p_metric_type: 'view'
      });

      if (error) {
        console.error('View tracking failed:', error);
        return;
      }

      setViewTracked(true);
      // Optimistically update local state
      queryClient.setQueryData(["site-stats", site.id], (old: any) => {
        if (!old) return old;
        return { ...old, views: (old.views || 0) + 1 };
      });
    };

    trackView();
  }, [site?.id, viewTracked, queryClient]);

  // Scroll tracking for sticky CTA with direction detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      
      // Detect scroll direction
      if (scrollPosition > lastScrollY) {
        setScrollDirection('down');
      } else if (scrollPosition < lastScrollY) {
        setScrollDirection('up');
      }
      setLastScrollY(scrollPosition);
      
      // Show sticky CTA only when scrolling down and past 400px
      setShowStickyCTA(scrollPosition > 400 && scrollDirection === 'down');
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, scrollDirection]);

  // ✅ DÜZELTILDI: Thread-safe click tracking
  const trackClickMutation = useMutation({
    mutationFn: async () => {
      if (!site?.id) return;
      
      const { error } = await supabase.rpc('increment_site_stats', {
        p_site_id: site.id,
        p_metric_type: 'click'
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-stats", site?.id] });
    },
  });

  const handleAffiliateClick = async () => {
    if (site?.affiliate_link && site?.id) {
      trackClickMutation.mutate();
      
      // Track in analytics system
      try {
        analytics.trackAffiliateClick(site.id, site.name);
      } catch (error) {
        // Silent fail - affiliate tracking is non-critical
      }
      
      window.open(site.affiliate_link, "_blank");
    }
  };

  // Calculate average rating
  const averageRating = reviews?.length
    ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

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
        title={`${site.name} - Detaylı İnceleme ve Kullanıcı Yorumları`}
        description={`${site.name} bahis sitesi hakkında detaylı inceleme. ${site.bonus || 'Bonus kampanyaları'}, kullanıcı yorumları ve ${averageRating} puan değerlendirmesi. ${site.features?.slice(0, 3).join(', ')}`}
        keywords={[site.name, 'bahis sitesi', 'casino', 'bonus', ...(site.features || [])]}
        canonical={`${window.location.origin}/site/${site.slug}`}
        ogImage={logoUrl || undefined}
        ogImageAlt={`${site.name} Logo`}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: site.name,
          description: site.bonus || `${site.name} bahis sitesi`,
          image: logoUrl,
          brand: {
            '@type': 'Brand',
            name: site.name,
            logo: logoUrl,
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: averageRating,
            reviewCount: reviews?.length || 0,
            bestRating: 5,
            worstRating: 1,
          },
          offers: {
            '@type': 'Offer',
            availability: 'https://schema.org/InStock',
            url: site.affiliate_link,
            priceSpecification: {
              '@type': 'PriceSpecification',
              priceCurrency: 'TRY',
              price: '0',
            },
          },
        }}
      />
      
      {/* iGaming-Specific SEO Enhancements */}
      <GamblingSEOEnhancer
        isMoneyPage={true}
        authorName="CasinoAny Experts Team"
        lastReviewed={site.updated_at || new Date().toISOString()}
      />
      
      {/* Casino Review Schema (iGaming-Optimized) */}
      <CasinoReviewSchema
        name={site.name}
        url={`${window.location.origin}/site/${site.slug}`}
        logo={logoUrl || ''}
        rating={parseFloat(averageRating)}
        reviewCount={reviews?.length || 0}
        bonus={site.bonus || ''}
        features={site.features || []}
        license="Curacao eGaming"
        paymentMethods={['Papara', 'Cepbank', 'Kredi Kartı', 'Kripto']}
        gameProviders={['Pragmatic Play', 'Evolution Gaming', 'NetEnt']}
      />
      
      {/* Casino Product Schema - Google Rich Results */}
      <CasinoProductSchema
        site={site}
        logoUrl={logoUrl || undefined}
        reviews={reviews || []}
      />
      
      {/* Expert Review Schema (E-E-A-T) */}
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
      
      {/* Breadcrumb Schema */}
      <BreadcrumbSchema items={[
        { name: 'Ana Sayfa', url: window.location.origin },
        { name: site.name, url: `${window.location.origin}/site/${site.slug}` }
      ]} />
      {/* FAQ Schema */}
      {site.faq && site.faq.length > 0 && (
        <FAQSchema faqs={site.faq.map((f: any) => ({
          question: f.question,
          answer: f.answer
        }))} />
      )}
      {/* Review Schema */}
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
        {/* Breadcrumb */}
        <div className="text-sm text-muted-foreground mb-6">
          <button onClick={() => navigate("/")} className="hover:text-foreground transition-colors">
            Ana Sayfa
          </button>
          {" / "}
          <span className="text-foreground">{site.name}</span>
        </div>

        {/* Two-column layout: Main content + Sidebar (only if ad exists) */}
        <div className={`grid gap-8 max-w-[1400px] mx-auto ${
          hasSidebarAd ? 'grid-cols-1 lg:grid-cols-[1fr_300px]' : 'grid-cols-1'
        }`}>
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
                favoriteLoading={isToggling}
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
            {bonusOffers && bonusOffers.length > 0 ? (
              <>
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 md:p-12 text-primary-foreground animate-fade-in">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-primary-foreground/20 rounded-xl backdrop-blur-sm">
                        <Gift className="w-8 h-8" />
                      </div>
                      <div>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Aktif Bonuslar</h2>
                        <p className="text-primary-foreground/90 mt-1">{bonusOffers.length} özel kampanya sizi bekliyor</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bonus Cards Grid */}
                <div className="space-y-6">
                  {bonusOffers.map((bonus: any, index: number) => {
                    const [showFullTerms, setShowFullTerms] = useState(false);
                    
                    return (
                    <div 
                      key={bonus.id} 
                      className="group relative animate-fade-in hover-scale"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        <CardContent className="p-0">
                          <div className="flex flex-col">
                            {/* Image Section */}
                            {bonus.image_url && (
                              <div className="relative w-full h-48 sm:h-64 lg:h-72 overflow-hidden flex-shrink-0">
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-10"></div>
                                <img 
                                  src={bonus.image_url} 
                                  alt={bonus.title}
                                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                                />
                              </div>
                            )}
                            
                            {/* Content Section */}
                            <div className="flex-1 p-6 md:p-8 space-y-6">
                              {/* Header */}
                              <div className="space-y-3">
                                <div className="flex items-start justify-between gap-4">
                                  <h3 className="text-2xl md:text-3xl font-bold leading-tight group-hover:text-primary transition-colors duration-300">
                                    {bonus.title}
                                  </h3>
                                  <Badge className="bg-gradient-to-r from-gold to-gold/90 text-gold-foreground shadow-md px-4 py-2 text-base md:text-lg font-bold whitespace-nowrap flex-shrink-0">
                                    {bonus.bonus_amount}
                                  </Badge>
                                </div>
                                
                                {/* Bonus Type */}
                                {bonus.bonus_type && (
                                  <div>
                                    <Badge variant="secondary" className="px-3 py-1.5 text-sm font-semibold">
                                      {bonus.bonus_type === 'no_deposit' && '🎁 Deneme Bonusu'}
                                      {bonus.bonus_type === 'welcome' && '👋 Hoş Geldin'}
                                      {bonus.bonus_type === 'deposit' && '💰 Yatırım Bonusu'}
                                      {bonus.bonus_type === 'free_spins' && '🎰 Free Spin'}
                                      {bonus.bonus_type === 'reload' && '🔄 Reload Bonusu'}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                              
                              {/* Info Grid */}
                              {(bonus.wagering_requirement || bonus.eligibility || bonus.validity_period) && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  {bonus.wagering_requirement && (
                                    <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 p-3 border border-border/50 group/card hover:border-primary/30 transition-colors">
                                      <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 rounded-full -mr-6 -mt-6"></div>
                                      <div className="relative">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Çevrim Şartı</p>
                                        <p className="text-sm font-bold text-foreground">{bonus.wagering_requirement}</p>
                                      </div>
                                    </div>
                                  )}
                                  {bonus.eligibility && (
                                    <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 p-3 border border-border/50 group/card hover:border-primary/30 transition-colors">
                                      <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 rounded-full -mr-6 -mt-6"></div>
                                      <div className="relative">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Kimler İçin</p>
                                        <p className="text-sm font-bold text-foreground">{bonus.eligibility}</p>
                                      </div>
                                    </div>
                                  )}
                                  {bonus.validity_period && (
                                    <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 p-3 border border-border/50 group/card hover:border-primary/30 transition-colors">
                                      <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 rounded-full -mr-6 -mt-6"></div>
                                      <div className="relative">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Geçerlilik</p>
                                        <p className="text-sm font-bold text-foreground">{bonus.validity_period}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* Terms */}
                              {bonus.terms && (
                                <div className="relative">
                                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-lg"></div>
                                  <div className="relative bg-muted/30 backdrop-blur-sm rounded-lg p-4 border border-border/50">
                                    <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                                      {bonus.terms.length > 300 && !showFullTerms ? (
                                        <>
                                          {bonus.terms.substring(0, 300)}...
                                          <button 
                                            onClick={() => setShowFullTerms(true)}
                                            className="text-primary hover:underline ml-1 font-semibold"
                                          >
                                            Devamını Oku
                                          </button>
                                        </>
                                      ) : (
                                        <>
                                          {bonus.terms}
                                          {bonus.terms.length > 300 && (
                                            <button 
                                              onClick={() => setShowFullTerms(false)}
                                              className="text-primary hover:underline ml-1 font-semibold"
                                            >
                                              Daha Az Göster
                                            </button>
                                          )}
                                        </>
                                      )}
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              {/* CTA Button */}
                              <Button 
                                onClick={handleAffiliateClick} 
                                size="lg"
                                className="w-full sm:w-auto relative overflow-hidden group/btn bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                              >
                                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></span>
                                <span className="relative flex items-center gap-2 font-bold">
                                  <Gift className="w-5 h-5" />
                                  Bonusu Hemen Talep Et
                                  <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </span>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )})}
                </div>

                {/* Disclaimer */}
                <Card className="border-dashed bg-muted/30">
                  <CardContent className="p-6">
                    <div className="flex gap-3 items-start">
                      <div className="p-2 bg-amber-500/10 rounded-lg flex-shrink-0">
                        <svg className="w-5 h-5 text-amber-600 dark:text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          <span className="font-semibold text-foreground">Önemli Uyarı:</span> Bonus şartları ve koşulları değişebilir. 
                          Lütfen güncel bilgiler için {site.name} sitesini ziyaret edin. 
                          Sorumlu oyun kurallarına uygun hareket ediniz.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-primary" />
                    Aktif Bonuslar ve Kampanyalar
                  </CardTitle>
                  <CardDescription>
                    {site.name} sitesinde geçerli olan bonus teklifleri
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {site.bonus && (
                    <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                      <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                        <Star className="w-5 h-5 text-gold" />
                        Hoş Geldin Bonusu
                      </h3>
                      <p className="text-muted-foreground mb-4">{site.bonus}</p>
                      <Button onClick={handleAffiliateClick} className="w-full sm:w-auto">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Bonusu Talep Et
                      </Button>
                    </div>
                  )}
                  
                  <div className="grid gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">💰 Çevrim Koşulları</h4>
                      <p className="text-sm text-muted-foreground">
                        Bonus çevrim şartları ve detayları için {site.name} sitesini ziyaret edin.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">🎯 Özel Kampanyalar</h4>
                      <p className="text-sm text-muted-foreground">
                        Sadakat programı, cashback ve diğer kampanyalar için siteyi kontrol edin.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">📅 Güncel Promosyonlar</h4>
                      <p className="text-sm text-muted-foreground">
                        Haftalık ve aylık özel promosyonlar için {site.name} sitesini takip edin.
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      ⚠️ Bonus şartları ve koşulları değişebilir. Güncel bilgi için lütfen {site.name} sitesini ziyaret edin.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="comments">
            {!reviewsLoading && !complaintsLoading ? (
              <SiteDetailReviews 
                site={site} 
                reviews={reviews || []}
                complaints={complaints || []}
                user={user} 
                averageRating={averageRating} 
              />
            ) : (
              <Card>
                <CardContent className="py-8">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            )}
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
      <div className={`fixed bottom-0 left-0 right-0 z-40 md:z-50 transition-all duration-500 pb-20 md:pb-0 ${
        showStickyCTA ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}>
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
