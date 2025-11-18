import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, MousePointerClick, TrendingUp, DollarSign, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { AggregateAnalytics } from '@/hooks/queries/useAdminAnalytics';
import { cn } from '@/lib/utils';

interface AnalyticsSummaryCardsProps {
  analytics: AggregateAnalytics;
}

export const AnalyticsSummaryCards = ({ analytics }: AnalyticsSummaryCardsProps) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const TrendIndicator = ({ value }: { value: number }) => {
    if (value > 0) {
      return (
        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
          <ArrowUp className="w-4 h-4" />
          <span className="text-sm font-medium">{value.toFixed(1)}%</span>
        </div>
      );
    } else if (value < 0) {
      return (
        <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
          <ArrowDown className="w-4 h-4" />
          <span className="text-sm font-medium">{Math.abs(value).toFixed(1)}%</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <Minus className="w-4 h-4" />
        <span className="text-sm font-medium">0%</span>
      </div>
    );
  };

  const cards = [
    {
      title: 'Toplam Görüntülenme',
      value: formatNumber(analytics.totalViews),
      icon: Eye,
      trend: analytics.trends.viewsTrend,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      title: 'Toplam Tıklama',
      value: formatNumber(analytics.totalClicks),
      icon: MousePointerClick,
      trend: analytics.trends.clicksTrend,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
    },
    {
      title: 'Ortalama CTR',
      value: `${analytics.averageCTR.toFixed(2)}%`,
      icon: TrendingUp,
      trend: analytics.trends.ctrTrend,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    },
    {
      title: 'Toplam Gelir',
      value: formatCurrency(analytics.totalRevenue),
      icon: DollarSign,
      trend: analytics.trends.revenueTrend,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={cn('p-2 rounded-lg', card.bgColor)}>
              <card.icon className={cn('w-5 h-5', card.color)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className={cn('text-3xl font-bold', card.color)}>
                  {card.value}
                </div>
                <div className="mt-2">
                  <TrendIndicator value={card.trend} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
