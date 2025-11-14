import { useMemo } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDashboardWidgets, Widget } from '@/hooks/useDashboardWidgets';
import { useAdminStats } from '@/hooks/admin/useAdminStats';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GripVertical, Plus, ExternalLink, History, TrendingUp, Activity, DollarSign, Percent, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatDistanceToNow, subDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface SortableWidgetProps {
  widget: Widget;
  children: React.ReactNode;
}

function SortableWidget({ widget, children }: SortableWidgetProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: widget.id 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={cn(
      'relative group',
      widget.size === 'small' && 'col-span-1',
      widget.size === 'medium' && 'col-span-2',
      widget.size === 'large' && 'col-span-4',
    )}>
      <div
        {...attributes}
        {...listeners}
        className="absolute -top-2 -right-2 z-10 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <div className="bg-primary text-primary-foreground p-1 rounded-md shadow-lg">
          <GripVertical className="w-4 h-4" />
        </div>
      </div>
      {children}
    </div>
  );
}

interface DashboardWidgetGridProps {
  onNavigate?: (tab: string) => void;
}

export function DashboardWidgetGrid({ onNavigate }: DashboardWidgetGridProps) {
  const { dashboardStats, isLoadingStats } = useAdminStats();
  const { widgets, reorderWidgets } = useDashboardWidgets();

  const { data: recentChanges } = useQuery({
    queryKey: ['recent-changes-widget'],
    queryFn: async () => {
      const { data } = await supabase
        .from('change_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const { data: revenueData } = useQuery({
    queryKey: ['revenue-widget'],
    queryFn: async () => {
      const { data } = await supabase
        .from('affiliate_metrics')
        .select('estimated_revenue');
      const total = data?.reduce((sum, item) => sum + (item.estimated_revenue || 0), 0) || 0;
      
      // Calculate previous period revenue for trend
      const thirtyDaysAgo = subDays(new Date(), 30);
      const { data: previousData } = await supabase
        .from('affiliate_metrics')
        .select('estimated_revenue')
        .lt('created_at', thirtyDaysAgo.toISOString());
      const previousTotal = previousData?.reduce((sum, item) => sum + (item.estimated_revenue || 0), 0) || 0;
      
      return { total, previousTotal, trend: previousTotal > 0 ? ((total - previousTotal) / previousTotal) * 100 : 0 };
    },
  });

  const { data: conversionData } = useQuery({
    queryKey: ['conversion-widget'],
    queryFn: async () => {
      const [conversions, pageViews] = await Promise.all([
        supabase.from('conversions').select('id', { count: 'exact', head: true }),
        supabase.from('page_views').select('id', { count: 'exact', head: true }),
      ]);
      
      const conversionCount = conversions.count || 0;
      const viewCount = pageViews.count || 1;
      const rate = (conversionCount / viewCount) * 100;
      
      // Calculate previous period for trend
      const thirtyDaysAgo = subDays(new Date(), 30);
      const [prevConversions, prevPageViews] = await Promise.all([
        supabase.from('conversions').select('id', { count: 'exact', head: true }).lt('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('page_views').select('id', { count: 'exact', head: true }).lt('created_at', thirtyDaysAgo.toISOString()),
      ]);
      
      const prevConversionCount = prevConversions.count || 0;
      const prevViewCount = prevPageViews.count || 1;
      const prevRate = (prevConversionCount / prevViewCount) * 100;
      const trend = prevRate > 0 ? ((rate - prevRate) / prevRate) * 100 : 0;
      
      return { rate, trend };
    },
  });

  const { data: trendData } = useQuery({
    queryKey: ['trend-widget'],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30);
      const sixtyDaysAgo = subDays(new Date(), 60);
      
      const [currentPeriod, previousPeriod] = await Promise.all([
        supabase.from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', sixtyDaysAgo.toISOString()).lt('created_at', thirtyDaysAgo.toISOString()),
      ]);
      
      const current = currentPeriod.count || 0;
      const previous = previousPeriod.count || 1;
      const trend = ((current - previous) / previous) * 100;
      
      return { current, previous, trend };
    },
  });

  const sensors = useSensors(useSensor(PointerSensor));

  const visibleWidgets = useMemo(() => 
    widgets.filter(w => w.visible),
    [widgets]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = visibleWidgets.findIndex(w => w.id === active.id);
      const newIndex = visibleWidgets.findIndex(w => w.id === over.id);
      const items = [...visibleWidgets];
      const [removed] = items.splice(oldIndex, 1);
      items.splice(newIndex, 0, removed);
      reorderWidgets(items);
    }
  };

  const renderWidget = (widget: Widget) => {
    switch (widget.type) {
      case 'stats':
        let value: string | number = 0;
        let icon = Activity;
        let trend: number | null = null;
        let subtitle = 'Güncel';
        
        if (widget.id === 'sites-count') {
          value = dashboardStats?.totalSites || 0;
          icon = Activity;
        } else if (widget.id === 'active-sites') {
          value = dashboardStats?.activeSites || 0;
          icon = TrendingUp;
        } else if (widget.id === 'total-views') {
          value = dashboardStats?.totalViews || 0;
          icon = Activity;
        } else if (widget.id === 'total-clicks') {
          value = dashboardStats?.totalClicks || 0;
          icon = Activity;
        } else if (widget.id === 'total-revenue') {
          value = `₺${(revenueData?.total || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          icon = DollarSign;
          trend = revenueData?.trend || null;
          subtitle = 'Toplam tahsil';
        } else if (widget.id === 'conversion-rate') {
          value = `${(conversionData?.rate || 0).toFixed(2)}%`;
          icon = Percent;
          trend = conversionData?.trend || null;
          subtitle = 'Dönüşüm başarısı';
        } else if (widget.id === 'trend-analysis') {
          value = (trendData?.current || 0).toLocaleString();
          icon = TrendingUp;
          trend = trendData?.trend || null;
          subtitle = 'Son 30 gün';
        }

        const Icon = icon;
        const isPositiveTrend = trend !== null && trend > 0;
        const TrendIcon = isPositiveTrend ? ArrowUpRight : ArrowDownRight;
        
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-muted-foreground">
                  {isLoadingStats ? 'Yükleniyor...' : subtitle}
                </p>
                {trend !== null && trend !== 0 && (
                  <div className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    isPositiveTrend ? "text-green-600" : "text-red-600"
                  )}>
                    <TrendIcon className="h-3 w-3" />
                    {Math.abs(trend).toFixed(1)}%
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'recent-activity':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-4 h-4" />
                {widget.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentChanges?.slice(0, 5).map((change: any) => {
                  const metadata = change.metadata as any;
                  return (
                    <div key={change.id} className="flex items-start gap-2 text-sm border-l-2 border-primary/20 pl-3 py-1">
                      <div className="flex-1">
                        <p className="font-medium">{change.table_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {metadata?.description || change.action_type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(change.created_at), {
                            addSuffix: true,
                            locale: tr,
                          })}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {change.action_type}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );

      case 'quick-action':
        const actions = [
          { label: 'Yeni Site Ekle', tab: 'manage', icon: Plus },
          { label: 'Analitikleri Gör', tab: 'analytics', icon: Activity },
          { label: 'Değişiklik Geçmişi', tab: 'history', icon: History },
        ];

        return (
          <Card>
            <CardHeader>
              <CardTitle>{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {actions.map((action) => (
                  <Button
                    key={action.tab}
                    variant="outline"
                    className="justify-start"
                    onClick={() => onNavigate?.(action.tab)}
                  >
                    <action.icon className="w-4 h-4 mr-2" />
                    {action.label}
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={visibleWidgets.map(w => w.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleWidgets.map((widget) => (
            <SortableWidget key={widget.id} widget={widget}>
              {renderWidget(widget)}
            </SortableWidget>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
