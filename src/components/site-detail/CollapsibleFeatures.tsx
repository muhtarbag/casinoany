import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

interface CollapsibleFeaturesProps {
  features: string[];
}

export const CollapsibleFeatures = ({ features }: CollapsibleFeaturesProps) => {
  if (!features || features.length === 0) return null;

  return (
    <div className="w-full mb-4 border rounded-lg px-4 py-4 bg-card">
      <div className="flex items-center justify-between w-full mb-4">
        <div className="flex items-center gap-3">
          <Star className="w-5 h-5 text-primary" />
          <span className="font-semibold">Site Özellikleri</span>
        </div>
        <Badge variant="secondary">
          {features.length} özellik
        </Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        {features.map((feature, index) => (
          <Badge 
            key={index} 
            variant="secondary"
            className="transition-all duration-200 hover:scale-105"
          >
            {feature}
          </Badge>
        ))}
      </div>
    </div>
  );
};
