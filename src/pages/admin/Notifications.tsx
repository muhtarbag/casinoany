import { Suspense } from 'react';
import { LoadingState } from '@/components/ui/loading-state';
import { LazyNotificationManagement } from '@/components/Performance/LazyAdminComponents';

export default function Notifications() {
  return (
    <Suspense fallback={<LoadingState variant="skeleton" rows={8} />}>
      <LazyNotificationManagement />
    </Suspense>
  );
}
