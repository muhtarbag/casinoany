import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Wallet } from "lucide-react";
import DOMPurify from 'dompurify';

interface WithdrawalGuideBlockProps {
  withdrawalGuide?: string;
}

export const WithdrawalGuideBlock = ({ withdrawalGuide }: WithdrawalGuideBlockProps) => {
  if (!withdrawalGuide) return null;

  // 🛡️ XSS Protection: Sanitize HTML content
  const sanitizedGuide = DOMPurify.sanitize(withdrawalGuide, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'blockquote'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
  });

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
            dangerouslySetInnerHTML={{ __html: sanitizedGuide }}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
