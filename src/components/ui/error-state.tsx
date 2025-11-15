import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { Card } from './card';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ErrorState({
  title = 'Bir Hata Oluştu',
  message = 'Veriler yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.',
  onRetry,
  retrying = false,
  className,
  size = 'md'
}: ErrorStateProps) {
  const sizeStyles = {
    sm: {
      container: 'py-6',
      icon: 'h-8 w-8',
      title: 'text-sm',
      message: 'text-xs'
    },
    md: {
      container: 'py-12',
      icon: 'h-12 w-12',
      title: 'text-lg',
      message: 'text-sm'
    },
    lg: {
      container: 'py-16',
      icon: 'h-16 w-16',
      title: 'text-2xl',
      message: 'text-base'
    }
  };

  const styles = sizeStyles[size];

  return (
    <Card className={cn('border-destructive/50 bg-destructive/5', className)}>
      <div className={cn('flex flex-col items-center justify-center text-center space-y-4', styles.container)}>
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertCircle className={cn(styles.icon, 'text-destructive')} />
        </div>
        <div className="space-y-2 max-w-sm">
          <h3 className={cn('font-semibold text-destructive', styles.title)}>
            {title}
          </h3>
          <p className={cn('text-muted-foreground', styles.message)}>
            {message}
          </p>
        </div>
        {onRetry && (
          <Button
            onClick={onRetry}
            disabled={retrying}
            variant="outline"
            size={size === 'sm' ? 'sm' : 'default'}
            className="gap-2"
          >
            <RefreshCw className={cn('h-4 w-4', retrying && 'animate-spin')} />
            {retrying ? 'Yeniden Deneniyor...' : 'Tekrar Dene'}
          </Button>
        )}
      </div>
    </Card>
  );
}
