import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

interface QuickActionsBarProps {
  actions: QuickAction[];
  title?: string;
}

export const QuickActionsBar = memo(({ actions, title = '⚡ Hızlı İşlemler' }: QuickActionsBarProps) => {
  return (
    <Card className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground/80">{title}</h3>
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                onClick={action.onClick}
                size="sm"
                variant={action.variant === 'primary' ? 'default' : 'outline'}
                className={cn(
                  'gap-2 hover:scale-105 transition-transform',
                  action.variant === 'success' && 'border-success text-success hover:bg-success/10',
                  action.variant === 'warning' && 'border-warning text-warning hover:bg-warning/10'
                )}
              >
                <Icon className="w-4 h-4" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </div>
    </Card>
  );
});

QuickActionsBar.displayName = 'QuickActionsBar';
