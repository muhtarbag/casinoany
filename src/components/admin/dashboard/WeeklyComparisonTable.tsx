import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface WeeklyComparisonData {
  name: string;
  current: number;
  previous: number;
  change: number;
  trend: 'up' | 'down';
}

interface WeeklyComparisonTableProps {
  data: WeeklyComparisonData[];
}

export const WeeklyComparisonTable = memo(({ data }: WeeklyComparisonTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Haftalık Karşılaştırma</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  Bu hafta: {item.current} | Geçen hafta: {item.previous}
                </p>
              </div>
              <div className={`flex items-center gap-1 ${item.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                {item.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="font-bold">{(item.change != null && !isNaN(item.change) ? Math.abs(item.change).toFixed(1) : '0')}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

WeeklyComparisonTable.displayName = 'WeeklyComparisonTable';
