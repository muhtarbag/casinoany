import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Star,
  Eye,
  MousePointerClick,
  TrendingUp,
  Users,
  AlertCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

interface ActivityFeedProps {
  siteId: string;
  limit?: number;
}

export function ActivityFeed({ siteId, limit = 20 }: ActivityFeedProps) {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['site-activity-feed', siteId],
    queryFn: async () => {
      // Fetch recent complaints
      const { data: complaints } = await supabase
        .from('site_complaints')
        .select('id, title, status, created_at')
        .eq('site_id', siteId)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recent reviews
      const { data: reviews } = await supabase
        .from('site_reviews')
        .select('id, rating, comment, created_at')
        .eq('site_id', siteId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(5);

      // Combine and sort activities
      const allActivities = [
        ...(complaints || []).map((c) => ({
          id: c.id,
          type: 'complaint',
          title: `Yeni şikayet: ${c.title}`,
          status: c.status,
          created_at: c.created_at,
        })),
        ...(reviews || []).map((r) => ({
          id: r.id,
          type: 'review',
          title: `Yeni değerlendirme (${r.rating} yıldız)`,
          comment: r.comment,
          created_at: r.created_at,
        })),
      ];

      return allActivities
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit);
    },
    refetchInterval: 30000,
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'complaint':
        return <MessageSquare className="h-4 w-4 text-orange-500" />;
      case 'review':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'view':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'click':
        return <MousePointerClick className="h-4 w-4 text-green-500" />;
      default:
        return <TrendingUp className="h-4 w-4 text-primary" />;
    }
  };

  const getActivityBadge = (activity: any) => {
    if (activity.type === 'complaint') {
      const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
        pending: 'destructive',
        in_progress: 'secondary',
        resolved: 'outline',
      };
      const labels: Record<string, string> = {
        pending: 'Beklemede',
        in_progress: 'İnceleniyor',
        resolved: 'Çözüldü',
      };
      return (
        <Badge variant={variants[activity.status] || 'default'} className="text-xs">
          {labels[activity.status] || activity.status}
        </Badge>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Aktivite Akışı
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-5 w-5" />
          Aktivite Akışı
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">Henüz aktivite yok</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {activities.map((activity: any) => (
                <div key={`${activity.type}-${activity.id}`} className="flex gap-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{activity.title}</p>
                      {getActivityBadge(activity)}
                    </div>
                    {activity.comment && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {activity.comment}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(activity.created_at), {
                        addSuffix: true,
                        locale: tr,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
