import { memo, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BettingSiteCard } from "./BettingSiteCard";
import { useSiteStats } from "@/hooks/queries/useSiteQueries";

interface RecommendedSitesProps {
  currentSiteId: string;
  currentSiteFeatures: string[];
}

const RecommendedSitesComponent = ({ currentSiteId, currentSiteFeatures }: RecommendedSitesProps) => {
  const { data: allSites, isLoading } = useQuery({
    queryKey: ["recommended-sites-all", currentSiteId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("betting_sites")
        .select("id, name, logo_url, slug, rating, bonus, features, affiliate_link, email, whatsapp, telegram, twitter, instagram, facebook, youtube")
        .eq("is_active", true)
        .neq("id", currentSiteId)
        .order("rating", { ascending: false })
        .limit(20); // Limit to top 20 sites instead of fetching all

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
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  });

  const { data: siteStats } = useSiteStats();

  // Memoize recommended sites selection - only recalculate when dependencies change
  const recommendedSites = useMemo(() => {
    if (!allSites || allSites.length === 0) return [];
    
    const shuffled = [...allSites].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  }, [allSites]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Önerilen Siteler</CardTitle>
          <CardDescription>Benzer özelliklere sahip diğer bahis siteleri</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
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
    <Card>
      <CardHeader>
        <CardTitle>Önerilen Siteler</CardTitle>
        <CardDescription>Kullanıcılar bu sitelere de baktı</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {recommendedSites.map((site: any) => {
            const stats = (siteStats as any)?.find((s: any) => s.site_id === site.id);
            return (
              <BettingSiteCard
                key={site.id}
                id={site.id}
                slug={site.slug}
                name={site.name}
                logo={site.logo_url}
                rating={site.rating}
                bonus={site.bonus}
                features={site.features || []}
                affiliateUrl={site.affiliate_link}
                email={site.email}
                whatsapp={site.whatsapp}
                telegram={site.telegram}
                twitter={site.twitter}
                instagram={site.instagram}
                facebook={site.facebook}
                youtube={site.youtube}
                views={stats?.views || 0}
                clicks={stats?.clicks || 0}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(RecommendedSitesComponent);
