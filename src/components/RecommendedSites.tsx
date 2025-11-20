import { memo, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Star, Eye, MousePointerClick, TrendingUp } from "lucide-react";
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
        .limit(8);

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

  // Memoize recommended sites selection - only recalculate when dependencies change
  const recommendedSites = useMemo(() => {
    if (!allSites || allSites.length === 0) return [];
    
    const shuffled = [...allSites].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 8);
  }, [allSites]);

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Önerilen Siteler</CardTitle>
          <CardDescription>Kullanıcılar bu sitelere de baktı</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-border scrollbar-track-muted">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="min-w-[280px] h-[140px] snap-start" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendedSites || recommendedSites.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Önerilen Siteler
        </CardTitle>
        <CardDescription>Kullanıcılar bu sitelere de baktı</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-border scrollbar-track-muted animate-fade-in">
          {recommendedSites.map((site: any) => {
            const stats = (siteStats as any)?.find((s: any) => s.site_id === site.id);
            const views = stats?.views || 0;
            const clicks = stats?.clicks || 0;
            
            return (
              <Link
                key={site.id}
                to={`/${site.slug}`}
                className="group min-w-[280px] snap-start"
              >
                <Card className="h-full border-2 hover:border-primary hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Logo Section */}
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-border group-hover:border-primary transition-colors bg-background shadow-sm">
                          {site.logo_url ? (
                            <OptimizedImage
                              src={site.logo_url}
                              alt={`${site.name} logo`}
                              className="w-full h-full object-contain p-2"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold bg-primary/10 text-primary">
                              {site.name.charAt(0)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div>
                          <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
                            {site.name}
                          </h3>
                          {site.bonus && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {site.bonus}
                            </p>
                          )}
                        </div>

                        {/* Social Proof */}
                        <div className="flex flex-wrap gap-2">
                          {/* Rating */}
                          {site.rating && (
                            <Badge variant="secondary" className="gap-1 text-xs">
                              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                              <span className="font-semibold">{site.rating}</span>
                            </Badge>
                          )}
                          
                          {/* Views */}
                          {views > 0 && (
                            <Badge variant="outline" className="gap-1 text-xs">
                              <Eye className="h-3 w-3" />
                              <span>{views > 1000 ? `${(views / 1000).toFixed(1)}k` : views}</span>
                            </Badge>
                          )}
                          
                          {/* Clicks */}
                          {clicks > 0 && (
                            <Badge variant="outline" className="gap-1 text-xs">
                              <MousePointerClick className="h-3 w-3" />
                              <span>{clicks > 1000 ? `${(clicks / 1000).toFixed(1)}k` : clicks}</span>
                            </Badge>
                          )}
                        </div>

                        {/* Features Preview */}
                        {site.features && site.features.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {site.features.slice(0, 2).map((feature: string, idx: number) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                              >
                                {feature}
                              </span>
                            ))}
                            {site.features.length > 2 && (
                              <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
                                +{site.features.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(RecommendedSitesComponent);
