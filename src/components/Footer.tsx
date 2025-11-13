import { Mail, Twitter, Facebook, Instagram } from 'lucide-react';
import logo from '@/assets/casinodoo-logo.svg';

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/30 mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <img src={logo} alt="CasinoDoo" className="h-8 w-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Türkiye'nin en güvenilir casino ve bahis siteleri rehberi. 
              Güncel bonuslar ve kampanyalar hakkında bilgi alın.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Ana Sayfa
                </a>
              </li>
              <li>
                <a href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  Hakkımızda
                </a>
              </li>
              <li>
                <a href="/blog" className="text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">İletişim</h3>
            <div className="flex gap-4">
              <a href="mailto:info@bahissiteleri.com" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; 2025 CasinoDoo. Tüm hakları saklıdır.</p>
          <p className="mt-2">18+ | Sorumlu bahis oynayın</p>
        </div>
      </div>
    </footer>
  );
};
