import { useAdminStats } from '@/hooks/admin/useAdminStats';
import { LoadingState } from '@/components/ui/loading-state';
import { DashboardTab } from '@/components/admin/DashboardTab';
import { useNavigate } from 'react-router-dom';
import { ErrorState } from '@/components/ui/error-state';
import { RetryBoundary } from '@/components/feedback/RetryBoundary';

export default function Dashboard() {
  const navigate = useNavigate();
  const { 
    dashboardStats, 
    isLoadingStats
  } = useAdminStats();

  // Loading state
  if (isLoadingStats) {
    return <LoadingState variant="skeleton" text="Dashboard yükleniyor..." />;
  }

  return (
    <RetryBoundary>
      <div className="space-y-6">
        {dashboardStats && (
          <DashboardTab 
            dashboardStats={dashboardStats}
            onNavigate={(tab) => {
              const routeMap: Record<string, string> = {
                'manage': '/admin/sites',
                'blog': '/admin/blog',
                'yorumlar': '/admin/reviews',
              };
              const route = routeMap[tab] || `/admin/${tab}`;
              navigate(route);
            }}
          />
        )}
      </div>
    </RetryBoundary>
  );
}
