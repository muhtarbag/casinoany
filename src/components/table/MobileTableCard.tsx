import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MobileTableCardProps {
  title: string;
  subtitle?: string;
  status?: {
    label: string;
    variant: 'default' | 'secondary' | 'success' | 'accent' | 'destructive' | 'outline';
  };
  stats?: Array<{
    label: string;
    value: string | number;
    icon?: ReactNode;
  }>;
  actions?: ReactNode;
  children?: ReactNode;
}

export function MobileTableCard({
  title,
  subtitle,
  status,
  stats,
  actions,
  children,
}: MobileTableCardProps) {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-sm truncate">{title}</h3>
            {status && (
              <Badge variant={status.variant} className="text-xs">
                {status.label}
              </Badge>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex gap-1.5 shrink-0">{actions}</div>}
      </div>

      {stats && stats.length > 0 && (
        <div className="flex gap-4 text-xs text-muted-foreground pt-2 border-t">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center gap-1.5">
              {stat.icon}
              <span className="font-medium">{stat.label}:</span>
              <span>{stat.value}</span>
            </div>
          ))}
        </div>
      )}

      {children}
    </Card>
  );
}
