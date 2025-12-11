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
    <div className="group relative overflow-hidden p-6 rounded-xl border border-warning/30 bg-gradient-to-r from-warning/10 via-warning/5 to-transparent backdrop-blur-sm hover:shadow-xl transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-r from-warning/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative flex items-start gap-4">
        <div className="p-3 rounded-xl bg-warning/20 group-hover:bg-warning/30 transition-colors shrink-0">
          <AlertTriangle className="h-6 w-6 text-warning" />
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <h3 className="font-bold text-lg text-warning">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onAction} 
          className="shrink-0 border-warning/50 text-warning hover:bg-warning/10 hover:border-warning transition-all"
        >
          {actionLabel}
        </Button>
      </div>
    </div>
  );
});

AlertBanner.displayName = 'AlertBanner';
