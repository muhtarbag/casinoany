import { Suspense, lazy } from 'react';
import { LoadingFallback } from '@/components/admin/LoadingFallback';

const ContentPlannerComponent = lazy(() => import('@/components/ContentPlanner').then(m => ({ default: m.ContentPlanner })));

export default function ContentPlanner() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ContentPlannerComponent />
    </Suspense>
  );
}
