import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TypedRPC } from '@/lib/supabase-extended';
import { useAuth } from "@/contexts/AuthContext";
import { analytics } from "@/lib/analytics";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, ExternalLink, Mail, MessageCircle, Send, ChevronRight } from "lucide-react";
import { FaTwitter, FaInstagram, FaFacebook, FaYoutube } from 'react-icons/fa';
import { toast } from "sonner";
import RecommendedSites from "@/components/RecommendedSites";
import { SiteDetailHeader } from '@/components/site-detail/SiteDetailHeader';
import { SiteDetailContact } from '@/components/site-detail/SiteDetailContact';
import { SiteDetailReviews } from '@/components/site-detail/SiteDetailReviews';

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

export default function SiteDetail() {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [viewTracked, setViewTracked] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const [lastScrollY, setLastScrollY] = useState(0);

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
          profiles: profile ? { username: profile.username || "Anonim", avatar_url: profile.avatar_url } : undefined,
        };
      });

      return reviewsWithProfiles;
    },
    enabled: !!site?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes - reviews don't change frequently
  });

  // Track view on mount
  useEffect(() => {
    if (!site?.id || viewTracked) return;

    const trackView = async () => {
      // Track site_stats
      const { data: stats } = await supabase
        .from('site_stats')
        .select('*')
        .eq('site_id', site.id)
        .maybeSingle();

      if (stats) {
        await supabase
          .from("site_stats")
          .update({ views: stats.views + 1 })
          .eq("site_id", site.id);
      } else {
        await supabase
          .from("site_stats")
          .insert({ site_id: site.id, views: 1, clicks: 0 });
      }

      // Track casino analytics
      try {
        await TypedRPC.incrementCasinoAnalytics({
          p_site_id: site.id,
          p_block_name: undefined,
          p_is_affiliate_click: false,
        });
      } catch (error) {
        // Silent fail - analytics tracking is non-critical
      }

      setViewTracked(true);
      // Only invalidate site-stats, not all queries
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

  // Track click mutation
  const trackClickMutation = useMutation({
    mutationFn: async () => {
      if (!site?.id) return;
      const { data: stats } = await supabase
        .from('site_stats')
        .select('*')
        .eq('site_id', site.id)
        .maybeSingle();

      if (stats) {
        const { error } = await supabase
          .from("site_stats")
          .update({ clicks: stats.clicks + 1 })
          .eq("site_id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("site_stats")
          .insert({ site_id: id, clicks: 1, views: 1 });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-stats", id] });
    },
  });

  const handleAffiliateClick = async () => {
    if (site?.affiliate_link && site?.id) {
      trackClickMutation.mutate();
      
      // Track affiliate click in analytics
      try {
        await TypedRPC.incrementCasinoAnalytics({
          p_site_id: site.id,
          p_block_name: undefined,
          p_is_affiliate_click: true,
        });
        
        // Track in new analytics system
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
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted">
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted">
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
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-muted-foreground mb-6">
          <button onClick={() => navigate("/")} className="hover:text-foreground transition-colors">
            Ana Sayfa
          </button>
          {" / "}
          <span className="text-foreground">{site.name}</span>
        </div>

        {/* Site Header */}
        <div className="mb-2">
          <SiteDetailHeader
            site={site}
            logoUrl={logoUrl}
            averageRating={averageRating}
            reviewCount={reviews?.length || 0}
            onAffiliateClick={handleAffiliateClick}
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

        {/* Casino Review Core Content */}
        <div className="mb-2">
          <CasinoReviewCoreContent
            siteName={site.name}
            pros={site.pros}
            cons={site.cons}
            verdict={site.verdict}
            expertReview={site.expert_review}
            gameCategories={site.game_categories}
            loginGuide={site.login_guide}
            withdrawalGuide={site.withdrawal_guide}
            faq={site.faq}
          />
        </div>

        {/* Reviews Section */}
        {!reviewsLoading && reviews && (
          <div className="mb-2">
            <SiteDetailReviews 
              site={site} 
              reviews={reviews} 
              user={user} 
              averageRating={averageRating} 
            />
          </div>
        )}

        {/* Site Blog Section */}
        <div className="mb-2">
          <SiteBlogSection siteId={site.id} siteName={site.name} />
        </div>

        {/* Recommended Sites */}
        <RecommendedSites currentSiteId={site.id} currentSiteFeatures={site.features || []} />
      </main>
      
      {/* Sticky Floating CTA */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ${
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
    </div>
  );
}
