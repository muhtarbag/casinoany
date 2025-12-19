// Internal Linking AI Engine
// Generates contextual link suggestions using AI

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LinkSuggestion {
  targetPage: string;
  targetType: string;
  anchorText: string;
  relevanceScore: number;
  contextSnippet: string;
  positionInContent: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use service role key to bypass RLS for internal linking operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { sourcePage, sourceType, content, maxLinks = 5 } = await req.json();

    if (!sourcePage || !sourceType || !content) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: sourcePage, sourceType, content' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get potential link targets based on source type
    let potentialTargets: any[] = [];

    if (sourceType === 'blog') {
      // Get related casino sites
      const { data: sites } = await supabase
        .from('betting_sites')
        .select('slug, name, features, bonus')
        .eq('is_active', true)
        .limit(20);
      
      potentialTargets = (sites || []).map((s: any) => ({
        type: 'casino',
        page: `/site/${s.slug}`,
        title: s.name,
        keywords: [...(s.features || []), s.bonus].filter(Boolean),
      }));

      // Get related blog posts
      const { data: posts } = await supabase
        .from('blog_posts')
        .select('slug, title, meta_keywords')
        .eq('is_published', true)
        .neq('slug', sourcePage.replace('/blog/', ''))
        .limit(10);
      
      potentialTargets.push(
        ...(posts || []).map((p: any) => ({
          type: 'blog',
          page: `/blog/${p.slug}`,
          title: p.title,
          keywords: p.meta_keywords || [],
        }))
      );
    } else if (sourceType === 'casino') {
      // Get related blogs
      const { data: posts } = await supabase
        .from('blog_posts')
        .select('slug, title, meta_keywords')
        .eq('is_published', true)
        .limit(15);
      
      potentialTargets = (posts || []).map((p: any) => ({
        type: 'blog',
        page: `/blog/${p.slug}`,
        title: p.title,
        keywords: p.meta_keywords || [],
      }));
    }

    // Call Lovable AI for intelligent link suggestions
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an SEO expert specializing in internal linking for iGaming content. 
Analyze the content and suggest the most relevant internal links from the provided targets.
Consider: semantic relevance, user intent, link placement, and SEO value.
Return ONLY valid JSON with no markdown formatting.`,
          },
          {
            role: 'user',
            content: `Content: ${content.substring(0, 5000)}

Available link targets:
${JSON.stringify(potentialTargets, null, 2)}

Generate ${maxLinks} internal link suggestions with:
1. Best anchor text (natural, keyword-rich)
2. Optimal position in content (character index)
3. Relevance score (0-1)
4. Context snippet (20 words around suggested link)

Return JSON array of suggestions.`,
          },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'suggest_internal_links',
              description: 'Generate internal link suggestions',
              parameters: {
                type: 'object',
                properties: {
                  suggestions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        targetPage: { type: 'string' },
                        targetType: { type: 'string' },
                        anchorText: { type: 'string' },
                        relevanceScore: { type: 'number' },
                        contextSnippet: { type: 'string' },
                        positionInContent: { type: 'number' },
                      },
                      required: [
                        'targetPage',
                        'targetType',
                        'anchorText',
                        'relevanceScore',
                        'contextSnippet',
                        'positionInContent',
                      ],
                    },
                  },
                },
                required: ['suggestions'],
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'suggest_internal_links' } },
      }),
    });

    if (!aiResponse.ok) {
      const error = await aiResponse.text();
      console.error('Lovable AI error:', error);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    
    // Extract tool call results
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const suggestions: LinkSuggestion[] = JSON.parse(toolCall.function.arguments).suggestions;

    // Store suggestions in database
    const linksToInsert = suggestions.map((s) => ({
      source_page: sourcePage,
      source_type: sourceType,
      target_page: s.targetPage,
      target_type: s.targetType,
      anchor_text: s.anchorText,
      link_type: 'contextual',
      ai_relevance_score: s.relevanceScore,
      position_in_content: s.positionInContent,
      context_snippet: s.contextSnippet,
      is_active: true,
    }));

    const { data: insertedLinks, error: insertError } = await supabase
      .from('internal_links')
      .insert(linksToInsert)
      .select();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        suggestions: insertedLinks,
        count: insertedLinks?.length || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Internal linking AI error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal linking generation failed',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
