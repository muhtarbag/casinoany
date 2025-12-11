import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";

interface ProsConsBlockProps {
  pros?: string[];
  cons?: string[];
}

export const ProsConsBlock = ({ pros, cons }: ProsConsBlockProps) => {
  if (!pros?.length && !cons?.length) return null;

  const totalCount = (pros?.length || 0) + (cons?.length || 0);

  return (
    <Accordion type="single" collapsible className="border border-border/50 rounded-lg px-4">
      <AccordionItem value="pros-cons" className="border-none">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">Artılar & Eksiler</span>
            <Badge variant="secondary" className="ml-2">
              {totalCount}
            </Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pros && pros.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Artılar
                </h3>
                <ul className="space-y-2">
                  {pros.map((pro, index) => (
                    <li key={`pro-${pro.slice(0, 20)}-${index}`} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {cons && cons.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  Eksiler
                </h3>
                <ul className="space-y-2">
                  {cons.map((con, index) => (
                    <li key={`con-${con.slice(0, 20)}-${index}`} className="flex items-start gap-2 text-sm">
                      <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
