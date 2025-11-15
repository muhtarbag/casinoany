import { CompactSiteCard } from './CompactSiteCard';

interface CategorySiteGridProps {
  sites: any[];
  categoryName: string;
}

export function CategorySiteGrid({ sites, categoryName }: CategorySiteGridProps) {
  return (
    <section className="mb-16 animate-fade-in">
      {/* Header - Daha belirgin */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {categoryName} Siteleri
        </h2>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <span className="text-xs font-medium text-primary">
            {sites.length} site
          </span>
        </div>
      </div>

      {/* Grid - Optimize edilmiş breakpoint'ler */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {sites.map((site) => (
          <CompactSiteCard key={site.id} site={site} />
        ))}
      </div>
    </section>
  );
}
