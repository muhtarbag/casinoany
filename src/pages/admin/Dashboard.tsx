import { useAdminStats } from '@/hooks/admin/useAdminStats';
import { LoadingState } from '@/components/admin/LoadingState';
import { DashboardTab } from '@/components/admin/DashboardTab';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const { 
    dashboardStats, 
    isLoadingStats, 
    dailyPageViews, 
    deviceStats, 
    topPages,
    weeklyComparison,
    monthlyTrend,
    customMetrics
  } = useAdminStats();

  // ✅ STANDARDIZED: LoadingState component
  if (isLoadingStats) {
    return <LoadingState variant="skeleton" text="Dashboard yükleniyor..." />;
  }

  return (
    <div className="space-y-6">
      {dashboardStats && (
        <DashboardTab 
          dashboardStats={dashboardStats}
          dailyPageViews={dailyPageViews || []}
          deviceStats={deviceStats || []}
          topPages={topPages || []}
          weeklyComparison={weeklyComparison}
          monthlyTrend={monthlyTrend}
          customMetrics={customMetrics}
          onNavigate={(tab) => {
            // Route-based navigation using React Router
            const routeMap: Record<string, string> = {
              'manage': '/admin/sites',
              'blog': '/admin/blog',
              'analytics': '/admin/analytics',
              'yorumlar': '/admin/reviews',
            };
            const route = routeMap[tab] || `/admin/${tab}`;
            navigate(route);
          }}
        />
      )}
    </div>
  );
}
