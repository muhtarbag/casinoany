import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type MetricVariant = 'hero' | 'standard' | 'compact';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  subtitle?: string;
  borderColor?: string;
  iconColor?: string;
  onClick?: () => void;
  variant?: MetricVariant;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const MetricCard = memo(({
  title,
  value,
  icon: Icon,
  subtitle,
  borderColor = 'border-l-primary',
  iconColor = 'text-primary',
  onClick,
  variant = 'standard',
  trend
}: MetricCardProps) => {
  const variantStyles = {
    hero: 'h-40 border-l-8',
    standard: 'h-32 border-l-4',
    compact: 'h-28 border-l-2'
  };

  const valueStyles = {
    hero: 'text-5xl',
    standard: 'text-3xl',
    compact: 'text-2xl'
  };

  const iconStyles = {
    hero: 'h-8 w-8',
    standard: 'h-5 w-5',
    compact: 'h-4 w-4'
  };

  return (
    <Card 
      className={cn(
        variantStyles[variant],
        borderColor,
        'hover:shadow-lg hover:scale-[1.02] transition-all duration-200',
        onClick && 'cursor-pointer',
        variant === 'hero' && 'bg-gradient-to-br from-card to-card/50',
        'overflow-hidden'
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={cn(
          variant === 'hero' ? 'text-base font-semibold' : 'text-sm font-medium'
        )}>
          {title}
        </CardTitle>
        <Icon className={cn(iconStyles[variant], iconColor)} />
      </CardHeader>
      <CardContent className="overflow-hidden">
        <div className={cn(valueStyles[variant], 'font-bold text-primary')}>
          {value}
        </div>
        {trend && (
          <div className={cn(
            'text-sm font-medium mt-1',
            trend.isPositive ? 'text-success' : 'text-destructive'
          )}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}%
          </div>
        )}
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1 break-words overflow-hidden">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
});

MetricCard.displayName = 'MetricCard';
