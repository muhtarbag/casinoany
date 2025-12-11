/**
 * Internal Linking Hook
 * Fetches and applies AI-suggested internal links
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface InternalLink {
  id: string;
  target_page: string;
  anchor_text: string;
  link_type: string;
  ai_relevance_score: number;
  position_in_content: number;
  context_snippet: string;
}

export function useInternalLinks(sourcePage: string, isActive: boolean = true) {
  return useQuery({
    queryKey: ['internal-links', sourcePage],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('internal_links')
        .select('*')
        .eq('source_page', sourcePage)
        .eq('is_active', isActive)
        .order('ai_relevance_score', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as InternalLink[];
    },
    enabled: !!sourcePage,
  });
}

/**
 * Generate internal link suggestions using AI
 */
export async function generateInternalLinks(
  sourcePage: string,
  sourceType: 'blog' | 'casino' | 'news' | 'category',
  content: string,
  maxLinks: number = 5
) {
  try {
    const { data, error } = await supabase.functions.invoke('internal-linking-ai', {
      body: {
        sourcePage,
        sourceType,
        content,
        maxLinks,
      },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to generate internal links:', error);
    throw error;
  }
}

/**
 * Track internal link click
 */
export async function trackLinkClick(linkId: string) {
  try {
    const { error } = await supabase.rpc('track_internal_link_click', {
      p_link_id: linkId,
    });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to track link click:', error);
  }
}

/**
 * Apply internal links to HTML content
 * Injects links at specified positions
 */
export function applyInternalLinks(content: string, links: InternalLink[]): string {
  if (!links || links.length === 0) return content;

  let result = content;
  let offset = 0;

  // Sort links by position to apply them in order
  const sortedLinks = [...links].sort((a, b) => a.position_in_content - b.position_in_content);

  sortedLinks.forEach((link) => {
    const position = link.position_in_content + offset;
    
    // Create link HTML with tracking
    const linkHtml = `<a href="${link.target_page}" 
      class="internal-link" 
      data-link-id="${link.id}"
      data-link-type="${link.link_type}"
      title="${link.context_snippet}"
    >${link.anchor_text}</a>`;

    // Insert link at position
    result = result.slice(0, position) + linkHtml + result.slice(position + link.anchor_text.length);
    
    // Update offset for subsequent links
    offset += linkHtml.length - link.anchor_text.length;
  });

  return result;
}
