import { CompactSiteCard } from './CompactSiteCard';

interface CategorySiteGridProps {
  sites: any[];
  categoryName: string;
}

export function CategorySiteGrid({ sites, categoryName }: CategorySiteGridProps) {
  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {categoryName} Siteleri
        </h2>
        <span className="text-sm text-muted-foreground">
          {sites.length} site bulundu
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sites.map((site) => (
          <CompactSiteCard key={site.id} site={site} />
        ))}
      </div>
    </section>
  );
}
