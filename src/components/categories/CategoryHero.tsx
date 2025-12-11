import * as LucideIcons from 'lucide-react';
import type { Category } from '@/hooks/queries/useCategoryQueries';

interface CategoryHeroProps {
  category: Category & {
    site_count?: number;
    blog_count?: number;
  };
}

import { getIcon } from '@/lib/utils';

export function CategoryHero({ category }: CategoryHeroProps) {
  const IconComponent = getIcon(category.icon);

  return (
    <div className="mb-12 sm:mb-16 animate-fade-in">
      <div
        className="relative rounded-3xl overflow-hidden p-8 sm:p-10 md:p-12 shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${category.color}20, ${category.color}05)`,
          borderWidth: '2px',
          borderStyle: 'solid',
          borderColor: `${category.color}30`,
        }}
      >
        {/* Animated Background Pattern */}
        <div
          className="absolute inset-0 opacity-10 animate-pulse"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, ${category.color} 1px, transparent 1px),
                              radial-gradient(circle at 80% 80%, ${category.color} 1px, transparent 1px)`,
            backgroundSize: '30px 30px, 40px 40px',
          }}
        />

        {/* Gradient Orb */}
        <div
          className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: category.color }}
        />

        <div className="relative z-10 flex flex-col items-center text-center gap-6 sm:gap-8">
          {/* Icon - Büyük ve Merkezde - MOBİL RESPONSIVE */}
          <div
            className="p-6 sm:p-7 md:p-8 rounded-3xl shadow-2xl transform hover:scale-110 transition-all duration-300 hover:rotate-6"
            style={{
              backgroundColor: category.color,
              boxShadow: `0 20px 60px -10px ${category.color}50`
            }}
          >
            <IconComponent className="w-16 h-16 sm:w-20 sm:h-20 md:w-16 md:h-16 text-white" />
          </div>

          {/* Content - MOBİL FONT SIZE */}
          <div className="max-w-3xl space-y-4 sm:space-y-5">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent leading-tight px-4 sm:px-0">
              {category.name}
            </h1>

            {category.description && (
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed px-4 sm:px-0">
                {category.description}
              </p>
            )}

            {/* Stats - Kompakt ve Modern - MOBİL STACK */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
              {category.site_count !== undefined && (
                <div
                  className="flex items-center gap-2 sm:gap-2.5 px-5 py-3 sm:px-4 sm:py-2 rounded-full backdrop-blur-sm shadow-lg transform hover:scale-105 transition-transform"
                  style={{
                    backgroundColor: `${category.color}25`,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: `${category.color}40`
                  }}
                >
                  <LucideIcons.ExternalLink className="w-5 h-5 sm:w-4 sm:h-4" style={{ color: category.color }} />
                  <span className="font-bold text-lg sm:text-base" style={{ color: category.color }}>
                    {category.site_count}
                  </span>
                  <span className="text-sm text-muted-foreground">site</span>
                </div>
              )}

              {category.blog_count !== undefined && (
                <div
                  className="flex items-center gap-2 sm:gap-2.5 px-5 py-3 sm:px-4 sm:py-2 rounded-full backdrop-blur-sm shadow-lg transform hover:scale-105 transition-transform"
                  style={{
                    backgroundColor: `${category.color}25`,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: `${category.color}40`
                  }}
                >
                  <LucideIcons.FileText className="w-5 h-5 sm:w-4 sm:h-4" style={{ color: category.color }} />
                  <span className="font-bold text-lg sm:text-base" style={{ color: category.color }}>
                    {category.blog_count}
                  </span>
                  <span className="text-sm text-muted-foreground">blog</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
