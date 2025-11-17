import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface ComparisonData {
  thisWeek: {
    views: number;
    conversions: number;
  };
  lastWeek: {
    views: number;
    conversions: number;
  };
  changes: {
    views: number;
    conversions: number;
  };
}

interface SiteComparisonCardProps {
  comparison: ComparisonData;
}

export const SiteComparisonCard = ({ comparison }: SiteComparisonCardProps) => {
  const ComparisonRow = ({ 
    label, 
    thisWeek, 
    lastWeek, 
    change 
  }: { 
    label: string; 
    thisWeek: number; 
    lastWeek: number; 
    change: number;
  }) => {
    const isPositive = change > 0;
    const isNegative = change < 0;
    
    return (
      <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
        <div className="space-y-1">
          <p className="text-sm font-medium">{label}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{lastWeek}</span>
            <ArrowRight className="h-3 w-3" />
            <span className="font-bold text-foreground">{thisWeek}</span>
          </div>
        </div>
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${
          isPositive 
            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
            : isNegative 
            ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' 
            : 'bg-muted text-muted-foreground'
        }`}>
          {isPositive && <TrendingUp className="h-4 w-4" />}
          {isNegative && <TrendingDown className="h-4 w-4" />}
          <span className="text-sm font-bold">
            {change > 0 ? '+' : ''}{change.toFixed(1)}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Haftalık Karşılaştırma</CardTitle>
        <CardDescription>
          Bu hafta vs geçen hafta performans karşılaştırması
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          <ComparisonRow 
            label="Görüntülenme"
            thisWeek={comparison.thisWeek.views}
            lastWeek={comparison.lastWeek.views}
            change={comparison.changes.views}
          />
          <ComparisonRow 
            label="Dönüşüm (Tıklama)"
            thisWeek={comparison.thisWeek.conversions}
            lastWeek={comparison.lastWeek.conversions}
            change={comparison.changes.conversions}
          />
        </div>
      </CardContent>
    </Card>
  );
};
