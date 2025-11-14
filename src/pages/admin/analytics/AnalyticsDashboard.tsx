import { Suspense, lazy } from 'react';
import { LoadingFallback } from '@/components/admin/LoadingFallback';

const AnalyticsDashboardComponent = lazy(() => import('@/components/AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard })));

export default function AnalyticsDashboard() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AnalyticsDashboardComponent />
    </Suspense>
  );
}
