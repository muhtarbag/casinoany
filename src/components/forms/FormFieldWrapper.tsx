import { ReactNode } from 'react';
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FormFieldWrapperProps {
  label: string;
  required?: boolean;
  helpText?: string;
  description?: string;
  children: ReactNode;
  error?: string;
}

export function FormFieldWrapper({
  label,
  required = false,
  helpText,
  description,
  children,
  error,
}: FormFieldWrapperProps) {
  return (
    <FormItem>
      <div className="flex items-center gap-2">
        <FormLabel className="flex items-center gap-2">
          {label}
          {required ? (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
              Zorunlu
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              Opsiyonel
            </Badge>
          )}
        </FormLabel>
        {helpText && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">{helpText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <FormControl>{children}</FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
}
