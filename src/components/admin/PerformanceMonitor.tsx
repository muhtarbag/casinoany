/**
 * Performance Monitoring Dashboard
 * Real-time performance metrics and query cache status
 */

import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Database, Clock, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

export const PerformanceMonitor = () => {
  const queryClient = useQueryClient();
  const [metrics, setMetrics] = useState({
    totalQueries: 0,
    cachedQueries: 0,
    staleQueries: 0,
    fetchingQueries: 0,
    cacheHitRate: 0,
  });

  useEffect(() => {
    const updateMetrics = () => {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();

      const totalQueries = queries.length;
      const cachedQueries = queries.filter(q => q.state.data !== undefined).length;
      const staleQueries = queries.filter(q => q.isStale()).length;
      const fetchingQueries = queries.filter(q => q.state.fetchStatus === 'fetching').length;
      const cacheHitRate = totalQueries > 0 ? ((cachedQueries / totalQueries) * 100).toFixed(1) : 0;

      setMetrics({
        totalQueries,
        cachedQueries,
        staleQueries,
        fetchingQueries,
        cacheHitRate: Number(cacheHitRate),
      });
    };

    // Update immediately
    updateMetrics();

    // Update every 2 seconds
    const interval = setInterval(updateMetrics, 2000);

    return () => clearInterval(interval);
  }, [queryClient]);

  const getQueryList = () => {
    const cache = queryClient.getQueryCache();
    return cache.getAll().map(query => ({
      key: JSON.stringify(query.queryKey),
      status: query.state.fetchStatus,
      dataUpdatedAt: query.state.dataUpdatedAt,
      isStale: query.isStale(),
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Performance Monitor</h2>
        <p className="text-muted-foreground">Real-time query cache and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="w-4 h-4" />
              Total Queries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalQueries}</div>
            <p className="text-xs text-muted-foreground mt-1">Active in cache</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Cache Hit Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cacheHitRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.cachedQueries}/{metrics.totalQueries} cached
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Stale Queries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.staleQueries}</div>
            <p className="text-xs text-muted-foreground mt-1">Need refetch</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Active Fetches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.fetchingQueries}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently loading</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Query Cache Status</CardTitle>
          <CardDescription>Real-time status of all cached queries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {getQueryList().map((query, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg text-sm"
              >
                <div className="flex-1 font-mono text-xs truncate">{query.key}</div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      query.status === 'fetching'
                        ? 'default'
                        : query.isStale
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {query.status === 'fetching' ? 'Fetching' : query.isStale ? 'Stale' : 'Fresh'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(query.dataUpdatedAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
