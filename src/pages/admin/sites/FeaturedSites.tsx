import { Suspense, lazy } from 'react';
import { LoadingFallback } from '@/components/admin/LoadingFallback';

const FeaturedSitesManagement = lazy(() => import('@/components/FeaturedSitesManagement').then(m => ({ default: m.FeaturedSitesManagement })));

export default function FeaturedSites() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <FeaturedSitesManagement />
    </Suspense>
  );
}
