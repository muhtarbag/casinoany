import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQBlockProps {
  faq?: FAQ[];
}

export const FAQBlock = ({ faq }: FAQBlockProps) => {
  if (!faq || faq.length === 0) return null;

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <HelpCircle className="w-5 h-5" />
          Sıkça Sorulan Sorular
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faq.map((item, index) => (
            <AccordionItem key={`faq-${item.question.slice(0, 20)}-${index}`} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {item.question}
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">{item.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};
