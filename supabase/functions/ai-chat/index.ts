import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI");
    
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI API key is not configured");
    }

    console.log("AI Chat request received, messages:", messages.length);

    // Supabase client oluştur
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Proje context'ini topla
    const [sitesData, categoriesData, blogData, analyticsData] = await Promise.all([
      supabase.from("betting_sites").select("id, name, slug, is_active, rating, bonus").eq("is_active", true).limit(20),
      supabase.from("categories").select("id, name, slug, is_active").eq("is_active", true),
      supabase.from("blog_posts").select("id, title, slug, is_published").eq("is_published", true).limit(10),
      supabase.from("analytics_daily_summary").select("site_id, metric_date, total_views, total_clicks, ctr").order("metric_date", { ascending: false }).limit(30)
    ]);

    const contextInfo = {
      sites: sitesData.data || [],
      categories: categoriesData.data || [],
      recentBlogs: blogData.data || [],
      recentMetrics: analyticsData.data || []
    };

    const systemPrompt = `Sen bu bahis ve casino sitesi yönetim panelinin yapay zeka asistanısın. Türkçe konuşuyorsun ve tüm proje detaylarına erişimin var.

## PROJE BİLGİLERİ:

### Aktif Siteler (${contextInfo.sites.length}):
${contextInfo.sites.map(s => `- ${s.name} (${s.slug}): Rating ${s.rating}/10, Bonus: ${s.bonus || 'Yok'}`).join('\n')}

### Kategoriler (${contextInfo.categories.length}):
${contextInfo.categories.map(c => `- ${c.name} (${c.slug})`).join('\n')}

### Son Blog Yazıları (${contextInfo.recentBlogs.length}):
${contextInfo.recentBlogs.map(b => `- ${b.title} (/${b.slug})`).join('\n')}

### Performans Metrikleri (Son 30 gün):
Toplam görüntülenme: ${contextInfo.recentMetrics.reduce((sum, m) => sum + (m.total_views || 0), 0)}
Toplam tıklama: ${contextInfo.recentMetrics.reduce((sum, m) => sum + (m.total_clicks || 0), 0)}
Ortalama CTR: ${(contextInfo.recentMetrics.reduce((sum, m) => sum + (m.ctr || 0), 0) / contextInfo.recentMetrics.length).toFixed(2)}%

## GÖREVLERİN:
- Admin paneli kullanımında yardım (site ekleme, düzenleme, analitik raporlar)
- Site yönetimi ve içerik stratejileri (SEO, blog yazıları, bonus kampanyaları)
- Performans analizi ve optimizasyon önerileri
- Teknik sorunlarda yardım (backend, database, edge functions)
- Bahis sektöründe trend ve analizler

Tonun profesyonel ama samimi olmalı. Somut öneriler ver ve yukarıdaki verilerden faydalanarak spesifik tavsiyeler sun.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5-mini-2025-08-07",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          ...messages,
        ],
        max_completion_tokens: 2000,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit aşıldı, lütfen biraz bekleyin." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    console.log("Streaming response from OpenAI GPT-5-mini");

    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Bilinmeyen hata" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
