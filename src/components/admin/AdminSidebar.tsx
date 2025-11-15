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
  Mail,
  Shield,
  Image,
  AlertCircle,
  Folder,
  Link2,
  Network
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
import { useAuth } from '@/contexts/AuthContext';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { userRoles } = useAuth();

  // Rol bazlı erişim kontrolü
  const hasRole = (requiredRoles: string[]) => {
    if (userRoles.includes('admin')) return true; // Admin her şeye erişir
    return requiredRoles.some(role => userRoles.includes(role));
  };

  const navigationGroups = [
    {
      label: 'Gösterge Paneli',
      items: [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Genel Bakış', badge: null, route: '/admin/dashboard', roles: [] },
        { id: 'realtime', icon: Activity, label: 'Canlı Takip', badge: null, route: '/admin/analytics/realtime', roles: ['seo_manager'] },
      ],
    },
    {
      label: 'İçerik',
      items: [
        { id: 'manage', icon: Globe, label: 'Site Yönetimi', badge: null, route: '/admin/sites', roles: ['content_editor'] },
        { id: 'casino-content', icon: Gamepad2, label: 'Casino İçerik', badge: null, route: '/admin/content/casino', roles: ['content_editor'] },
        { id: 'featured-sites', icon: Star, label: 'Öne Çıkan Siteler', badge: null, route: '/admin/sites/featured', roles: ['content_editor'] },
        { id: 'recommended-sites', icon: Link2, label: 'Önerilen Siteler', badge: 'NEW', route: '/admin/sites/recommended', roles: ['content_editor'] },
        { id: 'bonus', icon: Gift, label: 'Bonuslar', badge: null, route: '/admin/finance/bonus', roles: ['content_editor', 'finance'] },
        { id: 'categories', icon: Folder, label: 'Kategoriler', badge: 'NEW', route: '/admin/content/categories', roles: ['content_editor'] },
        { id: 'blog', icon: FileText, label: 'Blog', badge: null, route: '/admin/blog', roles: ['content_editor'] },
        { id: 'banners', icon: Image, label: 'Banner Yönetimi', badge: null, route: '/admin/sites/banners', roles: ['content_editor'] },
        { id: 'news', icon: Newspaper, label: 'Haberler', badge: null, route: '/admin/news', roles: ['content_editor'] },
      ],
    },
    {
      label: 'Finans',
      items: [
        { id: 'affiliate', icon: DollarSign, label: 'Affiliate', badge: null, route: '/admin/finance/affiliate', roles: ['finance'] },
        { id: 'bonus-requests', icon: Mail, label: 'Bonus Talepleri', badge: null, route: '/admin/finance/bonus-requests', roles: ['finance'] },
      ],
    },
    {
      label: 'Etkileşim',
      items: [
        { id: 'reviews', icon: MessageSquare, label: 'Yorumlar', badge: null, route: '/admin/reviews', roles: ['content_editor'] },
        { id: 'notifications', icon: Bell, label: 'Bildirimler', badge: null, route: '/admin/notifications', roles: ['content_editor'] },
      ],
    },
    {
      label: 'Analiz & SEO',
      items: [
        { id: 'analytics', icon: BarChart3, label: 'Analytics', badge: null, route: '/admin/analytics', roles: ['seo_manager'] },
        { id: 'keywords', icon: Search, label: 'SEO Takip', badge: null, route: '/admin/analytics/keywords', roles: ['seo_manager'] },
        { id: 'content-planner', icon: Calendar, label: 'İçerik Planlama', badge: null, route: '/admin/content/planner', roles: ['seo_manager', 'content_editor'] },
      ],
    },
    {
      label: 'Sistem',
      items: [
        { id: 'domains', icon: Network, label: 'Domain Yönetimi', badge: 'TİB', route: '/admin/system/domains', roles: [] },
        { id: 'health', icon: Activity, label: 'Sistem Durumu', badge: null, route: '/admin/system/health', roles: [] },
        { id: 'build-health', icon: AlertCircle, label: 'Build Sağlığı', badge: 'NEW', route: '/admin/system/build-health', roles: [] },
        { id: 'history', icon: History, label: 'Değişiklik Geçmişi', badge: null, route: '/admin/system/history', roles: [] },
        { id: 'performance', icon: Gauge, label: 'Performance İzleme', badge: null, route: '/admin/system/performance', roles: [] },
        { id: 'roles', icon: Shield, label: 'Rol Yönetimi', badge: null, route: '/admin/system/roles', roles: [] },
        { id: 'ai', icon: Gamepad2, label: 'AI Asistan', badge: 'BETA', route: '/admin/ai', roles: ['content_editor', 'seo_manager'] },
      ],
    },
  ].map(group => ({
    ...group,
    items: group.items.filter(item => item.roles.length === 0 || hasRole(item.roles))
  })).filter(group => group.items.length > 0);

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
