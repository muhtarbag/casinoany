import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Shield } from 'lucide-react';
import { MobileMenu } from '@/components/MobileMenu';
import { ImpersonationBanner } from '@/components/ImpersonationBanner';
import logo from '@/assets/casinodoo-logo.svg';

export const Header = () => {
  const { user, isAdmin, isSiteOwner, signOut } = useAuth();

  return (
    <>
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <nav className="flex items-center justify-between">
            <NavLink to="/" className="flex items-center hover:opacity-80 transition-opacity">
              <img src={logo} alt="CasinoAny.com" className="h-6 md:h-8 w-auto" loading="eager" />
            </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 md:gap-6">
            <NavLink 
              to="/" 
              className="text-muted-foreground hover:text-foreground transition-colors text-sm md:text-base"
              activeClassName="text-primary font-semibold"
            >
              Ana Sayfa
            </NavLink>
            <NavLink 
              to="/deneme-bonusu" 
              className="text-muted-foreground hover:text-foreground transition-colors text-sm md:text-base"
              activeClassName="text-primary font-semibold"
            >
              Deneme Bonusu
            </NavLink>
            <NavLink 
              to="/kategoriler" 
              className="text-muted-foreground hover:text-foreground transition-colors text-sm md:text-base"
              activeClassName="text-primary font-semibold"
            >
              Kategoriler
            </NavLink>
            <NavLink 
              to="/blog" 
              className="hidden lg:block text-muted-foreground hover:text-foreground transition-colors text-sm md:text-base"
              activeClassName="text-primary font-semibold"
            >
              Blog
            </NavLink>
            <NavLink 
              to="/sikayetler" 
              className="hidden lg:block text-muted-foreground hover:text-foreground transition-colors text-sm md:text-base"
              activeClassName="text-primary font-semibold"
            >
              Şikayetler
            </NavLink>
            <NavLink 
              to="/about" 
              className="hidden lg:block text-muted-foreground hover:text-foreground transition-colors text-sm md:text-base"
              activeClassName="text-primary font-semibold"
            >
              Hakkımızda
            </NavLink>

            <div className="flex items-center gap-1.5 md:gap-3">
              {user ? (
                <>
                  <NavLink to="/profile/dashboard">
                    <Button variant="outline" size="sm" className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                      <Shield className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">Hesabım</span>
                    </Button>
                  </NavLink>
                  {isAdmin && (
                    <NavLink to="/admin">
                      <Button variant="outline" size="sm" className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                        <Shield className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="hidden sm:inline">Admin</span>
                      </Button>
                    </NavLink>
                  )}
                  {isSiteOwner && (
                    <NavLink to="/panel/dashboard">
                      <Button variant="outline" size="sm" className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                        <Shield className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="hidden sm:inline">Panel</span>
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
                </>
              ) : (
                <>
                  <NavLink to="/login">
                    <Button variant="ghost" size="sm" className="text-xs md:text-sm px-2 md:px-3">
                      Giriş Yap
                    </Button>
                  </NavLink>
                  <NavLink to="/signup">
                    <Button size="sm" className="text-xs md:text-sm px-2 md:px-3">
                      Kayıt Ol
                    </Button>
                  </NavLink>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          <MobileMenu />
        </nav>
      </div>
    </header>
    
    {/* ✅ YENİ: Impersonation banner */}
    <ImpersonationBanner />
  </>
  );
};
