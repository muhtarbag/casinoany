import { memo } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingStateProps {
  variant?: 'spinner' | 'skeleton' | 'minimal';
  text?: string;
  className?: string;
}

export const LoadingState = memo(({ 
  variant = 'skeleton', 
  text = 'Yükleniyor...',
  className = ''
}: LoadingStateProps) => {
  if (variant === 'minimal') {
    return (
      <div className={`flex items-center justify-center gap-2 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{text}</span>
      </div>
    );
  }

  if (variant === 'spinner') {
    return (
      <div className={`min-h-[400px] flex flex-col items-center justify-center gap-3 ${className}`}>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    );
  }

  // Default: skeleton
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

LoadingState.displayName = 'LoadingState';
