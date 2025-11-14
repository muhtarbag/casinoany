import { Suspense, lazy } from 'react';
import { LoadingFallback } from '@/components/admin/LoadingFallback';

const NotificationManagement = lazy(() => import('@/components/NotificationManagement').then(m => ({ default: m.NotificationManagement })));

export default function Notifications() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <NotificationManagement />
    </Suspense>
  );
}
