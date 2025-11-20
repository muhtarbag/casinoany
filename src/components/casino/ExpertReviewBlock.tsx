import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileText } from "lucide-react";

interface ExpertReviewBlockProps {
  expertReview?: string;
}

export const ExpertReviewBlock = ({ expertReview }: ExpertReviewBlockProps) => {
  if (!expertReview) return null;

  return (
    <Accordion type="single" collapsible className="border border-border/50 rounded-lg px-4">
      <AccordionItem value="expert-review" className="border-none">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <span className="text-lg font-semibold">Detaylı İnceleme</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4">
          <div 
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: expertReview }}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
