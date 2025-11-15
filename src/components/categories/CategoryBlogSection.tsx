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
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {categoryName} Blog Yazıları
        </h2>
        {blogs.length > 6 && (
          <Link to="/blog">
            <Button variant="ghost" size="sm">
              Tümünü Gör
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {blogs.slice(0, 6).map((blog) => (
          <Link key={blog.id} to={`/blog/${blog.slug}`}>
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  {blog.category && (
                    <Badge variant="secondary" className="text-xs">
                      {blog.category}
                    </Badge>
                  )}
                  {blog.read_time && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{blog.read_time} dk</span>
                    </div>
                  )}
                </div>

                <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                  {blog.title}
                </CardTitle>

                {blog.excerpt && (
                  <CardDescription className="line-clamp-3">
                    {blog.excerpt}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {blog.published_at && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {format(new Date(blog.published_at), 'd MMMM yyyy', { locale: tr })}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
