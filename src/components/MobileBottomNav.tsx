import { Link, useLocation } from 'react-router-dom';
import { Home, Grid3x3, Heart, User, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    {
      icon: Home,
      label: 'Ana Sayfa',
      path: '/',
    },
    {
      icon: Grid3x3,
      label: 'Kategoriler',
      path: '/categories',
    },
    ...(user ? [{
      icon: Heart,
      label: 'Favoriler',
      path: '/profile/favorites',
    }] : []),
    {
      icon: User,
      label: user ? 'Profil' : 'Giriş',
      path: user ? '/profile/dashboard' : '/login',
    },
  ];

  const menuItems = [
    { label: 'Blog', path: '/blog' },
    { label: 'Haberler', path: '/haberler' },
    { label: 'Şikayetler', path: '/sikayetler' },
    { label: 'Bonus Kampanyaları', path: '/bonus-kampanyalari' },
    { label: 'Hakkımızda', path: '/hakkimizda' },
  ];

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg">
        <div className={cn("grid h-16", user ? "grid-cols-5" : "grid-cols-4")}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 text-xs transition-all duration-200',
                  active
                    ? 'text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <div
                  className={cn(
                    'p-2 rounded-full transition-all duration-200',
                    active && 'bg-primary/10'
                  )}
                >
                  <Icon className={cn('w-5 h-5', active && 'scale-110')} />
                </div>
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Menu Item */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <button
                className={cn(
                  'flex flex-col items-center justify-center gap-1 text-xs transition-all duration-200 text-muted-foreground hover:text-foreground'
                )}
              >
                <div className="p-2 rounded-full">
                  <Menu className="w-5 h-5" />
                </div>
                <span>Menü</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto rounded-t-2xl">
              <div className="py-4">
                <h3 className="font-semibold text-lg mb-4">Menü</h3>
                <div className="grid gap-2">
                  {menuItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <span>{item.label}</span>
                      <span className="text-muted-foreground">→</span>
                    </Link>
                  ))}
                </div>

                {user && (
                  <div className="mt-4 pt-4 border-t">
                    <Link
                      to="/profile/settings"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <span>Ayarlar</span>
                      <span className="text-muted-foreground">→</span>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Spacer for fixed bottom nav */}
      <div className="md:hidden h-16" />
    </>
  );
};
