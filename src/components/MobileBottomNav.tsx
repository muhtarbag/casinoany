import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Grid3x3, Heart, User, Menu, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { SmartSearch } from '@/components/SmartSearch';

export const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
    // Search is handled separately as a trigger
    // Categories is moved to Menu or kept if critical, but Search is more important for a content site
    // Let's keep 5 items: Home, Search, Favorites(if user), Profile/Login, Menu
  ];

  const menuItems = [
    { label: 'Kategoriler', path: '/kategoriler', icon: Grid3x3 },
    { label: 'Blog', path: '/blog' },
    { label: 'Haberler', path: '/haberler' },
    { label: 'Şikayetler', path: '/sikayetler' },
    { label: 'Bonus Kampanyaları', path: '/bonus-kampanyalari' },
    { label: 'Hakkımızda', path: '/hakkimizda' },
  ];

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] transition-all duration-300 pb-safe"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
      >
        <div className={cn("grid h-16 items-center", user ? "grid-cols-5" : "grid-cols-4")}>
          {/* 1. Home */}
          <Link
            to="/"
            className={cn(
              'flex flex-col items-center justify-center gap-1.5 transition-all duration-200 select-none touch-manipulation',
              isActive('/') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Home className={cn('w-5 h-5 transition-transform duration-200', isActive('/') && '-translate-y-0.5')} />
            <span className="text-[10px] font-medium">Ana Sayfa</span>
          </Link>

          {/* 2. Search (Trigger Sheet) */}
          <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <SheetTrigger asChild>
              <button
                className={cn(
                  'flex flex-col items-center justify-center gap-1.5 transition-all duration-200 select-none touch-manipulation text-muted-foreground hover:text-foreground'
                )}
              >
                <Search className="w-5 h-5" />
                <span className="text-[10px] font-medium">Ara</span>
              </button>
            </SheetTrigger>
            <SheetContent side="top" className="h-[100dvh] pt-14 px-0 border-b-0 rounded-b-2xl overflow-y-auto w-full">
              <SheetHeader className="px-6 mb-6">
                <SheetTitle className="text-left text-2xl font-bold">Arama</SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-20">
                <SmartSearch
                  onSearch={(term) => {
                    setIsSearchOpen(false);
                    // SmartSearch handles navigation mostly, but if it returns:
                    // window.location.href = `/?search=${term}`;
                  }}
                  searchTerm=""
                  onNavigate={(slug) => {
                    setIsSearchOpen(false);
                    navigate(`/${slug}`);
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* 3. Favorites (Conditional) */}
          {user && (
            <Link
              to="/profile/favorites"
              className={cn(
                'flex flex-col items-center justify-center gap-1.5 transition-all duration-200 select-none touch-manipulation',
                isActive('/profile/favorites') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Heart className={cn('w-5 h-5 transition-transform duration-200', isActive('/profile/favorites') && '-translate-y-0.5')} />
              <span className="text-[10px] font-medium">Favoriler</span>
            </Link>
          )}

          {/* 4. Profile/Login */}
          <Link
            to={user ? '/profile/dashboard' : '/login'}
            className={cn(
              'flex flex-col items-center justify-center gap-1.5 transition-all duration-200 select-none touch-manipulation',
              isActive('/profile') || isActive('/login') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <User className={cn('w-5 h-5 transition-transform duration-200', (isActive('/profile') || isActive('/login')) && '-translate-y-0.5')} />
            <span className="text-[10px] font-medium">{user ? 'Profil' : 'Giriş'}</span>
          </Link>

          {/* 5. Menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <button
                className={cn(
                  'flex flex-col items-center justify-center gap-1.5 transition-all duration-200 select-none touch-manipulation text-muted-foreground hover:text-foreground'
                )}
              >
                <div className="p-0.5 rounded-full border border-current opacity-80">
                  <Menu className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium">Menü</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] rounded-t-[2rem] px-0 border-t-0 bg-background/95 backdrop-blur-xl">
              <div className="flex flex-col h-full">
                <div className="px-6 pt-6 pb-4 border-b border-border/50">
                  <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6" />
                  <h3 className="font-bold text-2xl tracking-tight">Menü</h3>
                </div>

                <div className="flex-1 overflow-y-auto py-4 px-4">
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {menuItems.slice(0, 4).map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-muted/30 hover:bg-muted/60 border border-border/50 transition-all text-center"
                      >
                        {item.icon && <item.icon className="w-6 h-6 text-primary" />}
                        <span className="font-medium text-sm">{item.label}</span>
                      </Link>
                    ))}
                  </div>

                  <div className="grid gap-2">
                    {menuItems.slice(4).map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-between p-4 rounded-xl hover:bg-accent/10 hover:text-accent transition-colors border border-transparent hover:border-accent/20"
                      >
                        <span className="font-medium">{item.label}</span>
                        <span className="text-muted-foreground">→</span>
                      </Link>
                    ))}
                  </div>

                  {user && (
                    <div className="mt-6 pt-6 border-t border-border/50">
                      <Link
                        to="/profile/settings"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-between p-4 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors"
                      >
                        <span className="font-medium">Ayarlar</span>
                        <span className="text-muted-foreground">→</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Spacer for fixed bottom nav */}
      <div
        className="md:hidden h-24"
        aria-hidden="true"
      />
    </>
  );
};
