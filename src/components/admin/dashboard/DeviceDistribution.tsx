import { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

interface DeviceDistributionProps {
  data: Array<{ name: string; value: number }>;
}

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

export const DeviceDistribution = memo(({ data }: DeviceDistributionProps) => {
  // Memoize chart config
  const chartConfig = useMemo(() => ({
    cx: '50%',
    cy: '50%',
    labelLine: false,
    outerRadius: 100,
  }), []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cihaz Dağılımı</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              {...chartConfig}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

DeviceDistribution.displayName = 'DeviceDistribution';
