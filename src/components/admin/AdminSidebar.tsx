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
  PieChart
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
      label: 'Genel Bakış',
      items: [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'analytics', icon: BarChart3, label: 'Analytics' },
        { id: 'realtime', icon: Activity, label: 'Canlı İstatistikler' },
      ],
    },
    {
      label: 'İçerik Yönetimi',
      items: [
        { id: 'manage', icon: Globe, label: 'Siteler' },
        { id: 'featured', icon: Star, label: 'Öne Çıkan Siteler' },
        { id: 'blog', icon: FileText, label: 'Blog Yönetimi' },
        { id: 'news', icon: Newspaper, label: 'Haber Yönetimi' },
        { id: 'casino-content', icon: Gamepad2, label: 'Casino İçerik' },
      ],
    },
    {
      label: 'Kullanıcı İşlemleri',
      items: [
        { id: 'reviews', icon: MessageSquare, label: 'Site Yorumları' },
        { id: 'comments', icon: MessageSquare, label: 'Blog Yorumları' },
        { id: 'notifications', icon: Bell, label: 'Bildirimler' },
      ],
    },
    {
      label: 'SEO & Analytics',
      items: [
        { id: 'site-stats', icon: PieChart, label: 'Site İstatistikleri' },
        { id: 'blog-stats', icon: TrendingUp, label: 'Blog İstatistikleri' },
        { id: 'casino-analytics', icon: BarChart3, label: 'Casino Analytics' },
        { id: 'keywords', icon: Search, label: 'Anahtar Kelimeler' },
        { id: 'content-planner', icon: Calendar, label: 'İçerik Planlayıcı' },
        { id: 'gsc', icon: TrendingUp, label: 'Google Search Console' },
      ],
    },
    {
      label: 'AI & Otomasyon',
      items: [
        { id: 'ai', icon: Gamepad2, label: 'AI Asistan' },
        { id: 'ai-history', icon: FileCode, label: 'AI Analiz Geçmişi' },
      ],
    },
    {
      label: 'Sistem',
      items: [
        { id: 'health', icon: Activity, label: 'Sistem Sağlığı' },
        { id: 'logs', icon: FileCode, label: 'Sistem Logları' },
        { id: 'carousel', icon: Settings, label: 'Carousel Ayarları' },
      ],
    },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r z-50">
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
                      className="w-full"
                      tooltip={collapsed ? item.label : undefined}
                    >
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.label}</span>}
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
