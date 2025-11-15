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
    <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/30 active:scale-95">
      {/* Gradient accent */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, ${category.color}10, transparent)`
        }}
      />

      <CardHeader className="relative p-5 sm:p-6">
        {/* Icon - Üstte Ortada - MOBİL BÜYÜK */}
        <div className="flex justify-center mb-5 sm:mb-4">
          <div
            className="p-5 sm:p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg"
            style={{
              backgroundColor: category.color,
            }}
          >
            <IconComponent className="w-10 h-10 sm:w-8 sm:h-8 text-white" />
          </div>
        </div>

        {/* Content - Merkezde - MOBİL FONT */}
        <div className="text-center space-y-3 sm:space-y-2">
          <CardTitle className="text-2xl sm:text-xl font-bold group-hover:text-primary transition-colors leading-tight">
            {category.name}
          </CardTitle>
          {category.description && (
            <CardDescription className="line-clamp-3 text-base sm:text-sm leading-relaxed">
              {category.description}
            </CardDescription>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative px-5 sm:px-6 pb-4 sm:pb-3">
        {/* Stats - Kompakt - MOBİL WRAP */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 text-sm flex-wrap">
          {category.site_count !== undefined && (
            <div 
              className="flex items-center gap-2 sm:gap-1.5 px-4 py-2 sm:px-3 sm:py-1.5 rounded-full"
              style={{
                backgroundColor: `${category.color}15`,
                color: category.color
              }}
            >
              <ExternalLink className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span className="font-semibold text-base sm:text-sm">{category.site_count}</span>
            </div>
          )}
          {category.blog_count !== undefined && (
            <div 
              className="flex items-center gap-2 sm:gap-1.5 px-4 py-2 sm:px-3 sm:py-1.5 rounded-full"
              style={{
                backgroundColor: `${category.color}15`,
                color: category.color
              }}
            >
              <LucideIcons.FileText className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span className="font-semibold text-base sm:text-sm">{category.blog_count}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="relative pt-4 px-5 sm:px-6 pb-5 sm:pb-6">
        <Link to={`/kategori/${category.slug}`} className="w-full">
          <Button 
            size="lg"
            className="w-full h-12 sm:h-10 text-base sm:text-sm group-hover:shadow-xl transition-all duration-200 active:scale-95"
            style={{
              backgroundColor: category.color,
              color: 'white'
            }}
          >
            Keşfet
            <ArrowRight className="ml-2 w-5 h-5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
