// Serve the stored sitemap from database
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=UTF-8',
  'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get sitemap from database
    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_value, updated_at')
      .eq('setting_key', 'sitemap_xml')
      .maybeSingle();

    if (error) throw error;

    // If no sitemap in database, trigger generation
    if (!data) {
      console.log('No sitemap in database, triggering generation...');
      
      // Call update-sitemap function
      const updateResponse = await fetch(`${supabaseUrl}/functions/v1/update-sitemap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        },
        body: JSON.stringify({ trigger: 'first_generation' }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to generate sitemap');
      }

      // Fetch newly generated sitemap
      const { data: newData, error: newError } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'sitemap_xml')
        .single();

      if (newError) throw newError;

      return new Response(newData.setting_value, {
        headers: {
          ...corsHeaders,
          'Last-Modified': new Date().toUTCString(),
        }
      });
    }

    return new Response(data.setting_value, {
      headers: {
        ...corsHeaders,
        'Last-Modified': data.updated_at ? new Date(data.updated_at).toUTCString() : new Date().toUTCString(),
      }
    });

  } catch (error) {
    console.error('Sitemap error:', error);
    
    // Return basic sitemap as fallback
    const baseUrl = Deno.env.get('SITE_BASE_URL') || 'https://yourdomain.com';
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new Response(fallbackSitemap, {
      headers: corsHeaders
    });
  }
});
