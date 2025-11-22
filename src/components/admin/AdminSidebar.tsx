import { 
  LayoutDashboard, 
  Globe, 
  FileText, 
  MessageSquare,
  Newspaper,
  Gamepad2,
  Gift,
  DollarSign,
  Mail,
  Shield,
  Folder,
  Bell,
  AlertTriangle,
  BarChart3,
  Trophy,
  Link2,
  Megaphone
} from 'lucide-react';
import { Link } from 'react-router-dom';
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
import { Badge } from '@/components/ui/badge';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AdminSidebar({ activeTab }: AdminSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { userRoles } = useAuth();

  const hasRole = (requiredRoles: string[]) => {
    if (userRoles.includes('admin')) return true;
    return requiredRoles.some(role => userRoles.includes(role));
  };

  // 🎯 6 Main Hubs
  const navigationGroups = [
    {
      label: '🏠 Dashboard',
      items: [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Genel Bakış', route: '/admin/dashboard', roles: [], shortcut: 'g d' },
      ],
    },
    {
      label: '📊 Analitik Hub',
      items: [
        { id: 'analytics', icon: BarChart3, label: 'Analitikler', route: '/admin/analytics', roles: [], shortcut: 'g n' },
      ],
    },
    {
      label: '📝 İçerik Hub',
      items: [
        { id: 'sites', icon: Globe, label: 'Siteler', route: '/admin/sites', roles: ['content_editor'], shortcut: 'g s' },
        { id: 'site-requests', icon: Mail, label: 'Site Talepleri', route: '/admin/sites/addition-requests', roles: ['content_editor'] },
        { id: 'casino', icon: Gamepad2, label: 'Casino', route: '/admin/content/casino', roles: ['content_editor'], shortcut: 'g c' },
        { id: 'blog', icon: FileText, label: 'Blog', route: '/admin/blog', roles: ['content_editor'], shortcut: 'g b' },
        { id: 'categories', icon: Folder, label: 'Kategoriler', route: '/admin/content/categories', roles: ['content_editor'] },
        { id: 'news', icon: Newspaper, label: 'Haberler', route: '/admin/news', roles: ['content_editor'] },
      ],
    },
    {
      label: '💰 Gelir Hub',
      items: [
        { id: 'affiliate', icon: DollarSign, label: 'Affiliate', route: '/admin/finance/affiliate', roles: ['finance'], shortcut: 'g a' },
        { id: 'bonus', icon: Gift, label: 'Bonuslar', route: '/admin/finance/bonus', roles: ['content_editor', 'finance'] },
        { id: 'requests', icon: Mail, label: 'Bonus Talepleri', route: '/admin/finance/bonus-requests', roles: ['finance'] },
        { id: 'advertising', icon: Megaphone, label: 'Reklam Yönetimi', route: '/admin/advertising', roles: [] },
      ],
    },
    {
      label: '👥 Kullanıcı Hub',
      items: [
        { id: 'reviews', icon: MessageSquare, label: 'Yorumlar', route: '/admin/reviews', roles: ['content_editor'], shortcut: 'g r' },
        { id: 'comments', icon: MessageSquare, label: 'Blog Yorumları', route: '/admin/blog/comments', roles: ['content_editor'] },
        { id: 'complaints', icon: AlertTriangle, label: 'Şikayetler', route: '/admin/complaints', roles: ['content_editor'] },
        { id: 'notifications', icon: Bell, label: 'Bildirimler', route: '/admin/notifications', roles: ['content_editor'] },
      ],
    },
    {
      label: '🏆 Gamification Hub',
      items: [
        { id: 'gamification', icon: Trophy, label: 'Dashboard', route: '/admin/gamification/dashboard', roles: [] },
        { id: 'achievements', icon: Trophy, label: 'Başarılar', route: '/admin/gamification/achievements', roles: [] },
        { id: 'rewards', icon: Gift, label: 'Ödüller', route: '/admin/gamification/rewards', roles: [] },
        { id: 'user-stats', icon: BarChart3, label: 'Kullanıcı Stats', route: '/admin/gamification/user-stats', roles: [] },
      ],
    },
    {
      label: '⚙️ Sistem Hub',
      items: [
        { id: 'users', icon: Shield, label: 'Kullanıcılar', route: '/admin/system/users', roles: [] },
        { id: 'roles', icon: Shield, label: 'Rol Yönetimi', route: '/admin/system/roles', roles: [] },
        { id: 'footer', icon: Link2, label: 'Footer Yönetimi', route: '/admin/system/footer', roles: [] },
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
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground px-2">
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
                      tooltip={collapsed ? item.label : undefined}
                    >
                      <Link to={item.route} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span className={cn(collapsed && "sr-only")}>{item.label}</span>
                        {!collapsed && item.shortcut && (
                          <Badge variant="outline" className="ml-auto text-xs">
                            {item.shortcut}
                          </Badge>
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
