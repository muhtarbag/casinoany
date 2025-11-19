import { useState } from 'react';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Shield } from 'lucide-react';
import { MobileMenu } from '@/components/MobileMenu';
import logo from '@/assets/casinodoo-logo.svg';
import { cn } from '@/lib/utils';

export const Header = () => {
  const { user, isAdmin, isSiteOwner, signOut, isImpersonating } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className={cn(
      "border-b border-border/40 bg-gradient-to-r from-background/80 via-background/60 to-background/80",
      "backdrop-blur-xl backdrop-saturate-150 sticky shadow-sm",
      "transition-all duration-500 ease-in-out",
      isImpersonating ? "top-[41px]" : "top-0",
      isMobileMenuOpen ? "-translate-y-full" : "translate-y-0",
      "z-[60]"
    )}>
        <div className="container mx-auto px-4 py-4 md:py-5">
          <nav className="flex items-center justify-between">
            <NavLink to="/" className="group flex items-center transition-all duration-300 hover:scale-105">
              <div className="relative">
                <div className="absolute -inset-2 bg-primary/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img 
                  src={logo} 
                  alt="CasinoAny.com" 
                  className="h-7 md:h-9 w-auto relative z-10 drop-shadow-sm" 
                  loading="eager" 
                />
              </div>
            </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <NavLink 
              to="/" 
              className="relative px-3 lg:px-4 py-2 text-sm lg:text-base font-medium text-muted-foreground hover:text-foreground transition-all duration-300 group"
              activeClassName="text-primary"
            >
              <span className="relative z-10">Ana Sayfa</span>
              <div className="absolute inset-0 bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </NavLink>
            <NavLink 
              to="/deneme-bonusu" 
              className="relative px-3 lg:px-4 py-2 text-sm lg:text-base font-medium text-muted-foreground hover:text-foreground transition-all duration-300 group"
              activeClassName="text-primary"
            >
              <span className="relative z-10">Deneme Bonusu</span>
              <div className="absolute inset-0 bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </NavLink>
            <NavLink 
              to="/kategoriler" 
              className="relative px-3 lg:px-4 py-2 text-sm lg:text-base font-medium text-muted-foreground hover:text-foreground transition-all duration-300 group"
              activeClassName="text-primary"
            >
              <span className="relative z-10">Kategoriler</span>
              <div className="absolute inset-0 bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </NavLink>
            <NavLink 
              to="/blog" 
              className="hidden lg:flex relative px-3 lg:px-4 py-2 text-sm lg:text-base font-medium text-muted-foreground hover:text-foreground transition-all duration-300 group"
              activeClassName="text-primary"
            >
              <span className="relative z-10">Blog</span>
              <div className="absolute inset-0 bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </NavLink>
            <NavLink 
              to="/sikayetler" 
              className="hidden lg:flex relative px-3 lg:px-4 py-2 text-sm lg:text-base font-medium text-muted-foreground hover:text-foreground transition-all duration-300 group"
              activeClassName="text-primary"
            >
              <span className="relative z-10">Şikayetler</span>
              <div className="absolute inset-0 bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </NavLink>
            <NavLink 
              to="/about" 
              className="hidden xl:flex relative px-3 lg:px-4 py-2 text-sm lg:text-base font-medium text-muted-foreground hover:text-foreground transition-all duration-300 group"
              activeClassName="text-primary"
            >
              <span className="relative z-10">Hakkımızda</span>
              <div className="absolute inset-0 bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </NavLink>

            <div className="flex items-center gap-2 ml-2 lg:ml-4 pl-2 lg:pl-4 border-l border-border/40">
              {user ? (
                <>
                  <NavLink to="/profile/dashboard">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 text-sm px-3 py-2 border-border/60 hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <Shield className="w-4 h-4" />
                      <span className="hidden sm:inline font-medium">Hesabım</span>
                    </Button>
                  </NavLink>
                  {isAdmin && (
                    <NavLink to="/admin">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 text-sm px-3 py-2 border-primary/40 text-primary hover:bg-primary/10 transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        <Shield className="w-4 h-4" />
                        <span className="hidden sm:inline font-medium">Admin</span>
                      </Button>
                    </NavLink>
                  )}
                  {isSiteOwner && (
                    <NavLink to="/panel/dashboard">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 text-sm px-3 py-2 border-border/60 hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        <Shield className="w-4 h-4" />
                        <span className="hidden sm:inline font-medium">Panel</span>
                      </Button>
                    </NavLink>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={signOut}
                    className="gap-2 text-sm px-3 py-2 hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline font-medium">Çıkış</span>
                  </Button>
                </>
              ) : (
                <>
                  <NavLink to="/login">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-sm px-4 py-2 font-medium hover:bg-primary/5 transition-all duration-300"
                    >
                      Giriş Yap
                    </Button>
                  </NavLink>
                  <NavLink to="/signup">
                    <Button 
                      size="sm"
                      className="text-sm px-4 py-2 font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      Kayıt Ol
                    </Button>
                  </NavLink>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          <MobileMenu onOpenChange={setIsMobileMenuOpen} />
        </nav>
      </div>
    </header>
  );
};
