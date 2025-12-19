import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import {
  Menu,
  Award,
  MessageSquare,
  AlertTriangle,
  Gift,
  Users,
  UserPlus,
  Settings,
  LogOut,
  ChevronRight,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface MenuItemData {
  icon: any;
  label: string;
  href: string;
  badgeKey?: 'reviews' | 'complaints' | 'bonuses';
  color?: string;
}

interface MobileProfileMenuProps {
  badges?: {
    reviews: number;
    complaints: number;
    bonuses: number;
  };
  currentPath: string;
}

export const MobileProfileMenu = ({ badges, currentPath }: MobileProfileMenuProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    navigate('/');
  };

  const getInitials = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  const getBadgeCount = (badgeKey?: 'reviews' | 'complaints' | 'bonuses') => {
    if (!badgeKey || !badges) return null;
    const count = badges[badgeKey];
    return count > 0 ? count : null;
  };

  const menuItems: MenuItemData[] = [
    {
      icon: Award,
      label: 'Başarılarım',
      href: '/profile/achievements',
      color: 'text-yellow-500'
    },
    {
      icon: MessageSquare,
      label: 'Yorumlarım',
      href: '/profile/reviews',
      badgeKey: 'reviews',
      color: 'text-green-500'
    },
    {
      icon: AlertTriangle,
      label: 'Şikayetlerim',
      href: '/profile/complaints',
      badgeKey: 'complaints',
      color: 'text-orange-500'
    },
    {
      icon: Gift,
      label: 'Bonus Takibi',
      href: '/profile/bonus-tracking',
      badgeKey: 'bonuses',
      color: 'text-purple-500'
    },
    {
      icon: Users,
      label: 'Üyeliklerim',
      href: '/profile/memberships',
      color: 'text-blue-500'
    },
    {
      icon: UserPlus,
      label: 'Arkadaşını Davet Et',
      href: '/profile/referrals',
      color: 'text-pink-500'
    },
    {
      icon: Bell,
      label: 'Bildirimler',
      href: '/profile/notifications',
      color: 'text-indigo-500'
    },
    {
      icon: Settings,
      label: 'Ayarlar',
      href: '/profile/settings',
      color: 'text-gray-500'
    }
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className={cn(
            "relative flex flex-col items-center justify-center gap-1.5 rounded-xl transition-all duration-200 min-h-[56px]",
            "active:scale-95 active:bg-muted/50",
            "touch-manipulation select-none w-full",
            currentPath.includes('settings') && "bg-primary/10"
          )}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <div className={cn(
            "h-7 w-7 flex items-center justify-center transition-all",
            currentPath.includes('settings') ? "scale-110" : "scale-100"
          )}>
            <Menu className={cn(
              "h-6 w-6 transition-colors",
              currentPath.includes('settings') ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          <span className={cn(
            "text-[10px] font-medium leading-none transition-all",
            currentPath.includes('settings') ? "text-primary font-bold" : "text-muted-foreground"
          )}>
            Menü
          </span>
        </button>
      </SheetTrigger>

      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0">
        <div className="flex flex-col h-full">
          {/* Header with User Info */}
          <SheetHeader className="p-6 pb-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <SheetTitle className="text-xl font-bold">
                  {user?.user_metadata?.full_name || 'Kullanıcı'}
                </SheetTitle>
                <p className="text-sm text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            {badges && (
              <div className="flex gap-6 mt-4 text-xs bg-muted/30 rounded-xl p-3">
                <div className="flex flex-col items-center flex-1">
                  <span className="font-bold text-lg text-primary">{badges.reviews}</span>
                  <span className="text-muted-foreground">Yorum</span>
                </div>
                <div className="w-px bg-border" />
                <div className="flex flex-col items-center flex-1">
                  <span className="font-bold text-lg text-primary">{badges.complaints}</span>
                  <span className="text-muted-foreground">Şikayet</span>
                </div>
                <div className="w-px bg-border" />
                <div className="flex flex-col items-center flex-1">
                  <span className="font-bold text-lg text-primary">{badges.bonuses}</span>
                  <span className="text-muted-foreground">Bonus</span>
                </div>
              </div>
            )}
          </SheetHeader>

          <Separator />

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isActive = currentPath === item.href;
                const Icon = item.icon;
                const badgeCount = getBadgeCount(item.badgeKey);

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200',
                      'active:scale-98 touch-manipulation',
                      isActive
                        ? 'bg-primary/10 shadow-sm'
                        : 'hover:bg-muted/50 active:bg-muted'
                    )}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center",
                      isActive ? "bg-primary/20" : "bg-muted"
                    )}>
                      <Icon className={cn(
                        "h-5 w-5",
                        isActive ? "text-primary" : item.color || "text-muted-foreground"
                      )} />
                    </div>
                    
                    <span className={cn(
                      "flex-1 font-medium",
                      isActive ? "text-primary" : "text-foreground"
                    )}>
                      {item.label}
                    </span>

                    {badgeCount && (
                      <Badge 
                        variant="destructive" 
                        className="h-6 min-w-6 flex items-center justify-center px-2"
                      >
                        {badgeCount > 99 ? '99+' : badgeCount}
                      </Badge>
                    )}

                    <ChevronRight className={cn(
                      "h-5 w-5 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )} />
                  </Link>
                );
              })}
            </nav>
          </div>

          <Separator />

          {/* Logout Button */}
          <div className="p-4 pt-2">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Çıkış Yap</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
