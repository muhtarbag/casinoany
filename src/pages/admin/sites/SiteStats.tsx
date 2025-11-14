import { Suspense, lazy } from 'react';
import { LoadingFallback } from '@/components/admin/LoadingFallback';

const SiteStatsComponent = lazy(() => import('@/components/SiteStats'));

export default function SiteStats() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SiteStatsComponent />
    </Suspense>
  );
}
