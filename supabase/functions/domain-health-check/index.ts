// Domain health check and automatic failover with advanced DNS + HTTP/HTTPS checks
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Advanced health check function with DNS resolution and multiple protocol support
async function checkDomainHealth(domain: string): Promise<{
  healthy: boolean;
  status: string;
  protocol?: string;
  statusCode?: number;
  responseTime?: number;
  error?: string;
  dnsResolved?: boolean;
}> {
  const startTime = Date.now();
  
  try {
    // First, try to resolve DNS
    console.log(`🔍 DNS lookup for ${domain}...`);
    try {
      const dnsResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
      const dnsData = await dnsResponse.json();
      
      if (!dnsData.Answer || dnsData.Answer.length === 0) {
        console.log(`❌ DNS resolution failed for ${domain}`);
        return {
          healthy: false,
          status: 'offline',
          dnsResolved: false,
          error: 'DNS resolution failed - domain not found',
          responseTime: Date.now() - startTime,
        };
      }
      
      console.log(`✓ DNS resolved for ${domain}: ${dnsData.Answer[0].data}`);
    } catch (dnsError) {
      console.log(`⚠️ DNS check error for ${domain}:`, dnsError);
      // Continue anyway, the domain might still be accessible
    }

    // Try HTTPS first (preferred)
    console.log(`🔐 Trying HTTPS for ${domain}...`);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const httpsResponse = await fetch(`https://${domain}`, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; DomainHealthCheck/1.0)',
          'Accept': '*/*',
        },
        redirect: 'follow',
      });

      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;
      
      if (httpsResponse.ok || httpsResponse.status === 301 || httpsResponse.status === 302) {
        console.log(`✓ HTTPS works for ${domain} (${httpsResponse.status}) in ${responseTime}ms`);
        return {
          healthy: true,
          status: 'active',
          protocol: 'https',
          statusCode: httpsResponse.status,
          responseTime,
          dnsResolved: true,
        };
      }
      
      console.log(`⚠️ HTTPS returned ${httpsResponse.status} for ${domain}`);
    } catch (httpsError) {
      console.log(`❌ HTTPS failed for ${domain}:`, httpsError instanceof Error ? httpsError.message : httpsError);
    }

    // Try HTTP as fallback
    console.log(`🔓 Trying HTTP for ${domain}...`);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const httpResponse = await fetch(`http://${domain}`, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; DomainHealthCheck/1.0)',
          'Accept': '*/*',
        },
        redirect: 'follow',
      });

      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;
      
      if (httpResponse.ok || httpResponse.status === 301 || httpResponse.status === 302) {
        console.log(`✓ HTTP works for ${domain} (${httpResponse.status}) in ${responseTime}ms`);
        return {
          healthy: true,
          status: 'active',
          protocol: 'http',
          statusCode: httpResponse.status,
          responseTime,
          dnsResolved: true,
        };
      }
      
      console.log(`⚠️ HTTP returned ${httpResponse.status} for ${domain}`);
      return {
        healthy: false,
        status: 'offline',
        protocol: 'http',
        statusCode: httpResponse.status,
        responseTime,
        dnsResolved: true,
        error: `HTTP returned ${httpResponse.status}`,
      };
    } catch (httpError) {
      const errorMessage = httpError instanceof Error ? httpError.message : 'Unknown error';
      console.log(`❌ HTTP also failed for ${domain}:`, errorMessage);
      return {
        healthy: false,
        status: 'offline',
        responseTime: Date.now() - startTime,
        dnsResolved: true,
        error: `Both HTTPS and HTTP failed: ${errorMessage}`,
      };
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Complete failure for ${domain}:`, errorMessage);
    return {
      healthy: false,
      status: 'offline',
      responseTime: Date.now() - startTime,
      error: errorMessage,
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🚀 Starting advanced domain health check...');
    console.log('⏰ Started at:', new Date().toISOString());

    // Get all active domains
    const { data: domains, error: domainsError } = await supabase
      .from('alternative_domains')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (domainsError) throw domainsError;

    if (!domains || domains.length === 0) {
      console.log('⚠️ No active domains found to check');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No active domains to check',
          results: [],
          summary: { total: 0, healthy: 0, offline: 0 },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📋 Checking ${domains.length} domains...`);

    const results = [];

    // Check each domain with advanced health check
    for (const domain of domains) {
      console.log(`\n🔍 Checking ${domain.domain} (priority: ${domain.priority})...`);
      
      const healthCheck = await checkDomainHealth(domain.domain);
      
      // Update domain status in database
      const updateData: any = {
        status: healthCheck.status,
        last_checked_at: new Date().toISOString(),
      };
      
      // Only update blocked_at if status changed from active to offline
      if (!healthCheck.healthy && domain.status === 'active') {
        updateData.blocked_at = new Date().toISOString();
      }
      
      const { error: updateError } = await supabase
        .from('alternative_domains')
        .update(updateData)
        .eq('id', domain.id);

      if (updateError) {
        console.error(`❌ Failed to update ${domain.domain}:`, updateError);
      }

      results.push({
        domain: domain.domain,
        priority: domain.priority,
        is_primary: domain.is_primary,
        ...healthCheck,
      });

      const statusEmoji = healthCheck.healthy ? '✅' : '❌';
      console.log(`${statusEmoji} ${domain.domain}: ${healthCheck.status} (${healthCheck.protocol || 'N/A'}, ${healthCheck.responseTime}ms)`);
    }

    // Summary statistics
    const summary = {
      total: results.length,
      healthy: results.filter(r => r.healthy).length,
      offline: results.filter(r => !r.healthy).length,
      avgResponseTime: Math.round(
        results.reduce((acc, r) => acc + (r.responseTime || 0), 0) / results.length
      ),
    };

    console.log(`\n📊 Summary: ${summary.healthy}/${summary.total} domains healthy (avg: ${summary.avgResponseTime}ms)`);

    // Check if primary domain is down and activate next available
    const primaryDomain = domains.find(d => d.is_primary);
    const primaryResult = results.find(r => r.domain === primaryDomain?.domain);
    
    if (primaryDomain && primaryResult && !primaryResult.healthy) {
      console.log(`\n⚠️ PRIMARY DOMAIN DOWN: ${primaryDomain.domain}`);
      console.log('🔄 Attempting automatic failover...');

      const { data: nextDomain, error: rpcError } = await supabase
        .rpc('get_next_available_domain');

      if (rpcError) {
        console.error('❌ Failover RPC error:', rpcError);
      } else if (nextDomain) {
        console.log(`✅ Failover successful to: ${nextDomain}`);
        
        // Log this critical event
        try {
          await supabase.rpc('log_system_event', {
            p_log_type: 'domain_failover',
            p_severity: 'critical',
            p_action: 'automatic_failover',
            p_resource: `from ${primaryDomain.domain} to ${nextDomain}`,
            p_details: { 
              primaryDomainError: primaryResult.error,
              checkResults: results,
              timestamp: new Date().toISOString(),
            },
          });
        } catch (logError) {
          console.error('⚠️ Failed to log failover event:', logError);
        }
      } else {
        console.error('❌ CRITICAL: No alternative domain available for failover!');
      }
    } else if (primaryDomain && primaryResult?.healthy) {
      console.log(`\n✅ Primary domain ${primaryDomain.domain} is healthy`);
    }

    console.log('✅ Health check completed at:', new Date().toISOString());
    console.log('==========================================\n');

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        results,
        summary,
        primaryDomain: primaryDomain?.domain,
        primaryHealthy: primaryResult?.healthy ?? false,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ CRITICAL: Health check failed:', errorMessage);
    console.error('Stack:', error instanceof Error ? error.stack : 'N/A');
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
