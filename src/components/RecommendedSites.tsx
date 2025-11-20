import { memo, useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Eye, MousePointerClick, TrendingUp, ArrowRight, CheckCircle2, Zap, Award, ChevronLeft, ChevronRight } from "lucide-react";
import { OptimizedImage } from "./OptimizedImage";
import { useSiteStats } from "@/hooks/queries/useSiteQueries";

interface RecommendedSitesProps {
  currentSiteId: string;
  currentSiteFeatures: string[];
}

const RecommendedSitesComponent = ({ currentSiteId, currentSiteFeatures }: RecommendedSitesProps) => {
  // 🎯 STEP 1: Fetch from global pool
  const { data: globalRecommendations, isLoading: globalLoading } = useQuery({
    queryKey: ["global-recommended-sites-display"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recommended_sites_pool")
        .select(`
          site_id,
          display_order,
          betting_sites!recommended_sites_pool_site_id_fkey (
            id, name, logo_url, slug, rating, bonus, features, 
            affiliate_link, email, whatsapp, telegram, twitter, 
            instagram, facebook, youtube
          )
        `)
        .order("display_order")
        .limit(15);

      if (error) throw error;
      
      // Flatten the nested structure
      return data?.map((item: any) => item.betting_sites).filter(Boolean) || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  // 🎯 STEP 2: Fallback to algorithmic recommendations if no global ones exist
  const { data: algorithmicSites, isLoading: algorithmicLoading } = useQuery({
    queryKey: ["recommended-sites-algorithmic", currentSiteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("betting_sites")
        .select("id, name, logo_url, slug, rating, bonus, features, affiliate_link, email, whatsapp, telegram, twitter, instagram, facebook, youtube")
        .eq("is_active", true)
        .neq("id", currentSiteId)
        .order("rating", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Filter by similar features if possible
      if (currentSiteFeatures.length > 0) {
        const sitesWithMatchingFeatures = data.filter((site: any) => {
          const siteFeatures = site.features || [];
          return currentSiteFeatures.some((feature) => siteFeatures.includes(feature));
        });

        return sitesWithMatchingFeatures.length > 0 ? sitesWithMatchingFeatures : data;
      }

      return data;
    },
    staleTime: 10 * 60 * 1000,
    enabled: !globalLoading && (!globalRecommendations || globalRecommendations.length === 0),
  });

  const isLoading = globalLoading || algorithmicLoading;
  const allSites = globalRecommendations && globalRecommendations.length > 0 
    ? globalRecommendations 
    : algorithmicSites;

  const { data: siteStats } = useSiteStats();

  // Carousel state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Memoize recommended sites
  const recommendedSites = useMemo(() => {
    if (!allSites || allSites.length === 0) return [];
    const shuffled = [...allSites].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 15);
  }, [allSites]);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || recommendedSites.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % recommendedSites.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying, recommendedSites.length]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + recommendedSites.length) % recommendedSites.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % recommendedSites.length);
  };

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-background to-primary/5 p-8 border-2 border-primary/10">
        <div className="text-center space-y-4 mb-8">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  if (!recommendedSites || recommendedSites.length === 0) {
    return null;
  }

  const renderSiteCard = (site: any, index: number) => {
    const stats = (siteStats as any)?.find((s: any) => s.site_id === site.id);
    const views = stats?.views || 0;
    const clicks = stats?.clicks || 0;
    const isActive = index === currentIndex;
    const isPrev = index === (currentIndex - 1 + recommendedSites.length) % recommendedSites.length;
    const isNext = index === (currentIndex + 1) % recommendedSites.length;
    
    return (
      <div
        key={site.id}
        className={`absolute w-full transition-all duration-700 ease-out ${
          isActive 
            ? 'opacity-100 scale-100 translate-x-0 z-20' 
            : isPrev
            ? 'opacity-0 -translate-x-full scale-95 z-10'
            : isNext
            ? 'opacity-0 translate-x-full scale-95 z-10'
            : 'opacity-0 scale-90 z-0'
        }`}
      >
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-card via-card/95 to-primary/5 backdrop-blur-xl shadow-2xl overflow-hidden group hover:border-primary/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative p-6 md:p-8">
            {/* Trust Badge */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 gap-1 shadow-lg">
                <CheckCircle2 className="h-3 w-3" />
                Doğrulanmış
              </Badge>
              {site.rating >= 4.5 && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 gap-1 shadow-lg">
                  <Award className="h-3 w-3" />
                  Top Site
                </Badge>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center mt-12 md:mt-0">
              {/* Left: Logo & Name */}
              <div className="text-center md:text-left space-y-6">
                <div className="inline-block relative">
                  <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                  <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto md:mx-0 rounded-3xl overflow-hidden border-4 border-primary/30 bg-background shadow-2xl group-hover:scale-105 group-hover:border-primary/50 transition-all duration-500">
                    {site.logo_url ? (
                      <OptimizedImage
                        src={site.logo_url}
                        alt={`${site.name} logo`}
                        className="w-full h-full object-contain p-4"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                        {site.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {site.name}
                  </h3>
                  {site.bonus && (
                    <p className="text-sm md:text-base text-muted-foreground font-medium flex items-center gap-2 justify-center md:justify-start">
                      <Zap className="h-4 w-4 text-primary animate-pulse" />
                      {site.bonus}
                    </p>
                  )}
                </div>

                {/* Social Proof - Large & Prominent */}
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {site.rating && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-full border border-amber-500/20">
                      <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                      <span className="font-bold text-lg">{site.rating}</span>
                      <span className="text-xs text-muted-foreground">/5.0</span>
                    </div>
                  )}
                  
                  {views > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full border border-primary/10">
                      <Eye className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{views > 1000 ? `${(views / 1000).toFixed(1)}k` : views}</span>
                      <span className="text-xs text-muted-foreground">görüntülenme</span>
                    </div>
                  )}
                  
                  {clicks > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full border border-primary/10">
                      <MousePointerClick className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{clicks > 1000 ? `${(clicks / 1000).toFixed(1)}k` : clicks}</span>
                      <span className="text-xs text-muted-foreground">tıklama</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Features & CTA */}
              <div className="space-y-6">
                {/* Features */}
                {site.features && site.features.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Öne Çıkan Özellikler
                    </h4>
                    <div className="grid gap-2">
                      {site.features.slice(0, 4).map((feature: string, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10 hover:bg-primary/10 hover:border-primary/20 transition-all duration-300"
                        >
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-sm font-medium">{feature}</span>
                        </div>
                      ))}
                      {site.features.length > 4 && (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          +{site.features.length - 4} özellik daha
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                <Link to={`/${site.slug}`} className="block">
                  <Button 
                    size="lg"
                    className="w-full text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 group/btn h-14"
                  >
                    <span>Siteyi İncele</span>
                    <ArrowRight className="ml-2 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>

                <p className="text-xs text-center text-muted-foreground">
                  Detaylı bilgi için tıklayın
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-background to-primary/5 p-6 md:p-8 border-2 border-primary/10 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 mb-2">
          <TrendingUp className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            Editörün Seçimi
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
          Önerilen Bahis Siteleri
        </h2>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
          Güvenilir, lisanslı ve kullanıcılar tarafından en çok tercih edilen platformlar
        </p>
      </div>

      {/* Carousel */}
      <div className="relative h-[500px] md:h-[400px] mb-8">
        {recommendedSites.map((site: any, index: number) => renderSiteCard(site, index))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          className="rounded-full border-2 hover:border-primary hover:bg-primary/10 transition-all duration-300"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {/* Dots */}
        <div className="flex gap-2">
          {recommendedSites.slice(0, 10).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsAutoPlaying(false);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'w-8 bg-primary' 
                  : 'w-2 bg-primary/20 hover:bg-primary/40'
              }`}
            />
          ))}
          {recommendedSites.length > 10 && (
            <span className="text-xs text-muted-foreground self-center">
              +{recommendedSites.length - 10}
            </span>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          className="rounded-full border-2 hover:border-primary hover:bg-primary/10 transition-all duration-300"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-primary">{currentIndex + 1}</span>
          {' / '}
          <span>{recommendedSites.length}</span>
          {' önerilen site'}
        </p>
      </div>
    </div>
  );
};

export default memo(RecommendedSitesComponent);
