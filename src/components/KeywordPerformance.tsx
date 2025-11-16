import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Target, 
  BarChart3, 
  Award,
  AlertTriangle,
  RefreshCw,
  LineChart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PerformanceData {
  summary: {
    total_keywords: number;
    achieved_targets: number;
    improving: number;
    declining: number;
    average_rank: number;
    success_rate: number;
  };
  top_performers: any[];
  needs_improvement: any[];
  trends: any[];
  all_keywords: any[];
}

export const KeywordPerformance = () => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);

  const { data: performanceData, refetch, isLoading } = useQuery({
    queryKey: ['keyword-performance', selectedPost],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('keyword-tracker', {
        body: {
          action: 'get-performance-report',
          data: selectedPost ? { post_id: selectedPost } : {}
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to get performance report');
      
      return data.data as PerformanceData;
    },
  });

  const { data: posts } = useQuery({
    queryKey: ['blog-posts-list'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('blog_posts')
        .select('id, title')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const handleUpdateRankings = async () => {
    setIsUpdating(true);
    try {
      toast({
        title: "🔄 Ranking Güncelleniyor",
        description: "Tüm keyword ranking'leri kontrol ediliyor...",
      });

      const { data, error } = await supabase.functions.invoke('keyword-tracker', {
        body: { action: 'update-rankings' }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Update failed');

      await refetch();

      toast({
        title: "✅ Ranking Güncellendi!",
        description: `${data.data.updated_count} keyword güncellendi`,
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Ranking güncellenirken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'achieved': return 'default';
      case 'improving': return 'secondary';
      case 'declining': return 'destructive';
      default: return 'outline';
    }
  };

  const getRankColor = (rank: number) => {
    if (rank <= 3) return 'text-green-600 font-bold';
    if (rank <= 10) return 'text-green-500';
    if (rank <= 20) return 'text-yellow-600';
    if (rank <= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">Yükleniyor...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!performanceData) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Henüz keyword takibi yapılmıyor. Blog yayınladıktan sonra keyword'ler otomatik olarak takip edilecek.
        </AlertDescription>
      </Alert>
    );
  }

  const { summary, top_performers, needs_improvement, trends, all_keywords } = performanceData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Keyword Performans Takibi</h2>
          <p className="text-muted-foreground mt-1">
            SEO keyword ranking'lerini izleyin ve performansı analiz edin
          </p>
        </div>
        <Button onClick={handleUpdateRankings} disabled={isUpdating}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
          Ranking Güncelle
        </Button>
      </div>

      {/* Post Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={!selectedPost ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedPost(null)}
        >
          Tüm Bloglar
        </Button>
        {posts?.map((post) => (
          <Button
            key={post.id}
            variant={selectedPost === post.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPost(post.id)}
          >
            {post.title.substring(0, 30)}...
          </Button>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Keyword</p>
                <p className="text-2xl font-bold">{summary.total_keywords}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hedefte</p>
                <p className="text-2xl font-bold text-green-600">{summary.achieved_targets}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ortalama Rank</p>
                <p className={`text-2xl font-bold ${getRankColor(summary.average_rank)}`}>
                  #{summary.average_rank}
                </p>
              </div>
              <LineChart className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Başarı Oranı</p>
                <p className="text-2xl font-bold">{summary.success_rate}%</p>
              </div>
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
            <Progress value={summary.success_rate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tüm Keywords</TabsTrigger>
          <TabsTrigger value="top">En İyiler</TabsTrigger>
          <TabsTrigger value="improve">İyileştir</TabsTrigger>
          <TabsTrigger value="trends">Trendler</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {all_keywords.map((keyword) => (
              <Card key={keyword.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{keyword.keyword}</CardTitle>
                      <CardDescription>
                        Arama Hacmi: {keyword.search_volume?.toLocaleString() || 'N/A'} | 
                        Zorluk: {keyword.difficulty || 'N/A'}/100
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusColor(keyword.status)}>
                      {keyword.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Mevcut Rank: </span>
                      <span className={`font-bold ${getRankColor(keyword.current_rank || 100)}`}>
                        #{keyword.current_rank || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Hedef: </span>
                      <span className="font-bold">#{keyword.target_rank || 10}</span>
                    </div>
                    {keyword.metadata?.total_change && (
                      <div className="flex items-center gap-1">
                        {keyword.metadata.total_change < 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className={keyword.metadata.total_change < 0 ? 'text-green-600' : 'text-red-600'}>
                          {Math.abs(keyword.metadata.total_change)} pozisyon
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="top" className="space-y-4">
          {top_performers.length === 0 ? (
            <Alert>
              <AlertDescription>
                Henüz ilk 10'da yer alan keyword yok. Çalışmaya devam edin!
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4">
              {top_performers.map((keyword, index) => (
                <Card key={keyword.id} className="border-l-4 border-l-green-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-bold text-green-600">#{index + 1}</div>
                        <div>
                          <CardTitle className="text-lg">{keyword.keyword}</CardTitle>
                          <CardDescription>Rank: #{keyword.current_rank}</CardDescription>
                        </div>
                      </div>
                      <Award className="h-6 w-6 text-yellow-500" />
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="improve" className="space-y-4">
          {needs_improvement.length === 0 ? (
            <Alert>
              <AlertDescription>
                Harika! Tüm keyword'ler iyi performans gösteriyor.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4">
              {needs_improvement.map((keyword) => (
                <Card key={keyword.id} className="border-l-4 border-l-red-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{keyword.keyword}</CardTitle>
                        <CardDescription>
                          Mevcut: #{keyword.current_rank} | Hedef: #{keyword.target_rank || 10}
                        </CardDescription>
                      </div>
                      <AlertTriangle className="h-6 w-6 text-red-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      💡 İçeriği güçlendirin, backlink sayısını artırın, kullanıcı deneyimini iyileştirin
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4">
            {trends.map((trend: any, index: number) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{trend.keyword}</CardTitle>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(trend.trend)}
                      <span className={`font-bold ${
                        trend.trend === 'up' ? 'text-green-600' : 
                        trend.trend === 'down' ? 'text-red-600' : 
                        'text-gray-600'
                      }`}>
                        {trend.trend === 'up' ? '↑' : trend.trend === 'down' ? '↓' : '→'}
                        {Math.abs(trend.change || 0)} pozisyon
                      </span>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
