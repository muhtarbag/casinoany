import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import BlogPost from './BlogPost';
import CategoryPage from './CategoryPage';
import { LoadingSpinner } from '@/components/LoadingSpinner';

/**
 * Smart router that checks if slug is a blog post or category
 * Blog posts take priority over categories
 */
export default function SlugRouter() {
  const { slug } = useParams();

  // Check if this slug belongs to a blog post
  const { data: blogPost, isLoading: blogLoading } = useQuery({
    queryKey: ['slug-check-blog', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('slug')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  if (blogLoading) {
    return (
      <div className="min-h-screen bg-gradient-dark pt-[72px] md:pt-[84px] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // If it's a blog post, render BlogPost component
  if (blogPost) {
    return <BlogPost />;
  }

  // Otherwise, try to render as category
  return <CategoryPage />;
}

