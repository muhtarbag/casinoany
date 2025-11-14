import { Suspense, lazy } from 'react';
import { LoadingFallback } from '@/components/admin/LoadingFallback';

const CasinoContentAnalytics = lazy(() => import('@/components/CasinoContentAnalytics').then(m => ({ default: m.CasinoContentAnalytics })));

export default function CasinoAnalytics() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CasinoContentAnalytics />
    </Suspense>
  );
}
