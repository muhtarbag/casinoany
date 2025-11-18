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

    // 5 örnek kurumsal kullanıcı verisi
    const testCompanies = [
      {
        name: 'Betium Gaming',
        slug: 'betium',
        email: 'kurumsal@betium.com',
        companyName: 'Betium Gaming Ltd.',
        description: 'Online bahis ve casino platformu'
      },
      {
        name: 'Maxibet Casino',
        slug: 'maxibet',
        email: 'kurumsal@maxibet.com',
        companyName: 'Maxibet Entertainment Inc.',
        description: 'Premium casino ve spor bahisleri'
      },
      {
        name: 'Royalbet',
        slug: 'royalbet',
        email: 'kurumsal@royalbet.com',
        companyName: 'Royalbet Interactive',
        description: 'Lüks casino ve bahis deneyimi'
      },
      {
        name: 'StarGaming',
        slug: 'stargaming',
        email: 'kurumsal@stargaming.com',
        companyName: 'Star Gaming Corporation',
        description: 'Yeni nesil oyun platformu'
      },
      {
        name: 'PrimeBet',
        slug: 'primebet',
        email: 'kurumsal@primebet.com',
        companyName: 'PrimeBet Solutions',
        description: 'Kaliteli bahis hizmetleri'
      }
    ];

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const company of testCompanies) {
      try {
        // Şifre oluştur
        const password = `${company.slug}2024!Test`;
        
        // Auth.users'da kullanıcı oluştur
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: company.email,
          password,
          email_confirm: true,
          user_metadata: {
            accountType: 'site_owner',
            companyName: company.companyName,
            companyType: 'limited',
            companyAuthorizedPerson: company.name + ' Yöneticisi',
            companyEmail: company.email,
            companyDescription: company.description,
            contactPersonName: company.name + ' İletişim',
          }
        });

        if (authError) {
          console.error(`Auth error for ${company.name}:`, authError);
          errorCount++;
          results.push({ 
            company: company.name, 
            success: false, 
            error: authError.message 
          });
          continue;
        }

        const userId = authData.user.id;

        // Profile oluştur (trigger otomatik oluşturacak ama yine de güncelleme yapabiliriz)
        await supabaseAdmin
          .from('profiles')
          .update({
            company_name: company.companyName,
            company_description: company.description,
            company_email: company.email,
            user_type: 'corporate'
          })
          .eq('id', userId);

        successCount++;
        results.push({ 
          company: company.name,
          email: company.email,
          password: password,
          success: true,
          message: 'Kullanıcı başarıyla oluşturuldu. Site başvurusu için panel kullanılabilir.'
        });

      } catch (error) {
        console.error(`Error creating user for ${company.name}:`, error);
        errorCount++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({ 
          company: company.name, 
          success: false, 
          error: errorMessage 
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        total: testCompanies.length,
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
