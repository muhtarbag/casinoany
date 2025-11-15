import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './button';
import { Card } from './card';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  children?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = 'md',
  children
}: EmptyStateProps) {
  const sizeStyles = {
    sm: {
      container: 'py-6',
      icon: 'h-8 w-8',
      title: 'text-sm',
      description: 'text-xs'
    },
    md: {
      container: 'py-12',
      icon: 'h-12 w-12',
      title: 'text-lg',
      description: 'text-sm'
    },
    lg: {
      container: 'py-16',
      icon: 'h-16 w-16',
      title: 'text-2xl',
      description: 'text-base'
    }
  };

  const styles = sizeStyles[size];

  return (
    <Card className={cn('border-dashed', className)}>
      <div className={cn('flex flex-col items-center justify-center text-center space-y-4', styles.container)}>
        {Icon && (
          <div className="rounded-full bg-muted p-4">
            <Icon className={cn(styles.icon, 'text-muted-foreground')} />
          </div>
        )}
        <div className="space-y-2 max-w-sm">
          <h3 className={cn('font-semibold', styles.title)}>{title}</h3>
          {description && (
            <p className={cn('text-muted-foreground', styles.description)}>
              {description}
            </p>
          )}
        </div>
        {children}
        {action && (
          <Button
            onClick={action.onClick}
            variant={action.variant || 'default'}
            size={size === 'sm' ? 'sm' : 'default'}
          >
            {action.label}
          </Button>
        )}
      </div>
    </Card>
  );
}
