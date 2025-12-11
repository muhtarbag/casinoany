import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, FileText } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Category } from '@/hooks/queries/useCategoryQueries';
import { motion } from 'framer-motion';

interface CategoryCardProps {
  category: Category & {
    site_count?: number;
    blog_count?: number;
  };
}

import { getIcon } from '@/lib/utils';
// ... imports

export const CategoryCard = memo(({ category }: CategoryCardProps) => {
  // Dinamik ikon yükleme - memoized
  const IconComponent = useMemo(() => {
    return getIcon(category.icon);
  }, [category.icon]);

  return (
    <Link to={`/kategori/${category.slug}`} className="block group">
      <Card className="relative h-full overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:-translate-y-2 bg-card/60 backdrop-blur-xl border-border/50 hover:border-primary/40">
        {/* Background Gradient Overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-br"
          style={{
            backgroundImage: `linear-gradient(135deg, ${category.color}15, transparent 60%)`
          }}
        />

        {/* Decorative Corner Accent */}
        <div
          className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-all duration-700"
          style={{ backgroundColor: category.color }}
        />

        <CardHeader className="relative p-6 sm:p-8">
          {/* Icon */}
          <motion.div
            className="mb-6"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div
              className="inline-flex p-4 rounded-2xl shadow-lg ring-1 ring-black/5 transition-all duration-300 group-hover:shadow-xl"
              style={{
                backgroundColor: category.color,
              }}
            >
              <IconComponent className="w-8 h-8 text-white" />
            </div>
          </motion.div>

          {/* Content */}
          <div className="space-y-3">
            <h3 className="text-2xl sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 leading-tight">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {category.description}
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent className="relative px-6 sm:px-8 pb-4">
          {/* Stats */}
          {(category.site_count !== undefined || category.blog_count !== undefined) && (
            <div className="flex items-center gap-3">
              {category.site_count !== undefined && (
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full ring-1 ring-inset ring-border/50 transition-all duration-300 hover:ring-2"
                  style={{
                    backgroundColor: `${category.color}10`,
                    color: category.color
                  }}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="text-sm font-semibold">{category.site_count}</span>
                  <span className="text-xs opacity-70">site</span>
                </div>
              )}
              {category.blog_count !== undefined && (
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full ring-1 ring-inset ring-border/50 transition-all duration-300 hover:ring-2"
                  style={{
                    backgroundColor: `${category.color}10`,
                    color: category.color
                  }}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="text-sm font-semibold">{category.blog_count}</span>
                  <span className="text-xs opacity-70">yazı</span>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="relative px-6 sm:px-8 pb-6 sm:pb-8">
          <Button
            size="lg"
            className="w-full h-11 text-sm font-semibold shadow-lg group-hover:shadow-xl transition-all duration-300 border-0 relative overflow-hidden"
            style={{
              backgroundColor: category.color,
              color: 'white'
            }}
          >
            {/* Button shine effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />

            <span className="relative flex items-center justify-center gap-2">
              Keşfet
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
});

CategoryCard.displayName = 'CategoryCard';
