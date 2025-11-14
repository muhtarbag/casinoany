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
    // 🔐 JWT + Admin verification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: roleData, error: roleError } = await supabase
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

    const { action, data } = await req.json();
    console.log('Content Planner action:', action, 'by', user.email);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY bulunamadı');
    }

    let result;

    if (action === 'analyze-content-gaps') {
      result = await analyzeContentGaps(data, LOVABLE_API_KEY);
    } else if (action === 'generate-content-calendar') {
      result = await generateContentCalendar(data, LOVABLE_API_KEY);
    } else if (action === 'suggest-topics') {
      result = await suggestTopics(data, LOVABLE_API_KEY);
    } else {
      throw new Error('Geçersiz action');
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Content Planner Error:', error);
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

async function analyzeContentGaps(data: any, apiKey: string) {
  const { existingPosts, targetAudience, niche } = data;

  console.log('Analyzing content gaps...');
  
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{
        role: 'user',
        content: `Mevcut blog içeriklerini analiz et ve içerik boşluklarını tespit et.

Mevcut İçerikler:
${JSON.stringify(existingPosts.map((p: any) => ({ title: p.title, category: p.category, tags: p.tags })))}

Hedef Kitle: ${targetAudience || 'Bahis siteleri kullanıcıları'}
Niş: ${niche || 'Online bahis ve casino'}

Şunları belirle:
- Hangi konular eksik?
- Hangi kategorilerde daha fazla içerik gerekli?
- Hangi keywords hedeflenmeye başlanmalı?
- Hangi içerik formatları eksik? (rehber, karşılaştırma, liste, vaka çalışması)
- Rakiplerin hangi konularda güçlü ama bizim zayıf olduğumuz?`
      }],
      tools: [{
        type: 'function',
        function: {
          name: 'analyze_content_gaps',
          parameters: {
            type: 'object',
            properties: {
              missing_topics: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    topic: { type: 'string' },
                    reason: { type: 'string' },
                    priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                    estimated_search_volume: { type: 'string' },
                    difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
                    content_type: { type: 'string', enum: ['guide', 'comparison', 'list', 'tutorial', 'case-study', 'news'] }
                  }
                },
                minItems: 5
              },
              category_gaps: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    category: { type: 'string' },
                    current_count: { type: 'number' },
                    recommended_count: { type: 'number' },
                    topics_to_add: { type: 'array', items: { type: 'string' } }
                  }
                }
              },
              keyword_opportunities: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    keyword: { type: 'string' },
                    search_intent: { type: 'string' },
                    competition: { type: 'string' },
                    opportunity_score: { type: 'number' }
                  }
                },
                minItems: 10
              },
              competitor_insights: {
                type: 'object',
                properties: {
                  strong_areas: { type: 'array', items: { type: 'string' } },
                  weak_areas: { type: 'array', items: { type: 'string' } },
                  opportunities: { type: 'array', items: { type: 'string' } }
                }
              }
            },
            required: ['missing_topics', 'category_gaps', 'keyword_opportunities', 'competitor_insights']
          }
        }
      }],
      tool_choice: { type: 'function', function: { name: 'analyze_content_gaps' } }
    })
  });

  const result = await response.json();
  
  console.log('Gaps Analysis API Response:', JSON.stringify(result));
  
  if (!result.choices || !result.choices[0]) {
    throw new Error('AI API yanıtı beklenmedik formatta');
  }

  if (!result.choices[0].message?.tool_calls?.[0]?.function?.arguments) {
    throw new Error('AI içerik analizi yapamadı. Lütfen tekrar deneyin.');
  }

  return JSON.parse(result.choices[0].message.tool_calls[0].function.arguments);
}

async function generateContentCalendar(data: any, apiKey: string) {
  const { topics, duration, frequency, startDate } = data;

  console.log('Generating content calendar...');

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{
        role: 'user',
        content: `${duration} aylık içerik takvimi oluştur.

Öncelikli Konular: ${JSON.stringify(topics)}
Yayın Sıklığı: ${frequency || 'Haftada 2-3 içerik'}
Başlangıç Tarihi: ${startDate || 'Bugün'}

Her içerik için:
- Yayın tarihi
- Konu başlığı
- İçerik tipi
- Tahmini kelime sayısı
- Hedef keywords
- İçerik amacı (trafik, dönüşüm, brand awareness)
- Öncelik seviyesi`
      }],
      tools: [{
        type: 'function',
        function: {
          name: 'generate_content_calendar',
          parameters: {
            type: 'object',
            properties: {
              calendar: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    week: { type: 'number' },
                    date: { type: 'string' },
                    title: { type: 'string' },
                    content_type: { type: 'string' },
                    target_words: { type: 'number' },
                    keywords: { type: 'array', items: { type: 'string' } },
                    goal: { type: 'string' },
                    priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                    estimated_hours: { type: 'number' },
                    dependencies: { type: 'array', items: { type: 'string' } }
                  }
                },
                minItems: 8
              },
              monthly_themes: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    month: { type: 'string' },
                    theme: { type: 'string' },
                    focus_areas: { type: 'array', items: { type: 'string' } }
                  }
                }
              },
              success_metrics: {
                type: 'object',
                properties: {
                  target_posts: { type: 'number' },
                  target_words: { type: 'number' },
                  target_keywords: { type: 'number' },
                  expected_traffic_increase: { type: 'string' }
                }
              }
            },
            required: ['calendar', 'monthly_themes', 'success_metrics']
          }
        }
      }],
      tool_choice: { type: 'function', function: { name: 'generate_content_calendar' } }
    })
  });

  const result = await response.json();
  
  console.log('Calendar API Response:', JSON.stringify(result));
  
  if (!result.choices || !result.choices[0]) {
    throw new Error('AI API yanıtı beklenmedik formatta');
  }

  if (!result.choices[0].message?.tool_calls?.[0]?.function?.arguments) {
    throw new Error('AI takvim oluşturamadı. Lütfen tekrar deneyin.');
  }

  return JSON.parse(result.choices[0].message.tool_calls[0].function.arguments);
}

async function suggestTopics(data: any, apiKey: string) {
  const { category, count, siteName } = data;

  console.log('Suggesting topics...');

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{
        role: 'user',
        content: `${category || 'Online bahis ve casino'} kategorisinde ${count || 10} adet blog konusu öner.
        
Site: ${siteName || 'Bahis sitesi karşılaştırma platformu'}

Her konu için:
- Çekici başlık
- SEO potansiyeli
- Hedef kitle
- İçerik türü
- Ana anahtar kelimeler
- Yazılma zorluğu
- Tahmini trafik potansiyeli
- Hangi kullanıcı sorusuna cevap veriyor?`
      }],
      tools: [{
        type: 'function',
        function: {
          name: 'suggest_topics',
          parameters: {
            type: 'object',
            properties: {
              topics: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    seo_score: { type: 'number', minimum: 0, maximum: 100 },
                    target_audience: { type: 'string' },
                    content_type: { type: 'string' },
                    keywords: { type: 'array', items: { type: 'string' }, minItems: 3 },
                    difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
                    traffic_potential: { type: 'string', enum: ['low', 'medium', 'high'] },
                    user_question: { type: 'string' },
                    estimated_word_count: { type: 'number' },
                    recommended_publish_time: { type: 'string' }
                  }
                }
              },
              trending_topics: {
                type: 'array',
                items: { type: 'string' },
                minItems: 5
              },
              seasonal_opportunities: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    season: { type: 'string' },
                    topics: { type: 'array', items: { type: 'string' } }
                  }
                }
              }
            },
            required: ['topics', 'trending_topics', 'seasonal_opportunities']
          }
        }
      }],
      tool_choice: { type: 'function', function: { name: 'suggest_topics' } }
    })
  });

  const result = await response.json();
  
  console.log('Topics Suggestion API Response:', JSON.stringify(result));
  
  if (!result.choices || !result.choices[0]) {
    throw new Error('AI API yanıtı beklenmedik formatta');
  }

  if (!result.choices[0].message?.tool_calls?.[0]?.function?.arguments) {
    throw new Error('AI konu önerisi oluşturamadı. Lütfen tekrar deneyin.');
  }

  return JSON.parse(result.choices[0].message.tool_calls[0].function.arguments);
}
