import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'suggest-site-details') {
      systemPrompt = `Sen bahis sitelerini analiz eden bir uzman asistansın. Verilen site bilgilerine göre bonus, özellikler ve rating önerileri yapıyorsun. Türkçe yanıt ver.`;
      userPrompt = `Site adı: ${data.siteName}
      
Lütfen bu bahis sitesi için:
1. Cazip ve gerçekçi bonus teklifleri öner (virgülle ayrılmış)
2. Sitenin sahip olması gereken özellikler listesi öner (virgülle ayrılmış)
3. 1-10 arası rating öner

JSON formatında yanıt ver:
{
  "bonus": "bonus1, bonus2, bonus3",
  "features": "özellik1, özellik2, özellik3",
  "rating": 8.5
}`;
    } else if (type === 'generate-blog') {
      systemPrompt = `Sen SEO uzmanı bir blog yazarısın. Bahis siteleri hakkında profesyonel, bilgilendirici ve SEO optimizasyonlu içerik üretiyorsun. Türkçe yazıyorsun.`;
      userPrompt = `Konu: ${data.topic}
${data.siteName ? `İlgili Site: ${data.siteName}` : ''}

Lütfen aşağıdaki formatta SEO optimizasyonlu bir blog yazısı oluştur:

1. Başlık: Dikkat çekici, SEO uyumlu (60 karakter civarı)
2. İçerik: En az 1000 kelime, HTML formatında, başlıklar (h2, h3), paragraflar, listeler içeren profesyonel içerik
3. Özet: 150-160 karakter arası çekici özet
4. Meta Description: SEO için 150-160 karakter
5. Etiketler: Virgülle ayrılmış 5-7 SEO etiketi

JSON formatında yanıt ver:
{
  "title": "başlık",
  "content": "html içerik",
  "excerpt": "özet",
  "meta_description": "meta açıklama",
  "tags": "etiket1, etiket2, etiket3"
}`;
    } else if (type === 'generate-reviews') {
      systemPrompt = `Sen gerçekçi ve organik kullanıcı yorumları oluşturan bir asistansın. Bahis siteleri hakkında çeşitli profillerde kullanıcıların yazabileceği gerçekçi yorumlar üretiyorsun. Türkçe yazıyorsun.`;
      userPrompt = `Site adı: ${data.siteName}
Oluşturulacak yorum sayısı: ${data.count || 3}

Her yorum için gerçekçi ve çeşitli içerik oluştur:
1. İsim: Türk isimleri kullan (örn: Ahmet Y., Ayşe K., Mehmet D.)
2. Puan: 1-5 arası, çoğunlukla 4-5 puan ağırlıklı ama 2-3 puan alan yorumlar da olsun
3. Başlık: Kısa, özgün ve duygusal (10-50 karakter)
4. Yorum: 50-200 kelime arası detaylı, kişisel deneyim içeren gerçekçi yorum. Her yorum farklı bir perspektif sunmalı (bonuslardan bahseden, müşteri hizmetlerinden, çekim hızından, oyun çeşitliliğinden vs.)

JSON formatında yanıt ver:
{
  "reviews": [
    {
      "name": "İsim Soyad İlk Harf",
      "rating": 4,
      "title": "Yorum başlığı",
      "comment": "Detaylı yorum metni..."
    }
  ]
}`;
    } else {
      throw new Error('Invalid request type');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit aşıldı, lütfen daha sonra tekrar deneyin.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI kredisi yetersiz, lütfen hesabınıza kredi ekleyin.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const result = await response.json();
    const aiResponse = result.choices[0].message.content;
    
    // Extract JSON from response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI yanıtından JSON çıkarılamadı');
    }
    
    const suggestion = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify({ success: true, data: suggestion }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in admin-ai-assistant:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Bilinmeyen hata' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
