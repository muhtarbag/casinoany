import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BettingSiteCard } from "./BettingSiteCard";
import { useState, useEffect } from "react";

interface RecommendedSitesProps {
  currentSiteId: string;
  currentSiteFeatures: string[];
}

export default function RecommendedSites({ currentSiteId, currentSiteFeatures }: RecommendedSitesProps) {
  const { data: allSites, isLoading } = useQuery({
    queryKey: ["recommended-sites-all", currentSiteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("betting_sites")
        .select("*")
        .eq("is_active", true)
        .neq("id", currentSiteId)
        .order("rating", { ascending: false });

      if (error) throw error;

      // Filter by similar features if possible
      if (currentSiteFeatures.length > 0) {
        const sitesWithMatchingFeatures = data.filter((site) => {
          const siteFeatures = site.features || [];
          return currentSiteFeatures.some((feature) => siteFeatures.includes(feature));
        });

        return sitesWithMatchingFeatures.length > 0 ? sitesWithMatchingFeatures : data;
      }

      return data;
    },
  });

  // Randomly select 4 sites - shuffles every time component mounts or allSites changes
  const [recommendedSites, setRecommendedSites] = useState<any[]>([]);

  useEffect(() => {
    if (!allSites || allSites.length === 0) {
      setRecommendedSites([]);
      return;
    }
    
    // Shuffle array and take first 4
    const shuffled = [...allSites].sort(() => Math.random() - 0.5);
    setRecommendedSites(shuffled.slice(0, 4));
  }, [allSites, currentSiteId]); // Re-shuffle when site changes or allSites changes

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendedSites.map((site: any) => (
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
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
