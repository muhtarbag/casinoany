import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  subtitle?: string;
  borderColor?: string;
  iconColor?: string;
  onClick?: () => void;
}

export const MetricCard = memo(({
  title,
  value,
  icon: Icon,
  subtitle,
  borderColor = 'border-l-primary',
  iconColor = 'text-primary',
  onClick
}: MetricCardProps) => {
  return (
    <Card 
      className={`border-l-4 ${borderColor} hover:shadow-lg transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-primary">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
});

MetricCard.displayName = 'MetricCard';
