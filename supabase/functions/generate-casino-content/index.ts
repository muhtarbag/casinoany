import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { siteId, siteName, siteUrl } = await req.json();
    console.log('Generating casino content for:', siteName);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const prompt = `Sen profesyonel bir online casino ve bahis uzmanısın. "${siteName}" adlı bahis sitesi için detaylı, bilgilendirici ve çekici casino içeriği oluştur.

Site bilgileri:
- İsim: ${siteName}
- URL: ${siteUrl}

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

    // Update the site in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: updateError } = await supabase
      .from('betting_sites')
      .update({
        pros: generatedContent.pros,
        cons: generatedContent.cons,
        verdict: generatedContent.verdict,
        expert_review: generatedContent.expertReview,
        game_categories: generatedContent.gameCategories,
        login_guide: generatedContent.loginGuide,
        withdrawal_guide: generatedContent.withdrawalGuide,
        faq: generatedContent.faq,
      })
      .eq('id', siteId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

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