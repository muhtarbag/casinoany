import { useState } from 'react';
import { subDays } from 'date-fns';
import { useAdminAnalytics } from '@/hooks/queries/useAdminAnalytics';
import { useSiteAnalytics } from '@/hooks/queries/useAnalyticsQueries';
import { AnalyticsSummaryCards } from './AnalyticsSummaryCards';
import { AnalyticsCharts } from './AnalyticsCharts';
import { AnalyticsTable } from './AnalyticsTable';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

export const AdminAnalyticsDashboard = () => {
  const [days, setDays] = useState(30);
  
  const endDate = new Date();
  const startDate = subDays(endDate, days);

  const { data: aggregateAnalytics, isLoading: isLoadingAggregate } = useAdminAnalytics(days);
  const { data: siteAnalytics, isLoading: isLoadingSites } = useSiteAnalytics({
    start: startDate,
    end: endDate,
  });

  const isLoading = isLoadingAggregate || isLoadingSites;

  const dateRangeOptions = [
    { label: 'Son 7 Gün', value: 7 },
    { label: 'Son 30 Gün', value: 30 },
    { label: 'Son 90 Gün', value: 90 },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <LoadingSpinner size="lg" text="Analitik veriler yükleniyor..." />
        </CardContent>
      </Card>
    );
  }

  if (!aggregateAnalytics || !siteAnalytics) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Analitik veriler yüklenemedi
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analitik Dashboard</h2>
          <p className="text-muted-foreground">
            Detaylı performans metrikleri ve analizler
          </p>
        </div>
        <div className="flex gap-2">
          {dateRangeOptions.map((option) => (
            <Button
              key={option.value}
              variant={days === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDays(option.value)}
            >
              <Calendar className="w-4 h-4 mr-2" />
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <AnalyticsSummaryCards analytics={aggregateAnalytics} />

      {/* Additional Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Aktif Site Sayısı</div>
            <div className="text-2xl font-bold text-primary mt-1">
              {aggregateAnalytics.activeSiteCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Ortalama Gelir/Tıklama</div>
            <div className="text-2xl font-bold text-primary mt-1">
              {new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: 'TRY',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(aggregateAnalytics.revenuePerClick)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Dönüşüm Oranı</div>
            <div className="text-2xl font-bold text-primary mt-1">
              {aggregateAnalytics.conversionRate.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <AnalyticsCharts siteAnalytics={siteAnalytics} />

      {/* Detailed Table */}
      <AnalyticsTable siteAnalytics={siteAnalytics} />
    </div>
  );
};
