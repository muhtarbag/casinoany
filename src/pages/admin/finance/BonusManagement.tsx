import { Suspense, lazy } from 'react';
import { LoadingFallback } from '@/components/admin/LoadingFallback';

const BonusManagementComponent = lazy(() => import('@/components/BonusManagement').then(m => ({ default: m.BonusManagement })));

export default function BonusManagement() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BonusManagementComponent />
    </Suspense>
  );
}
