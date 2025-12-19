import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useRelatedNews } from '@/hooks/useRelatedNews';
import { calculateReadingTime, formatReadingTime } from '@/lib/readingTime';
import { Skeleton } from '@/components/ui/skeleton';

interface RelatedNewsProps {
  currentArticleId: string;
  category: string | null;
  tags: string[] | null;
  limit?: number;
}

export function RelatedNews({ 
  currentArticleId, 
  category, 
  tags, 
  limit = 4 
}: RelatedNewsProps) {
  const { data: relatedArticles, isLoading } = useRelatedNews(
    currentArticleId,
    category,
    tags,
    limit
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">İlgili Haberler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (!relatedArticles || relatedArticles.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span>İlgili Haberler</span>
          <Badge variant="secondary" className="text-xs">
            {relatedArticles.length}
          </Badge>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {relatedArticles.map((article: any) => {
            const readTime = calculateReadingTime(article.content || '');
            
            return (
              <Link key={article.id} to={`/haber/${article.slug}`}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:border-primary/50 overflow-hidden group">
                  {article.featured_image && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={article.featured_image}
                        alt={article.featured_image_alt || article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      {article.category && (
                        <Badge variant="secondary" className="text-xs">
                          {article.category}
                        </Badge>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatReadingTime(readTime)}</span>
                        </div>
                        {article.view_count && article.view_count > 0 && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              <span>{article.view_count}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-xs">
                      <Calendar className="w-3 h-3" />
                      <time dateTime={article.published_at}>
                        {format(new Date(article.published_at), 'dd MMM yyyy', { locale: tr })}
                      </time>
                    </CardDescription>
                  </CardHeader>
                  {article.excerpt && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {article.excerpt}
                      </p>
                    </CardContent>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Internal Linking SEO Enhancement */}
      <div className="text-xs text-muted-foreground border-t pt-4">
        <p>
          Bu haberle ilgili daha fazla içerik için{' '}
          <Link to="/haberler" className="text-primary hover:underline">
            tüm haberlerimizi
          </Link>{' '}
          inceleyebilirsiniz.
        </p>
      </div>
    </div>
  );
}
