import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Heart,
  Users,
  MessageSquare,
  AlertTriangle,
  Gift,
  Settings,
  User,
  Home,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageTransition } from './PageTransition';
import { PullToRefresh } from './PullToRefresh';
import logo from '@/assets/casinodoo-logo.svg';

interface ProfileLayoutProps {
  children: ReactNode;
}

interface MenuItem {
  icon: any;
  label: string;
  href: string;
  badgeKey?: 'reviews' | 'complaints' | 'bonuses';
}

export const ProfileLayout = ({ children }: ProfileLayoutProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Fetch notification badges
  const { data: badges, refetch: refetchBadges } = useQuery({
    queryKey: ['profile-badges', user?.id],
    queryFn: async () => {
      if (!user) return { reviews: 0, complaints: 0, bonuses: 0 };

      const [reviewsRes, complaintsRes, bonusesRes] = await Promise.all([
        supabase
          .from('site_reviews')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_approved', false),
        supabase
          .from('site_complaints')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'open'),
        supabase
          .from('user_bonus_tracking')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'active')
      ]);

      return {
        reviews: reviewsRes.count || 0,
        complaints: complaintsRes.count || 0,
        bonuses: bonusesRes.count || 0
      };
    },
    enabled: !!user,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const handleRefresh = async () => {
    await refetchBadges();
    // Add haptic feedback if supported
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const menuItems: MenuItem[] = [
    {
      icon: Home,
      label: 'Ana Sayfa',
      href: '/'
    },
    {
      icon: LayoutDashboard,
      label: 'Genel Bakış',
      href: '/profile/dashboard'
    },
    {
      icon: Heart,
      label: 'Favorilerim',
      href: '/profile/favorites'
    },
    {
      icon: Users,
      label: 'Üyeliklerim',
      href: '/profile/memberships'
    },
    {
      icon: MessageSquare,
      label: 'Yorumlarım',
      href: '/profile/reviews',
      badgeKey: 'reviews'
    },
    {
      icon: AlertTriangle,
      label: 'Şikayetlerim',
      href: '/profile/complaints',
      badgeKey: 'complaints'
    },
    {
      icon: Gift,
      label: 'Bonus Takibi',
      href: '/profile/bonus-tracking',
      badgeKey: 'bonuses'
    },
    {
      icon: Settings,
      label: 'Ayarlar',
      href: '/profile/settings'
    }
  ];

  // Mobile bottom nav items (most important only)
  const mobileBottomNavItems = [
    menuItems.find(item => item.href === '/')!,
    menuItems.find(item => item.href === '/profile/dashboard')!,
    menuItems.find(item => item.href === '/profile/favorites')!,
    menuItems.find(item => item.href === '/profile/reviews')!,
  ];

  const getInitials = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  const getBadgeCount = (badgeKey?: 'reviews' | 'complaints' | 'bonuses') => {
    if (!badgeKey || !badges) return null;
    const count = badges[badgeKey];
    return count > 0 ? count : null;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img src={logo} alt="CasinoAny.com" className="h-8 w-auto" loading="eager" />
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline-block font-medium">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Kullanıcı'}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 text-sm">
                <p className="font-medium">{user?.user_metadata?.full_name || 'Kullanıcı'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Ayarlar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Çıkış Yap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                {/* User Profile Section */}
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="relative mb-3">
                    <Avatar className="h-20 w-20 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-background" />
                  </div>
                  <h3 className="font-semibold text-lg">
                    {user?.user_metadata?.full_name || 'Kullanıcı'}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate w-full">
                    {user?.email}
                  </p>
                  
                  {/* Quick Stats */}
                  {badges && (
                    <div className="flex gap-4 mt-3 text-xs">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-primary">{badges.reviews}</span>
                        <span className="text-muted-foreground">Yorum</span>
                      </div>
                      <div className="w-px bg-border" />
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-primary">{badges.complaints}</span>
                        <span className="text-muted-foreground">Şikayet</span>
                      </div>
                      <div className="w-px bg-border" />
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-primary">{badges.bonuses}</span>
                        <span className="text-muted-foreground">Bonus</span>
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="mb-4" />

                {/* Navigation Menu */}
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    const Icon = item.icon;
                    const badgeCount = getBadgeCount(item.badgeKey);

                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative',
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-102'
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        {badgeCount && (
                          <Badge 
                            variant="destructive" 
                            className="ml-auto h-5 min-w-5 flex items-center justify-center px-1.5 animate-pulse"
                          >
                            {badgeCount}
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
          <main className="flex-1 min-w-0 pb-24 lg:pb-0">
            <PullToRefresh onRefresh={handleRefresh}>
              <PageTransition>
                {children}
              </PageTransition>
            </PullToRefresh>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/95 border-t border-border backdrop-blur-lg shadow-lg" style={{ zIndex: 9999 }}>
        <div className="flex items-center justify-around py-3 px-2 safe-area-inset-bottom">
          {mobileBottomNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            const badgeCount = getBadgeCount(item.badgeKey);

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-0',
                  'active:scale-95 active:bg-muted/50',
                  'touch-manipulation select-none',
                  isActive
                    ? 'text-primary scale-110'
                    : 'text-muted-foreground'
                )}
                style={{
                  WebkitTapHighlightColor: 'transparent'
                }}
              >
                {badgeCount && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 min-w-4 p-0 flex items-center justify-center text-[10px] animate-pulse z-10"
                  >
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </Badge>
                )}
                <Icon className={cn(
                  "h-5 w-5 shrink-0 transition-transform",
                  isActive && "scale-110"
                )} />
                <span className={cn(
                  "text-[10px] font-medium truncate max-w-full transition-all",
                  isActive && "font-bold"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          
          {/* More Menu */}
          <Link
            to="/profile/settings"
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors touch-manipulation',
              location.pathname === '/profile/settings'
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
            style={{
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            <Settings className="h-5 w-5" />
            <span className="text-[10px] font-medium">Ayarlar</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};
