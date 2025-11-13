import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Shield, Trophy } from 'lucide-react';

export const Header = () => {
  const { user, isAdmin, signOut } = useAuth();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            <Trophy className="w-7 h-7 text-primary" />
            <span>BahisSiteleri</span>
          </NavLink>

          <div className="flex items-center gap-6">
            <NavLink 
              to="/" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-primary font-semibold"
            >
              Ana Sayfa
            </NavLink>
            <NavLink 
              to="/about" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-primary font-semibold"
            >
              Hakkımızda
            </NavLink>
            <NavLink 
              to="/blog" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-primary font-semibold"
            >
              Blog
            </NavLink>

            {user ? (
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <NavLink to="/admin">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Shield className="w-4 h-4" />
                      Admin Panel
                    </Button>
                  </NavLink>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={signOut}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Çıkış
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <NavLink to="/login">
                  <Button variant="ghost" size="sm">Giriş</Button>
                </NavLink>
                <NavLink to="/signup">
                  <Button size="sm" className="bg-gradient-primary">Kayıt Ol</Button>
                </NavLink>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};
