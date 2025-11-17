import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function generateContentForSite(siteName: string, siteUrl: string, bonus: string, features: string[], apiKey: string) {
  const prompt = `Sen profesyonel bir online casino ve bahis uzmanısın. "${siteName}" adlı bahis sitesi için detaylı, bilgilendirici ve çekici casino içeriği oluştur.

Site bilgileri:
- İsim: ${siteName}
- URL: ${siteUrl}
- Bonus: ${bonus || 'Bilgi yok'}
- Özellikler: ${features?.join(', ') || 'Bilgi yok'}

Lütfen aşağıdaki içerikleri JSON formatında oluştur:

{
  "pros": ["avantaj 1", "avantaj 2", "avantaj 3", "avantaj 4", "avantaj 5"],
  "cons": ["dezavantaj 1", "dezavantaj 2", "dezavantaj 3"],
  "verdict": "<p>Site hakkında genel değerlendirme ve uzman görüşü (HTML formatında, 2-3 paragraf)</p>",
  "expertReview": "<p>Detaylı inceleme metni (HTML formatında, 3-4 paragraf, sitenin güvenilirliği, oyun çeşitliliği, bonus sistemi hakkında)</p>",
  "gameCategories": {
    "Slot": "Slot oyunları açıklaması",
    "Canlı Casino": "Canlı casino açıklaması",
    "Spor Bahisleri": "Spor bahisleri açıklaması",
    "Poker": "Poker oyunları açıklaması"
  },
  "loginGuide": "<ol><li>Adım 1</li><li>Adım 2</li><li>Adım 3</li></ol>",
  "withdrawalGuide": "<ol><li>Para çekme adım 1</li><li>Adım 2</li><li>Adım 3</li></ol>",
  "faq": [
    {"question": "Soru 1?", "answer": "Cevap 1"},
    {"question": "Soru 2?", "answer": "Cevap 2"},
    {"question": "Soru 3?", "answer": "Cevap 3"},
    {"question": "Soru 4?", "answer": "Cevap 4"},
    {"question": "Soru 5?", "answer": "Cevap 5"}
  ]
}

İçerik Türkçe olmalı, profesyonel ve kullanıcı dostu bir dil kullan. Site özelliklerini ve bonusları vurgula. HTML içeriklerde sadece temel HTML etiketleri (p, strong, em, ol, ul, li) kullan.`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'Sen casino ve bahis siteleri konusunda uzman bir içerik yazarısın. JSON formatında yapılandırılmış içerik üretiyorsun.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI Gateway error: ${response.status} - ${errorText}`);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid AI response structure:', JSON.stringify(data));
      throw new Error('Invalid AI response structure');
    }
    
    const content = data.choices[0].message.content;
    
    let jsonContent = content;
    if (content.includes('```json')) {
      jsonContent = content.split('```json')[1].split('```')[0].trim();
    } else if (content.includes('```')) {
      jsonContent = content.split('```')[1].split('```')[0].trim();
    }
    
    const parsedContent = JSON.parse(jsonContent);
    console.log('✅ Successfully generated content for:', siteName);
    return parsedContent;
  } catch (error) {
    console.error('❌ Error generating content for', siteName, ':', error);
    throw error;
  }
}

async function saveSiteContent(supabase: any, siteId: string, content: any) {
  // Save version first
  const { error: versionError } = await supabase
    .from('casino_content_versions')
    .insert({
      site_id: siteId,
      generation_source: 'ai',
      pros: content.pros,
      cons: content.cons,
      verdict: content.verdict,
      expert_review: content.expertReview,
      game_categories: content.gameCategories,
      login_guide: content.loginGuide,
      withdrawal_guide: content.withdrawalGuide,
      faq: content.faq,
    });

  if (versionError) {
    console.error('Version save error:', versionError);
  }

  // Update main table
  const { error: updateError } = await supabase
    .from('betting_sites')
    .update({
      pros: content.pros,
      cons: content.cons,
      verdict: content.verdict,
      expert_review: content.expertReview,
      game_categories: content.gameCategories,
      login_guide: content.loginGuide,
      withdrawal_guide: content.withdrawalGuide,
      faq: content.faq,
    })
    .eq('id', siteId);

  if (updateError) {
    throw updateError;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 🔐 JWT + Admin verification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: roleData, error: roleError } = await supabaseAuth
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Admin verified:', user.email);

    const { siteId, siteName, siteUrl, isBulk = false, siteIds = [] } = await req.json();
    console.log('Generating casino content for:', siteName, 'Bulk:', isBulk, 'by', user.email);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Create admin client for database operations
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    // Handle bulk generation
    if (isBulk && siteIds.length > 0) {
      const results = [];
      for (const id of siteIds) {
        const { data: site } = await supabaseAdmin
          .from('betting_sites')
          .select('name, affiliate_link, bonus, features')
          .eq('id', id)
          .single();
        
        if (site) {
          try {
            const content = await generateContentForSite(site.name, site.affiliate_link, site.bonus, site.features, LOVABLE_API_KEY);
            await saveSiteContent(supabaseAdmin, id, content);
            results.push({ siteId: id, success: true, siteName: site.name });
          } catch (error) {
            console.error(`Error generating content for ${site.name}:`, error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            results.push({ siteId: id, success: false, siteName: site.name, error: errorMessage });
          }
        }
      }
      
      return new Response(
        JSON.stringify({ success: true, results }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get site details for better prompt
    const { data: siteDetails } = await supabaseAdmin
      .from('betting_sites')
      .select('bonus, features')
      .eq('id', siteId)
      .single();

    const prompt = `Sen profesyonel bir online casino ve bahis uzmanısın. "${siteName}" adlı bahis sitesi için detaylı, bilgilendirici ve çekici casino içeriği oluştur.

Site bilgileri:
- İsim: ${siteName}
- URL: ${siteUrl}
- Bonus: ${siteDetails?.bonus || 'Bilgi yok'}
- Özellikler: ${siteDetails?.features?.join(', ') || 'Bilgi yok'}

Lütfen aşağıdaki içerikleri JSON formatında oluştur:

{
  "pros": ["avantaj 1", "avantaj 2", "avantaj 3", "avantaj 4", "avantaj 5"],
  "cons": ["dezavantaj 1", "dezavantaj 2", "dezavantaj 3"],
  "verdict": "<p>Site hakkında genel değerlendirme ve uzman görüşü (HTML formatında, 2-3 paragraf)</p>",
  "expertReview": "<p>Detaylı inceleme metni (HTML formatında, 3-4 paragraf, sitenin güvenilirliği, oyun çeşitliliği, bonus sistemi hakkında)</p>",
  "gameCategories": {
    "Slot": "Slot oyunları açıklaması",
    "Canlı Casino": "Canlı casino açıklaması",
    "Spor Bahisleri": "Spor bahisleri açıklaması",
    "Poker": "Poker oyunları açıklaması"
  },
  "loginGuide": "<ol><li>Adım 1</li><li>Adım 2</li><li>Adım 3</li></ol>",
  "withdrawalGuide": "<ol><li>Para çekme adım 1</li><li>Adım 2</li><li>Adım 3</li></ol>",
  "faq": [
    {"question": "Soru 1?", "answer": "Cevap 1"},
    {"question": "Soru 2?", "answer": "Cevap 2"},
    {"question": "Soru 3?", "answer": "Cevap 3"},
    {"question": "Soru 4?", "answer": "Cevap 4"},
    {"question": "Soru 5?", "answer": "Cevap 5"}
  ]
}

İçerik Türkçe olmalı, profesyonel ve kullanıcı dostu bir dil kullan. HTML içeriklerde sadece temel HTML etiketleri (p, strong, em, ol, ul, li) kullan.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'Sen casino ve bahis siteleri konusunda uzman bir içerik yazarısın. JSON formatında yapılandırılmış içerik üretiyorsun.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');
    
    const content = data.choices[0].message.content;
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonContent = content;
    if (content.includes('```json')) {
      jsonContent = content.split('```json')[1].split('```')[0].trim();
    } else if (content.includes('```')) {
      jsonContent = content.split('```')[1].split('```')[0].trim();
    }
    
    const generatedContent = JSON.parse(jsonContent);

    // Save content and create version
    await saveSiteContent(supabaseAdmin, siteId, generatedContent);

    console.log('Casino content generated and saved successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        content: generatedContent 
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in generate-casino-content:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});