import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { AdminErrorBoundary } from './AdminErrorBoundary';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface AdminLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  username?: string;
}

export function AdminLayout({ children, activeTab, onTabChange, username }: AdminLayoutProps) {
  const queryClient = useQueryClient();

  const clearCache = () => {
    queryClient.clear();
    toast.success('Cache temizlendi');
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background to-muted">
        <AdminSidebar activeTab={activeTab} onTabChange={onTabChange} />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center gap-4 px-4">
              <SidebarTrigger />
              
              <div className="flex-1">
                <h1 className="text-xl font-semibold bg-gradient-primary bg-clip-text text-transparent">
                  Hoş Geldin, {username || 'Admin'}! 👋
                </h1>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={clearCache}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Cache Temizle
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6">
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
