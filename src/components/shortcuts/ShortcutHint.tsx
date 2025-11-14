import { Badge } from '@/components/ui/badge';
import { getShortcutText } from '@/hooks/useKeyboardShortcuts';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ShortcutHintProps {
  shortcut: {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
  };
  description?: string;
  className?: string;
}

export function ShortcutHint({ shortcut, description, className }: ShortcutHintProps) {
  const text = getShortcutText(shortcut as any);

  if (description) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={`font-mono text-[10px] ${className}`}>
              {text}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Badge variant="outline" className={`font-mono text-[10px] ${className}`}>
      {text}
    </Badge>
  );
}
