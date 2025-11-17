import { Suspense } from 'react';
import { LoadingState } from '@/components/ui/loading-state';
import { LazyEnhancedReviewManagement } from '@/components/Performance/LazyAdminComponents';

export default function Reviews() {
  return (
    <Suspense fallback={<LoadingState variant="skeleton" rows={8} />}>
      <LazyEnhancedReviewManagement />
    </Suspense>
  );
}
