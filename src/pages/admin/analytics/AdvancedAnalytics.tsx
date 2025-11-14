import { Suspense, lazy } from 'react';
import { LoadingFallback } from '@/components/admin/LoadingFallback';

const AdvancedAnalyticsDashboard = lazy(() => import('@/components/admin/AdvancedAnalyticsDashboard').then(m => ({ default: m.AdvancedAnalyticsDashboard })));

export default function AdvancedAnalytics() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AdvancedAnalyticsDashboard />
    </Suspense>
  );
}
