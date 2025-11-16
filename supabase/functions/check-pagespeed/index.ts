import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PageSpeedResult {
  url: string;
  performance_score: number;
  fcp: number;
  lcp: number;
  cls: number;
  tbt: number;
  si: number;
  strategy: string;
  lighthouse_version: string;
  fetch_time: number;
  metadata: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, strategy = 'mobile' } = await req.json();
    
    if (!url) {
      throw new Error('URL is required');
    }

    const apiKey = Deno.env.get('PAGESPEED_API_KEY');
    if (!apiKey) {
      throw new Error('PageSpeed API key not configured');
    }

    console.log(`Testing PageSpeed for: ${url} (${strategy})`);

    // Call Google PageSpeed Insights API
    const pagespeedUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&key=${apiKey}`;
    
    const startTime = Date.now();
    const response = await fetch(pagespeedUrl);
    const fetchTime = (Date.now() - startTime) / 1000;

    if (!response.ok) {
      throw new Error(`PageSpeed API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract lighthouse results
    const lighthouse = data.lighthouseResult;
    const metrics = lighthouse.audits;

    const result: PageSpeedResult = {
      url,
      performance_score: Math.round(lighthouse.categories.performance.score * 100),
      fcp: metrics['first-contentful-paint']?.numericValue || 0,
      lcp: metrics['largest-contentful-paint']?.numericValue || 0,
      cls: metrics['cumulative-layout-shift']?.numericValue || 0,
      tbt: metrics['total-blocking-time']?.numericValue || 0,
      si: metrics['speed-index']?.numericValue || 0,
      strategy,
      lighthouse_version: lighthouse.lighthouseVersion,
      fetch_time: fetchTime,
      metadata: {
        fetch_time_ms: lighthouse.fetchTime,
        final_url: lighthouse.finalUrl,
        user_agent: lighthouse.userAgent,
      }
    };

    console.log('PageSpeed test completed:', result);

    // Store in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: insertError } = await supabase
      .from('pagespeed_history')
      .insert(result);

    if (insertError) {
      console.error('Error storing PageSpeed result:', insertError);
      throw insertError;
    }

    console.log('PageSpeed result stored successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        result 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in check-pagespeed function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
