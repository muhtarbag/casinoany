import { PerformanceDashboard } from '@/components/performance/PerformanceDashboard';
import { PageSpeedMonitor } from '@/components/admin/PageSpeedMonitor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Performance() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Performance Monitoring</h1>
        <p className="text-muted-foreground">
          Monitor your site's performance metrics and PageSpeed scores
        </p>
      </div>

      <Tabs defaultValue="vitals" className="space-y-6">
        <TabsList>
          <TabsTrigger value="vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="pagespeed">PageSpeed Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="vitals" className="space-y-6">
          <PerformanceDashboard />
        </TabsContent>

        <TabsContent value="pagespeed" className="space-y-6">
          <PageSpeedMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
}
