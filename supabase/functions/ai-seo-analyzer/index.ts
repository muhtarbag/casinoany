import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { siteUrl, sites, blogCount } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("SEO Analysis request for:", siteUrl);

    const prompt = `Site Analizi:
Site URL: ${siteUrl || 'Belirtilmemiş'}
Mevcut Siteler: ${sites?.length || 0} adet
Blog İçerikleri: ${blogCount || 0} adet

Lütfen aşağıdaki konularda detaylı analiz ve öneriler sun:

1. SEO DURUMU:
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

JSON formatında yanıt ver (sadece JSON, başka metin ekleme):`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Sen bir SEO ve web analiz uzmanısın. Verilen site bilgilerini analiz edip detaylı öneriler sunuyorsun. 
            
SADECE geçerli JSON formatında yanıt ver. Hiçbir ek metin, açıklama veya markdown ekleme. Yanıt şu yapıda olmalı:

{
  "score": 75,
  "summary": "Genel durum özeti (2-3 cümle)",
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
      "impact": "Yüksek/Orta/Düşük",
      "estimatedTime": "2 saat",
      "autoFixable": true,
      "category": "seo"
    }
  ]
}`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log("Raw AI response:", content);
    
    // Parse JSON from response
    let analysisData;
    try {
      // Try to extract JSON if wrapped in markdown
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                       content.match(/```\n([\s\S]*?)\n```/);
      
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[1]);
      } else {
        analysisData = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Content:", content);
      throw new Error("AI yanıtı geçerli JSON formatında değil");
    }

    console.log("SEO Analysis completed successfully");

    return new Response(
      JSON.stringify({ 
        data: analysisData,
        provider: "lovable-ai-gemini"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("SEO analyzer error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Bilinmeyen hata" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
