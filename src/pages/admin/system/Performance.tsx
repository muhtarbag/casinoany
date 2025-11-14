import { Suspense, lazy } from 'react';
import { LoadingFallback } from '@/components/admin/LoadingFallback';

const PerformanceDashboard = lazy(() => import('@/components/performance/PerformanceDashboard').then(m => ({ default: m.PerformanceDashboard })));

export default function Performance() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PerformanceDashboard />
    </Suspense>
  );
}
