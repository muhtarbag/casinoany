import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EnhancedEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'centered';
}

export function EnhancedEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default',
}: EnhancedEmptyStateProps) {
  const content = (
    <div className="text-center animate-fade-in">
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );

  if (variant === 'centered') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        {content}
      </div>
    );
  }

  return (
    <Card className="p-12">
      {content}
    </Card>
  );
}
