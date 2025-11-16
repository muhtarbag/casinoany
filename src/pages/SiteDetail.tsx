import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import ReviewCard from "@/components/ReviewCard";
import ReviewForm from "@/components/ReviewForm";
import RecommendedSites from "@/components/RecommendedSites";

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
import { BreadcrumbSchema, FAQSchema, ReviewSchema } from '@/components/StructuredData';
import { CasinoReviewSchema, ExpertReviewSchema } from '@/components/seo/GamblingSEOSchemas';
import { GamblingSEOEnhancer } from '@/components/seo/GamblingSEOEnhancer';

export default function SiteDetail() {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [viewTracked, setViewTracked] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  // Fetch site data by slug or id
  const { data: site, isLoading: siteLoading, error: siteError } = useQuery({
    queryKey: ["betting-site", slug || id],
    queryFn: async (): Promise<any> => {
      if (slug) {
        const { data, error } = await (supabase as any)
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
        const { data, error } = await (supabase as any)
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
          .from("site_stats" as any)
          .insert({ site_id: site.id, views: 1, clicks: 0 });
      }

      // Track casino analytics
      try {
        await (supabase as any).rpc('increment_casino_analytics', {
          p_site_id: site.id,
          p_block_name: null,
          p_is_affiliate_click: false,
        });
      } catch (error) {
        console.error('Error tracking casino analytics:', error);
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

  // Scroll tracking for sticky CTA
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setShowStickyCTA(scrollPosition > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track click mutation
  const trackClickMutation = useMutation({
    mutationFn: async () => {
      if (!site?.id) return;
      const { data: stats } = await supabase
        .from('site_stats' as any)
        .select('*')
        .eq('site_id', site.id)
        .maybeSingle();

      if (stats) {
        const { error } = await supabase
          .from("site_stats" as any)
          .update({ clicks: (stats as any).clicks + 1 })
          .eq("site_id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("site_stats" as any)
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
        await (supabase as any).rpc('increment_casino_analytics', {
          p_site_id: site.id,
          p_block_name: null,
          p_is_affiliate_click: true,
        });
        
        // Track in new analytics system
        analytics.trackAffiliateClick(site.id, site.name);
      } catch (error) {
        console.error('Error tracking affiliate click:', error);
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

        {/* Site Header Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col gap-6">
              {/* Logo - Horizontal Layout */}
              {logoUrl ? (
                <div className="flex items-center justify-center w-full min-h-[80px] sm:min-h-[120px] bg-card/50 rounded-xl border border-border p-4 sm:p-6">
                  <img
                    src={logoUrl}
                    alt={site.name}
                    className="max-w-full max-h-[80px] sm:max-h-[120px] object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `<div class="text-3xl sm:text-5xl font-bold text-foreground">${site.name}</div>`;
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center w-full min-h-[80px] sm:min-h-[120px] bg-gradient-primary rounded-xl p-4 sm:p-6">
                  <h2 className="text-3xl sm:text-5xl font-bold text-primary-foreground">{site.name}</h2>
                </div>
              )}
              
              <div className="space-y-4">
                <CardTitle className="text-2xl sm:text-3xl mb-2">{site.name}</CardTitle>
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(site.rating || 0)
                          ? "fill-gold text-gold"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                  <span className="font-semibold ml-2">{site.rating}/5</span>
                </div>
                {site.bonus && (
                  <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg p-4 mb-4">
                    <p className="text-lg font-bold">{site.bonus}</p>
                  </div>
                )}
                <Button
                  size="lg"
                  onClick={handleAffiliateClick}
                  className="w-full md:w-auto relative font-bold overflow-hidden group/cta transition-all duration-500 bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.6),0_0_50px_rgba(236,72,153,0.4)] hover:scale-[1.02] text-white border-0"
                >
                  {/* Animated shimmer overlay */}
                  <div className="absolute inset-0 w-full h-full">
                    <div className="absolute inset-0 translate-x-[-100%] animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent w-[150%]" />
                  </div>
                  
                  {/* Subtle pulse glow background */}
                  <div className="absolute inset-0 bg-white/5 animate-glow" />
                  
                  {/* Button content */}
                  <span className="relative z-10 flex items-center gap-2 drop-shadow-lg">
                    Siteye Git
                    <ExternalLink className="w-4 h-4 group-hover/cta:translate-x-1 transition-all duration-300" />
                  </span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Features */}
            {site.features && site.features.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Özellikler</h3>
                <div className="flex flex-wrap gap-2">
                  {site.features.map((feature, index) => (
                    <Badge key={index} variant="secondary">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Social Media Links */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">İletişim</h3>
              <div className="flex flex-wrap gap-3">
                {site.email && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`mailto:${site.email}`} target="_blank" rel="noopener noreferrer">
                      <Mail className="w-4 h-4 mr-2" style={{ color: '#6366f1' }} />
                      Email
                    </a>
                  </Button>
                )}
                {site.whatsapp && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={site.whatsapp} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="w-4 h-4 mr-2" style={{ color: '#25D366' }} />
                      WhatsApp
                    </a>
                  </Button>
                )}
                {site.telegram && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={site.telegram} target="_blank" rel="noopener noreferrer">
                      <Send className="w-4 h-4 mr-2" style={{ color: '#0088cc' }} />
                      Telegram
                    </a>
                  </Button>
                )}
                {site.twitter && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={site.twitter} target="_blank" rel="noopener noreferrer">
                      <FaTwitter className="w-4 h-4 mr-2" style={{ color: '#1DA1F2' }} />
                      Twitter
                    </a>
                  </Button>
                )}
                {site.instagram && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={site.instagram} target="_blank" rel="noopener noreferrer">
                      <FaInstagram className="w-4 h-4 mr-2" style={{ color: '#E4405F' }} />
                      Instagram
                    </a>
                  </Button>
                )}
                {site.facebook && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={site.facebook} target="_blank" rel="noopener noreferrer">
                      <FaFacebook className="w-4 h-4 mr-2" style={{ color: '#1877F2' }} />
                      Facebook
                    </a>
                  </Button>
                )}
                {site.youtube && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={site.youtube} target="_blank" rel="noopener noreferrer">
                      <FaYoutube className="w-4 h-4 mr-2" style={{ color: '#FF0000' }} />
                      YouTube
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="border-t mt-6 pt-6">
                <div className="flex gap-6 text-sm text-muted-foreground">
                  <span>👁️ {(stats as any).views} görüntülenme</span>
                  <span>🖱️ {(stats as any).clicks} tıklama</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Casino Review Core Content */}
        <div className="mb-8">
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
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Kullanıcı Yorumları</CardTitle>
            <CardDescription>
              Ortalama Puan: {averageRating} / 5.0 ({reviews?.length || 0} yorum)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reviewsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review: any) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Henüz yorum yapılmamış. İlk yorumu siz yapın!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Review Form - Anonim */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Yorum Yap</CardTitle>
            <CardDescription>Deneyimlerinizi diğer kullanıcılarla paylaşın (Üyelik gerektirmez)</CardDescription>
          </CardHeader>
          <CardContent>
            <ReviewForm siteId={site.id} />
          </CardContent>
        </Card>

        {/* Site Blog Section */}
        <div className="mb-8">
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
                className="relative font-bold overflow-hidden group/cta transition-all duration-500 bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.6),0_0_50px_rgba(236,72,153,0.4)] hover:scale-[1.02] text-white border-0 flex-shrink-0"
              >
                {/* Animated shimmer overlay */}
                <div className="absolute inset-0 w-full h-full">
                  <div className="absolute inset-0 translate-x-[-100%] animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent w-[150%]" />
                </div>
                
                {/* Subtle pulse glow background */}
                <div className="absolute inset-0 bg-white/5 animate-glow" />
                
                {/* Button content */}
                <span className="relative z-10 flex items-center gap-2 drop-shadow-lg whitespace-nowrap">
                  Siteye Git
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
