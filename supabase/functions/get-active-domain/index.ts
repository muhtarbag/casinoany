// Get currently active domain for SEO/redirects
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
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get primary domain first
    const { data: primaryDomain } = await supabase
      .rpc('get_primary_domain');

    if (primaryDomain) {
      return new Response(
        JSON.stringify({
          success: true,
          domain: primaryDomain,
          isPrimary: true,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // If primary is not available, get next available
    const { data: nextDomain } = await supabase
      .rpc('get_next_available_domain');

    return new Response(
      JSON.stringify({
        success: true,
        domain: nextDomain || 'www.casinoany.com',
        isPrimary: false,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get active domain error:', errorMessage);
    return new Response(
      JSON.stringify({ 
        success: false, 
        domain: 'www.casinoany.com',
        error: errorMessage 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
