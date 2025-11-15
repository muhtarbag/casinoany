import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface CategoryBlogSectionProps {
  blogs: any[];
  categoryName: string;
  categorySlug: string;
}

export function CategoryBlogSection({ blogs, categoryName, categorySlug }: CategoryBlogSectionProps) {
  return (
    <section className="mb-16 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {categoryName} Blog Yazıları
        </h2>
        {blogs.length > 6 && (
          <Link to="/blog">
            <Button variant="ghost" size="sm" className="hover:bg-primary/10">
              Tümünü Gör
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {blogs.slice(0, 6).map((blog, index) => (
          <Link 
            key={blog.id} 
            to={`/blog/${blog.slug}`}
            style={{ animationDelay: `${index * 100}ms` }}
            className="animate-scale-in"
          >
            <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/30">
              {/* Gradient accent */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <CardHeader className="relative">
                <div className="flex items-start justify-between gap-2 mb-3">
                  {blog.category && (
                    <Badge variant="secondary" className="text-xs font-medium">
                      {blog.category}
                    </Badge>
                  )}
                  {blog.read_time && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                      <Clock className="w-3 h-3" />
                      <span>{blog.read_time} dk</span>
                    </div>
                  )}
                </div>

                <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                  {blog.title}
                </CardTitle>

                {blog.excerpt && (
                  <CardDescription className="line-clamp-3 leading-relaxed">
                    {blog.excerpt}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="relative">
                {blog.published_at && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {format(new Date(blog.published_at), 'd MMMM yyyy', { locale: tr })}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
