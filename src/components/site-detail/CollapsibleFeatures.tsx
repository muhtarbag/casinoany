import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleFeaturesProps {
  features: string[];
}

export const CollapsibleFeatures = ({ features }: CollapsibleFeaturesProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleFeatures = isExpanded ? features : features.slice(0, 5);
  const hasMore = features.length > 5;

  return (
    <div className="mb-6">
      <h3 className="font-semibold mb-3 text-lg">Özellikler</h3>
      <div className="flex flex-wrap gap-2 mb-2">
        {visibleFeatures.map((feature, index) => (
          <Badge 
            key={index} 
            variant="secondary"
            className="transition-all duration-200 hover:scale-105"
          >
            {feature}
          </Badge>
        ))}
      </div>
      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-primary hover:text-primary/80 p-0 h-auto font-medium"
        >
          {isExpanded ? (
            <>
              Daha az göster <ChevronUp className="ml-1 w-4 h-4" />
            </>
          ) : (
            <>
              {features.length - 5} özellik daha <ChevronDown className="ml-1 w-4 h-4" />
            </>
          )}
        </Button>
      )}
    </div>
  );
};
