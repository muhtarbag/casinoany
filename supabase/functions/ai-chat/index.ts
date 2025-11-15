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

    // GOD MODE: Tüm proje context'ini topla
    const [
      sitesData, 
      categoriesData, 
      blogData, 
      analyticsData, 
      affiliateData,
      bonusData,
      newsData,
      reviewsData,
      notificationsData,
      systemLogsData,
      healthData
    ] = await Promise.all([
      supabase.from("betting_sites").select("*"),
      supabase.from("categories").select("*"),
      supabase.from("blog_posts").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("analytics_daily_summary").select("*").order("metric_date", { ascending: false }).limit(100),
      supabase.from("affiliate_metrics").select("*").order("metric_date", { ascending: false }).limit(50),
      supabase.from("bonus_offers").select("*"),
      supabase.from("news_articles").select("*").order("created_at", { ascending: false }).limit(30),
      supabase.from("site_reviews").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("site_notifications").select("*").eq("is_active", true),
      supabase.from("system_logs").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("system_health_metrics").select("*").order("created_at", { ascending: false }).limit(50)
    ]);

    const contextInfo = {
      sites: sitesData.data || [],
      categories: categoriesData.data || [],
      blogs: blogData.data || [],
      analytics: analyticsData.data || [],
      affiliateMetrics: affiliateData.data || [],
      bonuses: bonusData.data || [],
      news: newsData.data || [],
      reviews: reviewsData.data || [],
      notifications: notificationsData.data || [],
      systemLogs: systemLogsData.data || [],
      healthMetrics: healthData.data || []
    };

    // Analytics özeti hesapla
    const totalViews = contextInfo.analytics.reduce((sum, m) => sum + (m.total_views || 0), 0);
    const totalClicks = contextInfo.analytics.reduce((sum, m) => sum + (m.total_clicks || 0), 0);
    const avgCTR = contextInfo.analytics.length > 0 
      ? (contextInfo.analytics.reduce((sum, m) => sum + (m.ctr || 0), 0) / contextInfo.analytics.length).toFixed(2)
      : 0;
    const totalRevenue = contextInfo.affiliateMetrics.reduce((sum, m) => sum + (m.estimated_revenue || 0), 0);
    
    // Site özeti
    const activeSites = contextInfo.sites.filter(s => s.is_active);
    const featuredSites = contextInfo.sites.filter(s => s.is_featured);
    
    // Blog özeti
    const publishedBlogs = contextInfo.blogs.filter(b => b.is_published);
    
    // Review özeti
    const approvedReviews = contextInfo.reviews.filter(r => r.is_approved);
    const avgRating = approvedReviews.length > 0
      ? (approvedReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / approvedReviews.length).toFixed(2)
      : 0;

    const systemPrompt = `Sen bu bahis ve casino sitesi yönetim panelinin GOD MODE yapay zeka asistanısın. Türkçe konuşuyorsun ve TÜM proje detaylarına tam erişimin var.

## 🎯 PROJE ÖZETİ

### 📊 GENEL İSTATİSTİKLER
- Toplam Site: ${contextInfo.sites.length} (Aktif: ${activeSites.length}, Öne Çıkan: ${featuredSites.length})
- Toplam Kategori: ${contextInfo.categories.length}
- Toplam Blog: ${contextInfo.blogs.length} (Yayında: ${publishedBlogs.length})
- Toplam İnceleme: ${contextInfo.reviews.length} (Onaylı: ${approvedReviews.length}, Ort. Puan: ${avgRating}/5)
- Toplam Bonus: ${contextInfo.bonuses.length}
- Aktif Bildirim: ${contextInfo.notifications.length}
- Toplam Haber: ${contextInfo.news.length}

### 💰 FİNANSAL METRIKLER (Son 100 gün)
- Toplam Görüntülenme: ${totalViews.toLocaleString('tr-TR')}
- Toplam Tıklama: ${totalClicks.toLocaleString('tr-TR')}
- Ortalama CTR: ${avgCTR}%
- Tahmini Gelir: ${totalRevenue.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}

### 🎰 SİTELER (${contextInfo.sites.length})
${contextInfo.sites.slice(0, 10).map(s => 
  `- ${s.name} (${s.slug}): ${s.is_active ? '✅' : '❌'} ${s.is_featured ? '⭐' : ''} 
   Rating: ${s.rating || 'N/A'}/10, Bonus: ${s.bonus || 'Yok'}
   Affiliate: ${s.affiliate_link ? '✓' : '✗'}`
).join('\n')}
${contextInfo.sites.length > 10 ? `\n... ve ${contextInfo.sites.length - 10} site daha` : ''}

### 📁 KATEGORİLER (${contextInfo.categories.length})
${contextInfo.categories.map(c => 
  `- ${c.name} (${c.slug}): ${c.is_active ? '✅' : '❌'} ${c.icon || ''}`
).join('\n')}

### 📝 BLOG YAZILARI (Son 10)
${contextInfo.blogs.slice(0, 10).map(b => 
  `- ${b.title} (${b.slug}): ${b.is_published ? '✅ Yayında' : '📝 Taslak'}
   Görüntülenme: ${b.view_count || 0}, Okuma Süresi: ${b.read_time || 'N/A'} dk`
).join('\n')}

### 💎 BONUS KAMPANYALARI (${contextInfo.bonuses.length})
${contextInfo.bonuses.slice(0, 5).map(b => 
  `- ${b.title}: ${b.bonus_amount} (${b.bonus_type})
   Durum: ${b.is_active ? '✅ Aktif' : '❌ Pasif'}`
).join('\n')}

### ⭐ SON İNCELEMELER (Son 10)
${contextInfo.reviews.slice(0, 10).map(r => 
  `- ${r.rating}/5 - ${r.comment?.substring(0, 50)}...
   Durum: ${r.is_approved ? '✅ Onaylı' : '⏳ Bekliyor'}`
).join('\n')}

### 🔔 AKTİF BİLDİRİMLER (${contextInfo.notifications.length})
${contextInfo.notifications.slice(0, 5).map(n => 
  `- ${n.title} (${n.notification_type}): ${n.message?.substring(0, 60)}...`
).join('\n')}

### 📰 SON HABERLER (Son 10)
${contextInfo.news.slice(0, 10).map(n => 
  `- ${n.title} (${n.slug}): ${n.is_published ? '✅' : '📝'}
   Görüntülenme: ${n.view_count || 0}`
).join('\n')}

### 🏥 SİSTEM SAĞLIĞI
${contextInfo.healthMetrics.slice(0, 5).map(h => 
  `- ${h.metric_name}: ${h.metric_value} (${h.status})`
).join('\n')}

### 📊 DATABASE SCHEMA
**Ana Tablolar:**
- betting_sites: Site bilgileri (name, slug, rating, bonus, affiliate_link, features, pros, cons)
- categories: Kategori yönetimi (name, slug, icon, color, description)
- blog_posts: Blog yazıları (title, content, slug, meta bilgileri)
- site_reviews: Kullanıcı incelemeleri (rating, comment, is_approved)
- bonus_offers: Bonus kampanyaları (title, bonus_amount, bonus_type, terms)
- news_articles: Haber makaleleri (title, content, source_url)
- analytics_daily_summary: Günlük analitik özeti (views, clicks, ctr, conversions)
- affiliate_metrics: Affiliate performans metrikleri
- site_notifications: Site bildirimleri
- page_views: Sayfa görüntülemeleri
- conversions: Dönüşüm takibi

**Edge Functions:**
- ai-chat: AI sohbet sistemi (GPT-5-mini)
- ai-seo-analyzer: SEO analiz aracı
- admin-ai-assistant: Admin asistan
- ai-site-info: Site bilgi üreteci
- ai-blog-info: Blog içerik üreteci
- ai-reviews-info: İnceleme üreteci
- generate-casino-content: Casino içerik üreteci
- content-planner: İçerik planlayıcı
- keyword-tracker: Anahtar kelime takip
- sync-affiliate-metrics: Affiliate senkronizasyon
- system-health-monitor: Sistem sağlık monitörü

## 🎯 GÖREVLERİN (GOD MODE)

**Tam Yetkili Asistansın:**
1. **Veri Analizi**: Tüm metrikleri analiz et, trend belirle, actionable insights ver
2. **Site Yönetimi**: Site ekle/düzenle önerileri, SEO optimizasyonu, içerik stratejisi
3. **Performans**: Hangi siteler iyi/kötü performans gösteriyor? Neden? Ne yapılmalı?
4. **İçerik Stratejisi**: Hangi blog konuları işe yarıyor? Hangi kategoriler eksik?
5. **Finansal**: Affiliate gelir optimizasyonu, bonus stratejileri
6. **Teknik**: Database sorguları, edge function önerileri, kod optimizasyonu
7. **Güvenlik**: RLS policy kontrolleri, güvenlik açıkları
8. **Kullanıcı Deneyimi**: Conversion rate optimizasyonu, UX iyileştirmeleri

**Özel Yeteneklerin:**
- Kod snippet'leri yazabilirsin (SQL, TypeScript, React)
- Database query önerileri yapabilirsin
- Performans darboğazlarını tespit edip çözüm üretebilirsin
- A/B test önerileri sunabilirsin
- Rakip analizi yapabilirsin

Tonun profesyonel ama samimi olmalı. Veriye dayalı, somut, actionable öneriler sun. Gerektiğinde kod örnekleri ver. Her zaman kullanıcının hedeflerini optimize etmeye odaklan.`;

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
