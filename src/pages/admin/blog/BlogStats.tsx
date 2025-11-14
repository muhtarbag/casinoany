import { Suspense, lazy } from 'react';
import { LoadingFallback } from '@/components/admin/LoadingFallback';

const BlogStatsComponent = lazy(() => import('@/components/BlogStats'));

export default function BlogStats() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BlogStatsComponent />
    </Suspense>
  );
}
