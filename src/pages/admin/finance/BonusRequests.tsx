import { Suspense, lazy } from 'react';
import { LoadingFallback } from '@/components/admin/LoadingFallback';

const BonusRequestsManagement = lazy(() => import('@/components/BonusRequestsManagement').then(m => ({ default: m.BonusRequestsManagement })));

export default function BonusRequests() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BonusRequestsManagement />
    </Suspense>
  );
}
