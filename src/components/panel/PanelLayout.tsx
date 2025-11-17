import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { PanelSidebar } from './PanelSidebar';
import { NotificationBell } from './notifications/NotificationBell';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Kbd } from '@/components/ui/kbd';
import { SiteData } from '@/types/site';

interface PanelLayoutProps {
  siteData: SiteData;
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  siteId?: string;
}

export function PanelLayout({ 
  siteData, 
  activeTab, 
  onTabChange, 
  children,
  breadcrumbs = [],
  siteId
}: PanelLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <PanelSidebar 
          siteData={siteData}
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
        
        <SidebarInset className="flex-1">
          {/* Header with Breadcrumbs & Notifications */}
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-6" />
            
            {breadcrumbs.length > 0 && (
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/panel/site-management">
                      Panel
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {breadcrumbs.map((crumb, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        {crumb.href ? (
                          <BreadcrumbLink href={crumb.href}>
                            {crumb.label}
                          </BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                    </div>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            )}

            {/* Notification Bell & Shortcuts Hint */}
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
                <span>Kısayollar için</span>
                <Kbd>?</Kbd>
                <span>basın</span>
              </div>
              {siteId && <NotificationBell siteId={siteId} />}
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
