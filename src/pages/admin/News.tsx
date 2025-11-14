import { Suspense, lazy } from 'react';
import { LoadingFallback } from '@/components/admin/LoadingFallback';

const NewsManagement = lazy(() => import('@/components/NewsManagement').then(m => ({ default: m.NewsManagement })));

export default function News() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <NewsManagement />
    </Suspense>
  );
}
