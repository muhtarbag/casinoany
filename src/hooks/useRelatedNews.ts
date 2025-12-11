import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  tags: string[] | null;
  published_at: string;
  view_count: number | null;
  featured_image: string | null;
  featured_image_alt: string | null;
}

/**
 * Find related news articles based on tags and category
 * Uses weighted scoring:
 * - Same category: +10 points
 * - Each matching tag: +5 points
 * - Recent articles get slight boost
 */
export function useRelatedNews(
  currentArticleId: string,
  category: string | null,
  tags: string[] | null,
  limit: number = 4
) {
  return useQuery({
    queryKey: ['related-news', currentArticleId, category, tags],
    queryFn: async () => {
      if (!currentArticleId) return [];

      // Fetch published news articles (excluding current)
      const { data: articles, error } = await supabase
        .from('news_articles')
        .select('id, title, slug, excerpt, category, tags, published_at, view_count, featured_image, featured_image_alt')
        .eq('is_published', true)
        .neq('id', currentArticleId)
        .order('published_at', { ascending: false })
        .limit(50); // Get more to calculate relevance

      if (error) throw error;
      if (!articles || articles.length === 0) return [];

      // Calculate relevance score for each article
      const scoredArticles = articles.map((article: NewsArticle) => {
        let score = 0;

        // Same category bonus
        if (category && article.category === category) {
          score += 10;
        }

        // Matching tags bonus
        if (tags && article.tags) {
          const matchingTags = tags.filter(tag => 
            article.tags?.some(articleTag => 
              articleTag.toLowerCase() === tag.toLowerCase()
            )
          );
          score += matchingTags.length * 5;
        }

        // Recency bonus (newer articles get slight boost)
        const daysOld = Math.floor(
          (Date.now() - new Date(article.published_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysOld <= 7) score += 3;
        else if (daysOld <= 30) score += 1;

        // Popularity bonus
        if (article.view_count && article.view_count > 100) {
          score += 2;
        }

        return {
          ...article,
          relevanceScore: score,
        };
      });

      // Sort by score and return top N
      const related = scoredArticles
        .filter(a => a.relevanceScore > 0) // Only show if there's some relevance
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);

      return related;
    },
    enabled: !!currentArticleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
