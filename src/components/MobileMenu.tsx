import React, { useState } from 'react';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, Info, FileText, Shield, LogOut, Gift, Folder } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/casinodoo-logo.svg';

export const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();

  const handleNavClick = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          aria-label="Menüyü aç"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] sm:w-[350px]">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-3">
            <img src={logo} alt="CasinoAny.com" className="h-6 w-auto" />
          </SheetTitle>
        </SheetHeader>
        
        <nav className="flex flex-col gap-2">
          <NavLink
            to="/"
            onClick={handleNavClick}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            activeClassName="text-primary bg-muted font-semibold"
          >
            <Home className="w-5 h-5" />
            <span>Ana Sayfa</span>
          </NavLink>

          <NavLink
            to="/deneme-bonusu"
            onClick={handleNavClick}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            activeClassName="text-primary bg-muted font-semibold"
          >
            <Gift className="w-5 h-5" />
            <span>Deneme Bonusu</span>
          </NavLink>

          <NavLink
            to="/kategoriler"
            onClick={handleNavClick}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            activeClassName="text-primary bg-muted font-semibold"
          >
            <Folder className="w-5 h-5" />
            <span>Kategoriler</span>
          </NavLink>

          <NavLink
            to="/blog"
            onClick={handleNavClick}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            activeClassName="text-primary bg-muted font-semibold"
          >
            <FileText className="w-5 h-5" />
            <span>Blog</span>
          </NavLink>

          <NavLink
            to="/about"
            onClick={handleNavClick}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            activeClassName="text-primary bg-muted font-semibold"
          >
            <Info className="w-5 h-5" />
            <span>Hakkımızda</span>
          </NavLink>

          {user && (
            <>
              <div className="my-2 border-t border-border" />
              
              {isAdmin && (
                <NavLink
                  to="/admin"
                  onClick={handleNavClick}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                  activeClassName="text-primary bg-muted font-semibold"
                >
                  <Shield className="w-5 h-5" />
                  <span>Admin Panel</span>
                </NavLink>
              )}

              <button
                onClick={() => {
                  signOut();
                  handleNavClick();
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all w-full text-left"
              >
                <LogOut className="w-5 h-5" />
                <span>Çıkış Yap</span>
              </button>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
};
