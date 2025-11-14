import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MetricData {
  site_id: string;
  total_clicks: number;
  total_views: number;
  total_conversions: number;
  estimated_revenue: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Starting affiliate metrics sync...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { targetDate } = await req.json().catch(() => ({ targetDate: null }));
    const syncDate = targetDate || new Date().toISOString().split('T')[0];

    console.log(`📅 Syncing metrics for date: ${syncDate}`);

    // Get all sites with affiliate contracts
    const { data: affiliateSites, error: sitesError } = await supabase
      .from('betting_sites')
      .select('id, name, affiliate_commission_percentage, affiliate_has_monthly_payment, affiliate_monthly_payment')
      .not('affiliate_contract_date', 'is', null);

    if (sitesError) {
      console.error('❌ Error fetching sites:', sitesError);
      throw sitesError;
    }

    console.log(`✅ Found ${affiliateSites?.length || 0} affiliate sites`);

    const results = [];

    // Process each affiliate site
    for (const site of affiliateSites || []) {
      try {
        console.log(`\n📊 Processing: ${site.name}`);

        // Get casino analytics for the date
        const { data: casinoAnalytics, error: casinoError } = await supabase
          .from('casino_content_analytics')
          .select('total_views, affiliate_clicks, block_interactions')
          .eq('site_id', site.id)
          .eq('view_date', syncDate)
          .single();

        if (casinoError && casinoError.code !== 'PGRST116') {
          console.error(`⚠️ Casino analytics error for ${site.name}:`, casinoError);
        }

        // Get site stats (all-time)
        const { data: siteStats, error: statsError } = await supabase
          .from('site_stats')
          .select('views, clicks')
          .eq('site_id', site.id)
          .single();

        if (statsError && statsError.code !== 'PGRST116') {
          console.error(`⚠️ Site stats error for ${site.name}:`, statsError);
        }

        // Get page views for the date
        const { data: pageViews, error: pageViewsError } = await supabase
          .from('page_views')
          .select('id')
          .gte('created_at', `${syncDate}T00:00:00`)
          .lte('created_at', `${syncDate}T23:59:59`)
          .ilike('page_path', `%${site.id}%`);

        if (pageViewsError) {
          console.error(`⚠️ Page views error for ${site.name}:`, pageViewsError);
        }

        // Calculate metrics
        const totalViews = (casinoAnalytics?.total_views || 0) + (pageViews?.length || 0);
        const totalClicks = casinoAnalytics?.affiliate_clicks || 0;
        
        // Calculate conversions from block interactions (if user clicked on multiple blocks)
        const blockInteractions = casinoAnalytics?.block_interactions || {};
        const totalConversions = Object.values(blockInteractions as Record<string, number>)
          .reduce((sum: number, count) => sum + (count as number), 0);

        // Calculate estimated revenue
        let estimatedRevenue = 0;
        if (site.affiliate_has_monthly_payment && site.affiliate_monthly_payment) {
          // For monthly payment sites, divide by 30 days
          estimatedRevenue = Number(site.affiliate_monthly_payment) / 30;
        } else if (site.affiliate_commission_percentage && totalConversions > 0) {
          // Estimate based on commission percentage
          // Assuming average bet value of 100 TL per conversion (this can be adjusted)
          const avgBetValue = 100;
          estimatedRevenue = (totalConversions * avgBetValue * Number(site.affiliate_commission_percentage)) / 100;
        }

        // Prepare metric data
        const metricData: MetricData = {
          site_id: site.id,
          total_clicks: totalClicks,
          total_views: totalViews,
          total_conversions: totalConversions,
          estimated_revenue: Number(estimatedRevenue.toFixed(2)),
        };

        console.log(`  📈 Metrics for ${site.name}:`, metricData);

        // Insert or update affiliate metrics
        const { error: upsertError } = await supabase
          .from('affiliate_metrics')
          .upsert({
            ...metricData,
            metric_date: syncDate,
          }, {
            onConflict: 'site_id,metric_date',
          });

        if (upsertError) {
          console.error(`❌ Upsert error for ${site.name}:`, upsertError);
          results.push({
            site_id: site.id,
            site_name: site.name,
            success: false,
            error: upsertError.message,
          });
        } else {
          console.log(`  ✅ Successfully synced ${site.name}`);
          results.push({
            site_id: site.id,
            site_name: site.name,
            success: true,
            metrics: metricData,
          });
        }
      } catch (error) {
        console.error(`❌ Error processing ${site.name}:`, error);
        results.push({
          site_id: site.id,
          site_name: site.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`\n✅ Sync completed: ${successCount} successful, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Affiliate metrics synced for ${syncDate}`,
        results,
        stats: {
          total: results.length,
          successful: successCount,
          failed: failCount,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Fatal error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});