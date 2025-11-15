import { useAdminStats } from '@/hooks/admin/useAdminStats';
import { Loader2 } from 'lucide-react';
import { DashboardTab } from '@/components/admin/DashboardTab';

export default function Dashboard() {
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

  if (isLoadingStats) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
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
            // Route-based navigation
            const routeMap: Record<string, string> = {
              'manage': '/admin/sites',
              'blog': '/admin/blog',
              'analytics': '/admin/analytics',
            };
            const route = routeMap[tab] || `/admin/${tab}`;
            window.location.href = route;
          }}
        />
      )}
    </div>
  );
}
