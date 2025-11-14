import { Suspense, lazy } from 'react';
import { LoadingFallback } from '@/components/admin/LoadingFallback';

const AffiliateManagementComponent = lazy(() => import('@/components/AffiliateManagement').then(m => ({ default: m.AffiliateManagement })));

export default function AffiliateManagement() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AffiliateManagementComponent />
    </Suspense>
  );
}
