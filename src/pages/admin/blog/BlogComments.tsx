import { Suspense, lazy } from 'react';
import { LoadingFallback } from '@/components/admin/LoadingFallback';

const BlogCommentManagement = lazy(() => import('@/components/BlogCommentManagement').then(m => ({ default: m.BlogCommentManagement })));

export default function BlogComments() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BlogCommentManagement />
    </Suspense>
  );
}
