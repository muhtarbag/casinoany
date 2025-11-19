// Complaints Sitemap
// Handles all site complaints

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );

    const { data: primaryDomain } = await supabase.rpc('get_primary_domain');
    const domain = primaryDomain || 'www.casinoany.com';

    // Fetch all published complaints
    const { data: complaints, error } = await supabase
      .from('site_complaints')
      .select(`
        id,
        created_at,
        updated_at,
        status,
        betting_sites!inner(slug)
      `)
      .order('created_at', { ascending: false })
      .limit(50000);

    if (error) throw error;

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${(complaints || [])
  .map((complaint: any) => {
    const lastmod = complaint.updated_at
      ? new Date(complaint.updated_at).toISOString()
      : new Date(complaint.created_at).toISOString();
    
    // Active complaints get higher priority
    const priority = complaint.status === 'resolved' ? '0.6' : '0.7';
    const changefreq = complaint.status === 'resolved' ? 'monthly' : 'weekly';

    return `  <url>
    <loc>https://${domain}/complaint/${complaint.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  })
  .join('\n')}
</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, max-age=7200',
      },
    });
  } catch (error) {
    console.error('Sitemap-complaints error:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      { headers: corsHeaders, status: 500 }
    );
  }
});
