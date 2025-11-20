import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function checkRateLimit(supabase: any, ip: string, functionName: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  const now = new Date();
  const { data: banned } = await supabase.from('api_rate_limits').select('banned_until').eq('ip_address', ip).eq('function_name', functionName).gte('banned_until', now.toISOString()).maybeSingle();
  if (banned) return { allowed: false, retryAfter: Math.ceil((new Date(banned.banned_until).getTime() - now.getTime()) / 1000) };
  const windowStart = new Date(now.getTime() - 60000);
  const { data: existing } = await supabase.from('api_rate_limits').select('*').eq('ip_address', ip).eq('function_name', functionName).gte('window_start', windowStart.toISOString()).maybeSingle();
  if (existing) {
    if (existing.request_count >= 10) {
      await supabase.from('api_rate_limits').update({ banned_until: new Date(now.getTime() + 60000).toISOString(), updated_at: now.toISOString() }).eq('id', existing.id);
      return { allowed: false, retryAfter: 60 };
    }
    await supabase.from('api_rate_limits').update({ request_count: existing.request_count + 1, updated_at: now.toISOString() }).eq('id', existing.id);
    return { allowed: true };
  }
  await supabase.from('api_rate_limits').insert({ ip_address: ip, function_name: functionName, request_count: 1, window_start: now.toISOString() });
  return { allowed: true };
}

const RSS_FEEDS = [
  // iGaming Global Feeds
  'https://igamingbusiness.com/feed/',
  'https://sbcnews.co.uk/feed/',
  'https://www.gamblinginsider.com/rss',
  'https://www.gamblingnews.com/feed/',
  'https://www.yogonet.com/international/rss',
  'https://www.casino.org/news/feed/',
  'https://calvinayre.com/feed/',
  'https://igamingbusiness.com/category/casino/feed/',
  'https://coinjournal.net/news/feed/',
  'https://cryptoslate.com/feed/',
  
  // Türkiye Spor Haberleri
  'https://www.spormaraton.com/rss/anasayfa/',
];

interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  sourceFeed: string;
}

interface ProcessedArticle {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  content_html: string;
  category: string;
  tags: string[];
  meta_title: string;
  meta_description: string;
  source_url: string;
  source_feed: string;
  published_at: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const rateLimit = await checkRateLimit(supabase, ip, 'rss-news-processor');
    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({ error: 'Too Many Requests' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': String(rateLimit.retryAfter || 60) }
      });
    }

    console.log('Starting RSS processing...');
    const processedArticles: ProcessedArticle[] = [];
    const errors: string[] = [];

    for (const feedUrl of RSS_FEEDS) {
      try {
        console.log(`Fetching feed: ${feedUrl}`);
        const items = await fetchAndParseRSS(feedUrl);
        
        for (const item of items) {
          try {
            // Check duplicate
            const { data: existing } = await supabase
              .from('news_articles')
              .select('id')
              .eq('source_url', item.link)
              .maybeSingle();

            if (existing) {
              console.log(`Skipping duplicate: ${item.link}`);
              continue;
            }

            // Skip very short content
            const wordCount = item.content.split(/\s+/).length;
            if (wordCount < 50) {
              console.log(`Skipping short content: ${item.title}`);
              continue;
            }

            // Process with AI
            const processed = await processWithAI(item, lovableApiKey);
            if (processed) {
              // Insert to database
              const { error: insertError } = await supabase
                .from('news_articles')
                .insert({
                  ...processed,
                  is_published: true,
                });

              if (insertError) {
                console.error('Insert error:', insertError);
                errors.push(`Insert error for ${item.title}: ${insertError.message}`);
              } else {
                processedArticles.push(processed);
                console.log(`Successfully processed: ${processed.title}`);
              }
            }
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            console.error(`Error processing item: ${item.title}`, error);
            errors.push(`Error processing ${item.title}: ${errorMsg}`);
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error fetching feed: ${feedUrl}`, error);
        errors.push(`Error fetching ${feedUrl}: ${errorMsg}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedArticles.length,
        articles: processedArticles.map(a => ({ title: a.title, slug: a.slug })),
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('RSS processor error:', error);
    return new Response(
      JSON.stringify({ error: errorMsg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function fetchAndParseRSS(feedUrl: string): Promise<RSSItem[]> {
  const response = await fetch(feedUrl);
  const text = await response.text();
  
  // Simple XML parsing for RSS
  const items: RSSItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  
  while ((match = itemRegex.exec(text)) !== null) {
    const itemXml = match[1];
    
    const title = extractTag(itemXml, 'title');
    const link = extractTag(itemXml, 'link');
    const pubDate = extractTag(itemXml, 'pubDate');
    const description = extractTag(itemXml, 'description');
    const content = extractTag(itemXml, 'content:encoded') || description;
    
    if (title && link) {
      items.push({
        title: cleanHtml(title),
        link: link.trim(),
        pubDate: pubDate || new Date().toISOString(),
        content: cleanHtml(content),
        sourceFeed: feedUrl,
      });
    }
  }
  
  return items.slice(0, 5); // Limit to 5 items per feed per run
}

function extractTag(xml: string, tagName: string): string {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\/${tagName}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

function cleanHtml(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/Read more|Click here|Continue reading.*/gi, '')
    .trim();
}

function slugify(text: string): string {
  const trMap: Record<string, string> = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u',
  };
  
  return text
    .split('')
    .map(char => trMap[char] || char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function categorizeContent(content: string): string {
  const lower = content.toLowerCase();
  
  // Spor içeriği kontrolü (önce)
  if (lower.includes('futbol') || lower.includes('maç') || lower.includes('gol') || 
      lower.includes('lig') || lower.includes('takım') || lower.includes('football') || 
      lower.includes('soccer') || lower.includes('süper lig') || lower.includes('goal')) {
    return 'Spor Haberleri';
  }
  if (lower.includes('slot') || lower.includes('rtp') || lower.includes('provider')) {
    return 'Slot Haberleri';
  }
  if (lower.includes('regulation') || lower.includes('lisans') || lower.includes('ukgc') || lower.includes('mga')) {
    return 'Regülasyon';
  }
  if (lower.includes('crypto') || lower.includes('bitcoin') || lower.includes('usdt')) {
    return 'Kripto Casino';
  }
  if (lower.includes('bonus') || lower.includes('promotion')) {
    return 'Bonus Haberleri';
  }
  
  return 'iGaming Genel';
}

async function processWithAI(item: RSSItem, apiKey: string): Promise<ProcessedArticle | null> {
  try {
    // Step 1: Translate and create Turkish content
    const contentResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: 'Sen CasinoAny.com için iGaming haberleri yazan profesyonel bir içerik yazarısın. Türkçe, SEO-uyumlu, %100 özgün içerikler üretirsin.',
          },
          {
            role: 'user',
            content: `Aşağıdaki iGaming haberini Türkçe'ye çevir ve CasinoAny.com için özgün bir haber haline getir:

Başlık: ${item.title}
İçerik: ${item.content}

Format:
BAŞLIK: [60 karakter max, SEO-friendly]
KISA AÇIKLAMA: [2-3 cümle]
ANA İÇERİK: [200-250 kelime, özgün, Türkçe]

Önemli:
- %100 özgün içerik üret, kelime kelime çevirme
- Casino, slot, bahis terimleri Türkçeleştir
- SEO için doğal anahtar kelimeler kullan (casino, slot oyunları, canlı casino, bonus)
- Profesyonel ve bilgilendirici üslup kullan`,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!contentResponse.ok) {
      console.error('AI content generation failed:', await contentResponse.text());
      return null;
    }

    const contentResult = await contentResponse.json();
    const contentText = contentResult.choices[0].message.content;

    // Parse AI response
    const titleMatch = contentText.match(/BAŞLIK:\s*(.+?)(?:\n|$)/i);
    const excerptMatch = contentText.match(/KISA AÇIKLAMA:\s*(.+?)(?:\n|ANA İÇERİK:)/is);
    const contentMatch = contentText.match(/ANA İÇERİK:\s*(.+)$/is);

    const title = titleMatch ? titleMatch[1].trim() : item.title;
    const excerpt = excerptMatch ? excerptMatch[1].trim().replace(/\n/g, ' ') : '';
    const content = contentMatch ? contentMatch[1].trim() : contentText;

    // Step 2: Generate SEO metadata
    const seoResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: 'Sen SEO uzmanısın. Türkçe içerikler için optimize edilmiş meta bilgileri üretirsin.',
          },
          {
            role: 'user',
            content: `Bu haber için SEO optimize meta bilgileri üret:

Başlık: ${title}
İçerik: ${content}

Format:
SEO_TITLE: [60 karakter max]
META_DESCRIPTION: [155 karakter max]
TAGS: [4-6 Türkçe tag, virgülle ayır]`,
          },
        ],
        temperature: 0.5,
      }),
    });

    const seoResult = await seoResponse.json();
    const seoText = seoResult.choices[0].message.content;

    const seoTitleMatch = seoText.match(/SEO_TITLE:\s*(.+?)(?:\n|$)/i);
    const metaDescMatch = seoText.match(/META_DESCRIPTION:\s*(.+?)(?:\n|$)/i);
    const tagsMatch = seoText.match(/TAGS:\s*(.+?)(?:\n|$)/i);

    const seoTitle = seoTitleMatch ? seoTitleMatch[1].trim() : title.slice(0, 60);
    const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : excerpt.slice(0, 155);
    const tagsRaw = tagsMatch ? tagsMatch[1].trim() : 'casino, igaming';
    const tags = tagsRaw.split(',').map((t: string) => t.trim()).slice(0, 6);

    const category = categorizeContent(content);
    const slug = slugify(title);

    // Convert content to HTML
    const contentHtml = content
      .split('\n\n')
      .filter((p: string) => p.trim())
      .map((p: string) => `<p>${p.trim()}</p>`)
      .join('\n');

    return {
      title,
      slug,
      excerpt,
      content,
      content_html: contentHtml,
      category,
      tags,
      meta_title: seoTitle,
      meta_description: metaDescription,
      source_url: item.link,
      source_feed: item.sourceFeed,
      published_at: new Date(item.pubDate).toISOString(),
    };
  } catch (error) {
    console.error('AI processing error:', error);
    return null;
  }
}
