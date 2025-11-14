// Deno edge function
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 🔐 STEP 1: JWT Verification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 🔐 STEP 2: Create Supabase client with user's JWT
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // 🔐 STEP 3: Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ Invalid token or user not found:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Authenticated user:', user.email);

    // 🔐 STEP 4: Check admin role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      console.error('❌ Not an admin user:', user.email);
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Admin verified:', user.email);

    // 🎯 STEP 5: Process request
    const { type, data } = await req.json();
    console.log('Request type:', type, 'by admin:', user.email);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY bulunamadı');
    }

    let result;

    if (type === 'suggest-site-details') {
      result = await generateSiteDetails(data, LOVABLE_API_KEY);
    } else if (type === 'generate-blog') {
      result = await generateBlogContent(data, LOVABLE_API_KEY);
    } else if (type === 'generate-reviews') {
      result = await generateReviews(data, LOVABLE_API_KEY);
    } else {
      throw new Error('Geçersiz istek tipi');
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function generateSiteDetails(data: any, apiKey: string) {
  const { siteName, description } = data;

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
          content: 'Sen bahis sitesi analiz uzmanısın. Verilen site için detaylı ve doğru bilgiler üretmelisin.'
        },
        {
          role: 'user',
          content: `${siteName} bahis sitesi için detaylı bilgiler oluştur. Açıklama: ${description || 'Yok'}. 
          
          Şu bilgileri JSON formatında döndür (sadece JSON, başka metin yok):
          - name: Site adı
          - description: 2-3 cümlelik açıklama (150-200 karakter)
          - rating: 1-5 arası puan
          - welcome_bonus: Hoş geldin bonusu açıklaması
          - payment_methods: Ödeme yöntemleri dizisi (en az 5 adet)
          - sports_coverage: Spor karşılaması dizisi (en az 8 adet)
          - live_betting: Canlı bahis özellikleri (boolean)
          - mobile_app: Mobil uygulama durumu (boolean)
          - customer_support: Müşteri desteği açıklaması
          - license_info: Lisans bilgisi`
        }
      ],
      tools: [{
        type: 'function',
        function: {
          name: 'generate_site_details',
          description: 'Bahis sitesi için detaylı bilgiler oluştur',
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
              rating: { type: 'number', minimum: 1, maximum: 5 },
              welcome_bonus: { type: 'string' },
              payment_methods: { 
                type: 'array',
                items: { type: 'string' },
                minItems: 5
              },
              sports_coverage: { 
                type: 'array',
                items: { type: 'string' },
                minItems: 8
              },
              live_betting: { type: 'boolean' },
              mobile_app: { type: 'boolean' },
              customer_support: { type: 'string' },
              license_info: { type: 'string' }
            },
            required: ['name', 'description', 'rating', 'welcome_bonus', 'payment_methods', 'sports_coverage', 'live_betting', 'mobile_app', 'customer_support', 'license_info'],
            additionalProperties: false
          }
        }
      }],
      tool_choice: { type: 'function', function: { name: 'generate_site_details' } }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Lovable AI Error:', response.status, errorText);
    throw new Error(`Lovable AI hatası: ${response.status}`);
  }

  const result = await response.json();
  const toolCall = result.choices[0].message.tool_calls?.[0];
  
  if (!toolCall) {
    throw new Error('AI tool call yanıtı alınamadı');
  }

  return JSON.parse(toolCall.function.arguments);
}

async function generateBlogContent(data: any, apiKey: string) {
  const { topic, siteName, targetKeywords } = data;

  // Step 1: SEO Keyword Research
  console.log('Step 1: SEO Keyword Research');
  const keywordResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{
        role: 'user',
        content: `"${topic}" konusu için SEO keyword araştırması yap. Site: ${siteName || 'Genel'}
        
        Şunları belirle:
        - Ana anahtar kelime
        - 5-7 ikincil anahtar kelime
        - 3-5 uzun kuyruk anahtar kelime
        - Önerilen H2/H3 başlıkları`
      }],
      tools: [{
        type: 'function',
        function: {
          name: 'keyword_research',
          parameters: {
            type: 'object',
            properties: {
              primary_keyword: { type: 'string' },
              secondary_keywords: { type: 'array', items: { type: 'string' }, minItems: 5 },
              long_tail_keywords: { type: 'array', items: { type: 'string' }, minItems: 3 },
              suggested_headings: { type: 'array', items: { type: 'string' }, minItems: 5 }
            },
            required: ['primary_keyword', 'secondary_keywords', 'long_tail_keywords', 'suggested_headings']
          }
        }
      }],
      tool_choice: { type: 'function', function: { name: 'keyword_research' } }
    })
  });

  const keywordResult = await keywordResponse.json();
  const keywords = JSON.parse(keywordResult.choices[0].message.tool_calls[0].function.arguments);

  // Step 2: Content Outline
  console.log('Step 2: Content Outline');
  const outlineResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{
        role: 'user',
        content: `"${topic}" için detaylı blog taslağı oluştur.
        
        Ana keyword: ${keywords.primary_keyword}
        İkincil keywords: ${keywords.secondary_keywords.join(', ')}
        
        Her bölüm için:
        - Başlık (H2/H3)
        - Ana noktalar
        - Hedef kelime sayısı`
      }],
      tools: [{
        type: 'function',
        function: {
          name: 'create_outline',
          parameters: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              introduction: { type: 'string' },
              sections: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    heading: { type: 'string' },
                    key_points: { type: 'array', items: { type: 'string' } },
                    target_word_count: { type: 'number' }
                  }
                },
                minItems: 4
              },
              conclusion_points: { type: 'array', items: { type: 'string' } }
            },
            required: ['title', 'introduction', 'sections', 'conclusion_points']
          }
        }
      }],
      tool_choice: { type: 'function', function: { name: 'create_outline' } }
    })
  });

  const outlineResult = await outlineResponse.json();
  const outline = JSON.parse(outlineResult.choices[0].message.tool_calls[0].function.arguments);

  // Step 3: Generate Full Content
  console.log('Step 3: Generate Full Content');
  const contentResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{
        role: 'user',
        content: `Bu taslağa göre SEO optimize edilmiş tam blog içeriği oluştur:

Başlık: ${outline.title}
Giriş: ${outline.introduction}

Bölümler: ${JSON.stringify(outline.sections)}

Sonuç noktaları: ${outline.conclusion_points.join(', ')}

🎯 SEO KEYWORD STRATEJİSİ (ÇOK ÖNEMLİ):

Primary Keyword: "${keywords.primary_keyword}"
Secondary Keywords: ${keywords.secondary_keywords.join(', ')}
Long-tail Keywords: ${keywords.long_tail_keywords.join(', ')}

**KEYWORD PLACEMENT KURALLARI:**
1. İlk 100 kelimede primary keyword'ü mutlaka kullan
2. Her ana bölümde (H2) en az bir primary veya secondary keyword kullan
3. Alt başlıklarda (H3) secondary ve long-tail keywords'leri kullan
4. Keyword density %1-2 arasında tut
5. Kelimeleri DOĞAL ve OKUNABILIR şekilde yerleştir
6. Keyword stuffing yapma - aşırı tekrar etme
7. Bold/Strong etiketlerinde önemli kelimeleri vurgula
8. Liste öğelerinde ve tablo başlıklarında keywords kullan

İçerik HTML formatında olmalı:
- Semantic HTML kullan (article, section, header, h1-h6, p, ul, ol, strong, em)
- Minimum 1500 kelime (ideal 2000-2500)
- Her bölüm için uygun başlıklar
- Liste ve tablolar kullan (SEO keywords dahil et)
- CTA bölümleri ekle
- İç linkler için placeholder'lar bırak
- Meta description'da primary keyword olmalı`
      }],
      tools: [{
        type: 'function',
        function: {
          name: 'generate_blog_content',
          parameters: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              content: { type: 'string', description: 'HTML formatted content' },
              excerpt: { type: 'string', maxLength: 160 },
              meta_description: { type: 'string', maxLength: 160 },
              meta_keywords: { type: 'array', items: { type: 'string' }, maxItems: 10 },
              focus_keyword: { type: 'string' },
              read_time: { type: 'number', description: 'Estimated read time in minutes' },
              tags: { type: 'array', items: { type: 'string' }, minItems: 3 },
              category: { type: 'string' },
              word_count: { type: 'number' }
            },
            required: ['title', 'content', 'excerpt', 'meta_description', 'meta_keywords', 'focus_keyword', 'read_time', 'tags', 'category', 'word_count']
          }
        }
      }],
      tool_choice: { type: 'function', function: { name: 'generate_blog_content' } }
    })
  });

  const contentResult = await contentResponse.json();
  const content = JSON.parse(contentResult.choices[0].message.tool_calls[0].function.arguments);

  // Step 4: SEO Score Analysis
  console.log('Step 4: SEO Analysis');
  const seoResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{
        role: 'user',
        content: `Bu blog içeriği için SEO analizi yap:

Başlık: ${content.title}
İçerik kelime sayısı: ${content.word_count}
Focus keyword: ${content.focus_keyword}
Meta description: ${content.meta_description}

SEO skorunu 0-100 arasında değerlendir ve iyileştirme önerileri sun.`
      }],
      tools: [{
        type: 'function',
        function: {
          name: 'seo_analysis',
          parameters: {
            type: 'object',
            properties: {
              seo_score: { type: 'number', minimum: 0, maximum: 100 },
              keyword_density: { type: 'number' },
              readability_score: { type: 'number', minimum: 0, maximum: 100 },
              improvements: { type: 'array', items: { type: 'string' }, minItems: 3 },
              strengths: { type: 'array', items: { type: 'string' }, minItems: 2 }
            },
            required: ['seo_score', 'keyword_density', 'readability_score', 'improvements', 'strengths']
          }
        }
      }],
      tool_choice: { type: 'function', function: { name: 'seo_analysis' } }
    })
  });

  const seoResult = await seoResponse.json();
  const seoAnalysis = JSON.parse(seoResult.choices[0].message.tool_calls[0].function.arguments);

  return {
    ...content,
    seo_analysis: seoAnalysis,
    keywords_research: keywords,
    outline: outline
  };
}

async function generateReviews(data: any, apiKey: string) {
  const { siteName, count } = data;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      temperature: 0.9, // Yüksek yaratıcılık için
      messages: [
        {
          role: 'system',
          content: 'Sen gerçek kullanıcı yorumları yazan bir uzman yazarsın. Her yorumun benzersiz, organik ve gerçekçi olması gerekir. Asla aynı ismi veya benzer ifadeleri tekrar etme. Her yorumcu farklı bir kişilik ve deneyime sahip olmalı.'
        },
        {
          role: 'user',
          content: `${siteName} bahis sitesi için ${count || 5} adet BENZERSIZ ve ORGANIK kullanıcı yorumu oluştur.

        🎯 UNIQUE İSİM KURALLARI (ÇOK ÖNEMLİ):
        - Her yorumcu için FARKLI bir Türkçe isim-soyisim kombinasyonu kullan
        - Popüler Türkçe isimleri kullan: Ahmet, Mehmet, Ali, Mustafa, Hasan, Hüseyin, İbrahim, Yusuf, Emre, Burak, Cem, Deniz, Fatma, Ayşe, Elif, Zeynep, Merve, Selin, Ebru, Gülşen vb.
        - Çeşitli soyisimler: Yılmaz, Demir, Çelik, Aydın, Özdemir, Arslan, Doğan, Kaya, Şahin, Kılıç, Polat, Karaca, Koç, Öztürk vb.
        - Asla aynı ismi tekrar etme!
        - Erkek ve kadın isimleri karıştır
        
        👤 KULLANICI ÇEŞİTLİLİĞİ:
        - Farklı yaş grupları (20'li yaşlar: genç dil, 30'lu yaşlar: deneyimli, 40+: muhafazakâr üslup)
        - Farklı deneyim seviyeleri (yeni başlayan, orta seviye, profesyonel)
        - Farklı bahis tarzları (spor bahisleri, canlı bahis, casino oyunları)
        - Bazıları teknik detaylara girerken, bazıları genel izlenimlerini paylaşsın
        
        📝 ORGANİK YORUM İÇERİĞİ:
        - Her yorum FARKLI konulara odaklansın
        - Bazıları bonuslardan bahsetsin
        - Bazıları çekim süreçlerinden
        - Bazıları müşteri hizmetlerinden
        - Bazıları mobil uygulamadan
        - Bazıları bahis oranlarından
        - GERÇEK kullanıcı tecrübesi gibi yaz (gramer hataları, günlük dil, emoji kullanımı dahil)
        
        ⭐ PUAN DAĞILIMI:
        - ${Math.ceil((count || 5) * 0.6)} adet 4-5 yıldız (pozitif deneyim)
        - ${Math.floor((count || 5) * 0.4)} adet 1-3 yıldız (negatif/orta deneyim)
        - Her puan için farklı gerekçeler
        
        📅 TARİH ÇEŞİTLİLİĞİ:
        - Son 3 ay içinde farklı tarihler
        - Aynı günde birden fazla yorum olmasın
        
        ✍️ YORUM DETAYLARI:
        - Başlık: 50-80 karakter, dikkat çekici ve özgün
        - Yorum: 150-250 kelime, detaylı ve kişisel
        - Pros: 2-4 madde, spesifik avantajlar
        - Cons: 1-3 madde (pozitif yorumlarda az, negatif yorumlarda çok)`
        }
      ],
      tools: [{
        type: 'function',
        function: {
          name: 'generate_reviews',
          parameters: {
            type: 'object',
            properties: {
              reviews: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', description: 'Kullanıcının adı soyadı' },
                    title: { type: 'string', description: 'Yorumun kısa başlığı (50-80 karakter)' },
                    rating: { type: 'integer', minimum: 1, maximum: 5, description: 'Tam sayı puan (1-5)' },
                    comment: { type: 'string', description: 'Detaylı yorum metni (150-250 kelime)' },
                    date: { type: 'string', format: 'date', description: 'YYYY-MM-DD formatında tarih' },
                    pros: { type: 'array', items: { type: 'string' }, description: 'Artılar listesi' },
                    cons: { type: 'array', items: { type: 'string' }, description: 'Eksiler listesi' }
                  },
                  required: ['name', 'title', 'rating', 'comment', 'date'],
                  additionalProperties: false
                }
              }
            },
            required: ['reviews']
          }
        }
      }],
      tool_choice: { type: 'function', function: { name: 'generate_reviews' } }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Lovable AI Error:', response.status, errorText);
    throw new Error(`Lovable AI hatası: ${response.status}`);
  }

  const result = await response.json();
  const toolCall = result.choices[0].message.tool_calls?.[0];
  
  if (!toolCall) {
    console.error('AI tool call yanıtı alınamadı, result:', JSON.stringify(result));
    throw new Error('AI tool call yanıtı alınamadı');
  }

  const parsedData = JSON.parse(toolCall.function.arguments);
  console.log('Generated reviews:', JSON.stringify(parsedData));
  
  return parsedData;
}
