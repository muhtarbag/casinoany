import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormFieldErrorProps {
  error?: string;
  className?: string;
}

export const FormFieldError = ({ error, className }: FormFieldErrorProps) => {
  if (!error) return null;

  return (
    <div className={cn('flex items-center gap-2 text-sm text-destructive mt-1', className)}>
      <AlertCircle className="h-3 w-3 shrink-0" />
      <span>{error}</span>
    </div>
  );
};
