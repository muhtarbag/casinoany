import { Badge } from '@/components/ui/badge';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronDown, Star } from 'lucide-react';

interface CollapsibleFeaturesProps {
  features: string[];
}

export const CollapsibleFeatures = ({ features }: CollapsibleFeaturesProps) => {
  if (!features || features.length === 0) return null;

  return (
    <Accordion type="single" collapsible className="w-full mb-4">
      <AccordionItem value="features" className="border rounded-lg px-4 bg-card">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center justify-between w-full pr-4">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-primary" />
              <span className="font-semibold">Site Özellikleri</span>
            </div>
            <Badge variant="secondary" className="mr-2">
              {features.length} özellik
            </Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-wrap gap-2 py-4">
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
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
