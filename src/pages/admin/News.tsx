import { Suspense } from 'react';
import { LoadingState } from '@/components/ui/loading-state';
import { LazyNewsManagement } from '@/components/Performance/LazyAdminComponents';

export default function News() {
  return (
    <Suspense fallback={<LoadingState variant="skeleton" rows={8} />}>
      <LazyNewsManagement />
    </Suspense>
  );
}
