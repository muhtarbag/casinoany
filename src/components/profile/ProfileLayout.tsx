import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Heart,
  Users,
  MessageSquare,
  AlertTriangle,
  Gift,
  Settings,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileLayoutProps {
  children: ReactNode;
}

const menuItems = [
  {
    icon: LayoutDashboard,
    label: 'Genel Bakış',
    href: '/profile/dashboard',
    badge: null
  },
  {
    icon: Heart,
    label: 'Favorilerim',
    href: '/profile/favorites',
    badge: null
  },
  {
    icon: Users,
    label: 'Üyeliklerim',
    href: '/profile/memberships',
    badge: null
  },
  {
    icon: MessageSquare,
    label: 'Yorumlarım',
    href: '/profile/reviews',
    badge: null
  },
  {
    icon: AlertTriangle,
    label: 'Şikayetlerim',
    href: '/profile/complaints',
    badge: null
  },
  {
    icon: Gift,
    label: 'Bonus Takibi',
    href: '/profile/bonus-tracking',
    badge: null
  },
  {
    icon: Settings,
    label: 'Ayarlar',
    href: '/profile/settings',
    badge: null
  }
];

export const ProfileLayout = ({ children }: ProfileLayoutProps) => {
  const { user } = useAuth();
  const location = useLocation();

  const getInitials = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                {/* User Profile Section */}
                <div className="flex flex-col items-center text-center mb-6">
                  <Avatar className="h-20 w-20 mb-3">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg">
                    {user?.user_metadata?.full_name || 'Kullanıcı'}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate w-full">
                    {user?.email}
                  </p>
                </div>

                <Separator className="mb-4" />

                {/* Navigation Menu */}
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex items-center justify-around py-2">
          {menuItems.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-0',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="text-[10px] font-medium truncate max-w-full">
                  {item.label}
                </span>
                {item.badge && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-1 -right-1 h-4 min-w-4 p-0 flex items-center justify-center text-[10px]"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
          
          {/* More Menu */}
          <Link
            to="/profile/settings"
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors',
              location.pathname === '/profile/settings'
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
          >
            <User className="h-5 w-5" />
            <span className="text-[10px] font-medium">Daha Fazla</span>
          </Link>
        </div>
      </nav>

      {/* Mobile Bottom Padding */}
      <div className="lg:hidden h-20" />
    </div>
  );
};
