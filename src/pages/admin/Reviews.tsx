import { Suspense, lazy } from 'react';
import { LoadingFallback } from '@/components/admin/LoadingFallback';

const EnhancedReviewManagement = lazy(() => import('@/components/EnhancedReviewManagement'));

export default function Reviews() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EnhancedReviewManagement />
    </Suspense>
  );
}
