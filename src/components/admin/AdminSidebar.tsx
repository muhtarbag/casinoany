import { 
  LayoutDashboard, 
  Globe, 
  FileText, 
  MessageSquare, 
  Users, 
  BarChart3, 
  Settings,
  TrendingUp,
  Bell,
  Activity,
  FileCode,
  Newspaper,
  Star,
  Search,
  Calendar,
  Gamepad2,
  PieChart,
  Gift,
  FileEdit,
  DollarSign,
  History,
  Gauge,
  Mail
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const navigationGroups = [
    {
      label: 'Gösterge Paneli',
      items: [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Genel Bakış', badge: null, route: '/admin/dashboard' },
        { id: 'realtime', icon: Activity, label: 'Canlı Takip', badge: null, route: '/admin/analytics/realtime' },
      ],
    },
    {
      label: 'İçerik',
      items: [
        { id: 'manage', icon: Globe, label: 'Site Yönetimi', badge: null, route: '/admin/sites' },
        { id: 'casino-content', icon: Gamepad2, label: 'Casino İçerik', badge: null, route: '/admin/content/casino' },
        { id: 'blog', icon: FileText, label: 'Blog', badge: null, route: '/admin/blog' },
        { id: 'news', icon: Newspaper, label: 'Haberler', badge: null, route: '/admin/news' },
      ],
    },
    {
      label: 'Finans',
      items: [
        { id: 'affiliate', icon: DollarSign, label: 'Affiliate', badge: null, route: '/admin/finance/affiliate' },
        { id: 'bonus', icon: Gift, label: 'Bonuslar', badge: null, route: '/admin/finance/bonus' },
        { id: 'bonus-requests', icon: Mail, label: 'Bonus Talepleri', badge: null, route: '/admin/finance/bonus-requests' },
      ],
    },
    {
      label: 'Etkileşim',
      items: [
        { id: 'reviews', icon: MessageSquare, label: 'Yorumlar', badge: null, route: '/admin/reviews' },
        { id: 'notifications', icon: Bell, label: 'Bildirimler', badge: null, route: '/admin/notifications' },
      ],
    },
    {
      label: 'Analiz & SEO',
      items: [
        { id: 'analytics', icon: BarChart3, label: 'Analytics', badge: null, route: '/admin/analytics' },
        { id: 'keywords', icon: Search, label: 'SEO Takip', badge: null, route: '/admin/analytics/keywords' },
        { id: 'content-planner', icon: Calendar, label: 'İçerik Planlama', badge: null, route: '/admin/content/planner' },
      ],
    },
    {
      label: 'Sistem',
      items: [
        { id: 'health', icon: Activity, label: 'Sistem Durumu', badge: null, route: '/admin/system/health' },
        { id: 'history', icon: History, label: 'Değişiklik Geçmişi', badge: null, route: '/admin/system/history' },
        { id: 'performance', icon: Gauge, label: 'Performance İzleme', badge: null, route: '/admin/system/performance' },
        { id: 'ai', icon: Gamepad2, label: 'AI Asistan', badge: 'BETA', route: '/admin/ai' },
      ],
    },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        {navigationGroups.map((group) => (
          <SidebarGroup key={group.label}>
            {!collapsed && (
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={activeTab === item.id}
                      className={cn(
                        "w-full justify-between transition-all",
                        activeTab === item.id
                          ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary shadow-sm'
                          : 'hover:bg-muted/50'
                      )}
                      tooltip={collapsed ? item.label : undefined}
                    >
                      <Link to={item.route}>
                        <div className="flex items-center gap-3 flex-1">
                          <item.icon className={cn("w-4 h-4", activeTab === item.id && 'text-primary')} />
                          {!collapsed && <span>{item.label}</span>}
                        </div>
                        {!collapsed && item.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-warning/20 text-warning font-semibold">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
