import { Suspense, lazy } from 'react';
import { LoadingFallback } from '@/components/admin/LoadingFallback';

const AnalysisHistory = lazy(() => import('@/components/AnalysisHistory').then(m => ({ default: m.AnalysisHistory })));

export default function AIHistory() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AnalysisHistory />
    </Suspense>
  );
}
