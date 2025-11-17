import { Suspense } from 'react';
import { LoadingState } from '@/components/ui/loading-state';
import { LazyBlogManagement } from '@/components/Performance/LazyAdminComponents';

export default function BlogManagement() {
  return (
    <Suspense fallback={<LoadingState variant="skeleton" rows={8} />}>
      <LazyBlogManagement />
    </Suspense>
  );
}
