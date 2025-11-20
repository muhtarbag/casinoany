import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Wallet } from "lucide-react";

interface WithdrawalGuideBlockProps {
  withdrawalGuide?: string;
}

export const WithdrawalGuideBlock = ({ withdrawalGuide }: WithdrawalGuideBlockProps) => {
  if (!withdrawalGuide) return null;

  return (
    <Accordion type="single" collapsible className="border border-border/50 rounded-lg px-4">
      <AccordionItem value="withdrawal-guide" className="border-none">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            <span className="text-lg font-semibold">Para Çekme Rehberi</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4">
          <div 
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: withdrawalGuide }}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
