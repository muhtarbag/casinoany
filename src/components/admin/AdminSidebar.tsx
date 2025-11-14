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
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
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
        { id: 'dashboard', icon: LayoutDashboard, label: 'Genel Bakış', badge: null },
        { id: 'realtime', icon: Activity, label: 'Canlı Takip', badge: null },
      ],
    },
    {
      label: 'İçerik',
      items: [
        { id: 'manage', icon: Globe, label: 'Site Yönetimi', badge: null },
        { id: 'casino-content', icon: Gamepad2, label: 'Casino İçerik', badge: null },
        { id: 'blog', icon: FileText, label: 'Blog', badge: null },
        { id: 'news', icon: Newspaper, label: 'Haberler', badge: null },
      ],
    },
    {
      label: 'Finans',
      items: [
        { id: 'affiliate', icon: DollarSign, label: 'Affiliate', badge: null },
        { id: 'bonus', icon: Gift, label: 'Bonuslar', badge: null },
        { id: 'bonus-requests', icon: Mail, label: 'Bonus Talepleri', badge: null },
      ],
    },
    {
      label: 'Etkileşim',
      items: [
        { id: 'reviews', icon: MessageSquare, label: 'Yorumlar', badge: null },
        { id: 'notifications', icon: Bell, label: 'Bildirimler', badge: null },
      ],
    },
    {
      label: 'Analiz & SEO',
      items: [
        { id: 'analytics', icon: BarChart3, label: 'Analytics', badge: null },
        { id: 'keywords', icon: Search, label: 'SEO Takip', badge: null },
        { id: 'content-planner', icon: Calendar, label: 'İçerik Planlama', badge: null },
      ],
    },
    {
      label: 'Sistem',
      items: [
        { id: 'health', icon: Activity, label: 'Sistem Durumu', badge: null },
        { id: 'history', icon: History, label: 'Değişiklik Geçmişi', badge: null },
        { id: 'performance', icon: Gauge, label: 'Performance İzleme', badge: null },
        { id: 'ai', icon: Gamepad2, label: 'AI Asistan', badge: 'BETA' },
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
                      onClick={() => onTabChange(item.id)}
                      isActive={activeTab === item.id}
                      className="w-full justify-between"
                      tooltip={collapsed ? item.label : undefined}
                    >
                      <div className="flex items-center gap-2">
                        <item.icon className="w-4 h-4" />
                        {!collapsed && <span>{item.label}</span>}
                      </div>
                      {!collapsed && item.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-warning/20 text-warning font-semibold">
                          {item.badge}
                        </span>
                      )}
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
