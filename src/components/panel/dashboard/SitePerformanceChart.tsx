import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartDataPoint {
  date: string;
  views: number;
  sessions: number;
  users: number;
}

interface SitePerformanceChartProps {
  data: ChartDataPoint[];
}

export const SitePerformanceChart = ({ data }: SitePerformanceChartProps) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatDate}
          className="text-xs"
        />
        <YAxis className="text-xs" />
        <Tooltip 
          labelFormatter={formatDate}
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="views" 
          stroke="hsl(var(--primary))" 
          strokeWidth={2}
          name="Görüntülenme"
          dot={{ fill: 'hsl(var(--primary))' }}
        />
        <Line 
          type="monotone" 
          dataKey="sessions" 
          stroke="hsl(var(--chart-2))" 
          strokeWidth={2}
          name="Oturum"
          dot={{ fill: 'hsl(var(--chart-2))' }}
        />
        <Line 
          type="monotone" 
          dataKey="users" 
          stroke="hsl(var(--chart-3))" 
          strokeWidth={2}
          name="Kullanıcı"
          dot={{ fill: 'hsl(var(--chart-3))' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
