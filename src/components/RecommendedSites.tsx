import { memo, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Star, Eye, MousePointerClick, TrendingUp, ExternalLink, CheckCircle2 } from "lucide-react";
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

  // Memoize recommended sites
  const recommendedSites = useMemo(() => {
    if (!allSites || allSites.length === 0) return [];
    const shuffled = [...allSites].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 15);
  }, [allSites]);

  if (isLoading) {
    return (
      <Card className="p-6 border-2 border-primary/10 bg-gradient-to-br from-card to-primary/5">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[...Array(15)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </Card>
    );
  }

  if (!recommendedSites || recommendedSites.length === 0) {
    return null;
  }

  const renderSiteCard = (site: any) => {
    const stats = (siteStats as any)?.find((s: any) => s.site_id === site.id);
    const views = stats?.views || 0;
    const clicks = stats?.clicks || 0;
    
    return (
      <Link
        key={site.id}
        to={`/${site.slug}`}
        className="group block"
      >
        <Card className="h-full p-3 border-2 border-border hover:border-primary bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <div className="flex flex-col gap-2">
            {/* Logo */}
            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-background border border-border group-hover:border-primary transition-colors">
              {site.logo_url ? (
                <OptimizedImage
                  src={site.logo_url}
                  alt={`${site.name} logo`}
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl font-bold bg-primary/10 text-primary">
                  {site.name.charAt(0)}
                </div>
              )}
              {/* Verified Badge */}
              {site.rating >= 4.0 && (
                <div className="absolute top-1 right-1">
                  <CheckCircle2 className="h-4 w-4 text-green-500 fill-green-500/20" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-1.5">
              <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                {site.name}
              </h3>

              {/* Rating & Stats */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {site.rating && (
                  <Badge variant="secondary" className="h-5 px-1.5 gap-0.5 text-xs">
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    {site.rating}
                  </Badge>
                )}
                {views > 0 && (
                  <Badge variant="outline" className="h-5 px-1.5 gap-0.5 text-xs">
                    <Eye className="h-2.5 w-2.5" />
                    {views > 1000 ? `${(views / 1000).toFixed(1)}k` : views}
                  </Badge>
                )}
              </div>

              {/* Bonus - Compact */}
              {site.bonus && (
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {site.bonus}
                </p>
              )}
            </div>

            {/* Hover Action */}
            <div className="flex items-center justify-between text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="font-medium">Detaylar</span>
              <ExternalLink className="h-3 w-3" />
            </div>
          </div>
        </Card>
      </Link>
    );
  };

  return (
    <Card className="p-6 border-2 border-primary/10 bg-gradient-to-br from-card to-primary/5 animate-fade-in">
      {/* Header - Compact */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg md:text-xl font-bold">Önerilen Siteler</h2>
        </div>
        <Badge variant="secondary" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          {recommendedSites.length} site
        </Badge>
      </div>

      {/* Grid Layout - Responsive & Compact */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {recommendedSites.map((site: any) => renderSiteCard(site))}
      </div>

      {/* Footer Note */}
      <p className="text-xs text-center text-muted-foreground mt-4 pt-4 border-t border-border/50">
        Güvenilir ve kullanıcılar tarafından onaylanmış platformlar
      </p>
    </Card>
  );
};

export default memo(RecommendedSitesComponent);
