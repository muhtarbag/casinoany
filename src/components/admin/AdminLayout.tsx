import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { AdminErrorBoundary } from './AdminErrorBoundary';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface AdminLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  username?: string;
}

export function AdminLayout({ children, activeTab, onTabChange, username }: AdminLayoutProps) {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const clearCache = () => {
    queryClient.clear();
    toast.success('Cache temizlendi');
  };

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

              <Button
                variant="outline"
                size={isMobile ? "icon" : "sm"}
                onClick={clearCache}
                className="gap-2 shrink-0"
                title="Cache Temizle"
              >
                <RefreshCw className="w-4 h-4" />
                {!isMobile && <span>Cache Temizle</span>}
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-3 sm:p-6">
              <AdminErrorBoundary fallbackMessage="Bu modülde bir hata oluştu">
                {children}
              </AdminErrorBoundary>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
