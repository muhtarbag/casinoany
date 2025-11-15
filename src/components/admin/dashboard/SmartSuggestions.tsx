import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, TrendingUp, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

type SuggestionPriority = 'high' | 'medium' | 'low';

interface Suggestion {
  id: string;
  message: string;
  action: () => void;
  actionLabel: string;
  priority: SuggestionPriority;
}

interface SmartSuggestionsProps {
  suggestions: Suggestion[];
}

export const SmartSuggestions = memo(({ suggestions }: SmartSuggestionsProps) => {
  if (suggestions.length === 0) return null;

  const getPriorityConfig = (priority: SuggestionPriority) => {
    switch (priority) {
      case 'high':
        return {
          icon: AlertCircle,
          bgColor: 'bg-destructive/10',
          borderColor: 'border-destructive/30',
          textColor: 'text-destructive',
          iconColor: 'text-destructive'
        };
      case 'medium':
        return {
          icon: TrendingUp,
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/30',
          textColor: 'text-warning',
          iconColor: 'text-warning'
        };
      case 'low':
        return {
          icon: Zap,
          bgColor: 'bg-primary/10',
          borderColor: 'border-primary/30',
          textColor: 'text-primary',
          iconColor: 'text-primary'
        };
    }
  };

  return (
    <div className="space-y-2">
      {suggestions.map((suggestion) => {
        const config = getPriorityConfig(suggestion.priority);
        const Icon = config.icon;

        return (
          <Card
            key={suggestion.id}
            className={cn(
              'border-l-4',
              config.bgColor,
              config.borderColor
            )}
          >
            <CardContent className="flex items-center gap-3 p-4">
              <Icon className={cn('h-5 w-5 shrink-0', config.iconColor)} />
              <p className="flex-1 text-sm">{suggestion.message}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={suggestion.action}
                className="shrink-0"
              >
                {suggestion.actionLabel}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});

SmartSuggestions.displayName = 'SmartSuggestions';
