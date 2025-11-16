import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Zap, TrendingUp, Clock, Gauge } from 'lucide-react';
import { toast } from 'sonner';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format } from 'date-fns';

interface PageSpeedHistory {
  id: string;
  url: string;
  performance_score: number;
  fcp: number;
  lcp: number;
  cls: number;
  tbt: number;
  si: number;
  strategy: string;
  test_date: string;
}

export const PageSpeedMonitor = () => {
  const [testing, setTesting] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState('https://bahiskarsilastirma.com');

  const { data: history, isLoading, refetch } = useQuery({
    queryKey: ['pagespeed-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pagespeed_history')
        .select('*')
        .order('test_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as PageSpeedHistory[];
    },
  });

  const runPageSpeedTest = async () => {
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-pagespeed', {
        body: { 
          url: selectedUrl,
          strategy: 'mobile'
        },
      });

      if (error) throw error;

      toast.success('PageSpeed test completed!', {
        description: `Score: ${data.result.performance_score}/100`,
      });

      refetch();
    } catch (error) {
      console.error('PageSpeed test error:', error);
      toast.error('PageSpeed test failed', {
        description: error.message,
      });
    } finally {
      setTesting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 50) return 'secondary';
    return 'destructive';
  };

  const chartData = history?.map(h => ({
    date: format(new Date(h.test_date), 'MMM dd HH:mm'),
    score: h.performance_score,
    lcp: Math.round(h.lcp),
    fcp: Math.round(h.fcp),
  })) || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Google PageSpeed Insights
          </CardTitle>
          <CardDescription>
            Test your site's performance with Google PageSpeed API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <input
              type="url"
              value={selectedUrl}
              onChange={(e) => setSelectedUrl(e.target.value)}
              placeholder="Enter URL to test"
              className="flex-1 px-3 py-2 border rounded-md"
            />
            <Button
              onClick={runPageSpeedTest}
              disabled={testing || !selectedUrl}
              className="min-w-[140px]"
            >
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Test Now
                </>
              )}
            </Button>
          </div>

          {history && history.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Latest Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(history[0].performance_score)}`}>
                  {history[0].performance_score}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">LCP</p>
                <p className="text-2xl font-bold">
                  {(history[0].lcp / 1000).toFixed(2)}s
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">FCP</p>
                <p className="text-2xl font-bold">
                  {(history[0].fcp / 1000).toFixed(2)}s
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">CLS</p>
                <p className="text-2xl font-bold">
                  {history[0].cls.toFixed(3)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">TBT</p>
                <p className="text-2xl font-bold">
                  {Math.round(history[0].tbt)}ms
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Performance Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Test History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : history && history.length > 0 ? (
            <div className="space-y-2">
              {history.map((test) => (
                <div
                  key={test.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{test.url}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(test.test_date), 'PPp')} • {test.strategy}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-sm">
                      <p>LCP: {(test.lcp / 1000).toFixed(2)}s</p>
                      <p>CLS: {test.cls.toFixed(3)}</p>
                    </div>
                    <Badge variant={getScoreBadge(test.performance_score)}>
                      {test.performance_score}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No test history yet. Run your first test!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
