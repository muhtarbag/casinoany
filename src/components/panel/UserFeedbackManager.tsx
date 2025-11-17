import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, ThumbsUp, MessageSquare, TrendingUp, Users, Inbox } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { EnhancedEmptyState } from './EnhancedEmptyState';
import { LoadingState } from '@/components/admin/LoadingState';

interface UserFeedbackManagerProps {
  siteId: string;
}

export const UserFeedbackManager = ({ siteId }: UserFeedbackManagerProps) => {
  // Fetch reviews
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['site-reviews-feedback', siteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_reviews')
        .select('*')
        .eq('site_id', siteId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
    enabled: !!siteId,
  });

  // Fetch favorites
  const { data: favorites } = useQuery({
    queryKey: ['site-favorites', siteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_favorite_sites')
        .select('created_at')
        .eq('site_id', siteId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      
      if (error) throw error;
      return data;
    },
    enabled: !!siteId,
  });

  // Calculate stats
  const totalReviews = reviews?.length || 0;
  const avgRating = reviews?.reduce((sum, r) => sum + (r.rating || 0), 0) / (totalReviews || 1);
  const positiveReviews = reviews?.filter(r => (r.rating || 0) >= 4).length || 0;
  const neutralReviews = reviews?.filter(r => (r.rating || 0) === 3).length || 0;
  const negativeReviews = reviews?.filter(r => (r.rating || 0) <= 2).length || 0;

  // Rating distribution
  const ratingDistribution = [
    { rating: '5 Yıldız', count: reviews?.filter(r => r.rating === 5).length || 0, fill: '#22c55e' },
    { rating: '4 Yıldız', count: reviews?.filter(r => r.rating === 4).length || 0, fill: '#84cc16' },
    { rating: '3 Yıldız', count: reviews?.filter(r => r.rating === 3).length || 0, fill: '#eab308' },
    { rating: '2 Yıldız', count: reviews?.filter(r => r.rating === 2).length || 0, fill: '#f97316' },
    { rating: '1 Yıldız', count: reviews?.filter(r => r.rating === 1).length || 0, fill: '#ef4444' },
  ];

  // Sentiment breakdown
  const sentimentData = [
    { name: 'Olumlu', value: positiveReviews, fill: '#22c55e' },
    { name: 'Nötr', value: neutralReviews, fill: '#eab308' },
    { name: 'Olumsuz', value: negativeReviews, fill: '#ef4444' },
  ];

  // Monthly trend (last 6 months)
  const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const monthReviews = reviews?.filter(r => {
      const reviewDate = new Date(r.created_at);
      return reviewDate >= monthStart && reviewDate <= monthEnd;
    }) || [];

    const monthFavorites = favorites?.filter(f => {
      const favDate = new Date(f.created_at);
      return favDate >= monthStart && favDate <= monthEnd;
    }) || [];

    return {
      month: date.toLocaleDateString('tr-TR', { month: 'short' }),
      reviews: monthReviews.length,
      favorites: monthFavorites.length,
      avgRating: monthReviews.length > 0
        ? (monthReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / monthReviews.length).toFixed(1)
        : 0,
    };
  });

  if (isLoading) {
    return <LoadingState variant="spinner" text="Yorumlar yükleniyor..." />;
  }

  if (!reviews || reviews.length === 0) {
    return (
      <EnhancedEmptyState
        icon={Inbox}
        title="Henüz yorum yok"
        description="Siteniz hakkında henüz onaylanmış yorum bulunmuyor. İlk yorumların gelmesini bekleyin!"
        variant="centered"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Star className="h-4 w-4" />
              Ortalama Puan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">{totalReviews} değerlendirme</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ThumbsUp className="h-4 w-4" />
              Olumlu Yorumlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{positiveReviews}</div>
            <p className="text-xs text-muted-foreground">
              %{totalReviews > 0 ? ((positiveReviews / totalReviews) * 100).toFixed(0) : 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Toplam Yorum
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReviews}</div>
            <p className="text-xs text-muted-foreground">Tüm zamanlar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Favorilere Eklenme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{favorites?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Son 30 gün</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Puan Dağılımı</CardTitle>
            <CardDescription>Değerlendirmelerin yıldız bazında dağılımı</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ratingDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {ratingDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sentiment Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Duygu Analizi</CardTitle>
            <CardDescription>Yorumların genel dağılımı</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) =>
                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={80}
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Aylık Trend
          </CardTitle>
          <CardDescription>Son 6 ayın yorum ve favori trendi</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="reviews"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Yorumlar"
              />
              <Line
                type="monotone"
                dataKey="favorites"
                stroke="#22c55e"
                strokeWidth={2}
                name="Favoriler"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>Son Değerlendirmeler</CardTitle>
          <CardDescription>Kullanıcı yorumları ve puanları</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Tümü</TabsTrigger>
              <TabsTrigger value="positive">Olumlu</TabsTrigger>
              <TabsTrigger value="neutral">Nötr</TabsTrigger>
              <TabsTrigger value="negative">Olumsuz</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-4">
              {reviews?.slice(0, 10).map((review) => (
                <div key={review.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < (review.rating || 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <Badge
                        variant={
                          (review.rating || 0) >= 4
                            ? 'default'
                            : (review.rating || 0) === 3
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {review.rating} Yıldız
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(review.created_at), {
                        addSuffix: true,
                        locale: tr,
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="positive" className="space-y-4 mt-4">
              {reviews
                ?.filter(r => (r.rating || 0) >= 4)
                .slice(0, 10)
                .map((review) => (
                  <div key={review.id} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < (review.rating || 0)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <Badge variant="default">{review.rating} Yıldız</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(review.created_at), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
            </TabsContent>

            <TabsContent value="neutral" className="space-y-4 mt-4">
              {reviews
                ?.filter(r => (r.rating || 0) === 3)
                .slice(0, 10)
                .map((review) => (
                  <div key={review.id} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < (review.rating || 0)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <Badge variant="secondary">{review.rating} Yıldız</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(review.created_at), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
            </TabsContent>

            <TabsContent value="negative" className="space-y-4 mt-4">
              {reviews
                ?.filter(r => (r.rating || 0) <= 2)
                .slice(0, 10)
                .map((review) => (
                  <div key={review.id} className="p-4 rounded-lg border bg-card border-red-200 dark:border-red-900">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < (review.rating || 0)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <Badge variant="destructive">{review.rating} Yıldız</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(review.created_at), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
