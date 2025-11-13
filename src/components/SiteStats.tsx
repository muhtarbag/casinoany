import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, MousePointer } from "lucide-react";

export default function SiteStats() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ["all-site-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_stats")
        .select(`
          *,
          betting_sites (
            name
          )
        `)
        .order("clicks", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const topClicked = [...(statsData || [])].sort((a, b) => b.clicks - a.clicks).slice(0, 5);
  const topViewed = [...(statsData || [])].sort((a, b) => b.views - a.views).slice(0, 5);

  const totalClicks = statsData?.reduce((sum, stat) => sum + stat.clicks, 0) || 0;
  const totalViews = statsData?.reduce((sum, stat) => sum + stat.views, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Toplam Görüntülenme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{totalViews.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MousePointer className="w-5 h-5" />
              Toplam Tıklama
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{totalClicks.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>En Çok Tıklanan Siteler</CardTitle>
            <CardDescription>Site bağlantılarına yapılan tıklamalar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topClicked.map((stat, index) => (
                <div key={stat.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-muted-foreground">#{index + 1}</span>
                    <span className="font-medium">{stat.betting_sites?.name || "Bilinmeyen"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MousePointer className="w-4 h-4 text-muted-foreground" />
                    <span className="font-bold">{stat.clicks.toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {topClicked.length === 0 && (
                <p className="text-muted-foreground text-center py-4">Henüz tıklama verisi yok</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>En Çok Görüntülenen Siteler</CardTitle>
            <CardDescription>Site detay sayfası görüntülenmeleri</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topViewed.map((stat, index) => (
                <div key={stat.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-muted-foreground">#{index + 1}</span>
                    <span className="font-medium">{stat.betting_sites?.name || "Bilinmeyen"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span className="font-bold">{stat.views.toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {topViewed.length === 0 && (
                <p className="text-muted-foreground text-center py-4">Henüz görüntülenme verisi yok</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
