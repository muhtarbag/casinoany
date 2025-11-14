import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, TrendingUp, FileText, BarChart3 } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Line, LineChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export default function BlogStats() {
  const { data: blogData, isLoading } = useQuery({
    queryKey: ["blog-stats"],
    queryFn: async () => {
      const { data: posts, error } = await supabase
        .from("blog_posts" as any)
        .select("id, title, view_count, slug, category, published_at, is_published")
        .eq("is_published", true)
        .order("view_count", { ascending: false });

      if (error) throw error;

      // Get comments count per post
      const { data: comments } = await supabase
        .from("blog_comments" as any)
        .select("post_id")
        .eq("is_approved", true);

      const commentsByPost = comments?.reduce((acc: any, comment: any) => {
        acc[comment.post_id] = (acc[comment.post_id] || 0) + 1;
        return acc;
      }, {});

      return (posts as any[] || []).map((post: any) => ({
        ...post,
        comments_count: commentsByPost?.[post.id] || 0,
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 dakika cache
    refetchInterval: 3 * 60 * 1000, // 3 dakikada bir yenile
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const totalViews = (blogData || []).reduce((sum: number, post: any) => sum + (post.view_count || 0), 0);
  const totalPosts = blogData?.length || 0;
  const averageViews = totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0;

  const topViewedPosts = [...(blogData || [])].sort((a: any, b: any) => b.view_count - a.view_count).slice(0, 10);
  const topCommentedPosts = [...(blogData || [])].sort((a: any, b: any) => b.comments_count - a.comments_count).slice(0, 5);

  const viewsChartData = topViewedPosts.map((post: any) => ({
    name: post.title.length > 20 ? post.title.substring(0, 20) + "..." : post.title,
    views: post.view_count || 0,
  }));

  const categoryStats = (blogData || []).reduce((acc: any, post: any) => {
    const cat = post.category || "Diğer";
    if (!acc[cat]) {
      acc[cat] = { category: cat, posts: 0, views: 0 };
    }
    acc[cat].posts += 1;
    acc[cat].views += post.view_count || 0;
    return acc;
  }, {});

  const categoryChartData = Object.values(categoryStats);

  const chartConfig = {
    views: {
      label: "Görüntülenmeler",
      color: "hsl(var(--primary))",
    },
    posts: {
      label: "Yazı Sayısı",
      color: "hsl(var(--secondary))",
    },
    comments: {
      label: "Yorum Sayısı",
      color: "hsl(var(--accent))",
    },
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Toplam Yazı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{totalPosts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Toplam Okuma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{totalViews.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Ort. Okuma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{averageViews.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Kategoriler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{Object.keys(categoryStats).length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              En Çok Okunan Yazılar
            </CardTitle>
            <CardDescription>Top 10 blog yazısı görüntülenmesi</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={viewsChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={120}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="views" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Kategori Performansı
            </CardTitle>
            <CardDescription>Kategorilere göre yazı ve görüntülenme sayısı</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="category" 
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="posts" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} name="Yazı Sayısı" />
                  <Bar dataKey="views" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} name="Görüntülenmeler" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>En Çok Okunan Yazılar</CardTitle>
            <CardDescription>Görüntülenme sayısına göre</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topViewedPosts.slice(0, 5).map((post: any, index: number) => (
                <div key={post.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="font-bold text-lg text-muted-foreground">#{index + 1}</span>
                    <span className="font-medium truncate">{post.title}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span className="font-bold">{(post.view_count || 0).toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {topViewedPosts.length === 0 && (
                <p className="text-muted-foreground text-center py-4">Henüz veri yok</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>En Çok Yorumlanan Yazılar</CardTitle>
            <CardDescription>Onaylı yorum sayısına göre</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCommentedPosts.map((post: any, index: number) => (
                <div key={post.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="font-bold text-lg text-muted-foreground">#{index + 1}</span>
                    <span className="font-medium truncate">{post.title}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span className="font-bold">{post.comments_count}</span>
                  </div>
                </div>
              ))}
              {topCommentedPosts.length === 0 && (
                <p className="text-muted-foreground text-center py-4">Henüz veri yok</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
