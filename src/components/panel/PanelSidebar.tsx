import { 
  LayoutDashboard, 
  Settings, 
  FileText, 
  MessageSquare, 
  BarChart3, 
  Bell, 
  MessageCircle,
  Building2,
  Gift,
  User,
  Home
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { SiteData } from '@/types/site';
import { Link } from 'react-router-dom';

interface PanelSidebarProps {
  siteData: SiteData;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function PanelSidebar({ siteData, activeTab, onTabChange }: PanelSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const menuGroups = [
    {
      label: "Genel Bakış",
      items: [
        {
          id: "dashboard",
          title: "Dashboard",
          icon: LayoutDashboard,
          description: "Performans metrikleri"
        }
      ]
    },
    {
      label: "Yönetim",
      items: [
        {
          id: "site-info",
          title: "Site Bilgileri",
          icon: Settings,
          description: "Temel bilgiler ve logo"
        },
        {
          id: "content",
          title: "İçerik Yönetimi",
          icon: FileText,
          description: "Uzman yorumu, rehberler"
        },
        {
          id: "bonuses",
          title: "Bonuslar",
          icon: Gift,
          description: "Bonus ve kampanyalar"
        },
        {
          id: "profile",
          title: "Profil Ayarları",
          icon: User,
          description: "Sosyal medya ve iletişim"
        }
      ]
    },
    {
      label: "İletişim",
      items: [
        {
          id: "complaints",
          title: "Şikayetler",
          icon: MessageSquare,
          description: "Kullanıcı şikayetleri"
        },
        {
          id: "feedback",
          title: "Geri Bildirimler",
          icon: MessageCircle,
          description: "Yorumlar ve değerlendirmeler"
        },
        {
          id: "notifications",
          title: "Bildirimler",
          icon: Bell,
          description: "Sistem bildirimleri"
        }
      ]
    },
    {
      label: "Raporlama",
      items: [
        {
          id: "reports",
          title: "Raporlar",
          icon: BarChart3,
          description: "İstatistikler ve dışa aktarım"
        }
      ]
    }
  ];

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b px-4 py-3">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          {siteData?.logo_url && !isCollapsed && (
            <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-lg flex items-center justify-center p-1.5">
              <img 
                src={siteData.logo_url} 
                alt={siteData.name}
                className="w-full h-full object-contain"
              />
            </div>
          )}
          {isCollapsed ? (
            <div className="flex items-center justify-center w-full">
              <Home className="h-5 w-5 text-primary" />
            </div>
          ) : (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <p className="text-sm font-semibold truncate">{siteData?.name}</p>
              </div>
              <p className="text-xs text-muted-foreground">Kurumsal Panel</p>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            {!isCollapsed && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => onTabChange(item.id)}
                        isActive={isActive}
                        tooltip={isCollapsed ? item.title : undefined}
                        className="w-full"
                      >
                        <Icon className="h-4 w-4" />
                        {!isCollapsed && (
                          <div className="flex-1">
                            <p className="font-medium">{item.title}</p>
                            {!isActive && (
                              <p className="text-xs text-muted-foreground">
                                {item.description}
                              </p>
                            )}
                          </div>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
