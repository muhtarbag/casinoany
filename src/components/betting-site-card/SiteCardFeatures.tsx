import { Badge } from '@/components/ui/badge';

interface SiteCardFeaturesProps {
  features?: string[];
  siteId?: string;
}

export const SiteCardFeatures = ({ features, siteId }: SiteCardFeaturesProps) => {
  if (!features || features.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-muted-foreground">Özellikler</h4>
      <div className="flex flex-wrap gap-2">
        {features.slice(0, 3).map((feature, idx) => (
          <Badge key={`feature-${siteId}-${feature}-${idx}`} variant="success" className="text-xs">
            {feature}
          </Badge>
        ))}
        {features.length > 3 && (
          <Badge variant="success" className="text-xs">+{features.length - 3} daha</Badge>
        )}
      </div>
    </div>
  );
};
