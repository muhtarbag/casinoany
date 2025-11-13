import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, ExternalLink, Mail, MessageCircle, Send, Twitter, Instagram, Facebook, Youtube } from "lucide-react";
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

export default function SiteDetail() {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [viewTracked, setViewTracked] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Fetch site data by slug or id
  const { data: site, isLoading: siteLoading } = useQuery({
    queryKey: ["betting-site", slug || id],
    queryFn: async (): Promise<any> => {
      if (slug) {
        const { data, error } = await (supabase as any)
          .from("betting_sites")
          .select("*")
          .eq("is_active", true)
          .eq("slug", slug)
          .single();
        
        if (error) throw error;
        return data;
      } else if (id) {
        const { data, error } = await (supabase as any)
          .from("betting_sites")
          .select("*")
          .eq("is_active", true)
          .eq("id", id)
          .single();
        
        if (error) throw error;
        return data;
      }
      throw new Error("No slug or id provided");
    },
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
        setLogoUrl(data.publicUrl);
      }
    }
  }, [site?.logo_url]);

  // Fetch site stats
  const { data: stats } = useQuery({
    queryKey: ["site-stats", site?.id],
    queryFn: async () => {
      if (!site?.id) return null;
      const { data, error } = await supabase
        .from("site_stats" as any)
        .select("*")
        .eq("site_id", site.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!site?.id,
  });

  // Fetch reviews with profiles
  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ["site-reviews", site?.id],
    queryFn: async () => {
      if (!site?.id) return [];
      const { data: reviewsData, error: reviewsError } = await (supabase as any)
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
        const { data, error: profilesError } = await (supabase as any)
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
  });

  // Track view on mount
  useEffect(() => {
    if (!site?.id || viewTracked) return;

    const trackView = async () => {
      const { data: stats } = await supabase
        .from('site_stats' as any)
        .select('*')
        .eq('site_id', site.id)
        .maybeSingle();

      if (stats) {
        await supabase
          .from("site_stats" as any)
          .update({ views: (stats as any).views + 1 })
          .eq("site_id", site.id);
      } else {
        await supabase
          .from("site_stats" as any)
          .insert({ site_id: site.id, views: 1, clicks: 0 });
      }
      setViewTracked(true);
      queryClient.invalidateQueries({ queryKey: ["site-stats", site.id] });
    };

    trackView();
  }, [site?.id, viewTracked, queryClient]);

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

  const handleAffiliateClick = () => {
    if (site?.affiliate_link) {
      trackClickMutation.mutate();
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
        description={`${site.name} bahis sitesi hakkında detaylı bilgiler, kullanıcı yorumları ve bonus kampanyaları. ${site.bonus || ''}`}
        keywords={[site.name, 'bahis sitesi', 'casino', ...(site.features || [])]}
        canonical={`${window.location.origin}/${site.slug || `site/${site.id}`}`}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: site.name,
          description: site.bonus || `${site.name} bahis sitesi`,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: averageRating,
            reviewCount: reviews?.length || 0,
          },
          offers: {
            '@type': 'Offer',
            availability: 'https://schema.org/InStock',
            url: site.affiliate_link,
          },
        }}
      />
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
                <div className="flex items-center justify-center w-full min-h-[120px] bg-card/50 rounded-xl border border-border p-6">
                  <img
                    src={logoUrl}
                    alt={site.name}
                    className="max-w-full max-h-[120px] object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `<div class="text-5xl font-bold text-foreground">${site.name}</div>`;
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center w-full min-h-[120px] bg-gradient-primary rounded-xl p-6">
                  <h2 className="text-5xl font-bold text-primary-foreground">{site.name}</h2>
                </div>
              )}
              
              <div className="space-y-4">
                <CardTitle className="text-3xl mb-2">{site.name}</CardTitle>
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(site.rating || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
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
                  className="w-full md:w-auto"
                >
                  Siteye Git <ExternalLink className="ml-2 w-4 h-4" />
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
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </a>
                  </Button>
                )}
                {site.whatsapp && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={site.whatsapp} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </a>
                  </Button>
                )}
                {site.telegram && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={site.telegram} target="_blank" rel="noopener noreferrer">
                      <Send className="w-4 h-4 mr-2" />
                      Telegram
                    </a>
                  </Button>
                )}
                {site.twitter && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={site.twitter} target="_blank" rel="noopener noreferrer">
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </a>
                  </Button>
                )}
                {site.instagram && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={site.instagram} target="_blank" rel="noopener noreferrer">
                      <Instagram className="w-4 h-4 mr-2" />
                      Instagram
                    </a>
                  </Button>
                )}
                {site.facebook && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={site.facebook} target="_blank" rel="noopener noreferrer">
                      <Facebook className="w-4 h-4 mr-2" />
                      Facebook
                    </a>
                  </Button>
                )}
                {site.youtube && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={site.youtube} target="_blank" rel="noopener noreferrer">
                      <Youtube className="w-4 h-4 mr-2" />
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
            <ReviewForm siteId={id!} />
          </CardContent>
        </Card>

        {/* Site Blog Section */}
        <div className="mb-8">
          <SiteBlogSection siteId={id!} siteName={site.name} />
        </div>

        {/* Recommended Sites */}
        <RecommendedSites currentSiteId={id!} currentSiteFeatures={site.features || []} />
      </main>
      <Footer />
    </div>
  );
}
