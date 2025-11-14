import { Suspense, lazy } from 'react';
import { LoadingFallback } from '@/components/admin/LoadingFallback';

const SiteManagementContainer = lazy(() => import('@/features/sites/SiteManagementContainer').then(m => ({ default: m.SiteManagementContainer })));

export default function SiteManagement() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SiteManagementContainer />
    </Suspense>
  );
}
