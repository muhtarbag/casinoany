import { Suspense, lazy } from 'react';
import { LoadingFallback } from '@/components/admin/LoadingFallback';

const RoleManagementComponent = lazy(() => import('@/components/admin/RoleManagement').then(m => ({ default: m.RoleManagement })));

export default function RoleManagement() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RoleManagementComponent />
    </Suspense>
  );
}
