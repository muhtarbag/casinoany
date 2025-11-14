import { Suspense, lazy } from 'react';
import { LoadingFallback } from '@/components/admin/LoadingFallback';

const RealtimeAnalyticsDashboard = lazy(() => import('@/components/RealtimeAnalyticsDashboard').then(m => ({ default: m.RealtimeAnalyticsDashboard })));

export default function RealtimeAnalytics() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RealtimeAnalyticsDashboard />
    </Suspense>
  );
}
