import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LucideIcon, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionableKPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  action?: {
    label: string;
    onClick: () => void;
  };
  insight?: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

export const ActionableKPICard = ({
  title,
  value,
  icon: Icon,
  trend,
  action,
  insight,
  variant = 'default'
}: ActionableKPICardProps) => {
  const variantStyles = {
    default: 'border-border',
    success: 'border-success/30 bg-success/5',
    warning: 'border-warning/30 bg-warning/5',
    destructive: 'border-destructive/30 bg-destructive/5'
  };

  const iconColors = {
    default: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-destructive'
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value === 0) return <Minus className="h-3 w-3" />;
    return trend.isPositive ? 
      <TrendingUp className="h-3 w-3" /> : 
      <TrendingDown className="h-3 w-3" />;
  };

  return (
    <Card className={cn('relative overflow-hidden transition-all hover:shadow-md', variantStyles[variant])}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn('h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center', iconColors[variant])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div className="text-3xl font-bold">{value}</div>
          {trend && (
            <Badge 
              variant={trend.isPositive ? 'default' : 'destructive'}
              className="gap-1 text-xs"
            >
              {getTrendIcon()}
              {Math.abs(trend.value)}%
            </Badge>
          )}
        </div>

        {trend && (
          <p className="text-xs text-muted-foreground">
            {trend.label}
          </p>
        )}

        {insight && (
          <div className="p-2 rounded-md bg-muted/50 border border-border/50">
            <p className="text-xs text-muted-foreground">{insight}</p>
          </div>
        )}

        {action && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={action.onClick}
            className="w-full gap-2 mt-2"
          >
            {action.label}
            <ArrowRight className="h-3 w-3" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
