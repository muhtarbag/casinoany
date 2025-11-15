import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LayoutDashboard, FileText, DollarSign, Users, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationHubs = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/admin/dashboard',
  },
  {
    id: 'content',
    label: 'İçerik',
    icon: FileText,
    path: '/admin/sites',
  },
  {
    id: 'revenue',
    label: 'Gelir',
    icon: DollarSign,
    path: '/admin/finance/affiliate',
  },
  {
    id: 'users',
    label: 'Kullanıcı',
    icon: Users,
    path: '/admin/reviews',
  },
  {
    id: 'system',
    label: 'Sistem',
    icon: Settings,
    path: '/admin/system/performance',
  },
];

export function MobileAdminNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const handleNavClick = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden min-h-[44px] min-w-[44px]"
          aria-label="Admin menüsünü aç"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="text-xl font-bold">Admin Panel</SheetTitle>
        </SheetHeader>
        
        <nav className="flex flex-col gap-1 px-3 pb-6">
          {navigationHubs.map((hub) => {
            const Icon = hub.icon;
            const isActive = location.pathname.startsWith(hub.path);
            
            return (
              <Link
                key={hub.id}
                to={hub.path}
                onClick={handleNavClick}
                className={cn(
                  "flex items-center gap-4 px-4 py-4 min-h-[52px] rounded-lg transition-all touch-manipulation active:scale-98",
                  isActive 
                    ? "bg-primary/10 text-primary font-semibold" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className="w-6 h-6 shrink-0" />
                <span className="text-base">{hub.label}</span>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
