import * as LucideIcons from 'lucide-react';
import type { Category } from '@/hooks/queries/useCategoryQueries';

interface CategoryHeroProps {
  category: Category & {
    site_count?: number;
    blog_count?: number;
  };
}

export function CategoryHero({ category }: CategoryHeroProps) {
  const IconComponent = (LucideIcons as any)[
    category.icon.charAt(0).toUpperCase() + category.icon.slice(1)
  ] || LucideIcons.Folder;

  return (
    <div className="mb-12">
      <div
        className="relative rounded-2xl overflow-hidden p-8 md:p-12"
        style={{
          background: `linear-gradient(135deg, ${category.color}15, ${category.color}05)`,
          borderColor: `${category.color}30`,
        }}
      >
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle, ${category.color} 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Icon */}
          <div
            className="flex-shrink-0 p-6 rounded-2xl shadow-lg"
            style={{ backgroundColor: category.color }}
          >
            <IconComponent className="w-12 h-12 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-lg text-muted-foreground mb-4 max-w-3xl">
                {category.description}
              </p>
            )}

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {category.site_count !== undefined && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/50 backdrop-blur">
                  <LucideIcons.ExternalLink className="w-4 h-4" style={{ color: category.color }} />
                  <span className="font-medium">{category.site_count} Site</span>
                </div>
              )}
              {category.blog_count !== undefined && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/50 backdrop-blur">
                  <LucideIcons.FileText className="w-4 h-4" style={{ color: category.color }} />
                  <span className="font-medium">{category.blog_count} Blog Yazısı</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
