import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, XCircle, AlertCircle, TrendingUp } from 'lucide-react';

interface BonusStatsProps {
  total: number;
  active: number;
  inactive: number;
  pending?: number;
}

export const BonusStats = ({ total, active, inactive, pending = 0 }: BonusStatsProps) => {
  const activePercentage = total > 0 ? Math.round((active / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Toplam Bonus</p>
              <p className="text-2xl font-bold">{total}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-primary opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Aktif</p>
              <p className="text-2xl font-bold text-green-600">{active}</p>
              <p className="text-xs text-muted-foreground">{activePercentage}%</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-600 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pasif</p>
              <p className="text-2xl font-bold text-red-600">{inactive}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600 opacity-20" />
          </div>
        </CardContent>
      </Card>

      {pending > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bekleyen</p>
                <p className="text-2xl font-bold text-orange-600">{pending}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
