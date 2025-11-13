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
      systemPrompt = `Sen SEO ve içerik pazarlama uzmanısın. Arama motorları için optimize edilmiş, kullanıcı deneyimini ön planda tutan blog içerikleri üretiyorsun. Google'ın E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) prensiplerine göre içerik yazıyorsun. Türkçe yazıyorsun.`;
      userPrompt = `Konu: ${data.topic}
${data.siteName ? `İlgili Site: ${data.siteName}` : ''}

KRITIK SEO KURALLARI:

1. BAŞLIK (Title - 55-60 karakter):
   - Ana keyword'ü başa koy
   - Rakamlar ve güçlü kelimeler kullan (2024, En İyi, Rehber, Tam, Detaylı)
   - Tıklamayı teşvik edici
   
2. İÇERIK YAPISI (Minimum 1500 kelime):
   - <h2> ana bölümler (3-5 adet, her birinde keyword varyasyonu)
   - <h3> alt bölümler (daha detaylı konular)
   - <p> paragraflar (3-4 cümle, okunaklı)
   - <ul>/<ol> listeler (okuyucu için kolay taranabilir)
   - <strong> önemli terimler
   - <blockquote> önemli notlar
   - Keyword yoğunluğu: %1-2 (doğal kullanım)
   
3. SEO OPTIMIZASYONU:
   - LSI Keywords (ilgili terimler) kullan
   - Long-tail keywords ekle
   - Soru formatında başlıklar (H2/H3)
   - İlk paragrafta ana keyword geçmeli
   - Son paragrafta CTA (Call to Action)
   
4. İÇERIK KALİTESİ:
   - E-E-A-T prensipleri: Uzmanlık göster, kaynak ver
   - Güncel bilgiler (2024-2025)
   - Sayısal veriler ve istatistikler
   - Karşılaştırma tabloları
   - Adım adım rehberler
   - Gerçek kullanıcı senaryoları
   
5. KULLANICI DENEYİMİ:
   - Kısa paragraflar (mobil uyumlu)
   - Madde işaretleri
   - Geçiş cümleleri
   - Soru-cevap bölümü (FAQ)
   - Özet/Sonuç bölümü

6. SEMANTIC HTML:
   <article>
     <header>
       <h1>Ana Başlık (keyword içeren)</h1>
     </header>
     
     <section>
       <h2>Giriş - Konuya Genel Bakış</h2>
       <p>İçerik...</p>
     </section>
     
     <section>
       <h2>Ana Bölüm 1 (keyword varyasyonu)</h2>
       <h3>Alt Konu 1</h3>
       <p>Detaylı açıklama...</p>
       <ul>
         <li>Madde 1</li>
         <li>Madde 2</li>
       </ul>
       
       <h3>Alt Konu 2</h3>
       <p>Detaylı açıklama...</p>
     </section>
     
     <section>
       <h2>Ana Bölüm 2</h2>
       <p>İçerik...</p>
       <blockquote>
         <strong>ÖNEMLİ:</strong> Kritik bilgi
       </blockquote>
     </section>
     
     <section>
       <h2>Sıkça Sorulan Sorular (FAQ)</h2>
       <h3>Soru 1?</h3>
       <p>Cevap...</p>
       <h3>Soru 2?</h3>
       <p>Cevap...</p>
     </section>
     
     <section>
       <h2>Sonuç ve Öneriler</h2>
       <p>Özet ve CTA...</p>
     </section>
   </article>

JSON formatında yanıt ver:
{
  "title": "SEO optimized başlık (55-60 karakter, keyword içeren)",
  "content": "Yukarıdaki semantic HTML yapısında 1500+ kelime içerik",
  "excerpt": "İlgi çekici özet, keyword içeren (140-160 karakter)",
  "meta_description": "Arama sonuçları için optimize edilmiş açıklama, CTA içeren (150-160 karakter)",
  "tags": "ana-keyword, long-tail-keyword-1, long-tail-keyword-2, lsi-keyword-1, lsi-keyword-2, kategori-keyword"
}

NOT: 
- Başlıkta sayı kullan (örn: "2024 Rehberi", "10 İpucu", "5 Adımda")
- Meta description'da aktif fiil kullan (Keşfedin, Öğrenin, İnceleyin)
- İçerikte sorular sor ve yanıtla
- Mobil okumaya uygun kısa paragraflar yaz
- Her bölüm sonunda geçiş cümlesi kullan`;
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
