import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, Calendar, Award, Target } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface AnalysisRecord {
  id: string;
  created_at: string;
  score: number;
  summary: string;
  seo_data: any;
  technical_data: any;
  content_data: any;
  ux_data: any;
  provider: string;
}

export const AnalysisHistory = () => {
  const { data: history, isLoading } = useQuery({
    queryKey: ['analysis-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_analysis_history' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as any as AnalysisRecord[];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analiz Geçmişi Yükleniyor...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Analiz Geçmişi
          </CardTitle>
          <CardDescription>Henüz analiz yapılmadı. İlk analizinizi yapın!</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = [...history].reverse().map((record) => ({
    date: format(new Date(record.created_at), 'dd MMM', { locale: tr }),
    'SEO Skoru': record.score,
    'Teknik': record.technical_data?.score || 0,
    'UX': record.ux_data?.score || 0,
  }));

  // Calculate trends
  const latestScore = history[0].score;
  const previousScore = history[1]?.score || latestScore;
  const scoreTrend = latestScore - previousScore;
  const trendPercentage = previousScore > 0 ? ((scoreTrend / previousScore) * 100).toFixed(1) : '0';

  // Category improvements
  const categoryData = [
    {
      name: 'SEO',
      current: history[0].seo_data?.score || 0,
      previous: history[1]?.seo_data?.score || 0,
    },
    {
      name: 'Teknik',
      current: history[0].technical_data?.score || 0,
      previous: history[1]?.technical_data?.score || 0,
    },
    {
      name: 'İçerik',
      current: history[0].content_data?.score || 0,
      previous: history[1]?.content_data?.score || 0,
    },
    {
      name: 'UX',
      current: history[0].ux_data?.score || 0,
      previous: history[1]?.ux_data?.score || 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="w-4 h-4" />
              Güncel SEO Skoru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{latestScore}/100</div>
            <div className={`flex items-center gap-1 text-sm mt-2 ${scoreTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {scoreTrend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{scoreTrend >= 0 ? '+' : ''}{trendPercentage}% son analizden</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Toplam Analiz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{history.length}</div>
            <p className="text-sm text-muted-foreground mt-2">Tamamlanan analiz sayısı</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Son Analiz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">
              {format(new Date(history[0].created_at), 'dd MMMM yyyy', { locale: tr })}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {format(new Date(history[0].created_at), 'HH:mm', { locale: tr })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Score Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            SEO Skor Trendi
          </CardTitle>
          <CardDescription>Son {history.length} analizin karşılaştırması</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="SEO Skoru" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1}
                fill="url(#colorScore)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Kategori Karşılaştırması
          </CardTitle>
          <CardDescription>Mevcut vs Önceki Analiz</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="current" fill="hsl(var(--primary))" name="Güncel" />
              <Bar dataKey="previous" fill="hsl(var(--muted))" name="Önceki" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Multi-line Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Detaylı Performans Takibi</CardTitle>
          <CardDescription>SEO, Teknik ve UX skorları</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="SEO Skoru" stroke="hsl(var(--primary))" strokeWidth={2} />
              <Line type="monotone" dataKey="Teknik" stroke="hsl(var(--secondary))" strokeWidth={2} />
              <Line type="monotone" dataKey="UX" stroke="hsl(var(--accent))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Analysis List */}
      <Card>
        <CardHeader>
          <CardTitle>Analiz Geçmişi</CardTitle>
          <CardDescription>Son {history.length} analiz</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {history.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={record.score >= 70 ? 'default' : record.score >= 50 ? 'secondary' : 'destructive'}>
                      Skor: {record.score}
                    </Badge>
                    <Badge variant="outline">{record.provider === 'openai' ? 'OpenAI' : 'Lovable AI'}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{record.summary}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(record.created_at), "dd MMMM yyyy 'saat' HH:mm", { locale: tr })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
