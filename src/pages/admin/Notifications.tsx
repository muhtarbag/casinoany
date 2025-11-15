import { Suspense, lazy } from 'react';
import { LoadingFallback } from '@/components/admin/LoadingFallback';

const NotificationManagement = lazy(() => import('@/components/NotificationManagement'));

export default function Notifications() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <NotificationManagement />
    </Suspense>
  );
}
