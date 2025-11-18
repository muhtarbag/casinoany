import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SiteAnalytics } from '@/hooks/queries/useAnalyticsQueries';

interface AnalyticsChartsProps {
  siteAnalytics: SiteAnalytics[];
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export const AnalyticsCharts = ({ siteAnalytics }: AnalyticsChartsProps) => {
  // Top 10 clicked sites
  const topClickedSites = [...siteAnalytics]
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10)
    .map(site => ({
      name: site.site_name.length > 15 ? site.site_name.substring(0, 15) + '...' : site.site_name,
      clicks: site.clicks,
    }));

  // Top 10 viewed sites
  const topViewedSites = [...siteAnalytics]
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)
    .map(site => ({
      name: site.site_name.length > 15 ? site.site_name.substring(0, 15) + '...' : site.site_name,
      views: site.views,
    }));

  // Click distribution (Top 5)
  const clickDistribution = [...siteAnalytics]
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5)
    .map(site => ({
      name: site.site_name,
      value: site.clicks,
    }));

  // CTR Analysis (Top 10)
  const ctrAnalysis = [...siteAnalytics]
    .sort((a, b) => b.ctr - a.ctr)
    .slice(0, 10)
    .map(site => ({
      name: site.site_name.length > 15 ? site.site_name.substring(0, 15) + '...' : site.site_name,
      ctr: parseFloat(site.ctr.toFixed(2)),
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Clicked Sites */}
      <Card>
        <CardHeader>
          <CardTitle>En Çok Tıklanan Siteler</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topClickedSites}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                className="text-xs"
              />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
              <Bar dataKey="clicks" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Viewed Sites */}
      <Card>
        <CardHeader>
          <CardTitle>En Çok Görüntülenen Siteler</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topViewedSites}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                className="text-xs"
              />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
              <Bar dataKey="views" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Click Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Tıklama Dağılımı (Top 5)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={clickDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="hsl(var(--chart-1))"
                dataKey="value"
              >
                {clickDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* CTR Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Tıklama Oranı (CTR) Analizi</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ctrAnalysis}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                className="text-xs"
              />
              <YAxis className="text-xs" label={{ value: 'CTR %', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
                formatter={(value: number) => `${value.toFixed(2)}%`}
              />
              <Bar dataKey="ctr" fill="hsl(var(--chart-3))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
