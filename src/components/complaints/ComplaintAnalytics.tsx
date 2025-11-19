import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export const ComplaintAnalytics = () => {
  const { data: analyticsData } = useQuery({
    queryKey: ['complaint-analytics'],
    queryFn: async () => {
      const { data: complaints, error } = await supabase
        .from('site_complaints')
        .select('category, status, created_at')
        .eq('is_public', true);

      if (error) throw error;

      // Category distribution
      const categoryCount: Record<string, number> = {};
      complaints?.forEach(c => {
        categoryCount[c.category] = (categoryCount[c.category] || 0) + 1;
      });

      const categoryData = Object.entries(categoryCount).map(([name, value]) => ({
        name: getCategoryLabel(name),
        value,
      }));

      // Status distribution
      const statusCount: Record<string, number> = {};
      complaints?.forEach(c => {
        statusCount[c.status] = (statusCount[c.status] || 0) + 1;
      });

      const statusData = Object.entries(statusCount).map(([name, value]) => ({
        name: getStatusLabel(name),
        value,
      }));

      // Trend data (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const trendData = last7Days.map(date => {
        const count = complaints?.filter(c => 
          c.created_at.split('T')[0] === date
        ).length || 0;
        return {
          date: new Date(date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }),
          count,
        };
      });

      return { categoryData, statusData, trendData };
    },
  });

  const COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#6366f1'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6 mb-4 md:mb-6">
      {/* Category Distribution */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-lg">Kategori Dağılımı</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analyticsData?.categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analyticsData?.categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-lg">Durum Dağılımı</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analyticsData?.statusData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Trend Chart (Full Width) */}
      <Card className="lg:col-span-2">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-lg">Son 7 Gün Trend</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={analyticsData?.trendData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    odeme: 'Ödeme',
    bonus: 'Bonus',
    musteri_hizmetleri: 'Müşteri Hizmetleri',
    teknik: 'Teknik',
    guvenlik: 'Güvenlik',
    diger: 'Diğer',
  };
  return labels[category] || category;
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    open: 'Açık',
    in_review: 'İnceleniyor',
    resolved: 'Çözüldü',
    closed: 'Kapalı',
  };
  return labels[status] || status;
};
