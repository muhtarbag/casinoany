import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Shield, Trophy } from 'lucide-react';

export const Header = () => {
  const { user, isAdmin, signOut } = useAuth();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <nav className="flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-1.5 md:gap-2 text-lg md:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            <Trophy className="w-5 h-5 md:w-7 md:h-7 text-primary" />
            <span className="hidden sm:inline">BahisSiteleri</span>
          </NavLink>

          <div className="flex items-center gap-2 md:gap-6">
            <NavLink 
              to="/" 
              className="hidden md:block text-muted-foreground hover:text-foreground transition-colors text-sm md:text-base"
              activeClassName="text-primary font-semibold"
            >
              Ana Sayfa
            </NavLink>
            <NavLink 
              to="/about" 
              className="hidden lg:block text-muted-foreground hover:text-foreground transition-colors text-sm md:text-base"
              activeClassName="text-primary font-semibold"
            >
              Hakkımızda
            </NavLink>
            <NavLink 
              to="/blog" 
              className="hidden lg:block text-muted-foreground hover:text-foreground transition-colors text-sm md:text-base"
              activeClassName="text-primary font-semibold"
            >
              Blog
            </NavLink>

            {user ? (
              <div className="flex items-center gap-1.5 md:gap-3">
                {isAdmin && (
                  <NavLink to="/admin">
                    <Button variant="outline" size="sm" className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                      <Shield className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">Admin</span>
                    </Button>
                  </NavLink>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={signOut}
                  className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3"
                >
                  <LogOut className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Çıkış</span>
                </Button>
              </div>
            ) : (
              <div className="flex gap-1.5 md:gap-2">
                <NavLink to="/login">
                  <Button variant="ghost" size="sm" className="text-xs md:text-sm px-2 md:px-3">
                    <span className="hidden sm:inline">Giriş</span>
                    <span className="sm:hidden">Giriş</span>
                  </Button>
                </NavLink>
                <NavLink to="/signup">
                  <Button size="sm" className="bg-gradient-primary text-xs md:text-sm px-3 md:px-4">Kayıt Ol</Button>
                </NavLink>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};
