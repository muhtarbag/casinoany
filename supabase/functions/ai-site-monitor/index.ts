import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';
    let useOpenAI = false;

    if (action === 'analyze-seo') {
      useOpenAI = !!OPENAI_API_KEY;
      systemPrompt = `Sen bir SEO ve web analiz uzmanısın. Verilen site bilgilerini analiz edip detaylı öneriler sunuyorsun. Google arama sonuçları, SERP pozisyonları, teknik SEO, içerik kalitesi ve kullanıcı deneyimi açısından değerlendirme yapıyorsun. Türkçe yanıt ver.`;
      userPrompt = `Site Analizi:
Site URL: ${data.siteUrl || 'Belirtilmemiş'}
Mevcut Siteler: ${JSON.stringify(data.sites || [])}
Blog İçerikleri: ${data.blogCount || 0} adet

Lütfen aşağıdaki konularda detaylı analiz ve öneriler sun:

1. SEO DURUMu:
   - Title tag optimizasyonu
   - Meta description iyileştirmeleri
   - H1/H2 yapısı
   - Keyword kullanımı
   - İç linkleme stratejisi

2. SERP ANALİZİ:
   - Google arama sonuçları pozisyonu (tahmini)
   - Featured snippet fırsatları
   - Rakip analizi
   - Anahtar kelime önerileri

3. TEKNİK SEO:
   - Sayfa hızı optimizasyonu
   - Mobil uyumluluk
   - Schema markup önerileri
   - Sitemap ve robots.txt kontrolü

4. İÇERİK KALİTESİ:
   - Mevcut içeriklerin analizi
   - Eksik içerik konuları
   - İçerik güncelliği
   - E-E-A-T prensipleri

5. KULLANICI DENEYİMİ:
   - Site navigasyonu
   - CTA (Call to Action) optimizasyonu
   - Dönüşüm hunisi analizi

6. ÖNCELİKLİ AKSİYONLAR:
   Her biri için:
   - Aksiyon başlığı
   - Detaylı açıklama
   - Beklenen etki (Yüksek/Orta/Düşük)
   - Tahmini süre
   - Otomatik düzeltme yapılabilir mi (true/false)

JSON formatında yanıt ver:
{
  "score": 75,
  "summary": "Genel durum özeti",
  "seo": {
    "status": "İyi/Orta/Kötü",
    "issues": ["sorun1", "sorun2"],
    "recommendations": ["öneri1", "öneri2"]
  },
  "serp": {
    "estimatedPosition": "10-20 arası",
    "opportunities": ["fırsat1", "fırsat2"]
  },
  "technical": {
    "score": 80,
    "issues": ["sorun1"],
    "recommendations": ["öneri1"]
  },
  "content": {
    "quality": "İyi/Orta/Zayıf",
    "missingTopics": ["konu1", "konu2"],
    "recommendations": ["öneri1"]
  },
  "ux": {
    "score": 70,
    "issues": ["sorun1"],
    "recommendations": ["öneri1"]
  },
  "actions": [
    {
      "title": "Aksiyon başlığı",
      "description": "Detaylı açıklama",
      "impact": "Yüksek",
      "estimatedTime": "2 saat",
      "autoFixable": true,
      "category": "seo|content|technical|ux"
    }
  ]
}`;
    } else if (action === 'suggest-improvements') {
      useOpenAI = !!OPENAI_API_KEY;
      systemPrompt = `Sen bir web geliştirme ve optimizasyon uzmanısın. Verilen site için iyileştirme önerileri sunuyorsun. Türkçe yanıt ver.`;
      userPrompt = `Kategori: ${data.category}
Mevcut Durum: ${JSON.stringify(data.currentState)}

Bu kategori için spesifik ve uygulanabilir öneriler sun. Her öneri için:
- Öneri başlığı
- Detaylı açıklama
- Beklenen fayda
- Öncelik (Yüksek/Orta/Düşük)
- Otomatik uygulanabilir mi

JSON formatında yanıt ver:
{
  "suggestions": [
    {
      "title": "Öneri başlığı",
      "description": "Detaylı açıklama",
      "benefit": "Beklenen fayda",
      "priority": "Yüksek",
      "autoApplicable": true
    }
  ]
}`;
    } else if (action === 'auto-fix') {
      systemPrompt = `Sen bir kod üretim asistanısın. Verilen problemi çözmek için gerekli kod değişikliklerini öneriyorsun. Türkçe açıklama, kod İngilizce olacak.`;
      userPrompt = `Problem: ${data.problem}
Hedef Dosya: ${data.targetFile || 'Belirtilmemiş'}
Mevcut Durum: ${data.currentState || 'Belirtilmemiş'}

Lütfen bu problemi çözmek için:
1. Yapılması gereken değişiklikleri açıkla
2. Kod örnekleri ver
3. Test önerileri sun

JSON formatında yanıt ver:
{
  "explanation": "Değişikliklerin açıklaması",
  "changes": [
    {
      "file": "dosya/yolu",
      "description": "Değişiklik açıklaması",
      "code": "kod örneği"
    }
  ],
  "testSteps": ["test1", "test2"]
}`;
    } else {
      throw new Error('Invalid action type');
    }

    // Determine which API to use
    const apiUrl = useOpenAI && OPENAI_API_KEY
      ? 'https://api.openai.com/v1/chat/completions'
      : 'https://ai.gateway.lovable.dev/v1/chat/completions';
    
    const apiKey = useOpenAI && OPENAI_API_KEY ? OPENAI_API_KEY : LOVABLE_API_KEY;
    const model = useOpenAI && OPENAI_API_KEY ? 'gpt-5-mini-2025-08-07' : 'google/gemini-2.5-flash';

    console.log(`Using ${useOpenAI ? 'OpenAI' : 'Lovable AI'} for action: ${action}`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: useOpenAI ? undefined : 0.7,
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
      console.error('AI API error:', response.status, errorText);
      throw new Error('AI API error');
    }

    const result = await response.json();
    const aiResponse = result.choices[0].message.content;
    
    // Extract JSON from response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI yanıtından JSON çıkarılamadı');
    }
    
    // Clean control characters from JSON string before parsing
    const cleanedJson = jsonMatch[0]
      .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, '')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
    
    const analysisResult = JSON.parse(cleanedJson);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: analysisResult,
        provider: useOpenAI ? 'openai' : 'lovable-ai'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-site-monitor:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
