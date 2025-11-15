import { ReactNode, useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { AdminErrorBoundary } from './AdminErrorBoundary';
import { Button } from '@/components/ui/button';
import { RefreshCw, Keyboard } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { showSuccessToast } from '@/lib/toastHelpers';
import { useIsMobile } from '@/hooks/use-mobile';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { ShortcutsDialog } from '@/components/shortcuts/ShortcutsDialog';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { queryKeys } from '@/lib/queryClient';

interface AdminLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  username?: string;
}

export function AdminLayout({ children, activeTab, onTabChange, username }: AdminLayoutProps) {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const clearCache = (type?: 'all' | 'sites' | 'blog' | 'analytics') => {
    switch (type) {
      case 'sites':
        queryClient.invalidateQueries({ queryKey: queryKeys.sites.all });
        showSuccessToast('Site cache temizlendi');
        break;
      case 'blog':
        queryClient.invalidateQueries({ queryKey: queryKeys.blog.all });
        showSuccessToast('Blog cache temizlendi');
        break;
      case 'analytics':
        queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
        showSuccessToast('Analytics cache temizlendi');
        break;
      default:
        queryClient.clear();
        showSuccessToast('Tüm cache temizlendi');
    }
  };

  // Global keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: '/',
      handler: (e) => {
        e.preventDefault();
        setShortcutsOpen(true);
      },
      description: 'Kısayolları göster',
    },
    {
      key: 'r',
      ctrl: true,
      shift: true,
      handler: (e) => {
        e.preventDefault();
        clearCache();
      },
      description: 'Cache temizle',
    },
  ]);

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background to-muted relative">
        <div className="z-40 relative">
          <AdminSidebar activeTab={activeTab} onTabChange={onTabChange} />
        </div>
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center gap-2 sm:gap-4 px-3 sm:px-4">
              <SidebarTrigger className="shrink-0" />
              
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-xl font-semibold bg-gradient-primary bg-clip-text text-transparent truncate">
                  {isMobile ? 'Admin Panel' : `Hoş Geldin, ${username || 'Admin'}! 👋`}
                </h1>
              </div>

              <NotificationCenter />

              <Button
                variant="outline"
                size={isMobile ? "icon" : "sm"}
                onClick={() => setShortcutsOpen(true)}
                className="gap-2 shrink-0"
                title="Klavye Kısayolları"
              >
                <Keyboard className="w-4 h-4" />
                {!isMobile && <span className="hidden lg:inline">Kısayollar</span>}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size={isMobile ? "icon" : "sm"}
                    className="gap-2 shrink-0"
                    title="Cache Yönetimi"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {!isMobile && <span className="hidden xl:inline">Cache</span>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-background border shadow-lg z-50">
                  <DropdownMenuLabel>Cache Yönetimi</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => clearCache('sites')} className="cursor-pointer">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    <span>Site Cache Temizle</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => clearCache('blog')} className="cursor-pointer">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    <span>Blog Cache Temizle</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => clearCache('analytics')} className="cursor-pointer">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    <span>Analytics Cache Temizle</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => clearCache('all')} className="cursor-pointer font-semibold">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    <span>Tüm Cache Temizle</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-3 sm:p-6">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Shortcuts Dialog */}
      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </SidebarProvider>
  );
}
