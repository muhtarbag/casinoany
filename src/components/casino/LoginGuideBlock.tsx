import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LogIn } from "lucide-react";

interface LoginGuideBlockProps {
  loginGuide?: string;
}

export const LoginGuideBlock = ({ loginGuide }: LoginGuideBlockProps) => {
  if (!loginGuide) return null;

  return (
    <Accordion type="single" collapsible className="border border-border/50 rounded-lg px-4">
      <AccordionItem value="login-guide" className="border-none">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-2">
            <LogIn className="w-5 h-5" />
            <span className="text-lg font-semibold">Giriş Rehberi</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4">
          <div 
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: loginGuide }}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
