// Cleanup Scheduler - Runs maintenance tasks
// Call this endpoint periodically (e.g., via external cron service like cron-job.org)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results = {
      tasks_completed: [] as string[],
      errors: [] as string[],
      timestamp: new Date().toISOString()
    };

    // 1. Cleanup old rate limits
    try {
      await supabase.rpc('cleanup_old_rate_limits');
      results.tasks_completed.push('cleanup_old_rate_limits');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      results.errors.push(`cleanup_old_rate_limits: ${msg}`);
    }

    // 2. Sync affiliate metrics
    try {
      await supabase.rpc('sync_daily_affiliate_metrics');
      results.tasks_completed.push('sync_daily_affiliate_metrics');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      results.errors.push(`sync_daily_affiliate_metrics: ${msg}`);
    }

    // 3. Update analytics summary
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split('T')[0];
      
      await supabase.rpc('update_analytics_daily_summary', { 
        target_date: dateStr 
      });
      results.tasks_completed.push('update_analytics_daily_summary');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      results.errors.push(`update_analytics_daily_summary: ${msg}`);
    }

    // 4. Refresh materialized views
    try {
      await supabase.rpc('refresh_all_materialized_views');
      results.tasks_completed.push('refresh_all_materialized_views');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      results.errors.push(`refresh_all_materialized_views: ${msg}`);
    }

    // 5. Cleanup old logs (optional - keep last 30 days)
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      await supabase
        .from('system_logs')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString());

      results.tasks_completed.push('cleanup_old_system_logs');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      results.errors.push(`cleanup_old_system_logs: ${msg}`);
    }

    // Log the maintenance run
    await supabase.rpc('log_system_event', {
      p_log_type: 'system_maintenance',
      p_severity: results.errors.length > 0 ? 'warning' : 'info',
      p_action: 'scheduled_cleanup',
      p_details: results
    });

    const status = results.errors.length > 0 ? 206 : 200; // 206 Partial Content if errors
    return new Response(JSON.stringify(results), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Cleanup scheduler error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
