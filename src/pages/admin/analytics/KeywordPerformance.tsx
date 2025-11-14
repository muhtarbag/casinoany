import { Suspense, lazy } from 'react';
import { LoadingFallback } from '@/components/admin/LoadingFallback';

const KeywordPerformanceComponent = lazy(() => import('@/components/KeywordPerformance').then(m => ({ default: m.KeywordPerformance })));

export default function KeywordPerformance() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <KeywordPerformanceComponent />
    </Suspense>
  );
}
