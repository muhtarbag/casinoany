// Domain health check and automatic failover
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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 Starting domain health check...');

    // Get all active domains
    const { data: domains, error: domainsError } = await supabase
      .from('alternative_domains')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (domainsError) throw domainsError;

    const results = [];

    // Check each domain
    for (const domain of domains || []) {
      try {
        console.log(`Checking ${domain.domain}...`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`https://${domain.domain}`, {
          method: 'HEAD',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const isHealthy = response.ok;
        const newStatus = isHealthy ? 'active' : 'offline';

        // Update domain status
        const { error: updateError } = await supabase
          .from('alternative_domains')
          .update({
            status: newStatus,
            last_checked_at: new Date().toISOString(),
            blocked_at: !isHealthy && domain.status === 'active' ? new Date().toISOString() : domain.blocked_at,
          })
          .eq('id', domain.id);

        if (updateError) {
          console.error(`Failed to update ${domain.domain}:`, updateError);
        }

        results.push({
          domain: domain.domain,
          status: newStatus,
          healthy: isHealthy,
          responseCode: response.status,
        });

        console.log(`✓ ${domain.domain}: ${newStatus} (${response.status})`);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`✗ ${domain.domain}: Error -`, errorMessage);

        // Mark as offline on error
        await supabase
          .from('alternative_domains')
          .update({
            status: 'offline',
            last_checked_at: new Date().toISOString(),
            blocked_at: domain.status === 'active' ? new Date().toISOString() : domain.blocked_at,
          })
          .eq('id', domain.id);

        results.push({
          domain: domain.domain,
          status: 'offline',
          healthy: false,
          error: errorMessage,
        });
      }
    }

    // Check if primary domain is down and activate next available
    const primaryDomain = domains?.find(d => d.is_primary);
    if (primaryDomain && results.find(r => r.domain === primaryDomain.domain && !r.healthy)) {
      console.log('⚠️ Primary domain is down! Attempting failover...');

      const { data: nextDomain } = await supabase
        .rpc('get_next_available_domain');

      if (nextDomain) {
        console.log(`✓ Failover to: ${nextDomain}`);
        // Log this critical event
        await supabase.rpc('log_system_event', {
          p_log_type: 'domain_failover',
          p_severity: 'critical',
          p_action: 'automatic_failover',
          p_resource: `from ${primaryDomain.domain} to ${nextDomain}`,
          p_details: { results },
        });
      } else {
        console.error('✗ No alternative domain available!');
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        results,
        summary: {
          total: results.length,
          healthy: results.filter(r => r.healthy).length,
          offline: results.filter(r => !r.healthy).length,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Domain health check error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
