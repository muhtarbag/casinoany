import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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
          persistSession: false
        }
      }
    );

    // Tüm aktif siteleri çek
    const { data: sites, error: sitesError } = await supabaseAdmin
      .from('betting_sites')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('name');

    if (sitesError) throw sitesError;

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const site of sites) {
      try {
        // Rastgele şifre oluştur
        const password = `${site.slug}2024!${Math.random().toString(36).slice(-8)}`;
        const email = `admin@${site.slug}.com`;

        // Auth.users'da kullanıcı oluştur
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            first_name: site.name,
            site_id: site.id
          }
        });

        if (authError) {
          console.error(`Auth error for ${site.name}:`, authError);
          errorCount++;
          results.push({ site: site.name, success: false, error: authError.message });
          continue;
        }

        const userId = authData.user.id;

        // Profile oluştur
        await supabaseAdmin
          .from('profiles')
          .insert({
            id: userId,
            email,
            first_name: site.name,
            username: `${site.slug}_admin`
          });

        // user_roles'a ekle
        await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: userId,
            role: 'site_owner',
            status: 'approved'
          });

        // site_owners'a ekle
        await supabaseAdmin
          .from('site_owners')
          .insert({
            user_id: userId,
            site_id: site.id,
            company_name: `${site.name} Kurumsal`,
            status: 'approved',
            approved_at: new Date().toISOString(),
            description: `${site.name} sitesinin resmi kurumsal hesabı`,
            contact_email: email
          });

        successCount++;
        results.push({ 
          site: site.name, 
          success: true, 
          email, 
          password: password.substring(0, 20) + '...' 
        });
      } catch (error) {
        console.error(`Error creating user for ${site.name}:`, error);
        errorCount++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({ site: site.name, success: false, error: errorMessage });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        total: sites.length,
        successCount,
        errorCount,
        message: `${successCount} kurumsal kullanıcı oluşturuldu, ${errorCount} hata`,
        results 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
