import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';
import { handleError, logError, createSuccessResponse } from '../_shared/errorHandler.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cron job: Her gün saat 02:00'da çalışacak
Deno.cron("Daily Affiliate Metrics Sync", "0 2 * * *", async () => {
  console.log('🚀 Starting daily affiliate metrics sync...');
  
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    // Call the sync function
    const { error } = await supabaseAdmin.rpc('sync_daily_affiliate_metrics');
    
    if (error) {
      console.error('❌ Sync failed:', error);
      throw error;
    }
    
    console.log('✅ Affiliate metrics synced successfully');
    
    // Log health metric
    await supabaseAdmin.rpc('record_health_metric', {
      p_metric_type: 'cron_job',
      p_metric_name: 'affiliate_sync',
      p_metric_value: 1,
      p_status: 'healthy',
      p_metadata: { timestamp: new Date().toISOString() }
    });
    
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    
    // Structured error logging
    await logError(supabaseAdmin, err, {
      functionName: 'daily-affiliate-sync',
      operation: 'cron',
      metadata: { 
        cronSchedule: '0 2 * * *',
        timestamp: new Date().toISOString()
      }
    });
    
    // Log error metric
    await supabaseAdmin.rpc('record_health_metric', {
      p_metric_type: 'cron_job',
      p_metric_name: 'affiliate_sync',
      p_metric_value: 0,
      p_status: 'error',
      p_metadata: { 
        timestamp: new Date().toISOString(),
        error: err.message 
      }
    });
  }
});

// Manual trigger endpoint
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    console.log('🔄 Manual sync triggered');
    
    const { error } = await supabaseAdmin.rpc('sync_daily_affiliate_metrics');
    
    if (error) throw error;
    
    return createSuccessResponse(
      { message: 'Affiliate metrics synced successfully' },
      corsHeaders
    );
    
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    return handleError(supabaseAdmin, err, {
      functionName: 'daily-affiliate-sync',
      operation: 'manual-trigger',
    }, corsHeaders);
  }
});
