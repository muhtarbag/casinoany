import { Suspense, lazy } from 'react';
import { LoadingFallback } from '@/components/admin/LoadingFallback';

const BlogManagementComponent = lazy(() => import('@/components/BlogManagement').then(m => ({ default: m.BlogManagement })));

export default function BlogManagement() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BlogManagementComponent />
    </Suspense>
  );
}
