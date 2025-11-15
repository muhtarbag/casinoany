import { memo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AlertBannerProps {
  count: number;
  threshold: number;
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
}

export const AlertBanner = memo(({ 
  count, 
  threshold, 
  title, 
  message, 
  actionLabel, 
  onAction 
}: AlertBannerProps) => {
  if (count <= threshold) return null;

  return (
    <div className="p-4 rounded-lg border border-warning bg-warning/10 flex items-start gap-3">
      <AlertTriangle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-warning">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{message}</p>
      </div>
      <Button size="sm" variant="outline" onClick={onAction} className="shrink-0">
        {actionLabel}
      </Button>
    </div>
  );
});

AlertBanner.displayName = 'AlertBanner';
