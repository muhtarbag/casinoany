import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function checkRateLimit(supabase: any, ip: string, functionName: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  const now = new Date();
  const { data: banned } = await supabase.from('api_rate_limits').select('banned_until').eq('ip_address', ip).eq('function_name', functionName).gte('banned_until', now.toISOString()).maybeSingle();
  if (banned) return { allowed: false, retryAfter: Math.ceil((new Date(banned.banned_until).getTime() - now.getTime()) / 1000) };
  const windowStart = new Date(now.getTime() - 60000);
  const { data: existing } = await supabase.from('api_rate_limits').select('*').eq('ip_address', ip).eq('function_name', functionName).gte('window_start', windowStart.toISOString()).maybeSingle();
  if (existing) {
    if (existing.request_count >= 10) {
      await supabase.from('api_rate_limits').update({ banned_until: new Date(now.getTime() + 60000).toISOString(), updated_at: now.toISOString() }).eq('id', existing.id);
      return { allowed: false, retryAfter: 60 };
    }
    await supabase.from('api_rate_limits').update({ request_count: existing.request_count + 1, updated_at: now.toISOString() }).eq('id', existing.id);
    return { allowed: true };
  }
  await supabase.from('api_rate_limits').insert({ ip_address: ip, function_name: functionName, request_count: 1, window_start: now.toISOString() });
  return { allowed: true };
}

interface ConsistencyIssue {
  type: string;
  severity: 'critical' | 'warning' | 'info';
  description: string;
  affected_count: number;
  recommendation: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const rateLimit = await checkRateLimit(supabaseClient, ip, 'analytics-consistency-check');
    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({ error: 'Too Many Requests' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': String(rateLimit.retryAfter || 60) }
      });
    }

    console.log('🔍 Starting analytics consistency check...');
    const issues: ConsistencyIssue[] = [];

    // CHECK 1: News articles with zero view count
    const { count: zeroViewNewsCount } = await supabaseClient
      .from('news_articles')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true)
      .eq('view_count', 0)
      .gte('published_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (zeroViewNewsCount && zeroViewNewsCount > 5) {
      issues.push({
        type: 'news_view_count',
        severity: 'critical',
        description: `${zeroViewNewsCount} published news articles from last 7 days have 0 views`,
        affected_count: zeroViewNewsCount,
        recommendation: 'Verify increment_news_view_count() is being called',
      });
    }

    // CHECK 2: Site stats vs actual page views mismatch
    const { data: sitesWithStats } = await supabaseClient
      .from('betting_sites')
      .select(`
        id, 
        name, 
        slug,
        site_stats(views, clicks)
      `)
      .eq('is_active', true);

    let mismatchCount = 0;
    if (sitesWithStats) {
      for (const site of sitesWithStats) {
        const { count: actualViews } = await supabaseClient
          .from('page_views')
          .select('*', { count: 'exact', head: true })
          .ilike('page_path', `%${site.slug}%`);

        const statViews = (site.site_stats as any)?.[0]?.views || 0;
        const difference = Math.abs((actualViews || 0) - statViews);
        
        // Only flag if both have data AND there's a significant difference (>5 views)
        if (difference > 5 && (statViews > 0 || (actualViews || 0) > 0)) {
          const percentDiff = Math.max(statViews, actualViews || 0) > 0 
            ? (difference / Math.max(statViews, actualViews || 0)) * 100 
            : 0;
          
          if (percentDiff > 30) {
            mismatchCount++;
          }
        }
      }
    }

    if (mismatchCount > 0) {
      issues.push({
        type: 'site_stats_mismatch',
        severity: 'critical',
        description: `${mismatchCount} sites have >30% mismatch between site_stats and actual page_views`,
        affected_count: mismatchCount,
        recommendation: 'Migrate from site_stats to page_views for dashboard metrics',
      });
    }

    // CHECK 3: Casino analytics empty fields
    const { data: emptyBounceRate } = await supabaseClient
      .from('casino_content_analytics')
      .select('id')
      .eq('bounce_rate', 0)
      .eq('avg_time_on_page', 0)
      .gte('view_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(100);

    if (emptyBounceRate && emptyBounceRate.length > 10) {
      issues.push({
        type: 'casino_analytics_empty_fields',
        severity: 'warning',
        description: `${emptyBounceRate.length} casino analytics records missing bounce_rate and avg_time_on_page`,
        affected_count: emptyBounceRate.length,
        recommendation: 'Update increment_casino_analytics() to calculate these fields',
      });
    }

    // CHECK 4: Page views with zero duration
    const { count: zeroDurationCount } = await supabaseClient
      .from('page_views')
      .select('*', { count: 'exact', head: true })
      .eq('duration', 0)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const { count: totalRecentViews } = await supabaseClient
      .from('page_views')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const zeroDurationPercent = totalRecentViews && totalRecentViews > 0
      ? ((zeroDurationCount || 0) / totalRecentViews) * 100
      : 0;

    if (zeroDurationPercent > 50) {
      issues.push({
        type: 'page_view_duration',
        severity: 'warning',
        description: `${zeroDurationPercent.toFixed(1)}% of page views in last 24h have 0 duration`,
        affected_count: zeroDurationCount || 0,
        recommendation: 'Implement duration tracking with Visibility API',
      });
    }

    // CHECK 5: Affiliate metrics data quality
    const { data: affiliateMetrics } = await supabaseClient
      .from('affiliate_metrics')
      .select('site_id, metric_date, total_views, total_clicks')
      .gte('metric_date', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
      .order('metric_date', { ascending: false });

    if (affiliateMetrics && affiliateMetrics.length > 0) {
      // Group by site and check for identical values across multiple days
      const siteMetrics = new Map<string, number[]>();
      affiliateMetrics.forEach(m => {
        if (!siteMetrics.has(m.site_id)) {
          siteMetrics.set(m.site_id, []);
        }
        siteMetrics.get(m.site_id)!.push(m.total_views);
      });

      let suspiciousSites = 0;
      siteMetrics.forEach((views, siteId) => {
        if (views.length >= 3) {
          const uniqueValues = new Set(views.slice(0, 7)).size;
          if (uniqueValues === 1) {
            suspiciousSites++;
          }
        }
      });

      if (suspiciousSites > 0) {
        issues.push({
          type: 'affiliate_metrics_duplicate_values',
          severity: 'critical',
          description: `${suspiciousSites} affiliate sites have identical metrics for multiple consecutive days`,
          affected_count: suspiciousSites,
          recommendation: 'Fix sync_daily_affiliate_metrics() to calculate daily incremental values',
        });
      }
    }

    // CHECK 6: Notification clicks
    const { count: notificationViews } = await supabaseClient
      .from('notification_views')
      .select('*', { count: 'exact', head: true })
      .gte('viewed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const { count: notificationClicks } = await supabaseClient
      .from('notification_views')
      .select('*', { count: 'exact', head: true })
      .eq('clicked', true)
      .gte('viewed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const clickRate = notificationViews && notificationViews > 0
      ? ((notificationClicks || 0) / notificationViews) * 100
      : 0;

    if (notificationViews && notificationViews > 100 && clickRate < 1) {
      issues.push({
        type: 'notification_clicks',
        severity: 'warning',
        description: `Only ${clickRate.toFixed(2)}% click rate on notifications (${notificationClicks}/${notificationViews})`,
        affected_count: notificationViews - (notificationClicks || 0),
        recommendation: 'Verify notification click tracking is properly implemented',
      });
    }

    // Calculate overall consistency score
    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    
    let consistencyScore = 10;
    consistencyScore -= criticalCount * 2;
    consistencyScore -= warningCount * 1;
    consistencyScore = Math.max(0, consistencyScore);

    console.log(`✅ Consistency check complete. Score: ${consistencyScore}/10`);
    console.log(`   Critical issues: ${criticalCount}`);
    console.log(`   Warnings: ${warningCount}`);

    // Log to system_logs
    await supabaseClient.rpc('log_system_event', {
      p_log_type: 'analytics_consistency_check',
      p_severity: criticalCount > 0 ? 'error' : warningCount > 0 ? 'warning' : 'info',
      p_action: 'consistency_check_completed',
      p_details: {
        consistency_score: consistencyScore,
        critical_issues: criticalCount,
        warnings: warningCount,
        total_issues: issues.length,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        consistency_score: consistencyScore,
        issues,
        summary: {
          total_checks: 6,
          critical_issues: criticalCount,
          warnings: warningCount,
          info_issues: issues.filter(i => i.severity === 'info').length,
        },
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Consistency check error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
