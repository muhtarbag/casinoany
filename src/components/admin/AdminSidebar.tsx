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
  Activity
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

  // 🎯 5 Main Hubs (simplified from 7 groups)
  const navigationGroups = [
    {
      label: '🏠 Dashboard',
      items: [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Genel Bakış', route: '/admin/dashboard', roles: [], shortcut: 'g d' },
      ],
    },
    {
      label: '📝 İçerik Hub',
      items: [
        { id: 'sites', icon: Globe, label: 'Siteler', route: '/admin/sites', roles: ['content_editor'], shortcut: 'g s' },
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
      label: '⚙️ Sistem Hub',
      items: [
        { id: 'users', icon: Shield, label: 'Kullanıcılar', route: '/admin/system/users', roles: [] },
        { id: 'roles', icon: Shield, label: 'Rol Yönetimi', route: '/admin/system/roles', roles: [] },
        { id: 'errors', icon: Activity, label: 'Error Monitoring', route: '/admin/system/errors', roles: [] },
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
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.route}
                        className={cn(
                          'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground',
                          activeTab === item.id && 'bg-accent text-accent-foreground font-medium'
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="flex-1">{item.label}</span>
                            {item.shortcut && (
                              <Badge 
                                variant="outline" 
                                className="ml-auto text-[9px] font-mono px-1.5 py-0 opacity-40"
                              >
                                {item.shortcut}
                              </Badge>
                            )}
                          </>
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
