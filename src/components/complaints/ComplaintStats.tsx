import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const ComplaintStats = () => {
  const { data: stats } = useQuery({
    queryKey: ['complaint-stats'],
    queryFn: async () => {
      const { data: complaints, error } = await supabase
        .from('site_complaints')
        .select('status, created_at, response_count')
        .eq('is_public', true);

      if (error) throw error;

      const total = complaints?.length || 0;
      const resolved = complaints?.filter(c => c.status === 'resolved').length || 0;
      const pending = complaints?.filter(c => c.status === 'open' || c.status === 'in_review').length || 0;
      
      // Son 30 gün
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentComplaints = complaints?.filter(
        c => new Date(c.created_at) >= thirtyDaysAgo
      ).length || 0;

      // Ortalama yanıt süresi (yanıtı olan şikayetler için)
      const complaintsWithResponse = complaints?.filter(c => c.response_count > 0) || [];
      const avgResponseTime = complaintsWithResponse.length > 0 
        ? Math.round(complaintsWithResponse.length / total * 100) 
        : 0;

      return {
        total,
        resolved,
        pending,
        recentComplaints,
        avgResponseTime,
        resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
      };
    },
  });

  const statCards = [
    {
      title: 'Toplam Şikayet',
      value: stats?.total || 0,
      icon: AlertCircle,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Çözülen',
      value: stats?.resolved || 0,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      subtitle: `%${stats?.resolutionRate || 0} çözüm oranı`,
    },
    {
      title: 'Bekleyen',
      value: stats?.pending || 0,
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Son 30 Gün',
      value: stats?.recentComplaints || 0,
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      subtitle: `%${stats?.avgResponseTime || 0} yanıt oranı`,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium leading-tight">
                {stat.title}
              </CardTitle>
              <div className={`p-1.5 md:p-2 rounded-lg ${stat.bgColor} flex-shrink-0`}>
                <Icon className={`h-3 w-3 md:h-4 md:w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
              {stat.subtitle && (
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1 leading-tight">
                  {stat.subtitle}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
