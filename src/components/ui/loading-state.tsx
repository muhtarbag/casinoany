import { Loader2 } from 'lucide-react';
import { Card } from './card';
import { Skeleton } from './skeleton';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  text?: string;
  variant?: 'spinner' | 'skeleton' | 'pulse';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  rows?: number;
}

export function LoadingState({
  text = 'Yükleniyor...',
  variant = 'spinner',
  className,
  size = 'md',
  rows = 3
}: LoadingStateProps) {
  const sizeStyles = {
    sm: {
      container: 'py-6',
      icon: 'h-6 w-6',
      text: 'text-xs'
    },
    md: {
      container: 'py-12',
      icon: 'h-8 w-8',
      text: 'text-sm'
    },
    lg: {
      container: 'py-16',
      icon: 'h-12 w-12',
      text: 'text-base'
    }
  };

  const styles = sizeStyles[size];

  if (variant === 'skeleton') {
    return (
      <Card className={cn('p-6 space-y-4', className)}>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </Card>
    );
  }

  if (variant === 'pulse') {
    return (
      <Card className={cn('p-6', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-20 bg-muted rounded w-full" />
        </div>
      </Card>
    );
  }

  // spinner variant (default)
  return (
    <Card className={className}>
      <div className={cn('flex flex-col items-center justify-center space-y-4', styles.container)}>
        <Loader2 className={cn(styles.icon, 'animate-spin text-primary')} />
        {text && (
          <p className={cn('text-muted-foreground', styles.text)}>{text}</p>
        )}
      </div>
    </Card>
  );
}
