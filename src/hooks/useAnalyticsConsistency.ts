import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ConsistencyIssue {
  type: string;
  severity: 'critical' | 'warning' | 'info';
  description: string;
  affected_count: number;
  recommendation: string;
}

interface ConsistencyReport {
  consistency_score: number;
  issues: ConsistencyIssue[];
  summary: {
    total_checks: number;
    critical_issues: number;
    warnings: number;
    info_issues: number;
  };
  timestamp: string;
}

/**
 * Hook to monitor analytics data consistency
 * Runs automated checks to detect data quality issues
 */
export const useAnalyticsConsistency = () => {
  return useQuery<ConsistencyReport>({
    queryKey: ['analytics-consistency'],
    queryFn: async () => {
      console.log('🔍 Running analytics consistency check...');
      
      const issues: ConsistencyIssue[] = [];

      // CHECK 1: News articles with zero views (last 7 days)
      const { count: zeroViewNews } = await supabase
        .from('news_articles')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true)
        .eq('view_count', 0)
        .gte('published_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (zeroViewNews && zeroViewNews > 5) {
        issues.push({
          type: 'news_view_count',
          severity: 'critical',
          description: `${zeroViewNews} yayınlanan haber 0 görüntüleme ile`,
          affected_count: zeroViewNews,
          recommendation: 'News view tracking kontrol edilmeli',
        });
      }

      // CHECK 2: Page views with zero duration (last 24h)
      const { count: totalViews24h } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const { count: zeroDuration } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .eq('duration', 0)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const zeroDurationPercent = totalViews24h && totalViews24h > 0
        ? ((zeroDuration || 0) / totalViews24h) * 100
        : 0;

      if (zeroDurationPercent > 50) {
        issues.push({
          type: 'page_duration',
          severity: 'warning',
          description: `Son 24 saatte görüntülemelerin %${zeroDurationPercent.toFixed(1)}'i 0 süre ile`,
          affected_count: zeroDuration || 0,
          recommendation: 'Duration tracking implementasyonu gerekli',
        });
      }

      // CHECK 3: Casino analytics empty bounce/time fields
      const { data: casinoAnalytics } = await supabase
        .from('casino_content_analytics')
        .select('id, bounce_rate, avg_time_on_page')
        .gte('view_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const emptyFieldsCount = casinoAnalytics?.filter(
        ca => ca.bounce_rate === 0 && ca.avg_time_on_page === 0
      ).length || 0;

      if (emptyFieldsCount > 5) {
        issues.push({
          type: 'casino_analytics_fields',
          severity: 'warning',
          description: `${emptyFieldsCount} casino analytics kaydı bounce_rate ve avg_time_on_page verisi yok`,
          affected_count: emptyFieldsCount,
          recommendation: 'increment_casino_analytics() fonksiyonu güncellenmeli',
        });
      }

      // CHECK 4: Notification click rate
      const { count: notifViews } = await supabase
        .from('notification_views')
        .select('*', { count: 'exact', head: true })
        .gte('viewed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const { count: notifClicks } = await supabase
        .from('notification_views')
        .select('*', { count: 'exact', head: true })
        .eq('clicked', true)
        .gte('viewed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const clickRate = notifViews && notifViews > 0
        ? ((notifClicks || 0) / notifViews) * 100
        : 0;

      if (notifViews && notifViews > 100 && clickRate < 1) {
        issues.push({
          type: 'notification_clicks',
          severity: 'info',
          description: `Bildirim tıklama oranı çok düşük: %${clickRate.toFixed(2)} (${notifClicks}/${notifViews})`,
          affected_count: notifViews - (notifClicks || 0),
          recommendation: 'Notification UX iyileştirmesi veya tracking doğrulaması',
        });
      }

      // Calculate consistency score
      const criticalCount = issues.filter(i => i.severity === 'critical').length;
      const warningCount = issues.filter(i => i.severity === 'warning').length;
      
      let consistencyScore = 10;
      consistencyScore -= criticalCount * 2.5;
      consistencyScore -= warningCount * 1;
      consistencyScore = Math.max(0, Math.min(10, consistencyScore));

      console.log(`✅ Consistency score: ${consistencyScore}/10`);

      return {
        consistency_score: consistencyScore,
        issues,
        summary: {
          total_checks: 4,
          critical_issues: criticalCount,
          warnings: warningCount,
          info_issues: issues.filter(i => i.severity === 'info').length,
        },
        timestamp: new Date().toISOString(),
      };
    },
    refetchInterval: 5 * 60 * 1000, // Every 5 minutes
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};
