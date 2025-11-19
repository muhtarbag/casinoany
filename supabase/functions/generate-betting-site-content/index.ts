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
    const { siteName, siteUrl } = await req.json();
    
    if (!siteName) {
      throw new Error("Site name is required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Sen profesyonel bir bahis sitesi içerik yazarısın. Türkiye pazarına yönelik, SEO-dostu ve kullanıcı dostu içerikler oluşturuyorsun. 
    
    İçerikler:
    - Doğal ve akıcı Türkçe olmalı
    - SEO odaklı olmalı ama kullanıcı deneyimini önceliklemeli
    - Güvenilir ve bilgilendirici olmalı
    - Spam veya aşırı anahtar kelime yükleme içermemeli`;

    const userPrompt = `${siteName} ${siteUrl ? `(${siteUrl})` : ''} bahis sitesi için aşağıdaki içerikleri oluştur:

    1. Kısa bir açıklama (bonus bilgisi, 50-80 kelime)
    2. Öne çıkan 5-7 özellik (kısa madde başlıkları)
    3. 4-5 avantaj (pros - kısa cümleler)
    4. 3-4 dezavantaj (cons - kısa cümleler)
    5. Uzun detaylı expert review (500-700 kelime, bahis seçenekleri, ödeme yöntemleri, müşteri hizmetleri, mobil uyumluluk hakkında)
    6. Genel değerlendirme (verdict, 150-200 kelime)
    7. Giriş rehberi (login_guide, adım adım 200-250 kelime)
    8. Para çekme rehberi (withdrawal_guide, detaylı 250-300 kelime)
    9. 5-7 sık sorulan soru ve cevapları (FAQ)`;

    const body = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "generate_site_content",
            description: "Bahis sitesi için SEO-dostu içerik oluştur",
            parameters: {
              type: "object",
              properties: {
                bonus: { 
                  type: "string",
                  description: "Bonus bilgisi içeren kısa açıklama"
                },
                features: {
                  type: "array",
                  items: { type: "string" },
                  description: "Öne çıkan özellikler listesi"
                },
                pros: {
                  type: "array",
                  items: { type: "string" },
                  description: "Avantajlar listesi"
                },
                cons: {
                  type: "array",
                  items: { type: "string" },
                  description: "Dezavantajlar listesi"
                },
                expert_review: {
                  type: "string",
                  description: "Detaylı uzman incelemesi"
                },
                verdict: {
                  type: "string",
                  description: "Genel değerlendirme"
                },
                login_guide: {
                  type: "string",
                  description: "Giriş rehberi"
                },
                withdrawal_guide: {
                  type: "string",
                  description: "Para çekme rehberi"
                },
                faq: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      question: { type: "string" },
                      answer: { type: "string" }
                    },
                    required: ["question", "answer"]
                  },
                  description: "Sık sorulan sorular"
                }
              },
              required: [
                "bonus",
                "features",
                "pros",
                "cons",
                "expert_review",
                "verdict",
                "login_guide",
                "withdrawal_guide",
                "faq"
              ],
              additionalProperties: false
            }
          }
        }
      ],
      tool_choice: { type: "function", function: { name: "generate_site_content" } }
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), 
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No tool call in response");
    }

    const content = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({ content }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
