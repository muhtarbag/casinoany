import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Category } from '@/hooks/queries/useCategoryQueries';
import * as LucideIcons from 'lucide-react';

interface CategoryCardProps {
  category: Category & {
    site_count?: number;
    blog_count?: number;
  };
}

export function CategoryCard({ category }: CategoryCardProps) {
  // Dinamik ikon yükleme
  const IconComponent = (LucideIcons as any)[
    category.icon.charAt(0).toUpperCase() + category.icon.slice(1)
  ] || LucideIcons.Folder;

  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-card/50 backdrop-blur border-border/50">
      <CardHeader>
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className="flex-shrink-0 p-4 rounded-xl transition-transform group-hover:scale-110"
            style={{
              backgroundColor: `${category.color}20`,
            }}
          >
            <IconComponent
              className="w-8 h-8"
              style={{ color: category.color }}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
              {category.name}
            </CardTitle>
            {category.description && (
              <CardDescription className="line-clamp-2">
                {category.description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {category.site_count !== undefined && (
            <div className="flex items-center gap-1">
              <ExternalLink className="w-4 h-4" />
              <span>{category.site_count} Site</span>
            </div>
          )}
          {category.blog_count !== undefined && (
            <div className="flex items-center gap-1">
              <LucideIcons.FileText className="w-4 h-4" />
              <span>{category.blog_count} Blog</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Link to={`/kategori/${category.slug}`} className="w-full">
          <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
            Kategoriye Git
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
